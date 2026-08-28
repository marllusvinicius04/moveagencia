const ACCESS_PASSWORD='021MAX';
// DEPOIS DE IMPLANTAR O APPS SCRIPT, COLE A URL /exec ABAIXO.
// IMPORTANTE: use SOMENTE a URL pura. Não use [URL](URL).
const API_URL='https://script.google.com/macros/s/AKfycbxXnuPhQ3eMqgDf2FHJ_2RsqFACSF6gXaphhUXCvEr7YhO5AB_WwSvh3Binh3HvsR49/exec';
const API_SECRET='021MAX';
const PAYEE={key:'57293143000156',name:'MARLLUS VINICIUS SILVA ARAUJO',city:'URUCUI PIAUI',bank:'MERCADO PAGO'};

let DB={clients:[],debts:[],transactions:[],settings:{},emailLog:[]},PAGE='dashboard';

const $=s=>document.querySelector(s);
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?.()||Date.now()+'_'+Math.random().toString(16).slice(2);
const iso=d=>new Date(d).toISOString().slice(0,10);
const today=()=>iso(new Date());

$('#loginForm').onsubmit=e=>{
  e.preventDefault();
  if($('#password').value!==ACCESS_PASSWORD){
    $('#loginError').textContent='Senha incorreta.';
    return;
  }
  sessionStorage.setItem('alvu_auth','1');
  openApp();
};

$('#menu').onclick=e=>{
  const b=e.target.closest('[data-page]');
  if(!b)return;
  PAGE=b.dataset.page;
  document.querySelectorAll('#menu button').forEach(x=>x.classList.toggle('active',x===b));
  render();
  toggleMenu(false);
};

function apiReady(){
  return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/i.test(API_URL.trim());
}

async function parseApiResponse(r){
  const text=await r.text();
  let o;
  try{
    o=JSON.parse(text);
  }catch(_){
    throw new Error('O Apps Script não retornou JSON. Verifique a implantação /exec e o acesso "Qualquer pessoa". Resposta: '+text.slice(0,180));
  }
  if(!r.ok)throw new Error(o.error||('Erro HTTP '+r.status));
  if(!o.ok)throw new Error(o.error||'Erro desconhecido na API.');
  return o;
}

async function request(action,data={},method='GET'){
  if(!apiReady())throw new Error('Configure corretamente a URL /exec do Apps Script.');

  if(method==='GET'){
    const q=new URLSearchParams({
      ...data,
      action,
      secret:API_SECRET,
      _:Date.now().toString()
    });
    const r=await fetch(API_URL+'?'+q.toString(),{
      method:'GET',
      cache:'no-store',
      redirect:'follow'
    });
    return parseApiResponse(r);
  }

  const body=new URLSearchParams({
    ...data,
    action,
    secret:API_SECRET
  });

  const r=await fetch(API_URL,{
    method:'POST',
    body,
    redirect:'follow'
  });
  return parseApiResponse(r);
}

async function openApp(){
  $('#login').classList.add('hide');
  $('#shell').classList.remove('hide');
  await loadData();
}

function logout(){sessionStorage.clear();location.reload();}
function toggleMenu(v){$('#side').classList.toggle('open',typeof v==='boolean'?v:!$('#side').classList.contains('open'));}

async function loadData(notify=false){
  loading('Sincronizando financeiro...');
  try{
    if(apiReady()){
      const response=await request('load');
      DB={
        clients:Array.isArray(response.data?.clients)?response.data.clients:[],
        debts:Array.isArray(response.data?.debts)?response.data.debts:[],
        transactions:Array.isArray(response.data?.transactions)?response.data.transactions:[],
        settings:response.data?.settings||{},
        emailLog:Array.isArray(response.data?.emailLog)?response.data.emailLog:[]
      };
      localStorage.setItem('alvu_backup',JSON.stringify(DB));
      $('#syncText').textContent='Planilha sincronizada';
    }else{
      DB=JSON.parse(localStorage.getItem('alvu_backup')||'{"clients":[],"debts":[],"transactions":[],"settings":{},"emailLog":[]}');
      $('#syncText').textContent='Modo local — configure o Apps Script';
    }
    render();
    if(notify)toast('Dados atualizados.');
  }catch(e){
    DB=JSON.parse(localStorage.getItem('alvu_backup')||'{"clients":[],"debts":[],"transactions":[],"settings":{},"emailLog":[]}');
    $('#syncText').textContent='Backup local';
    render();
    toast(e.message);
  }finally{
    hideLoading();
  }
}

async function save(){
  localStorage.setItem('alvu_backup',JSON.stringify(DB));
  render();
  if(apiReady()){
    try{
      await request('save',{payload:JSON.stringify(DB)},'POST');
      $('#syncText').textContent='Salvo na planilha';
    }catch(e){
      $('#syncText').textContent='Backup local';
      toast('Salvo localmente. '+e.message);
    }
  }
}

function loading(t){$('#loadingText').textContent=t;$('#loading').classList.remove('hide');}
function hideLoading(){$('#loading').classList.add('hide');}
function toast(t){const x=$('#toast');x.textContent=t;x.classList.remove('hide');clearTimeout(x.t);x.t=setTimeout(()=>x.classList.add('hide'),3200);}

function status(c){
  if(c.status==='Pago')return{key:'paid',label:'Pago • próximo '+br(c.nextDue)};
  if(c.status==='Parcial'){
    const pago=Number(c.cyclePaid||0),total=Number(c.monthly||0);
    return{key:'pending',label:'Pago parcial • '+money(pago)+' de '+money(total)};
  }
  const d=dayDiff(c.nextDue);
  return d<0?{key:'late',label:Math.abs(d)+' dia(s) atrasado'}:{key:'pending',label:d===0?'Vence hoje':d+' dia(s) para vencer'};
}

function dayDiff(date){
  const a=new Date(today()+'T12:00:00'),b=new Date(String(date||today())+'T12:00:00');
  return Math.round((b-a)/86400000);
}
function br(d){return d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR'):'—';}

function render(){
  const titles={dashboard:'Dashboard financeiro',clients:'Empresas e cobranças',debts:'Controle de dívidas',transactions:'Movimentações',settings:'Configuração'};
  $('#pageTitle').textContent=titles[PAGE];
  $('#view').innerHTML=({dashboard,clients,debts,transactions,settings})[PAGE]();
}

function totals(){
  const income=DB.transactions.filter(x=>x.type==='Entrada').reduce((s,x)=>s+Number(x.value||0),0),
    outs=DB.transactions.filter(x=>x.type==='Saída'),
    expenses=outs.reduce((s,x)=>s+Number(x.value||0),0),
    companySpent=outs.filter(x=>(x.bucket||'Empresa')==='Empresa').reduce((s,x)=>s+Number(x.value||0),0),
    debtPaid=outs.filter(x=>x.bucket==='Dívidas'||x.category==='Dívidas').reduce((s,x)=>s+Number(x.value||0),0),
    proSpent=outs.filter(x=>x.bucket==='Pró-labore').reduce((s,x)=>s+Number(x.value||0),0);
  return{income,expenses,debtPaid,company:income*.4-companySpent,debts:income*.4-debtPaid,prolabore:income*.2-proSpent,balance:income-expenses};
}

function dashboard(){
  const t=totals(),expected=DB.clients.reduce((s,x)=>s+Number(x.monthly||0),0),late=DB.clients.filter(x=>status(x).key==='late').length;
  return `<section class="hero"><small>ALVUFINANCEIRO</small><h1>Seu dinheiro com direção.</h1><p>Cada entrada é distribuída automaticamente: 40% empresa, 40% dívidas e 20% pró-labore.</p></section><div class="stats"><div class="stat"><small>Recebido</small><b>${money(t.income)}</b></div><div class="stat"><small>Mensal previsto</small><b>${money(expected)}</b></div><div class="stat"><small>Saldo geral</small><b>${money(t.balance)}</b></div><div class="stat"><small>Clientes atrasados</small><b>${late}</b></div></div><div class="split"><section class="panel"><div class="panel-head"><h3>Quanto você pode gastar</h3><span class="badge paid">40 • 40 • 20</span></div><div class="allocation">${allocation('Operação da empresa',t.company,'Saldo disponível após gastos da empresa','#1769e0')}${allocation('Pagamento de dívidas',t.debts,'Saldo disponível da reserva de dívidas','#e98b15')}${allocation('Pró-labore',t.prolabore,'Saldo disponível para pró-labore','#119767')}</div></section><section class="panel"><div class="panel-head"><h3>Próximos vencimentos</h3></div>${DB.clients.slice().sort((a,b)=>String(a.nextDue).localeCompare(String(b.nextDue))).slice(0,6).map(c=>`<div style="padding:10px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between"><div><b style="font-size:11px">${esc(c.company)}</b><small style="display:block">${br(c.nextDue)}</small></div><span class="badge ${status(c).key}">${status(c).label}</span></div>`).join('')||'<p>Nenhuma empresa cadastrada.</p>'}</section></div>`;
}

function allocation(name,value,sub,color){return `<div class="allocation-row"><div><span>${name}</span><b>${money(value)}</b></div><small>${sub}</small><div class="bar"><i style="width:100%;background:${color}"></i></div></div>`;}

function clients(){return `<div class="section-head"><div><h3>Contratos mensais</h3><p>Cadastre, cobre, envie e acompanhe cada empresa.</p></div><button class="btn primary" onclick="clientForm()">+ Nova empresa</button></div><div class="table-wrap"><table><thead><tr><th>Empresa</th><th>Contato</th><th>Serviço</th><th>Mensalidade</th><th>Vencimento</th><th>Situação</th><th>Ações</th></tr></thead><tbody>${DB.clients.map(c=>`<tr><td><b>${esc(c.company)}</b><br>${esc(c.responsible)}</td><td>${esc(c.phone)}<br>${esc(c.email)}</td><td>${esc(c.service)}</td><td><b>${money(c.monthly)}</b></td><td>${br(c.nextDue)}</td><td><span class="badge ${status(c).key}">${status(c).label}</span></td><td><div class="actions"><button class="btn light small" onclick="charge('${c.id}')">Cobrança</button><button class="btn primary small" onclick="markPaid('${c.id}')">Pago</button><button class="btn light small" onclick="markPending('${c.id}')">Pendente</button><button class="btn light small" onclick="clientForm('${c.id}')">Editar</button><button class="btn danger small" onclick="removeClient('${c.id}')">Excluir</button></div></td></tr>`).join('')||'<tr><td colspan="7">Nenhuma empresa cadastrada.</td></tr>'}</tbody></table></div>`;}

function clientForm(id=''){
  const c=DB.clients.find(x=>x.id===id)||{};
  modal(id?'Editar empresa':'Nova empresa',`<form id="form" class="form-grid"><div class="field"><label>Empresa *</label><input name="company" value="${esc(c.company||'')}" required></div><div class="field"><label>Responsável *</label><input name="responsible" value="${esc(c.responsible||'')}" required></div><div class="field"><label>Telefone</label><input name="phone" value="${esc(c.phone||'')}"></div><div class="field"><label>E-mail *</label><input type="email" name="email" value="${esc(c.email||'')}" required></div><div class="field"><label>Mensalidade</label><input type="number" step="0.01" name="monthly" value="${c.monthly||''}" required></div><div class="field"><label>Próximo vencimento</label><input type="date" name="nextDue" value="${c.nextDue||today()}" required></div><div class="field span"><label>Serviço / descrição</label><textarea name="service">${esc(c.service||'')}</textarea></div></form>`,async()=>{
    const q=Object.fromEntries(new FormData($('#form')));
    q.monthly=Number(q.monthly);
    if(!q.company||!q.email)return toast('Preencha os campos obrigatórios.');
    if(id)Object.assign(c,q);else DB.clients.push({...q,id:uid(),status:'Pendente',createdAt:new Date().toISOString()});
    closeModal();loading('Salvando empresa...');await save();hideLoading();toast('Empresa salva.');
  });
}

function addMonth(date){const d=new Date(date+'T12:00:00'),day=d.getDate();d.setMonth(d.getMonth()+1,1);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return iso(d);}

async function markPaid(id){
  const c=DB.clients.find(x=>x.id===id);if(!c)return;
  if(c.status==='Pago')return toast('Este ciclo já está marcado como pago.');

  const total=Number(c.monthly||0);
  const jaPago=Number(c.cyclePaid||0);
  const restante=Math.max(0,total-jaPago);

  modal('Registrar pagamento — '+c.company,`
    <form id="paymentForm" class="form-grid">
      <div class="field span">
        <label>Como o cliente pagou?</label>
        <select name="paymentMode" id="paymentMode">
          <option value="full">Pago completo</option>
          <option value="partial">Pago parcelado</option>
        </select>
      </div>
      <div class="field span" id="partialPaymentField" style="display:none">
        <label>Quanto o cliente pagou agora?</label>
        <input type="number" step="0.01" min="0.01" max="${restante}" name="partialValue" placeholder="Ex.: 350,00">
        <small>Mensalidade: ${money(total)}${jaPago>0?' • já recebido neste ciclo: '+money(jaPago):''}</small>
      </div>
    </form>`,async()=>{
      const fd=new FormData($('#paymentForm'));
      const mode=fd.get('paymentMode');
      let value=mode==='full'?restante:Number(fd.get('partialValue'));

      if(restante<=0)return toast('Não há valor restante neste ciclo.');
      if(!Number.isFinite(value)||value<=0)return toast('Informe um valor de pagamento válido.');
      if(value>restante)return toast('O valor informado é maior que o restante da mensalidade.');

      loading('Registrando pagamento...');
      DB.transactions.push({
        id:uid(),
        date:today(),
        type:'Entrada',
        category:'Mensalidade',
        description:(mode==='partial'?'Pagamento parcelado — ':'Mensalidade — ')+c.company,
        value,
        clientId:c.id,
        paymentMode:mode
      });

      c.cyclePaid=jaPago+value;

      if(mode==='full'||c.cyclePaid>=total){
        c.lastPaidAt=new Date().toISOString();
        c.lastPaidDue=c.nextDue;
        c.nextDue=addMonth(c.nextDue);
        c.status='Pago';
        c.cyclePaid=0;
      }else{
        c.status='Parcial';
      }

      closeModal();
      await save();
      hideLoading();
      toast(c.status==='Pago'?'Pagamento completo registrado. Valor dividido em 40% / 40% / 20%.':'Pagamento parcial registrado: '+money(value)+'.');
    });

  $('#paymentMode').onchange=e=>{
    $('#partialPaymentField').style.display=e.target.value==='partial'?'block':'none';
  };
}
function markPending(id){const c=DB.clients.find(x=>x.id===id);if(!c)return;c.status='Pendente';save();toast('Situação alterada para pendente.');}
function removeClient(id){if(!confirm('Excluir esta empresa?'))return;DB.clients=DB.clients.filter(x=>x.id!==id);save();}

function message(c){
  const d=dayDiff(c.nextDue),name=c.responsible||c.company,val=money(c.monthly),due=br(c.nextDue);
  if(c.status==='Pago')return `Olá, ${name}! Confirmamos o pagamento da mensalidade. Muito obrigado! O próximo vencimento será em ${due}.`;
  if(d===0)return `Olá, ${name}! Passando para lembrar que a mensalidade de ${val}, referente aos serviços da ALVU, vence hoje (${due}). O pagamento pode ser realizado via Pix pela chave ${PAYEE.key}, em nome de ${PAYEE.name} — ${PAYEE.bank}. Caso já tenha pago, desconsidere. Obrigado!`;
  if(d===-1)return `Olá, ${name}! Identificamos que a mensalidade de ${val} venceu ontem (${due}) e ainda consta como pendente. Você pode regularizar via Pix pela chave ${PAYEE.key}, em nome de ${PAYEE.name} — ${PAYEE.bank}. Se já realizou o pagamento, envie o comprovante para atualizarmos. Obrigado!`;
  if(d<0)return `Olá, ${name}! Tudo bem? A mensalidade de ${val}, vencida em ${due}, está há ${Math.abs(d)} dias em atraso. Para regularizar, utilize o Pix ${PAYEE.key}, em nome de ${PAYEE.name} — ${PAYEE.bank}. Se precisar alinhar a data, fale conosco. Caso já tenha pago, envie o comprovante. Obrigado!`;
  return `Olá, ${name}! Lembramos que a mensalidade de ${val} vence ${d===1?'amanhã':'em '+d+' dias'}, no dia ${due}. Para facilitar, o pagamento pode ser feito via Pix ${PAYEE.key}, em nome de ${PAYEE.name} — ${PAYEE.bank}. Obrigado!`;
}

function tlv(id,value){value=String(value);return id+String(value.length).padStart(2,'0')+value;}
function clean(s,max){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9 $%*+\-./:]/gi,' ').toUpperCase().trim().slice(0,max);}
function crc16(s){let crc=0xffff;for(let i=0;i<s.length;i++){crc^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)crc=(crc&0x8000)?(crc<<1)^0x1021:crc<<1;crc&=0xffff;}return crc.toString(16).toUpperCase().padStart(4,'0');}
function pixPayload(value,txid){const gui=tlv('00','BR.GOV.BCB.PIX'),key=tlv('01',String(PAYEE.key).replace(/\D/g,'')),mai=tlv('26',gui+key),base=tlv('00','01')+tlv('01','11')+mai+tlv('52','0000')+tlv('53','986')+tlv('54',Number(value).toFixed(2))+tlv('58','BR')+tlv('59',clean(PAYEE.name,25))+tlv('60',clean(PAYEE.city,15))+tlv('62',tlv('05',clean(txid||'ALVU',25)))+'6304';return base+crc16(base);}

function carneData(c){
  const paid=Number(c.cyclePaid||0);
  const total=Number(c.monthly||0);
  const value=Math.max(0,total-paid)||total;
  const pix=pixPayload(value,'ALVU'+c.id.slice(0,12));
  const qr='https://quickchart.io/qr?size=420&margin=1&text='+encodeURIComponent(pix);
  const ref=new Date((c.nextDue||today())+'T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).toUpperCase();
  return{paid,total,value,pix,qr,ref};
}

function carnePreviewHtml(c){
  const d=carneData(c),late=dayDiff(c.nextDue)<0;
  return `
  <div style="max-width:760px;margin:auto;background:#fff;border:1px solid #dce4ea;border-radius:20px;overflow:hidden;box-shadow:0 14px 38px rgba(6,35,55,.12);font-family:Arial,sans-serif;color:#102d3f">
    <div style="background:linear-gradient(135deg,#082d46,#0b4566);padding:24px 28px;color:#fff;display:flex;justify-content:space-between;gap:20px;align-items:center">
      <div><div style="font-size:11px;letter-spacing:3px;font-weight:800;color:#d5aa63">ALVU FINANCEIRO</div><div style="font-size:27px;font-weight:900;margin-top:6px">CARNÊ DE PAGAMENTO</div><div style="font-size:12px;opacity:.82;margin-top:4px">Documento de cobrança • pagamento via Pix</div></div>
      <div style="background:#fff;color:#0a3e5b;padding:12px 16px;border-radius:13px;text-align:center;min-width:125px"><div style="font-size:9px;font-weight:800;letter-spacing:1px">VENCIMENTO</div><div style="font-size:18px;font-weight:900;margin-top:4px">${br(c.nextDue)}</div></div>
    </div>
    <div style="padding:22px 26px">
      <div style="display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="background:#f5f8fa;border:1px solid #e3e9ed;padding:14px;border-radius:12px"><small style="font-size:9px;color:#6b7c88;font-weight:800">CLIENTE</small><div style="font-size:14px;font-weight:900;margin-top:5px">${esc(c.company)}</div><div style="font-size:10px;color:#526672;margin-top:3px">${esc(c.responsible||'Responsável não informado')}</div></div>
        <div style="background:#f5f8fa;border:1px solid #e3e9ed;padding:14px;border-radius:12px"><small style="font-size:9px;color:#6b7c88;font-weight:800">REFERÊNCIA</small><div style="font-size:13px;font-weight:900;margin-top:5px">${d.ref}</div><div style="font-size:10px;color:#526672;margin-top:3px">${esc(c.service||'Serviços contratados')}</div></div>
        <div style="background:${late?'#fff1ee':'#eef9f4'};border:1px solid ${late?'#f3c7bd':'#cbe9dc'};padding:14px;border-radius:12px"><small style="font-size:9px;color:${late?'#a33c2b':'#19734e'};font-weight:800">VALOR DESTA PARCELA</small><div style="font-size:22px;font-weight:900;margin-top:5px;color:${late?'#982f20':'#0d6a48'}">${money(d.value)}</div>${d.paid>0?`<div style="font-size:9px;margin-top:3px">Já recebido: ${money(d.paid)}</div>`:''}</div>
      </div>
      <div style="border-radius:15px;background:linear-gradient(90deg,#0a3550 0 38%,#f7faf9 38%);border:1px solid #dce7e2;display:grid;grid-template-columns:.65fr 1fr;overflow:hidden;margin-bottom:16px">
        <div style="padding:18px;color:#fff"><div style="font-size:12px;color:#e1bb78;font-weight:900">PAGUE EM DIA</div><div style="font-size:11px;line-height:1.5;margin-top:6px;opacity:.92">Mantenha seu contrato regular e evite pendências no financeiro.</div></div>
        <div style="padding:18px 20px;display:flex;gap:18px;align-items:center;justify-content:space-around"><div style="text-align:center"><div style="font-size:20px">✓</div><b style="font-size:10px">CONTRATO REGULAR</b></div><div style="text-align:center"><div style="font-size:20px">🔒</div><b style="font-size:10px">PIX SEGURO</b></div><div style="text-align:center"><div style="font-size:20px">⚡</div><b style="font-size:10px">BAIXA RÁPIDA</b></div></div>
      </div>
      <div style="display:grid;grid-template-columns:190px 1fr;gap:20px;border:1px solid #dce4e9;border-radius:14px;padding:18px;align-items:center">
        <div style="text-align:center"><div style="font-size:10px;font-weight:900;color:#087b54;margin-bottom:8px">ESCANEIE PARA PAGAR</div><div style="background:#fff;border:7px solid #0f9c70;border-radius:12px;padding:6px;display:inline-block"><img src="${d.qr}" style="width:145px;height:145px;display:block" alt="QR Code Pix"></div></div>
        <div><small style="font-size:9px;color:#697b86;font-weight:800">PIX COPIA E COLA</small><div style="margin-top:6px;background:#eef7f3;border:1px solid #cfe8dc;border-radius:9px;padding:9px;font-size:9px;word-break:break-all;max-height:60px;overflow:auto">${esc(d.pix)}</div><div style="margin-top:12px;font-size:12px"><b>Chave Pix:</b> ${PAYEE.key}</div><div style="margin-top:5px;font-size:11px"><b>Recebedor:</b> ${PAYEE.name}</div><div style="margin-top:5px;font-size:11px"><b>Instituição:</b> ${PAYEE.bank}</div><div style="margin-top:5px;font-size:11px"><b>Cidade:</b> URUÇUÍ - PIAUÍ</div></div>
      </div>
      <div style="border-top:1px dashed #9aabb5;margin:20px -4px 0;padding:15px 4px 0;display:flex;justify-content:space-between;gap:14px;align-items:center"><div><small style="font-size:9px;color:#6b7d88;font-weight:800">FICHA DA PARCELA</small><div style="font-size:13px;font-weight:900;margin-top:4px">${esc(c.company)} • ${d.ref}</div><div style="font-size:10px;color:#5c6e79;margin-top:3px">Vencimento ${br(c.nextDue)} • Pagamento via Pix</div></div><div style="text-align:right"><small style="font-size:9px;color:#6b7d88;font-weight:800">VALOR</small><div style="font-size:19px;font-weight:900;color:#0a3f5c">${money(d.value)}</div></div></div>
    </div>
    <div style="background:#082d46;color:#d9e7ee;padding:11px 26px;text-align:center;font-size:9px;letter-spacing:.3px">ALVU FINANCEIRO • COBRANÇA DIGITAL • GUARDE ESTE DOCUMENTO ATÉ A CONFIRMAÇÃO DO PAGAMENTO</div>
  </div>`;
}

function charge(id){
  const c=DB.clients.find(x=>x.id===id);
  if(!c)return toast('Empresa não encontrada.');
  const d=carneData(c),msg=message(c);
  modal('Carnê — '+c.company,`${carnePreviewHtml(c)}<div class="actions" style="justify-content:center;margin-top:16px"><button class="btn light" id="copyPixBtn">Copiar Pix</button><button class="btn light" id="copyMsgBtn">Copiar mensagem</button><button class="btn primary" onclick="downloadPdf('${c.id}')">Imprimir / Salvar PDF</button><button class="btn dark" onclick="sendEmail('${c.id}')">Enviar e-mail</button></div>`);
  $('#copyPixBtn').onclick=()=>copyText(d.pix);
  $('#copyMsgBtn').onclick=()=>copyText(msg);
}

async function copyText(t){await navigator.clipboard.writeText(t);toast('Copiado.');}
async function sendEmail(id){loading('Enviando cobrança por e-mail...');try{await request('sendCharge',{clientId:id},'POST');toast('E-mail enviado.');}catch(e){toast(e.message);}finally{hideLoading();}}

function carneDocumentHtml(c){
  const body=carnePreviewHtml(c);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carnê - ${esc(c.company)}</title><style>*{box-sizing:border-box}body{margin:0;padding:18px;background:#eef2f4;font-family:Arial,sans-serif}@page{size:A4;margin:10mm}@media print{body{background:#fff;padding:0}button{display:none!important}}</style></head><body>${body}<div style="max-width:760px;margin:14px auto;text-align:center"><button onclick="window.print()" style="border:0;border-radius:10px;padding:12px 18px;background:#0a4566;color:#fff;font-weight:800;cursor:pointer">Imprimir / Salvar em PDF</button></div></body></html>`;
}

async function downloadPdf(id){
  const c=DB.clients.find(x=>x.id===id);
  if(!c)return toast('Empresa não encontrada.');
  const w=window.open('','_blank');
  if(!w)return toast('Permita pop-ups para gerar o carnê.');
  w.document.open();
  w.document.write(carneDocumentHtml(c));
  w.document.close();
  w.focus();
  setTimeout(()=>w.print(),700);
}

function debts(){
  const open=DB.debts.reduce((s,x)=>s+Math.max(0,Number(x.total)-Number(x.paid||0)),0);
  return `<div class="section-head"><div><h3>Dívidas da agência</h3><p>Saldo devedor total: <b>${money(open)}</b></p></div><div class="actions"><button class="btn dark" onclick="paymentAdvisor()">Assessor de pagamentos</button><button class="btn primary" onclick="debtForm()">+ Nova dívida</button></div></div><div class="grid">${DB.debts.map(d=>{const left=Math.max(0,Number(d.total)-Number(d.paid||0)),pct=Math.min(100,Number(d.paid||0)/Number(d.total||1)*100);return `<article class="card"><span class="badge ${left?'pending':'paid'}">${left?'Em aberto':'Quitada'}</span><h4>${esc(d.creditor)}</h4><p>${esc(d.description)}</p><b>${money(left)} restantes</b><div class="bar"><i style="width:${pct}%"></i></div><p>Pago ${money(d.paid)} de ${money(d.total)} • vence ${br(d.due)}</p><div class="actions"><button class="btn primary small" onclick="payDebt('${d.id}')">Abater valor</button><button class="btn light small" onclick="debtForm('${d.id}')">Editar</button><button class="btn danger small" onclick="removeDebt('${d.id}')">Excluir</button></div></article>`;}).join('')||'<div class="card">Nenhuma dívida cadastrada.</div>'}</div>`;
}

function advisorPlan(baseValue){
  const base=Math.max(0,Number(baseValue||0));
  const split={company:base*.4,debts:base*.4,prolabore:base*.2};
  let available=split.debts;
  const debtPlan=DB.debts
    .map(d=>({...d,left:Math.max(0,Number(d.total)-Number(d.paid||0))}))
    .filter(d=>d.left>0)
    .sort((a,b)=>String(a.due||'9999-12-31').localeCompare(String(b.due||'9999-12-31')))
    .map(d=>{
      const suggested=Math.min(d.left,available);
      available=Math.max(0,available-suggested);
      return{id:d.id,creditor:d.creditor,due:d.due,left:d.left,suggested};
    });
  return{base,split,debtPlan,unusedDebtReserve:available};
}

function renderAdvisorResult(baseValue){
  const plan=advisorPlan(baseValue);
  const target=$('#advisorResult');
  if(!target)return;
  target.innerHTML=`
    <div class="grid" style="margin-top:14px">
      <div class="card"><small>40% Empresa</small><h4>${money(plan.split.company)}</h4></div>
      <div class="card"><small>40% Dívidas</small><h4>${money(plan.split.debts)}</h4></div>
      <div class="card"><small>20% Pró-labore</small><h4>${money(plan.split.prolabore)}</h4></div>
    </div>
    <div class="table-wrap" style="margin-top:14px">
      <table>
        <thead><tr><th>Dívida</th><th>Vencimento</th><th>Saldo</th><th>Pagamento sugerido</th></tr></thead>
        <tbody>${plan.debtPlan.map(d=>`<tr><td><b>${esc(d.creditor)}</b></td><td>${br(d.due)}</td><td>${money(d.left)}</td><td><b>${money(d.suggested)}</b></td></tr>`).join('')||'<tr><td colspan="4">Nenhuma dívida em aberto.</td></tr>'}</tbody>
      </table>
    </div>
    ${plan.unusedDebtReserve>0?`<p style="margin-top:10px">Reserva de dívidas que sobra após quitar/abater as dívidas abertas: <b>${money(plan.unusedDebtReserve)}</b></p>`:''}
    <p style="color:var(--muted);font-size:11px;margin-top:10px">A prioridade é dada às dívidas com vencimento mais próximo. Nada é lançado até você confirmar.</p>`;
}

function paymentAdvisor(){
  const received=DB.transactions.filter(x=>x.type==='Entrada').reduce((s,x)=>s+Number(x.value||0),0);
  modal('Assessor de pagamentos',`
    <form id="advisorForm" class="form-grid">
      <div class="field span">
        <label>Qual valor deseja organizar?</label>
        <select id="advisorSource" name="source">
          <option value="received">Usar todo o valor recebido (${money(received)})</option>
          <option value="custom">Informar outro valor</option>
        </select>
      </div>
      <div class="field span" id="advisorCustomField" style="display:none">
        <label>Valor disponível para gestão</label>
        <input id="advisorCustomValue" type="number" min="0.01" step="0.01" placeholder="Ex.: 5.000,00">
      </div>
    </form>
    <div id="advisorResult"></div>
    <div class="actions" style="justify-content:flex-end;margin-top:17px">
      <button class="btn primary" id="advisorApplyBtn">Registrar pagamentos sugeridos</button>
    </div>`);

  const source=$('#advisorSource'),customField=$('#advisorCustomField'),custom=$('#advisorCustomValue');
  const currentBase=()=>source.value==='received'?received:Number(custom.value||0);
  const refresh=()=>renderAdvisorResult(currentBase());

  source.onchange=()=>{
    customField.style.display=source.value==='custom'?'block':'none';
    refresh();
  };
  custom.oninput=refresh;
  refresh();

  $('#advisorApplyBtn').onclick=async()=>{
    const plan=advisorPlan(currentBase());
    if(plan.base<=0)return toast('Informe um valor válido para organizar.');
    const payments=plan.debtPlan.filter(d=>d.suggested>0);
    if(!payments.length)return toast('Não há pagamento de dívida sugerido para registrar.');
    if(!confirm('Registrar '+payments.length+' pagamento(s) de dívida totalizando '+money(payments.reduce((s,x)=>s+x.suggested,0))+'?'))return;

    payments.forEach(p=>{
      const d=DB.debts.find(x=>x.id===p.id);
      if(!d)return;
      d.paid=Number(d.paid||0)+p.suggested;
      DB.transactions.push({
        id:uid(),
        date:today(),
        type:'Saída',
        category:'Dívidas',
        bucket:'Dívidas',
        description:'Assessor de pagamentos — '+d.creditor,
        value:p.suggested,
        debtId:d.id,
        advisor:true
      });
    });
    closeModal();
    loading('Registrando plano de pagamentos...');
    await save();
    hideLoading();
    toast('Plano do assessor registrado com sucesso.');
  };
}

function debtForm(id=''){
  const d=DB.debts.find(x=>x.id===id)||{};
  modal(id?'Editar dívida':'Nova dívida',`<form id="form" class="form-grid"><div class="field"><label>Credor / dívida</label><input name="creditor" value="${esc(d.creditor||'')}" required></div><div class="field"><label>Valor total</label><input type="number" step="0.01" name="total" value="${d.total||''}" required></div><div class="field"><label>Já pago</label><input type="number" step="0.01" name="paid" value="${d.paid||0}"></div><div class="field"><label>Vencimento</label><input type="date" name="due" value="${d.due||today()}"></div><div class="field span"><label>Descrição</label><textarea name="description">${esc(d.description||'')}</textarea></div></form>`,()=>{const q=Object.fromEntries(new FormData($('#form')));q.total=Number(q.total);q.paid=Number(q.paid);if(id)Object.assign(d,q);else DB.debts.push({...q,id:uid()});closeModal();save();toast('Dívida salva.');});
}

function payDebt(id){const d=DB.debts.find(x=>x.id===id);modal('Abater — '+d.creditor,`<form id="form"><div class="field"><label>Valor retirado da reserva de dívidas</label><input type="number" step="0.01" name="value" required></div></form>`,()=>{const v=Number(new FormData($('#form')).get('value'));if(v<=0)return;d.paid=Number(d.paid||0)+v;DB.transactions.push({id:uid(),date:today(),type:'Saída',category:'Dívidas',bucket:'Dívidas',description:'Pagamento — '+d.creditor,value:v,debtId:d.id});closeModal();save();toast('Abatimento registrado.');});}
function removeDebt(id){if(confirm('Excluir dívida?')){DB.debts=DB.debts.filter(x=>x.id!==id);save();}}

function transactions(){return `<div class="section-head"><div><h3>Histórico financeiro</h3><p>Todas as entradas e saídas.</p></div><button class="btn primary" onclick="transactionForm()">+ Lançamento</button></div><div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th></th></tr></thead><tbody>${DB.transactions.slice().reverse().map(x=>`<tr><td>${br(x.date)}</td><td><span class="badge ${x.type==='Entrada'?'paid':'late'}">${x.type}</span></td><td>${esc(x.category)}</td><td>${esc(x.description)}</td><td><b>${money(x.value)}</b></td><td><button class="btn danger small" onclick="removeTransaction('${x.id}')">Excluir</button></td></tr>`).join('')||'<tr><td colspan="6">Sem movimentações.</td></tr>'}</tbody></table></div>`;}

function transactionForm(){modal('Novo lançamento',`<form id="form" class="form-grid"><div class="field"><label>Data</label><input type="date" name="date" value="${today()}"></div><div class="field"><label>Tipo</label><select name="type"><option>Entrada</option><option>Saída</option></select></div><div class="field"><label>Categoria</label><input name="category" placeholder="Equipamento, imposto, aluguel..."></div><div class="field"><label>Retirar de qual reserva?</label><select name="bucket"><option>Empresa</option><option>Dívidas</option><option>Pró-labore</option></select></div><div class="field"><label>Valor</label><input type="number" step="0.01" name="value" required></div><div class="field"><label>Descrição</label><input name="description"></div></form>`,()=>{const q=Object.fromEntries(new FormData($('#form')));q.value=Number(q.value);DB.transactions.push({...q,id:uid()});closeModal();save();toast('Lançamento registrado.');});}
function removeTransaction(id){if(confirm('Excluir lançamento?')){DB.transactions=DB.transactions.filter(x=>x.id!==id);save();}}

function settings(){return `<section class="panel"><div class="panel-head"><h3>Dados de recebimento</h3></div><div class="grid"><div class="card"><small>Chave Pix</small><h4>${PAYEE.key}</h4></div><div class="card"><small>Destinatário</small><h4>${PAYEE.name}</h4></div><div class="card"><small>Instituição</small><h4>${PAYEE.bank}</h4></div></div><p style="color:var(--muted);font-size:11px">Automação: o Apps Script verifica diariamente os vencimentos, envia aviso quando faltam 2 dias e atualiza o status do novo ciclo.</p><button class="btn primary" onclick="testConnection()">Testar conexão</button></section>`;}

async function testConnection(){
  loading('Testando conexão...');
  try{
    const o=await request('ping');
    $('#syncText').textContent='Conexão ativa';
    toast('Conexão funcionando: '+(o.service||'ALVUFINANCEIRO'));
  }catch(e){
    $('#syncText').textContent='Erro de conexão';
    toast(e.message);
  }finally{hideLoading();}
}

function modal(title,body,onSave){
  $('#modal').innerHTML=`<div class="modal-box"><div class="modal-head"><h3>${esc(title)}</h3><button class="x" onclick="closeModal()">×</button></div>${body}${onSave?'<div style="text-align:right;margin-top:17px"><button id="modalSave" class="btn primary">Salvar</button></div>':''}</div>`;
  $('#modal').classList.remove('hide');
  if(onSave)$('#modalSave').onclick=onSave;
}
function closeModal(){$('#modal').classList.add('hide');}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal();};

if(sessionStorage.getItem('alvu_auth'))openApp();
