const KEY='move_local_complete_v1',M=[['home','fa-house','Início'],['empresas','fa-building','Empresas'],['quadro','fa-lightbulb','Quadro Criativo'],['campanhas','fa-bullhorn','Campanhas'],['pendencias','fa-triangle-exclamation','Pendências'],['textos','fa-file-lines','Meus Textos'],['agenda','fa-calendar-days','Agenda'],['tarefas','fa-list-check','Minhas Tarefas'],['curadoria','fa-icons','Curadoria']];let D=load(),R='home',CID='',cal=new Date(),CUR='all';

const MOVE_ACCESS_PASSWORD='DEUS2604';
const MOVE_AUTH_KEY='move_local_auth_v1';


// COLE AQUI A URL /exec GERADA AO IMPLANTAR O APPS SCRIPT COMO APLICATIVO DA WEB.
const MOVE_API_URL='https://script.google.com/macros/s/AKfycbydd_YHx04s5iFhFXeNUXnptdztQJXv2L2Ut9bWSWrg_O_9TuTbRYa_i2Y57sxWMeiCHA/exec';

let MOVE_SYNC_TIMER=null;
let MOVE_SYNCING=false;
let MOVE_SYNC_PENDING=false;

function moveApiConfigured(){
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(String(MOVE_API_URL||'').trim());
}
function moveSetSavedStatus(text){
  if(EL?.saved) EL.saved.textContent=text;
}
function moveEnsureLoading(){
  if(document.getElementById('moveCloudLoading'))return;
  const d=document.createElement('div');
  d.id='moveCloudLoading';
  d.style.cssText='position:fixed;inset:0;z-index:1000000;background:rgba(255,255,255,.96);display:none;align-items:center;justify-content:center;font-family:Inter,Arial,sans-serif';
  d.innerHTML=`<div style="text-align:center;max-width:360px;padding:30px">
    <div style="width:48px;height:48px;border:4px solid #ececec;border-top-color:#111;border-radius:50%;margin:0 auto 18px;animation:moveCloudSpin .8s linear infinite"></div>
    <div style="font-size:20px;font-weight:800;color:#111">Carregando seu painel</div>
    <div id="moveCloudLoadingText" style="margin-top:8px;color:#777;font-size:13px">Sincronizando dados com a planilha...</div>
  </div>`;
  document.body.appendChild(d);
  if(!document.getElementById('moveCloudSpinStyle')){
    const st=document.createElement('style');st.id='moveCloudSpinStyle';
    st.textContent='@keyframes moveCloudSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }
}
function moveShowLoading(text='Sincronizando dados com a planilha...'){
  moveEnsureLoading();
  const d=document.getElementById('moveCloudLoading');
  const t=document.getElementById('moveCloudLoadingText');
  if(t)t.textContent=text;
  if(d)d.style.display='flex';
}
function moveHideLoading(){const d=document.getElementById('moveCloudLoading');if(d)d.style.display='none'}
function moveSleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function moveFetchCloud(){
  if(!moveApiConfigured())return null;
  const r=await fetch(MOVE_API_URL+'?action=load&_='+Date.now(),{method:'GET',cache:'no-store',redirect:'follow'});
  if(!r.ok)throw new Error('Falha ao carregar banco: HTTP '+r.status);
  const out=await r.json();
  if(!out?.ok)throw new Error(out?.error||'Falha ao carregar banco');
  return out.data||null;
}
async function movePushCloudNow(){
  if(!moveApiConfigured())return false;
  if(MOVE_SYNCING){MOVE_SYNC_PENDING=true;return false}
  MOVE_SYNCING=true;
  MOVE_SYNC_PENDING=false;
  moveSetSavedStatus('Salvando na nuvem...');
  try{
    const payload=JSON.stringify(D);
    const body=new URLSearchParams();
    body.set('action','save');
    body.set('payload',payload);
    const r=await fetch(MOVE_API_URL,{method:'POST',body,redirect:'follow'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const out=await r.json();
    if(!out?.ok)throw new Error(out?.error||'Erro ao salvar');
    moveSetSavedStatus('Nuvem ✓ • '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}));
    return true;
  }catch(err){
    console.error('MOVE sync:',err);
    moveSetSavedStatus('Salvo neste aparelho • nuvem pendente');
    return false;
  }finally{
    MOVE_SYNCING=false;
    if(MOVE_SYNC_PENDING)moveScheduleSync(80);
  }
}
function moveScheduleSync(delay=350){
  if(!moveApiConfigured())return;
  clearTimeout(MOVE_SYNC_TIMER);
  MOVE_SYNC_TIMER=setTimeout(movePushCloudNow,delay);
}
async function moveLoadAfterLogin(){
  const started=Date.now();
  moveShowLoading(moveApiConfigured()?'Sincronizando dados com a planilha...':'Preparando seu painel...');
  try{
    if(moveApiConfigured()){
      const cloud=await moveFetchCloud();
      if(cloud && Object.values(cloud).some(v=>Array.isArray(v)&&v.length)){
        D=Object.assign(blank(),cloud);
        localStorage.setItem(KEY,JSON.stringify(D));
      }else{
        await movePushCloudNow();
      }
    }
  }catch(err){
    console.error('MOVE load cloud:',err);
    toast('Sem conexão com a planilha. Abrindo dados salvos neste aparelho.');
  }
  const rest=Math.max(0,3000-(Date.now()-started));
  if(rest)await moveSleep(rest);
  moveHideLoading();
  try{nav();render(R||'home')}catch(err){console.error(err)}
}


function ensureLogoutButton(){
  const topActions=document.querySelector('.top-actions')||document.querySelector('.top>div:last-child');
  if(!topActions||document.getElementById('logoutAccessBtn'))return;
  const b=document.createElement('button');
  b.id='logoutAccessBtn';
  b.className='btn dark sm';
  b.innerHTML='<i class="fa fa-right-from-bracket"></i> Sair';
  b.onclick=logoutAccess;
  topActions.appendChild(b);
}

function isAuthenticated(){
  return sessionStorage.getItem(MOVE_AUTH_KEY)==='1';
}
function applyAuthState(){
  const login=document.getElementById('loginScreen');
  const app=document.getElementById('appShell');
  if(!login||!app)return;
  if(isAuthenticated()){
    login.classList.add('is-hidden');
    app.classList.remove('auth-hidden');
    ensureLogoutButton();
    if(!window.__MOVE_CLOUD_BOOTED){
      window.__MOVE_CLOUD_BOOTED=true;
      setTimeout(()=>moveLoadAfterLogin(),0);
    }
  }else{
    login.classList.remove('is-hidden');
    app.classList.add('auth-hidden');
    setTimeout(()=>document.getElementById('loginPassword')?.focus(),80);
  }
}
function loginAccess(ev){
  if(ev)ev.preventDefault();
  const input=document.getElementById('loginPassword');
  const err=document.getElementById('loginError');
  const value=String(input?.value||'').trim();

  if(value===MOVE_ACCESS_PASSWORD){
    sessionStorage.setItem(MOVE_AUTH_KEY,'1');
    window.__MOVE_CLOUD_BOOTED=true;
    if(err)err.textContent='';
    if(input)input.value='';
    applyAuthState();
    moveLoadAfterLogin();
  }else{
    if(err)err.textContent='Senha incorreta.';
    if(input){
      input.value='';
      input.focus();
    }
  }
  return false;
}
function toggleLoginPassword(){
  const input=document.getElementById('loginPassword');
  const icon=document.querySelector('.login-eye i');
  if(!input)return;
  const show=input.type==='password';
  input.type=show?'text':'password';
  if(icon)icon.className=`fa ${show?'fa-eye-slash':'fa-eye'}`;
}
function logoutAccess(){
  sessionStorage.removeItem(MOVE_AUTH_KEY);
  window.__MOVE_CLOUD_BOOTED=false;
  applyAuthState();
}


if(D.finance)delete D.finance;if(D.contracts)delete D.contracts;

const EL={saved:document.getElementById('saved'),title:document.getElementById('title'),restore:document.getElementById('restore'),nav:document.getElementById('nav'),modal:document.getElementById('modal')};

function blank(){return{companies:[],weeks:[],contents:[],scheduled:[],tasks:[],texts:[],agenda:[],curadoria:[],campaigns:[]}}function load(){try{return Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return blank()}}function save(){localStorage.setItem(KEY,JSON.stringify(D));moveSetSavedStatus('Salvo local • sincronizando...');render(R);moveScheduleSync()}function id(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}function e(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}function date(v){if(!v)return'—';return new Date(String(v).slice(0,10)+'T12:00').toLocaleDateString('pt-BR')}function ini(n){return String(n||'M').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}function toast(x){let t=document.getElementById('toast');t.textContent=x;t.style.display='block';setTimeout(()=>t.style.display='none',2500)}function nav(){const navEl=document.getElementById('nav');navEl.innerHTML=M.map(x=>`<button class="${R===x[0]?'active':''}" onclick="go('${x[0]}')"><i class="fa ${x[1]}"></i>${x[2]}</button>`).join('')}function go(r){R=r;document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('p-'+r).classList.add('active');EL.title.textContent=M.find(x=>x[0]===r)?.[2]||'MOVE';nav();render(r)}function head(t,d,b=''){return`<div class="head"><div><h2>${t}</h2><p>${d}</p></div>${b}</div>`}function empty(t){return`<div class="empty">${t}</div>`}function render(r){({home,empresas,quadro,campanhas,pendencias,textos,agenda,tarefas,agendamento,curadoria}[r]||home)()}function modal(t,b,fn){let m=document.getElementById('modal');m.innerHTML=`<div class="modal"><div class="mh"><b>${t}</b><button class="btn light sm" onclick="closeM()">✕</button></div><div class="mb">${b}</div><div class="mf"><button class="btn light" onclick="closeM()">Cancelar</button>${fn?'<button class="btn primary" id="saveM">Salvar</button>':''}</div></div>`;m.classList.add('open');if(fn){const b=document.getElementById('saveM');if(b)b.onclick=fn}}function closeM(){const modalEl=document.getElementById('modal');modalEl.classList.remove('open');modalEl.innerHTML=''}function obj(f){let o={};new FormData(f).forEach((v,k)=>{if(!(v instanceof File))o[k]=v});return o}

const OBJETIVOS_OPCOES=[
  'Vender mais',
  'Gerar leads',
  'Atrair novos clientes',
  'Aumentar reconhecimento da marca',
  'Fortalecer autoridade',
  'Gerar engajamento',
  'Criar conexão com o público',
  'Fidelizar clientes',
  'Divulgar produtos/serviços',
  'Aumentar visitas ao perfil',
  'Aumentar alcance',
  'Gerar desejo',
  'Impulsionar matrículas/agendamentos',
  'Educar o público'
];

const LINHAS_CONTEUDO_OPCOES=[
  'Educacional',
  'Conexão',
  'Oferta',
  'Autoridade',
  'Entretenimento',
  'Institucional',
  'Bastidores',
  'Prova social',
  'Dicas',
  'Curiosidades',
  'Produto/Serviço',
  'Vendas',
  'Relacionamento',
  'Engajamento',
  'Tendências',
  'Datas comemorativas',
  'FAQ/Dúvidas',
  'Antes e depois',
  'Depoimentos',
  'Rotina'
];

const TONS_COMUNICACAO_OPCOES=[
  'Festeiro',
  'Educacional',
  'Sério',
  'Criativo',
  'Infantil',
  'Divertido',
  'Descontraído',
  'Profissional',
  'Elegante',
  'Premium',
  'Popular',
  'Jovem',
  'Moderno',
  'Institucional',
  'Inspirador',
  'Motivacional',
  'Emocional',
  'Acolhedor',
  'Humano',
  'Próximo',
  'Amigável',
  'Autoridade',
  'Especialista',
  'Informativo',
  'Didático',
  'Direto',
  'Objetivo',
  'Persuasivo',
  'Comercial',
  'Vendedor',
  'Provocativo',
  'Irreverente',
  'Humorado',
  'Leve',
  'Enérgico',
  'Urgente',
  'Exclusivo',
  'Sofisticado',
  'Confiante',
  'Empático',
  'Familiar',
  'Regional',
  'Descolado',
  'Tecnológico'
];


function multiSelectField(name,label,options,current=''){
  const selected=String(current||'')
    .split('|')
    .map(v=>v.trim())
    .filter(Boolean);

  return `<div class="field span">
    <label>${label}</label>
    <div class="move-check-grid" data-name="${name}">
      ${options.map(v=>`
        <label class="move-check-chip">
          <input type="checkbox" name="${name}" value="${e(v)}" ${selected.includes(v)?'checked':''}>
          <span>${e(v)}</span>
        </label>
      `).join('')}
    </div>
    <small class="move-check-help">Marque quantas opções quiser.</small>
  </div>`;
}

function objMulti(f){
  let o=obj(f);

  ['objetivos','linhas','objetivo','linha','tons'].forEach(k=>{
    const checked=[...f.querySelectorAll(`input[name="${k}"]:checked`)];
    if(checked.length){
      o[k]=checked.map(x=>x.value).join(' | ');
    }else if(f.querySelector(`input[name="${k}"]`)){
      o[k]='';
    }
  });

  return o;
}

function home(){let p=D.contents.length,m=D.scheduled.length,pe=pend().length;
  const demandCards=[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>{
    const weekly=Number(c.reels||0)+Number(c.posts||0)+Number(c.stories||0)+Number(c.captacoes||0);
    const monthly=weekly*4;
    const tasks=D.tasks.filter(t=>t.companyId===c.id);
    const pendingTasks=tasks.filter(t=>(t.status||'Pendente')!=='Concluída').length;
    const doneTasks=tasks.filter(t=>t.status==='Concluída').length;
    const contentsMonth=D.contents.filter(x=>x.companyId===c.id).length;
    const scheduledMonth=D.scheduled.filter(x=>x.companyId===c.id).length;
    const workload=monthly+pendingTasks;
    return `<div class="card company">
      <div class="avatar">${ini(c.nome)}</div>
      <h3>${e(c.nome)}</h3>
      <div class="meta">Demanda mensal estimada</div>
      <div class="stats" style="grid-template-columns:repeat(3,1fr)">
        <div class="mini"><b>${monthly}</b><span>VOLUME/MÊS</span></div>
        <div class="mini"><b>${pendingTasks}</b><span>TAREFAS ABERTAS</span></div>
        <div class="mini"><b>${workload}</b><span>CARGA ATUAL</span></div>
      </div>
      <div class="meta" style="margin-top:10px">Planejados: <b>${contentsMonth}</b> • Produzidos: <b>${scheduledMonth}</b> • Finalizados: <b>${doneTasks}</b></div>
    </div>`;
  }).join('');
  document.getElementById('p-home').innerHTML=
    head('Visão geral','Tudo salvo localmente e abrindo instantaneamente.')
    +`<div class="grid kpis"><div class="card kpi"><i class="fa fa-building"></i><b>${D.companies.length}</b><span>empresas</span></div><div class="card kpi"><i class="fa fa-lightbulb"></i><b>${p}</b><span>planejamentos</span></div><div class="card kpi"><i class="fa fa-photo-film"></i><b>${m}</b><span>materiais produzidos</span></div><div class="card kpi"><i class="fa fa-triangle-exclamation"></i><b>${pe}</b><span>pendências</span></div></div>`
    +`<div class="card section" style="margin-top:14px"><div class="list">${pend().slice(0,8).map(x=>`<div class="item"><div><strong>${e(x.company)} — ${e(x.title)}</strong><small>${e(x.detail)}</small></div><span class="badge warn">${x.type}</span></div>`).join('')||empty('Tudo em dia.')}</div></div>`
    +`<div style="margin-top:18px">${head('Demandas mensais','Cálculo por empresa usando o volume semanal x4 e as tarefas abertas.')}</div>`
    +`<div class="grid companies">${demandCards||empty('Cadastre empresas para calcular as demandas.')}</div>`;
}
function empresas(){
  document.getElementById('p-empresas').innerHTML=
    head('Empresas','Cadastre clientes e volume semanal.',`<button class="btn primary" onclick="company()">+ Nova empresa</button>`)
    +`<div class="grid companies">${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`
      <div class="card company">
        <div class="avatar">${ini(c.nome)}</div>
        <h3>${e(c.nome)}</h3>
        <div class="meta">${e(c.responsavel||'—')} • ${e(c.telefone||'')}</div>
        ${c.cor?`<div class="meta" style="display:flex;align-items:center;gap:6px;margin-top:6px"><span style="width:12px;height:12px;border-radius:50%;background:${e(c.cor)};border:1px solid #ddd;display:inline-block"></span> ${e(c.cor)}</div>`:''}
        <div class="stats">
          <div class="mini"><b>${c.reels||0}</b><span>REELS</span></div>
          <div class="mini"><b>${c.posts||0}</b><span>POSTS</span></div>
          <div class="mini"><b>${c.stories||0}</b><span>STORIES</span></div>
        </div>
        <div class="actions">
          <button class="btn light sm" onclick="company('${c.id}')"><i class="fa fa-pen"></i> Editar</button>
          <button class="btn dark sm" onclick="board('${c.id}')"><i class="fa fa-table-columns"></i> Quadro</button>
          <button class="btn danger sm" onclick="deleteCompany('${c.id}')"><i class="fa fa-trash"></i> Excluir</button>
        </div>
      </div>`).join('')||empty('Nenhuma empresa.')}</div>`;
}
function deleteCompany(companyId){
  const c=D.companies.find(x=>x.id===companyId);
  if(!c)return;

  const weeks=D.weeks.filter(x=>x.companyId===companyId);
  const contents=D.contents.filter(x=>x.companyId===companyId);
  const tasks=D.tasks.filter(x=>x.companyId===companyId);
  const scheduled=D.scheduled.filter(x=>x.companyId===companyId);
  const refs=D.curadoria.filter(x=>x.companyId===companyId);
  const campaigns=D.campaigns.filter(x=>x.companyId===companyId);

  const msg=`Excluir a empresa "${c.nome}"?

Isso também removerá:
• ${weeks.length} semana(s)
• ${contents.length} conteúdo(s)
• ${tasks.length} tarefa(s)
• ${scheduled.length} upload(s)/material(is)
• ${refs.length} referência(s) de curadoria
• ${campaigns.length} campanha(s)

Essa ação não pode ser desfeita.`;

  if(!confirm(msg))return;

  D.companies=D.companies.filter(x=>x.id!==companyId);
  D.weeks=D.weeks.filter(x=>x.companyId!==companyId);
  D.contents=D.contents.filter(x=>x.companyId!==companyId);
  D.tasks=D.tasks.filter(x=>x.companyId!==companyId);
  D.scheduled=D.scheduled.filter(x=>x.companyId!==companyId);
  D.curadoria=D.curadoria.filter(x=>x.companyId!==companyId);
  D.campaigns=D.campaigns.filter(x=>x.companyId!==companyId);

  if(CID===companyId)CID='';
  save();
  empresas();
  toast('Empresa excluída.');
}
function company(x=''){
  let c=D.companies.find(a=>a.id===x)||{};
  modal('Empresa',`<form id="f" class="fg">
    <div class="field"><label>Nome *</label><input name="nome" value="${e(c.nome||'')}" required></div>
    <div class="field"><label>Responsável</label><input name="responsavel" value="${e(c.responsavel||'')}"></div>
    <div class="field"><label>Telefone</label><input name="telefone" value="${e(c.telefone||'')}"></div>
    <div class="field"><label>E-mail</label><input name="email" value="${e(c.email||'')}"></div>
    <div class="field">
      <label>Cor da empresa</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="color" name="cor" value="${e(c.cor||'#fca311')}" style="width:52px;height:42px;padding:4px;cursor:pointer">
        <input type="text" value="${e(c.cor||'#fca311')}" oninput="this.previousElementSibling.value=this.value" onchange="this.previousElementSibling.value=this.value" placeholder="#000000" style="flex:1">
      </div>
      <small class="move-check-help">Cor principal/identidade visual da empresa.</small>
    </div>

    <div class="field span">
      <label>Sobre a empresa</label>
      <textarea name="sobre" style="min-height:150px" placeholder="Descreva a empresa, posicionamento, público, diferenciais, produtos, serviços, personalidade da marca e outras definições importantes.">${e(c.sobre||'')}</textarea>
    </div>

    ${multiSelectField('tons','Tom de comunicação',TONS_COMUNICACAO_OPCOES,c.tons||'')}
    ${multiSelectField('objetivos','Objetivos',OBJETIVOS_OPCOES,c.objetivos||'')}
    ${multiSelectField('linhas','Linhas de conteúdo',LINHAS_CONTEUDO_OPCOES,c.linhas||'')}

    <div class="field"><label>Reels/semana</label><input type="number" name="reels" value="${c.reels||0}"></div>
    <div class="field"><label>Posts/semana</label><input type="number" name="posts" value="${c.posts||0}"></div>
    <div class="field"><label>Stories/semana</label><input type="number" name="stories" value="${c.stories||0}"></div>
    <div class="field"><label>Captações/semana</label><input type="number" name="captacoes" value="${c.captacoes||0}"></div>
  </form>`,()=>{
    let q=objMulti(document.getElementById('f'));
    if(!q.nome)return toast('Informe o nome.');
    ['reels','posts','stories','captacoes'].forEach(k=>q[k]=Number(q[k]||0));
    q.cor=String(q.cor||'#fca311').trim();
    if(c.id)Object.assign(c,q);
    else D.companies.push({...q,id:id()});
    closeM();
    save();
  })
}
function weeklyExpected(c){
  return Number(c?.reels||0)+Number(c?.posts||0)+Number(c?.stories||0);
}

function weekProgress(w,c){
  const expected=weeklyExpected(c);
  const created=D.contents.filter(x=>x.weekId===w.id).length;
  return {
    expected,
    created,
    complete: expected>0 && created>=expected
  };
}

function completedWeeksCount(cid){
  const c=D.companies.find(x=>x.id===cid);
  if(!c)return 0;
  return D.weeks
    .filter(w=>w.companyId===cid)
    .filter(w=>weekProgress(w,c).complete)
    .length;
}

function celebrateWeek(wid){
  const w=D.weeks.find(x=>x.id===wid);
  if(!w)return;
  toast(`🎉 Semana ${w.numero} concluída!`);
  launchConfetti();
}

function launchConfetti(){
  injectMoveCelebrationCSS();
  const layer=document.createElement('div');
  layer.className='move-confetti-layer';
  const icons=['●','■','▲','★'];
  for(let i=0;i<90;i++){
    const piece=document.createElement('i');
    piece.className='move-confetti-piece';
    piece.textContent=icons[Math.floor(Math.random()*icons.length)];
    piece.style.left=(Math.random()*100)+'vw';
    piece.style.animationDelay=(Math.random()*.55)+'s';
    piece.style.animationDuration=(2.2+Math.random()*1.8)+'s';
    piece.style.setProperty('--drift',((Math.random()-.5)*220)+'px');
    piece.style.transform=`rotate(${Math.random()*360}deg)`;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(()=>layer.remove(),4600);
}

function quadro(){
  document.getElementById('p-quadro').innerHTML=
    head('Quadro Criativo','Planejamento mensal e exportação por semana.')
    +`<div class="grid companies">${D.companies.map(c=>{
      const done=completedWeeksCount(c.id);
      return `<div class="card company">
        <div class="avatar">${ini(c.nome)}</div>
        <h3>${e(c.nome)}</h3>
        <div class="meta">${D.contents.filter(x=>x.companyId===c.id).length} conteúdos planejados</div>
        <div class="move-company-progress ${done===4?'is-complete':''}">
          <i class="fa fa-check"></i> ${done}/4 semanas concluídas
        </div>
        <button class="btn primary" style="margin-top:12px" onclick="board('${c.id}')">Abrir quadro</button>
      </div>`;
    }).join('')||empty('Cadastre uma empresa.')}</div>`;
}


const MOVE_TEAM_STATUS={
  estrategica:['Planejamento','Aguardando aprovação','Aprovado para produção'],
  criativa:['Fila de produção','Em produção','Ajustes','Finalizado','Agendado','Publicado']
};
function contentTeam(ct){return MOVE_TEAM_STATUS.criativa.includes(ct?.workflowStatus||'Planejamento')?'criativa':'estrategica'}
function workflowBadge(st){
  const s=st||'Planejamento',cls=['Finalizado','Agendado','Publicado'].includes(s)?'ok':['Ajustes','Aguardando aprovação'].includes(s)?'warn':'';
  return `<span class="badge ${cls}">${e(s)}</span>`;
}

function sendWeekToProduction(weekId){
  const w=D.weeks.find(x=>x.id===weekId);
  if(!w)return toast('Semana não encontrada.');
  const items=D.contents.filter(x=>x.weekId===weekId);
  if(!items.length)return toast('Essa semana ainda não tem conteúdos.');
  if(!confirm(`Enviar a Semana ${w.numero} inteira para produção?\n\n${items.length} conteúdo(s) serão enviados para a Equipe Criativa / Operacional.`))return;
  items.forEach(ct=>ct.workflowStatus='Fila de produção');
  save();
  if(CID)board(CID);
  toast(`Semana ${w.numero} enviada para produção.`);
}

function sendToProduction(contentId){
  const ct=D.contents.find(x=>x.id===contentId);if(!ct)return toast('Conteúdo não encontrado.');
  ct.workflowStatus='Fila de produção';save();if(CID)board(CID);toast('Enviado para a Equipe Criativa.');
}
function setWorkflowStatus(contentId,status){
  const ct=D.contents.find(x=>x.id===contentId);if(!ct)return;
  ct.workflowStatus=status;save();if(CID)board(CID);toast('Etapa atualizada.');
}

function boardDateKey(d){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function boardDays(w){
  if(!w?.inicio||!w?.fim)return[];
  const start=new Date(String(w.inicio).slice(0,10)+'T12:00');
  const end=new Date(String(w.fim).slice(0,10)+'T12:00');
  if(isNaN(start)||isNaN(end)||end<start)return[];
  const out=[];
  for(let d=new Date(start);d<=end&&out.length<14;d.setDate(d.getDate()+1))out.push(new Date(d));
  return out;
}
function boardDayName(d){
  return d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');
}
async function board(cid){
  CID=cid;
  R='quadro';
  const c=D.companies.find(x=>x.id===cid);
  if(!c)return quadro();
  const ws=D.weeks.filter(x=>x.companyId===cid).sort((a,b)=>a.numero-b.numero),
        done=completedWeeksCount(cid);

  let weeksHTML=ws.map(w=>{
    const progress=weekProgress(w,c);
    const contents=D.contents.filter(x=>x.weekId===w.id).sort((a,b)=>a.ordem-b.ordem);
    const days=boardDays(w);
    const withoutDate=contents.filter(x=>!x.postDate||!days.some(d=>boardDateKey(d)===x.postDate));

    const calendar=days.length?`<div class="move-week-calendar">
      ${days.map(d=>{
        const k=boardDateKey(d);
        const dayContents=contents.filter(x=>x.postDate===k);
        return `<div class="move-day ${dayContents.length?'has-content':''}">
          <div class="move-day-head">
            <div><b>${boardDayName(d)}</b><span>${d.getDate()}</span></div>
            <button class="move-day-add" onclick="content('${cid}','${w.id}','','${k}')" title="Planejar conteúdo neste dia"><i class="fa fa-plus"></i></button>
          </div>
          <div class="move-day-body">
            ${dayContents.map(ct=>{
              const media=D.scheduled.find(s=>s.contentId===ct.id);
              return `<article class="move-calendar-content">
                <div class="move-calendar-tags">
                  <span class="badge">${e(ct.tipo||'Conteúdo')}</span>
                  <span class="badge ${contentTeam(ct)==='estrategica'?'move-team-strategic':'move-team-creative'}">${contentTeam(ct)==='estrategica'?'Estratégica':'Criativa'}</span>
                  ${workflowBadge(ct.workflowStatus)}
                  ${media?`<span class="badge ok move-upload-attached"><i class="fa fa-circle-check"></i> Anexado</span>`:''}
                </div>
                <strong>${e(ct.titulo||'Sem título')}</strong>
                <small>${e(ct.postTime||'Sem horário')}</small>
                <div class="actions">
                  <button class="btn light sm" onclick="content('${cid}','${w.id}','${ct.id}')"><i class="fa fa-pen"></i></button>
                  ${contentTeam(ct)==='estrategica'?`<button class="btn primary sm" onclick="sendToProduction('${ct.id}')" title="Enviar para produção"><i class="fa fa-arrow-right"></i></button>`:''}
                  ${media
                    ?`<button class="btn ok sm move-upload-done" onclick="upload('${cid}','${media.id}')" title="Mídia anexada — clique para editar"><i class="fa fa-circle-check"></i> Anexado</button>`
                    :`<button class="btn dark sm" onclick="attachContent('${cid}','${ct.id}')" title="Anexar imagem ou vídeo"><i class="fa fa-paperclip"></i> Upload</button>`}
                  <button class="btn danger sm" onclick="deleteContent('${ct.id}')"><i class="fa fa-trash"></i></button>
                </div>
              </article>`;
            }).join('')||`<button class="move-empty-day" onclick="content('${cid}','${w.id}','','${k}')">+ Planejar neste dia</button>`}
          </div>
        </div>`;
      }).join('')}
    </div>`:`<div class="notice">Defina o início e o fim da semana para visualizar o calendário. <button class="btn light sm" onclick="week('${cid}','${w.id}')">Editar semana</button></div>`;

    return `<section class="move-calendar-week ${progress.complete?'is-complete':''}">
      <div class="move-week-top">
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <h3 style="margin:0">Semana ${w.numero}</h3>
            ${progress.complete?`<span class="move-week-done"><i class="fa fa-check"></i> Concluída</span>`:''}
          </div>
          <div class="meta">${date(w.inicio)} — ${date(w.fim)} • ${progress.created}/${progress.expected} conteúdos</div>
          <div class="meta" style="margin-top:5px"><b>Objetivo:</b> ${e(w.objetivo||'—')} • <b>Linha:</b> ${e(w.linha||'—')}</div>
        </div>
        <div class="actions">
          <button class="btn light sm" onclick="week('${cid}','${w.id}')"><i class="fa fa-pen"></i> Semana</button>
          <button class="btn primary sm" onclick="sendWeekToProduction('${w.id}')"><i class="fa fa-paper-plane"></i> Enviar semana para produção</button>
          <button class="btn dark sm" onclick="weekHTML('${w.id}')"><i class="fa fa-download"></i> Baixar</button>
          <button class="btn danger sm" onclick="deleteWeek('${w.id}')"><i class="fa fa-trash"></i></button>
        </div>
      </div>
      ${calendar}
      ${withoutDate.length?`<div class="move-undated"><b>Conteúdos fora das datas desta semana</b>${withoutDate.map(ct=>`<button class="btn light sm" onclick="content('${cid}','${w.id}','${ct.id}')">${e(ct.titulo||'Sem título')}</button>`).join('')}</div>`:''}
    </section>`;
  }).join('')||empty('Crie a primeira semana para montar o calendário.');

  const scheduled=D.scheduled.filter(x=>x.companyId===cid).sort((a,b)=>String(a.data||'').localeCompare(String(b.data||''))||String(a.hora||'').localeCompare(String(b.hora||'')));
  let materialsHTML='';
  for(const s of scheduled){
    const ct=D.contents.find(x=>x.id===s.contentId)||{};
    const u=await mediaURL(s.mediaId);
    const preview=s.mime?.startsWith('image/')?`<img src="${u}" alt="${e(ct.titulo||s.fileName||'Material')}">`
      :s.mime?.startsWith('video/')?`<video class="move-video-player" controls playsinline preload="metadata" src="${u}" onloadedmetadata="moveVideoCheck(this)"></video>`
      :`<div class="move-file-placeholder"><i class="fa fa-file"></i></div>`;
    materialsHTML+=`<article class="move-board-media-card">
      <div class="move-board-media">${preview}</div>
      <div class="move-board-media-info">
        <div style="display:flex;justify-content:space-between;gap:8px"><span class="badge">${e(ct.tipo||'Material')}</span><span class="badge ${s.status==='Aprovado'?'ok':'warn'}">${e(s.status||'Aguardando aprovação')}</span></div>
        <h4>${e(ct.titulo||s.fileName||'Material')}</h4>
        <div class="meta">${date(s.data)} ${e(s.hora||'')}</div>
        <div class="actions">
          ${ct.id?`<button class="btn light sm" onclick="content('${cid}','${ct.weekId||''}','${ct.id}')"><i class="fa fa-pen"></i> Editar conteúdo</button>`:''}
          <button class="btn dark sm" onclick="upload('${cid}','${s.id}')"><i class="fa fa-paperclip"></i> Mídia</button>
          <button class="btn danger sm" onclick="deleteScheduled('${s.id}','${cid}')" title="Excluir upload"><i class="fa fa-trash"></i> Excluir upload</button>
        </div>
      </div>
    </article>`;
  }

  document.getElementById('p-quadro').innerHTML=
    head(
      c.nome,
      'Planejamento em calendário: crie o conteúdo no dia e anexe a imagem ou o Reels no mesmo fluxo.',
      `<span class="move-board-progress ${done===4?'is-complete':''}"><i class="fa fa-check"></i> ${done}/4 semanas concluídas</span> <button class="btn light" onclick="quadro()">← Empresas</button> <button class="btn dark" onclick="copyCompanyData('${cid}')"><i class="fa fa-copy"></i> Copiar dados</button> <button class="btn primary" onclick="week('${cid}')">+ Semana</button>`
    )
    +`<div class="move-board-calendar-wrap">${weeksHTML}</div>`
    +`<div class="move-team-area">
      <section class="move-team-column">
        <h3>Equipe Estratégica</h3><p class="meta">Planejamento, ideias, roteiros, calendário e aprovação.</p>
        <div class="move-team-list">${D.contents.filter(x=>x.companyId===cid&&contentTeam(x)==='estrategica').map(ct=>`<article class="move-team-card"><div class="move-calendar-tags"><span class="badge">${e(ct.tipo||'Conteúdo')}</span>${workflowBadge(ct.workflowStatus)}${D.scheduled.some(s=>s.contentId===ct.id)?`<span class="badge ok move-upload-attached"><i class="fa fa-circle-check"></i> Anexado</span>`:''}</div><strong>${e(ct.titulo||'Sem título')}</strong><small>${date(ct.postDate)} ${e(ct.postTime||'')}</small><div class="actions"><button class="btn light sm" onclick="content('${cid}','${ct.weekId||''}','${ct.id}')">Editar</button><button class="btn primary sm" onclick="sendToProduction('${ct.id}')">Enviar para produção</button></div></article>`).join('')||empty('Nenhum conteúdo estratégico.')}</div>
      </section>
      <section class="move-team-column">
        <h3>Equipe Criativa / Operacional</h3><p class="meta">Design, edição, captação, ajustes, finalização e agendamento.</p>
        <div class="move-team-list">${D.contents.filter(x=>x.companyId===cid&&contentTeam(x)==='criativa').map(ct=>`<article class="move-team-card"><div class="move-calendar-tags"><span class="badge">${e(ct.tipo||'Conteúdo')}</span>${workflowBadge(ct.workflowStatus)}${D.scheduled.some(s=>s.contentId===ct.id)?`<span class="badge ok move-upload-attached"><i class="fa fa-circle-check"></i> Anexado</span>`:''}</div><strong>${e(ct.titulo||'Sem título')}</strong><small>${date(ct.postDate)} ${e(ct.postTime||'')}</small><select class="move-status-select" onchange="setWorkflowStatus('${ct.id}',this.value)">${MOVE_TEAM_STATUS.criativa.map(s=>`<option ${((ct.workflowStatus||'Fila de produção')===s)?'selected':''}>${s}</option>`).join('')}</select><div class="actions"><button class="btn light sm" onclick="content('${cid}','${ct.weekId||''}','${ct.id}')">Abrir</button>${(()=>{const sm=D.scheduled.find(s=>s.contentId===ct.id);return sm?`<button class="btn ok sm move-upload-done" onclick="upload('${cid}','${sm.id}')"><i class="fa fa-circle-check"></i> Anexado</button>`:`<button class="btn dark sm" onclick="attachContent('${cid}','${ct.id}')"><i class="fa fa-paperclip"></i> Upload</button>`})()}</div></article>`).join('')||empty('Nenhum conteúdo em produção.')}</div>
      </section>
    </div>`
    +`<div class="move-board-schedule">
        ${head('Agendamento da empresa','As mídias anexadas aos conteúdos ficam aqui dentro do próprio Quadro Criativo.',`<button class="btn primary" onclick="upload('${cid}')"><i class="fa fa-plus"></i> Anexar material</button> <button class="btn dark" onclick="approval('${cid}')"><i class="fa fa-download"></i> Baixar aprovação</button>`)}
        <div class="move-board-media-grid">${materialsHTML||empty('Nenhuma mídia anexada ainda.')}</div>
      </div>`;
}

function copyCompanyData(cid){
  const c=D.companies.find(x=>x.id===cid);
  if(!c)return toast('Empresa não encontrada.');

  const lines=[
    `EMPRESA: ${c.nome||'—'}`,
    '',
    'SOBRE A EMPRESA:',
    c.sobre||'Não informado.',
    '',
    'QUANTIDADE DE CONTEÚDOS SEMANAIS:',
    `Reels: ${Number(c.reels||0)}`,
    `Posts: ${Number(c.posts||0)}`,
    `Stories: ${Number(c.stories||0)}`,
    `Captações: ${Number(c.captacoes||0)}`,
    '',
    'COR DA EMPRESA:',
    c.cor||'Não informado.',
    '',
    'TOM DE COMUNICAÇÃO:',
    c.tons||'Não informado.',
    '',
    'OBJETIVOS:',
    c.objetivos||'Não informado.',
    '',
    'LINHAS DE CONTEÚDO:',
    c.linhas||'Não informado.'
  ];

  const txt=lines.join('\n');

  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(txt)
      .then(()=>toast('Dados da empresa copiados.'))
      .catch(()=>{
        const ta=document.createElement('textarea');
        ta.value=txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('Dados da empresa copiados.');
      });
  }else{
    const ta=document.createElement('textarea');
    ta.value=txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast('Dados da empresa copiados.');
  }
}

async function deleteContent(contentId){
  const ct=D.contents.find(x=>x.id===contentId);
  if(!ct)return;
  const linked=D.scheduled.filter(x=>x.contentId===contentId);
  const msg=linked.length
    ?`Excluir o conteúdo "${ct.titulo||'Sem título'}"?

Existe ${linked.length} upload/material vinculado. Clique em OK para excluir o conteúdo E também remover o(s) upload(s).`
    :`Excluir o conteúdo "${ct.titulo||'Sem título'}"?`;
  if(!confirm(msg))return;

  const mids=linked.map(x=>x.mediaId).filter(Boolean);
  D.contents=D.contents.filter(x=>x.id!==contentId);
  D.scheduled=D.scheduled.filter(x=>x.contentId!==contentId);

  if(mids.length){
    try{
      const db=await mediaDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('m','readwrite');
        const st=tx.objectStore('m');
        mids.forEach(mid=>st.delete(mid));
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error);
      });
    }catch(_){}
  }

  save();
  if(CID)await board(CID);
  toast('Conteúdo e upload(s) excluídos.');
}
async function deleteWeek(weekId){
  const w=D.weeks.find(x=>x.id===weekId);
  if(!w)return;
  const contents=D.contents.filter(x=>x.weekId===weekId);
  const ids=new Set(contents.map(x=>x.id));
  const linked=D.scheduled.filter(s=>ids.has(s.contentId));
  const msg=`Excluir a Semana ${w.numero} e seu quadro?

${contents.length} conteúdo(s) planejado(s) serão excluídos.
${linked.length} upload(s)/material(is) vinculado(s) também serão removidos.

Essa ação não pode ser desfeita.`;
  if(!confirm(msg))return;

  const mids=linked.map(x=>x.mediaId).filter(Boolean);
  D.contents=D.contents.filter(x=>x.weekId!==weekId);
  D.weeks=D.weeks.filter(x=>x.id!==weekId);
  D.scheduled=D.scheduled.filter(s=>!ids.has(s.contentId));

  if(mids.length){
    try{
      const db=await mediaDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('m','readwrite');
        const st=tx.objectStore('m');
        mids.forEach(mid=>st.delete(mid));
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error);
      });
    }catch(_){}
  }

  save();
  if(CID)await board(CID);
  toast('Semana, conteúdos e uploads excluídos.');
}

function week(cid,x=''){let w=D.weeks.find(a=>a.id===x)||{},n=w.numero||Math.min(4,D.weeks.filter(a=>a.companyId===cid).length+1);modal('Semana',`<form id="f" class="fg"><div class="field"><label>Número</label><select name="numero">${[1,2,3,4].map(i=>`<option ${i==n?'selected':''}>${i}</option>`).join('')}</select></div><div></div><div class="field"><label>Início</label><input type="date" name="inicio" value="${w.inicio||''}"></div><div class="field"><label>Fim</label><input type="date" name="fim" value="${w.fim||''}"></div>${multiSelectField('objetivo','Objetivo',OBJETIVOS_OPCOES,w.objetivo||'')}${multiSelectField('linha','Linha estratégica',LINHAS_CONTEUDO_OPCOES,w.linha||'')}</form>`,()=>{let q=objMulti(document.getElementById('f'));q.numero=Number(q.numero);if(w.id)Object.assign(w,q);else D.weeks.push({...q,id:id(),companyId:cid});closeM();save();board(cid)})}
function content(cid,wid,x='',prefillDate=''){
  let c=D.contents.find(a=>a.id===x)||{},
      n=c.ordem||D.contents.filter(a=>a.weekId===wid).length+1,
      company=D.companies.find(a=>a.id===cid),
      w=D.weeks.find(z=>z.id===wid),
      wasComplete=company&&w?weekProgress(w,company).complete:false,
      media=c.id?D.scheduled.find(s=>s.contentId===c.id):null;

  modal('Conteúdo + Agendamento',`<form id="f" class="fg">
    <div class="field"><label>Ordem</label><input type="number" name="ordem" value="${n}"></div>
    <div class="field"><label>Tipo</label><select name="tipo">${['Reels','Post','Stories'].map(t=>`<option ${c.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
    <div class="field"><label>Etapa / Equipe</label><select name="workflowStatus">${[...MOVE_TEAM_STATUS.estrategica,...MOVE_TEAM_STATUS.criativa].map(s=>`<option ${((c.workflowStatus||'Planejamento')===s)?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="field span"><label>Título *</label><input name="titulo" value="${e(c.titulo||'')}"></div>
    <div class="field span"><label>Descrição</label><textarea name="descricao">${e(c.descricao||'')}</textarea></div>
    <div class="field span"><label>Roteiro / desenvolvimento</label><textarea name="roteiro" style="min-height:180px">${e(c.roteiro||'')}</textarea></div>
    <div class="field"><label>Data da postagem</label><input type="date" name="postDate" value="${c.postDate||prefillDate||''}"></div>
    <div class="field"><label>Hora</label><input type="time" name="postTime" value="${e(c.postTime||'')}"></div>
    <div class="field span"><label>Anexar imagem, post ou Reels/vídeo</label><input type="file" id="contentFile" accept="image/*,video/*"><small class="move-check-help">${media?.fileName?`Arquivo atual: ${e(media.fileName)}. Se não escolher outro, ele será mantido.`:'O arquivo fica salvo neste navegador e entra no HTML de aprovação/planejamento.'}</small></div>
    <div class="field span"><label>Legenda</label><textarea name="mediaLegenda">${e(media?.legenda||'')}</textarea></div>
    <div class="field"><label>Status do material</label><select name="mediaStatus">${['Aguardando aprovação','Aprovado','Ajustar','Agendado','Publicado'].map(v=>`<option ${media?.status===v?'selected':''}>${v}</option>`).join('')}</select></div>
  </form>`,async()=>{
    const f=document.getElementById('f');
    let q=obj(f);
    const legenda=q.mediaLegenda||'',status=q.mediaStatus||'Aguardando aprovação';
    delete q.mediaLegenda;delete q.mediaStatus;
    if(!q.titulo)return toast('Informe o título.');
    q.ordem=Number(q.ordem);
    q.workflowStatus=q.workflowStatus||c.workflowStatus||'Planejamento';
    const fl=document.getElementById('contentFile')?.files?.[0];
    if(fl&&fl.size>35*1024*1024)return toast('Use arquivo até 35 MB.');

    let contentId=c.id;
    if(c.id)Object.assign(c,q);
    else{
      contentId=id();
      c={...q,id:contentId,companyId:cid,weekId:wid};
      D.contents.push(c);
    }

    if(fl||media){
      if(!media){
        media={id:id(),companyId:cid,contentId};
        D.scheduled.push(media);
      }
      media.companyId=cid;
      media.contentId=contentId;
      media.data=q.postDate||'';
      media.hora=q.postTime||'';
      media.legenda=legenda;
      media.status=status;
      if(fl){
        const mid=media.mediaId||id();
        await mediaPut(mid,fl);
        media.mediaId=mid;
        media.mime=fl.type;
        media.fileName=fl.name;
      }
    }

    const nowComplete=company&&w?weekProgress(w,company).complete:false;
    closeM();
    save();
    await board(cid);
    if(!wasComplete&&nowComplete)setTimeout(()=>celebrateWeek(wid),120);
  });
}

function attachContent(cid,contentId){
  const ct=D.contents.find(x=>x.id===contentId);
  if(!ct)return toast('Conteúdo não encontrado.');
  const s=D.scheduled.find(x=>x.contentId===contentId);
  if(s)return upload(cid,s.id);
  modal('Anexar mídia',`<form id="f" class="fg">
    <div class="field span"><label>Conteúdo</label><input value="${e(ct.tipo||'Conteúdo')} — ${e(ct.titulo||'Sem título')}" disabled></div>
    <div class="field span"><label>Imagem ou Reels/vídeo</label><input type="file" id="file" accept="image/*,video/*"></div>
    <div class="field span"><label>Legenda</label><textarea name="legenda"></textarea></div>
    <div class="field"><label>Data</label><input type="date" name="data" value="${ct.postDate||''}"></div>
    <div class="field"><label>Hora</label><input type="time" name="hora" value="${e(ct.postTime||'')}"></div>
    <div class="field"><label>Status</label><select name="status">${['Aguardando aprovação','Aprovado','Ajustar','Agendado','Publicado'].map(v=>`<option>${v}</option>`).join('')}</select></div>
  </form>`,async()=>{
    const q=obj(document.getElementById('f')),fl=document.getElementById('file')?.files?.[0];
    if(!fl)return toast('Selecione uma imagem ou vídeo.');
    if(fl.size>35*1024*1024)return toast('Use arquivo até 35 MB.');
    const mid=id();
    await mediaPut(mid,fl);
    D.scheduled.push({...q,id:id(),companyId:cid,contentId,mediaId:mid,mime:fl.type,fileName:fl.name});
    closeM();save();await board(cid);toast('Mídia anexada ao conteúdo.');
  });
}

let CAMP_EDIT_STATE=[];
let CAMP_VIEW='list';


function campaignSummaryCount(c){
  return Number(c.reels||0)+Number(c.posts||0)+Number(c.stories||0);
}
function campaignTypeLabel(t){
  return t==='Reels'?'Reels':t==='Stories'?'Stories':'Post';
}
function campaignExpectedCreativesFromForm(){
  const f=document.getElementById('f');
  if(!f)return[];
  const reels=Number(f.querySelector('[name="reels"]')?.value||0);
  const posts=Number(f.querySelector('[name="posts"]')?.value||0);
  const stories=Number(f.querySelector('[name="stories"]')?.value||0);
  return [
    ...Array.from({length:reels},(_,i)=>({tipo:'Reels',numero:i+1})),
    ...Array.from({length:posts},(_,i)=>({tipo:'Post',numero:i+1})),
    ...Array.from({length:stories},(_,i)=>({tipo:'Stories',numero:i+1}))
  ];
}
function campaignSyncCreativeFields(){
  const box=document.getElementById('campaignCreativeFields');
  if(!box)return;

  // preserve anything already typed before rebuilding
  box.querySelectorAll('[data-camp-creative]').forEach(el=>{
    const key=el.dataset.campCreative;
    const idx=CAMP_EDIT_STATE.findIndex(x=>x.key===key);
    const val={key,tipo:el.dataset.tipo,numero:Number(el.dataset.numero||0),titulo:el.querySelector('[name="creativeTitle"]')?.value||'',roteiro:el.querySelector('[name="creativeScript"]')?.value||''};
    if(idx>=0)CAMP_EDIT_STATE[idx]=val;else CAMP_EDIT_STATE.push(val);
  });

  const expected=campaignExpectedCreativesFromForm();
  box.innerHTML=expected.map(x=>{
    const key=`${x.tipo}-${x.numero}`;
    const old=CAMP_EDIT_STATE.find(v=>v.key===key)||{};
    return `<article class="campaign-creative-editor" data-camp-creative="${key}" data-tipo="${x.tipo}" data-numero="${x.numero}">
      <div class="campaign-creative-head">
        <span class="badge">${campaignTypeLabel(x.tipo)} ${x.numero}</span>
        <small>Estrutura / roteiro do criativo</small>
      </div>
      <div class="field"><label>Nome do criativo</label><input name="creativeTitle" value="${e(old.titulo||'')}" placeholder="Ex.: Reel 01 — Gancho principal"></div>
      <div class="field"><label>Estrutura / roteiro</label><textarea name="creativeScript" style="min-height:145px" placeholder="Crie, cole ou escreva aqui a estrutura completa, roteiro, cenas, copy, CTA e observações.">${e(old.roteiro||'')}</textarea></div>
    </article>`;
  }).join('')||`<div class="empty">Defina a quantidade de Reels, Posts ou Stories para criar os campos de roteiro.</div>`;
}
function campaignCollectCreatives(){
  const box=document.getElementById('campaignCreativeFields');
  if(!box)return[];
  return [...box.querySelectorAll('[data-camp-creative]')].map(el=>({
    id:el.dataset.id||id(),
    key:el.dataset.campCreative,
    tipo:el.dataset.tipo,
    numero:Number(el.dataset.numero||0),
    titulo:el.querySelector('[name="creativeTitle"]')?.value||'',
    roteiro:el.querySelector('[name="creativeScript"]')?.value||''
  }));
}

function campanhas(){
  const cards=[...D.campaigns].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).map(c=>{
    const co=D.companies.find(x=>x.id===c.companyId);
    const total=campaignSummaryCount(c);
    return `<article class="card campaign-card">
      <div class="campaign-card-top">
        <span class="badge warn"><i class="fa fa-building"></i> ${e(co?.nome||'Empresa removida')}</span>
        <span class="badge">${total} criativo(s)</span>
      </div>
      <h3>${e(c.nome||'Campanha sem nome')}</h3>
      <p class="campaign-idea">${e(c.ideia||'Sem ideia descrita.')}</p>
      <div class="campaign-objective"><b>Objetivo</b><span>${e(c.objetivo||'—')}</span></div>
      <div class="stats" style="grid-template-columns:repeat(3,1fr)">
        <div class="mini"><b>${Number(c.reels||0)}</b><span>REELS</span></div>
        <div class="mini"><b>${Number(c.posts||0)}</b><span>POSTS</span></div>
        <div class="mini"><b>${Number(c.stories||0)}</b><span>STORIES</span></div>
      </div>
      <div class="meta" style="margin-top:10px">${(c.creatives||[]).filter(x=>x.roteiro||x.titulo).length}/${total} criativos estruturados</div>
      <div class="actions">
        <button class="btn light sm" onclick="campaignEdit('${c.id}')"><i class="fa fa-pen"></i> Editar</button>
        <button class="btn dark sm" onclick="campaignDownload('${c.id}')"><i class="fa fa-download"></i> Baixar proposta</button>
        <button class="btn danger sm" onclick="campaignDelete('${c.id}')"><i class="fa fa-trash"></i> Excluir</button>
      </div>
    </article>`;
  }).join('');

  const createPanel=`<div class="campaign-create-start card section">
    <div class="campaign-create-icon"><i class="fa fa-wand-magic-sparkles"></i></div>
    <h3>Criar nova campanha</h3>
    <p class="meta">Monte uma campanha estratégica completa para uma empresa, com ideia, objetivos, quantidade de criativos e roteiro de cada peça.</p>
    <button class="btn primary" onclick="campaignEdit()"><i class="fa fa-plus"></i> Criar campanha</button>
  </div>`;

  const listPanel=`<div class="grid companies campaign-grid">${cards||empty('Nenhuma campanha criada ainda.')}</div>`;

  document.getElementById('p-campanhas').innerHTML=
    head('Campanhas','Ideias criativas e campanhas estratégicas criadas para cada empresa.')
    +`<div class="campaign-tabs">
        <button class="btn ${CAMP_VIEW==='create'?'primary':'light'}" onclick="CAMP_VIEW='create';campanhas()"><i class="fa fa-plus"></i> Criar campanha</button>
        <button class="btn ${CAMP_VIEW==='list'?'dark':'light'}" onclick="CAMP_VIEW='list';campanhas()"><i class="fa fa-folder-open"></i> Ver campanhas <span class="campaign-tab-count">${D.campaigns.length}</span></button>
      </div>`
    +`<div class="notice">${CAMP_VIEW==='create'?'Comece uma nova campanha estratégica e depois salve para ela aparecer em Ver campanhas.':'Aqui ficam todas as campanhas já criadas, com opção de editar, excluir e baixar a proposta para o cliente.'}</div>`
    +(CAMP_VIEW==='create'?createPanel:listPanel);
}

function campaignEdit(x=''){
  const c=D.campaigns.find(v=>v.id===x)||{};
  CAMP_EDIT_STATE=(c.creatives||[]).map(v=>({...v,key:v.key||`${v.tipo}-${v.numero}`}));

  modal(c.id?'Editar campanha':'Nova campanha',`<form id="f" class="fg">
    <div class="field span"><label>Empresa *</label><select name="companyId"><option value="">Selecione...</option>${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(co=>`<option value="${co.id}" ${c.companyId===co.id?'selected':''}>${e(co.nome)}</option>`).join('')}</select></div>
    <div class="field span"><label>Nome da campanha *</label><input name="nome" value="${e(c.nome||'')}" placeholder="Ex.: Semana do Sorriso / Volta às Aulas / Campanha de Matrículas"></div>
    <div class="field span"><label>Ideia da campanha *</label><textarea name="ideia" style="min-height:130px" placeholder="Descreva o conceito criativo, como a campanha funciona, qual é a abordagem e a mensagem principal.">${e(c.ideia||'')}</textarea></div>
    <div class="field span"><label>Objetivos</label><textarea name="objetivo" placeholder="Ex.: gerar vendas, aumentar alcance, apresentar um novo serviço, gerar desejo...">${e(c.objetivo||'')}</textarea></div>

    <div class="field"><label>Quantidade de Reels</label><input type="number" min="0" name="reels" value="${Number(c.reels||0)}" oninput="campaignSyncCreativeFields()"></div>
    <div class="field"><label>Quantidade de Posts</label><input type="number" min="0" name="posts" value="${Number(c.posts||0)}" oninput="campaignSyncCreativeFields()"></div>
    <div class="field"><label>Quantidade de Stories</label><input type="number" min="0" name="stories" value="${Number(c.stories||0)}" oninput="campaignSyncCreativeFields()"></div>
    <div class="field"><label>Total</label><div class="campaign-total-box" id="campaignTotal">${campaignSummaryCount(c)}</div></div>

    <div class="field span">
      <div class="campaign-editor-title">
        <div><label>Estrutura dos criativos</label><small>Você pode criar ou simplesmente colar o roteiro/estrutura de cada peça.</small></div>
        <button type="button" class="btn dark sm" onclick="campaignSyncCreativeFields()">Atualizar campos</button>
      </div>
      <div id="campaignCreativeFields" class="campaign-creative-list"></div>
    </div>
  </form>`,()=>{
    const f=document.getElementById('f'),q=obj(f);
    if(!q.companyId)return toast('Selecione a empresa.');
    if(!q.nome)return toast('Informe o nome da campanha.');
    if(!q.ideia)return toast('Descreva a ideia da campanha.');
    q.reels=Number(q.reels||0);q.posts=Number(q.posts||0);q.stories=Number(q.stories||0);
    q.creatives=campaignCollectCreatives();
    q.updatedAt=new Date().toISOString();
    if(c.id)Object.assign(c,q);
    else D.campaigns.unshift({...q,id:id(),createdAt:new Date().toISOString()});
    closeM();save();CAMP_VIEW='list';campanhas();toast('Campanha salva.');
  });

  setTimeout(()=>{
    campaignSyncCreativeFields();
    const f=document.getElementById('f');
    ['reels','posts','stories'].forEach(n=>{
      const el=f?.querySelector(`[name="${n}"]`);
      if(el)el.addEventListener('input',()=>{
        const total=Number(f.querySelector('[name="reels"]')?.value||0)+Number(f.querySelector('[name="posts"]')?.value||0)+Number(f.querySelector('[name="stories"]')?.value||0);
        const t=document.getElementById('campaignTotal');if(t)t.textContent=total;
      });
    });
  },60);
}
function campaignDelete(x){
  const c=D.campaigns.find(v=>v.id===x);
  if(!c)return;
  if(!confirm(`Excluir a campanha "${c.nome||'Sem nome'}"?\\n\\nEssa ação não pode ser desfeita.`))return;
  D.campaigns=D.campaigns.filter(v=>v.id!==x);
  save();campanhas();toast('Campanha excluída.');
}
function campaignDownload(x){
  const c=D.campaigns.find(v=>v.id===x);
  if(!c)return toast('Campanha não encontrada.');
  const co=D.companies.find(v=>v.id===c.companyId);
  const creatives=(c.creatives||[]).sort((a,b)=>{
    const order={Reels:1,Post:2,Stories:3};
    return (order[a.tipo]||9)-(order[b.tipo]||9)||Number(a.numero||0)-Number(b.numero||0);
  });

  const creativeHTML=creatives.map((cr,i)=>`<article class="creative">
    <div class="creative-head"><span>${e(cr.tipo||'Criativo')} ${Number(cr.numero||i+1)}</span><small>CRIATIVO ${i+1}</small></div>
    <h2>${e(cr.titulo||`${cr.tipo||'Criativo'} ${cr.numero||i+1}`)}</h2>
    <section><b>Estrutura / roteiro</b><p>${e(cr.roteiro||'Estrutura ainda não definida.').replace(/\\n/g,'<br>')}</p></section>
  </article>`).join('');

  const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(c.nome)} — ${e(co?.nome||'Cliente')}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:#171717;font-family:Arial,sans-serif}.hero{background:#111;color:#fff;padding:48px 6vw}.hero b{color:#fca311}.hero h1{font-size:38px;margin:10px 0 6px}.hero p{margin:0;color:#bbb}.wrap{max-width:980px;margin:auto;padding:26px 18px}.intro,.creative{background:#fff;border:1px solid #e6e6e6;border-radius:18px;padding:20px;margin-bottom:14px}.label{font-size:9px;color:#888;text-transform:uppercase;font-weight:bold}.intro h2{margin:6px 0 12px}.idea{font-size:14px;line-height:1.7}.goal{background:#fff7e7;border-left:4px solid #fca311;padding:14px;border-radius:10px;margin-top:14px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}.stat{background:#111;color:#fff;border-radius:12px;padding:14px;text-align:center}.stat b{display:block;font-size:24px;color:#fca311}.stat span{font-size:9px;color:#bbb}.creative-head{display:flex;justify-content:space-between;align-items:center}.creative-head span{background:#fff1cf;color:#815300;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:bold}.creative-head small{font-size:9px;color:#888}.creative h2{margin:13px 0}.creative section{background:#f7f7f7;border-radius:12px;padding:14px}.creative section b{font-size:9px;text-transform:uppercase;color:#777}.creative section p{font-size:12px;line-height:1.65;margin-bottom:0}.foot{text-align:center;color:#888;font-size:10px;padding:20px}@media(max-width:620px){.stats{grid-template-columns:1fr 1fr}.hero h1{font-size:28px}}</style></head><body>
  <div class="hero"><b>MOVE AGÊNCIA</b><h1>${e(c.nome)}</h1><p>Proposta de campanha • ${e(co?.nome||'Cliente')}</p></div>
  <div class="wrap">
    <div class="intro"><span class="label">IDEIA DA CAMPANHA</span><h2>Conceito estratégico</h2><div class="idea">${e(c.ideia||'—').replace(/\\n/g,'<br>')}</div><div class="goal"><span class="label">OBJETIVOS</span><div class="idea">${e(c.objetivo||'—').replace(/\\n/g,'<br>')}</div></div></div>
    <div class="stats"><div class="stat"><b>${campaignSummaryCount(c)}</b><span>CRIATIVOS</span></div><div class="stat"><b>${Number(c.reels||0)}</b><span>REELS</span></div><div class="stat"><b>${Number(c.posts||0)}</b><span>POSTS</span></div><div class="stat"><b>${Number(c.stories||0)}</b><span>STORIES</span></div></div>
    ${creativeHTML||'<div class="intro">Nenhum roteiro de criativo cadastrado.</div>'}
    <div class="foot">Planejamento estratégico desenvolvido pela MOVE AGÊNCIA</div>
  </div></body></html>`;

  dl(html,`MOVE_Campanha_${safe(co?.nome||'Cliente')}_${safe(c.nome||'Campanha')}.html`);
  toast('Proposta da campanha baixada.');
}

function pend(){
  let a=[];
  D.companies.forEach(c=>{
    let ws=D.weeks.filter(w=>w.companyId===c.id);
    for(let i=1;i<=4;i++){
      let w=ws.find(z=>z.numero===i);
      if(!w){
        a.push({company:c.nome,title:'Semana '+i+' não criada',detail:'O mês precisa de 4 semanas planejadas.',type:'planejamento'});
      }else{
        let exp=Number(c.reels||0)+Number(c.posts||0)+Number(c.stories||0),
            got=D.contents.filter(x=>x.weekId===w.id).length;
        if(got<exp)a.push({company:c.nome,title:'Semana '+i+' incompleta',detail:got+'/'+exp+' conteúdos.',type:'conteúdo'});
      }
    }
  });
  return a;
}
function pendencias(){
  document.getElementById('p-pendencias').innerHTML=
    head('Pendências','Acompanhe somente o que falta no planejamento e na produção.')
    +`<div class="card section"><div class="list">${pend().map(x=>`<div class="item"><div><strong>${e(x.company)} — ${e(x.title)}</strong><small>${e(x.detail)}</small></div><span class="badge warn">${e(x.type)}</span></div>`).join('')||empty('Nenhuma pendência. Tudo em dia.')}</div></div>`;
}
function textos(){document.getElementById('p-textos').innerHTML=head('Meus Textos','Prompts, legendas e modelos.',`<button class="btn primary" onclick="text()">+ Texto</button>`)+`<div class="grid companies">${D.texts.map(t=>`<div class="card section"><span class="badge">${e(t.categoria||'Texto')}</span><h3>${e(t.titulo)}</h3><p class="meta" style="white-space:pre-wrap">${e(t.conteudo)}</p><div class="actions"><button class="btn light sm" onclick='navigator.clipboard.writeText(${JSON.stringify(t.conteudo||"")});toast("Copiado")'>Copiar</button><button class="btn light sm" onclick="text('${t.id}')">Editar</button></div></div>`).join('')||empty('Nenhum texto.')}</div>`}function text(x=''){let t=D.texts.find(a=>a.id===x)||{};modal('Texto',`<form id="f"><div class="field"><label>Título</label><input name="titulo" value="${e(t.titulo||'')}"></div><div class="field"><label>Categoria</label><input name="categoria" value="${e(t.categoria||'')}"></div><div class="field"><label>Conteúdo</label><textarea name="conteudo" style="min-height:260px">${e(t.conteudo||'')}</textarea></div></form>`,()=>{let q=obj(document.getElementById('f'));if(t.id)Object.assign(t,q);else D.texts.push({...q,id:id()});closeM();save()})}
let TASK_SECTOR='planejamento';

const TASK_SECTORS={
  planejamento:{
    title:'Planejamento',
    subtitle:'Equipe Estratégica',
    icon:'fa-lightbulb',
    desc:'Planejamento, roteiros, campanhas, calendário, aprovações e organização estratégica.'
  },
  producao:{
    title:'Produção',
    subtitle:'Equipe Criativa / Operacional',
    icon:'fa-clapperboard',
    desc:'Design, edição, captação, ajustes, uploads, finalização e publicação.'
  }
};

function taskNormalize(t){
  if(!t.setor)t.setor='planejamento';
  if(typeof t.feita!=='boolean')t.feita=(t.status==='Concluída');
  if(!t.data&&t.prazo)t.data=t.prazo;
  return t;
}

function tarefas(){
  D.tasks.forEach(taskNormalize);
  const s=TASK_SECTORS[TASK_SECTOR]||TASK_SECTORS.planejamento;
  const list=D.tasks
    .filter(x=>x.setor===TASK_SECTOR)
    .sort((a,b)=>{
      if(!!a.feita!==!!b.feita)return a.feita?1:-1;
      return String(a.data||'9999').localeCompare(String(b.data||'9999'))||String(a.hora||'').localeCompare(String(b.hora||''));
    });

  const pendingPlan=D.tasks.filter(x=>(x.setor||'planejamento')==='planejamento'&&!taskNormalize(x).feita).length;
  const pendingProd=D.tasks.filter(x=>x.setor==='producao'&&!taskNormalize(x).feita).length;

  const cards=list.map(t=>{
    const c=D.companies.find(x=>x.id===t.companyId);
    return `<article class="task-card-pro ${t.feita?'is-done':''}">
      <button class="task-check-pro ${t.feita?'checked':''}" onclick="toggleTask('${t.id}')" title="${t.feita?'Reabrir tarefa':'Concluir tarefa'}">
        <i class="fa ${t.feita?'fa-check':'fa-circle'}"></i>
      </button>

      <div class="task-content-pro">
        <div class="task-tags-pro">
          <span class="badge ${TASK_SECTOR==='planejamento'?'move-team-strategic':'move-team-creative'}">
            <i class="fa ${s.icon}"></i> ${s.title}
          </span>
          ${c?`<span class="badge"><i class="fa fa-building"></i> ${e(c.nome)}</span>`:''}
          ${t.prioridade==='Alta'?`<span class="badge red"><i class="fa fa-fire"></i> Alta prioridade</span>`:''}
        </div>

        <h4>${e(t.titulo||'Sem título')}</h4>
        ${t.descricao?`<p>${e(t.descricao)}</p>`:''}

        <div class="task-meta-pro">
          <span><i class="fa fa-calendar"></i> ${t.data?date(t.data):'Sem prazo'}</span>
          ${t.hora?`<span><i class="fa fa-clock"></i> ${e(t.hora)}</span>`:''}
        </div>
      </div>

      <div class="task-actions-pro">
        <button class="btn light sm" onclick="task('${t.id}','${TASK_SECTOR}')" title="Editar"><i class="fa fa-pen"></i></button>
        <button class="btn danger sm" onclick="deleteTask('${t.id}')" title="Excluir"><i class="fa fa-trash"></i></button>
      </div>
    </article>`;
  }).join('');

  document.getElementById('p-tarefas').innerHTML=
    head('Minhas Tarefas','Escolha o setor. Planejamento e Produção possuem filas completamente independentes.')
    +`<div class="task-sector-grid">
        <button class="task-sector-option ${TASK_SECTOR==='planejamento'?'active':''}" onclick="TASK_SECTOR='planejamento';tarefas()">
          <span class="task-sector-icon strategic"><i class="fa fa-lightbulb"></i></span>
          <span class="task-sector-copy"><b>Planejamento</b><small>Equipe Estratégica</small></span>
          <span class="task-sector-number">${pendingPlan}</span>
        </button>

        <button class="task-sector-option ${TASK_SECTOR==='producao'?'active':''}" onclick="TASK_SECTOR='producao';tarefas()">
          <span class="task-sector-icon production"><i class="fa fa-clapperboard"></i></span>
          <span class="task-sector-copy"><b>Produção</b><small>Equipe Criativa / Operacional</small></span>
          <span class="task-sector-number">${pendingProd}</span>
        </button>
      </div>`

    +`<section class="task-workspace">
        <div class="task-workspace-head">
          <div>
            <span class="eyebrow">SETOR ATUAL</span>
            <h3><i class="fa ${s.icon}"></i> ${s.title}</h3>
            <p>${s.desc}</p>
          </div>
          <button class="btn primary" onclick="task('','${TASK_SECTOR}')"><i class="fa fa-plus"></i> Nova tarefa</button>
        </div>

        <div class="task-list-pro">${cards||empty(`Nenhuma tarefa em ${s.title}.`)}</div>
      </section>`;
}

function task(x='',setor=TASK_SECTOR){
  let t=D.tasks.find(a=>a.id===x)||{};
  if(t.id)taskNormalize(t);
  setor=t.setor||setor||'planejamento';
  const s=TASK_SECTORS[setor]||TASK_SECTORS.planejamento;

  modal(t.id?'Editar tarefa':`Nova tarefa — ${s.title}`,`<form id="f" class="fg">
    <div class="field span">
      <label>Setor</label>
      <div class="task-sector-fixed">
        <span class="task-sector-icon ${setor==='planejamento'?'strategic':'production'}"><i class="fa ${s.icon}"></i></span>
        <div><b>${s.title}</b><small>${s.subtitle} • esta tarefa não será misturada com o outro setor.</small></div>
      </div>
      <input type="hidden" name="setor" value="${setor}">
    </div>

    <div class="field span"><label>Tarefa *</label><input name="titulo" value="${e(t.titulo||'')}" placeholder="Ex.: Finalizar roteiro da campanha"></div>

    <div class="field span"><label>Empresa</label><select name="companyId">
      <option value="">Sem empresa específica</option>
      ${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value="${c.id}" ${t.companyId===c.id?'selected':''}>${e(c.nome)}</option>`).join('')}
    </select></div>

    <div class="field"><label>Prazo</label><input type="date" name="data" value="${t.data||t.prazo||''}"></div>
    <div class="field"><label>Horário</label><input type="time" name="hora" value="${e(t.hora||'')}"></div>

    <div class="field"><label>Prioridade</label><select name="prioridade">
      ${['Normal','Alta'].map(v=>`<option ${t.prioridade===v?'selected':''}>${v}</option>`).join('')}
    </select></div>

    <div class="field span"><label>Descrição / observações</label><textarea name="descricao" placeholder="Detalhes importantes para executar a tarefa.">${e(t.descricao||'')}</textarea></div>
  </form>`,()=>{
    const q=obj(document.getElementById('f'));
    if(!q.titulo)return toast('Informe a tarefa.');
    q.setor=setor;
    q.feita=!!t.feita;

    if(t.id)Object.assign(t,q);
    else D.tasks.unshift({...q,id:id()});

    closeM();
    save();
    TASK_SECTOR=setor;
    tarefas();
    toast('Tarefa salva em '+s.title+'.');
  });
}

function toggleTask(taskId){
  const t=D.tasks.find(x=>x.id===taskId);
  if(!t)return;
  taskNormalize(t);
  t.feita=!t.feita;
  t.status=t.feita?'Concluída':'Pendente';
  save();
  tarefas();
  toast(t.feita?'Tarefa concluída.':'Tarefa reaberta.');
}

function deleteTask(taskId){
  const t=D.tasks.find(x=>x.id===taskId);
  if(!t)return;
  if(!confirm(`Excluir a tarefa "${t.titulo||'Sem título'}"?`))return;
  D.tasks=D.tasks.filter(x=>x.id!==taskId);
  save();
  tarefas();
  toast('Tarefa excluída.');
}

function agenda(){let y=cal.getFullYear(),m=cal.getMonth(),s=new Date(y,m,1-new Date(y,m,1).getDay()),days=[];for(let i=0;i<42;i++){let z=new Date(s);z.setDate(s.getDate()+i);days.push(z)}document.getElementById('p-agenda').innerHTML=head('Agenda','Calendário local.',`<button class="btn primary" onclick="eventM()">+ Compromisso</button>`)+`<div class="card section"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><button class="btn light sm" onclick="cal=new Date(${y},${m-1},1);agenda()">←</button><b>${cal.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</b><button class="btn light sm" onclick="cal=new Date(${y},${m+1},1);agenda()">→</button></div><div class="calendar">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>`<b style="font-size:9px;text-align:center">${x}</b>`).join('')}${days.map(d=>{let k=d.toISOString().slice(0,10),ev=D.agenda.filter(x=>x.data===k);return`<div class="day" onclick="eventM('','${k}')"><b>${d.getDate()}</b>${ev.map(v=>`<div class="event">${e(v.hora)} ${e(v.titulo)}</div>`).join('')}</div>`}).join('')}</div></div>`}function eventM(x='',dt=''){let a=D.agenda.find(v=>v.id===x)||{};modal('Compromisso',`<form id="f" class="fg"><div class="field span"><label>Título</label><input name="titulo" value="${e(a.titulo||'')}"></div><div class="field"><label>Data</label><input type="date" name="data" value="${a.data||dt}"></div><div class="field"><label>Hora</label><input type="time" name="hora" value="${a.hora||'08:00'}"></div><div class="field span"><label>Descrição</label><textarea name="descricao">${e(a.descricao||'')}</textarea></div></form>`,()=>{let q=obj(document.getElementById('f'));if(a.id)Object.assign(a,q);else D.agenda.push({...q,id:id()});closeM();save()})}
function agendamento(){document.getElementById('p-agendamento').innerHTML=head('Agendamento e Aprovação','Artes, vídeos, legendas e HTML para o cliente.')+`<div class="notice">Os arquivos ficam neste navegador em IndexedDB. O HTML de aprovação incorpora as mídias para o cliente abrir sem painel.</div><div class="grid companies">${D.companies.map(c=>`<div class="card company"><div class="avatar">${ini(c.nome)}</div><h3>${e(c.nome)}</h3><div class="meta">${D.scheduled.filter(x=>x.companyId===c.id).length} materiais</div><div class="actions"><button class="btn dark sm" onclick="materials('${c.id}')">Abrir</button><button class="btn light sm" onclick="approval('${c.id}')">Baixar HTML aprovação</button></div></div>`).join('')||empty('Cadastre empresa.')}</div>`}async function materials(cid){
  let c=D.companies.find(x=>x.id===cid),it=D.scheduled.filter(x=>x.companyId===cid),cards='';
  for(let s of it){
    let u=await mediaURL(s.mediaId),ct=D.contents.find(x=>x.id===s.contentId)||{};
    let media=s.mime?.startsWith('image/')?`<img src="${u}" alt="${e(ct.titulo||s.fileName||'Material')}">`
      :s.mime?.startsWith('video/')?`<video class="move-video-player" controls playsinline preload="metadata" src="${u}" onloadedmetadata="moveVideoCheck(this)"></video>`
      :'<i class="fa fa-file fa-2x"></i>';
    cards+=`<article class="instagram-card">
      <div class="instagram-media-wrap">${media}</div>
      <div class="instagram-info">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
          <span class="badge ${s.status==='Aprovado'?'ok':'warn'}">${e(s.status||'Aguardando aprovação')}</span>
          <span class="meta">${date(s.data)} ${e(s.hora||'')}</span>
        </div>
        <h3>${e(ct.titulo||s.fileName||'Material')}</h3>
        ${s.legenda?`<div class="caption">${e(s.legenda)}</div>`:'<div class="meta">Sem legenda cadastrada.</div>'}
        <div class="actions"><button class="btn light sm" onclick="upload('${cid}','${s.id}')"><i class="fa fa-pen"></i> Editar</button><button class="btn danger sm" onclick="deleteScheduled('${s.id}','${cid}')"><i class="fa fa-trash"></i> Excluir upload</button></div>
      </div>
    </article>`;
  }
  document.getElementById('p-agendamento').innerHTML=
    head(c.nome,'Materiais produzidos em cards estilo post, preservando o formato original.',`<button class="btn light" onclick="agendamento()">← Empresas</button> <button class="btn primary" onclick="upload('${cid}')">+ Material</button> <button class="btn dark" onclick="approval('${cid}')">Baixar HTML aprovação</button>`)
    +`<div style="display:grid;gap:18px">${cards||empty('Nenhum material.')}</div>`;
}
function upload(cid,x=''){let s=D.scheduled.find(a=>a.id===x)||{},opts=D.contents.filter(a=>a.companyId===cid).map(c=>`<option value="${c.id}" ${s.contentId===c.id?'selected':''}>${e(c.tipo)} — ${e(c.titulo)}</option>`).join('');modal('Material',`<form id="f" class="fg"><div class="field span"><label>Conteúdo</label><select name="contentId"><option value="">Sem vínculo</option>${opts}</select></div><div class="field span"><label>Imagem ou vídeo</label><input type="file" id="file" accept="image/*,video/*"></div><div class="field span"><label>Legenda</label><textarea name="legenda">${e(s.legenda||'')}</textarea></div><div class="field"><label>Data</label><input type="date" name="data" value="${s.data||''}"></div><div class="field"><label>Hora</label><input type="time" name="hora" value="${e(s.hora||'')}"></div><div class="field"><label>Status</label><select name="status">${['Aguardando aprovação','Aprovado','Ajustar','Agendado','Publicado'].map(v=>`<option ${s.status===v?'selected':''}>${v}</option>`).join('')}</select></div></form>`,async()=>{let q=obj(document.getElementById('f')),fl=document.getElementById('file').files[0],mid=s.mediaId||id();if(!x&&!fl)return toast('Selecione um arquivo.');if(fl&&fl.size>35*1024*1024)return toast('Use arquivo até 35 MB.');if(fl){await mediaPut(mid,fl);q.mediaId=mid;q.mime=fl.type;q.fileName=fl.name}else{q.mediaId=mid;q.mime=s.mime;q.fileName=s.fileName}if(s.id)Object.assign(s,q);else D.scheduled.push({...q,id:id(),companyId:cid});closeM();save();materials(cid)})}


async function deleteScheduled(scheduledId,cid=''){
  const s=D.scheduled.find(x=>x.id===scheduledId);
  if(!s)return;
  const ct=D.contents.find(x=>x.id===s.contentId);
  const name=ct?.titulo||s.fileName||'material';
  if(!confirm(`Excluir o upload "${name}"?\n\nO conteúdo planejado será mantido. Apenas a mídia/agendamento anexado será removido.`))return;

  const mid=s.mediaId;
  D.scheduled=D.scheduled.filter(x=>x.id!==scheduledId);

  if(mid){
    try{
      const db=await mediaDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('m','readwrite');
        tx.objectStore('m').delete(mid);
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error);
      });
    }catch(_){}
  }

  save();
  if(cid||CID){
    await board(cid||CID);
  }else{
    agendamento();
  }
  toast('Upload excluído.');
}

function cleanInstagram(u){u=String(u||'').trim();try{let x=new URL(u);x.search='';x.hash='';return x.toString()}catch(_){return u}}
function curadoria(){
  let cs=[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)),
      it=D.curadoria.filter(x=>CUR==='all'||x.companyId===CUR);
  document.getElementById('p-curadoria').innerHTML=
    head('Curadoria','Seu laboratório de referências: assista por aqui, organize por cliente e copie o link quando quiser compartilhar.',`<button class="btn primary" onclick="curadoriaEdit()">+ Nova referência</button>`)
    +`<div class="filter"><button class="btn ${CUR==='all'?'dark':'light'} sm" onclick="CUR='all';curadoria()">Todas</button>${cs.map(c=>`<button class="btn ${CUR===c.id?'dark':'light'} sm" onclick="CUR='${c.id}';curadoria()">${e(c.nome)}</button>`).join('')}</div>
    <div class="grid curadoria">${it.map(x=>{
      let c=D.companies.find(z=>z.id===x.companyId)||{},u=cleanInstagram(x.url);
      return `<article class="card reel">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px">
          <span class="badge warn">${e(c.nome||'Sem empresa')}</span>
          <button class="btn copy-link-btn sm" onclick="copyCuradoriaLink('${x.id}')"><i class="fa fa-copy"></i> Copiar link</button>
        </div>
        <h3>${e(x.titulo||'Referência')}</h3>
        ${x.obs?`<div class="meta" style="margin-bottom:9px">${e(x.obs)}</div>`:''}
        <div class="reelbox">
          <blockquote class="instagram-media" data-instgrm-permalink="${e(u)}" data-instgrm-version="14" data-instgrm-captioned style="background:#fff;border:0;margin:0;max-width:100%;min-width:0;width:100%"></blockquote>
        </div>
        <div class="actions">
          <button class="btn light sm" onclick="curadoriaEdit('${x.id}')">Editar</button>
          <button class="btn danger sm" onclick="curadoriaDel('${x.id}')">Excluir</button>
        </div>
      </article>`;
    }).join('')||empty('Nenhuma referência salva.')}</div>`;
  setTimeout(()=>{try{window.instgrm?.Embeds?.process()}catch(_){}},120);
}
function copyCuradoriaLink(idRef){
  const x=D.curadoria.find(v=>v.id===idRef);
  if(!x)return;
  navigator.clipboard.writeText(cleanInstagram(x.url)).then(()=>toast('Link copiado.')).catch(()=>toast('Não foi possível copiar.'));
}
function curadoriaEdit(x=''){let a=D.curadoria.find(v=>v.id===x)||{};modal('Referência de Curadoria',`<form id="f" class="fg"><div class="field span"><label>Empresa</label><select name="companyId"><option value="">Selecione...</option>${D.companies.map(c=>`<option value="${c.id}" ${a.companyId===c.id?'selected':''}>${e(c.nome)}</option>`).join('')}</select></div><div class="field span"><label>Nome da referência</label><input name="titulo" value="${e(a.titulo||'')}" placeholder="Ex.: Gancho criativo / transição / campanha"></div><div class="field span"><label>Link do Instagram</label><input name="url" value="${e(a.url||'')}" placeholder="https://www.instagram.com/reel/..."></div><div class="field span"><label>Observação</label><textarea name="obs">${e(a.obs||'')}</textarea></div></form>`,()=>{let q=obj(document.getElementById('f'));if(!q.companyId)return toast('Selecione a empresa.');if(!q.url)return toast('Cole o link.');q.url=cleanInstagram(q.url);if(a.id)Object.assign(a,q);else D.curadoria.unshift({...q,id:id()});closeM();save();curadoria();toast('Referência salva.')})}
function curadoriaDel(x){if(!confirm('Excluir referência?'))return;D.curadoria=D.curadoria.filter(v=>v.id!==x);save();curadoria()}

function dl(txt,name,type='text/html'){let u=URL.createObjectURL(new Blob([txt],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}function safe(s){return String(s||'arquivo').replace(/[^a-z0-9_-]/gi,'_')}
async function weekHTML(wid){
  const w=D.weeks.find(x=>x.id===wid);
  if(!w)return toast('Semana não encontrada.');
  const c=D.companies.find(x=>x.id===w.companyId);
  const it=D.contents.filter(x=>x.weekId===wid).sort((a,b)=>String(a.postDate||'').localeCompare(String(b.postDate||''))||a.ordem-b.ordem);
  let cards='';
  for(let i=0;i<it.length;i++){
    const x=it[i],s=D.scheduled.find(v=>v.contentId===x.id);
    let media='';
    if(s?.mediaId){
      const data=await mediaData(s.mediaId);
      if(s.mime?.startsWith('image/'))media=`<div class="media"><img src="${data}" alt="${e(x.titulo||s.fileName||'Imagem')}"></div>`;
      else if(s.mime?.startsWith('video/'))media=`<div class="media video"><video controls preload="metadata" playsinline src="${data}" onloadedmetadata="if(!this.videoWidth){this.insertAdjacentHTML(\'afterend\',\'<div class=&quot;video-warning&quot;>O áudio foi carregado, mas o navegador não suporta o codec de vídeo deste arquivo. Use MP4 H.264 para compatibilidade total.</div>\')}</video><small>Vídeo/Reels sem corte e em proporção original</small></div>`;
    }
    cards+=`<article>
      <div class="top"><span>${e(x.tipo)}</span><small>CONTEÚDO ${i+1}</small></div>
      <h2>${e(x.titulo)}</h2>
      <div class="when">${date(x.postDate)} ${e(x.postTime||'')}</div>
      ${media}
      ${x.descricao?`<section><b>Descrição</b><p>${e(x.descricao).replace(/\n/g,'<br>')}</p></section>`:''}
      ${x.roteiro?`<section class="script"><b>Roteiro / Desenvolvimento</b><p>${e(x.roteiro).replace(/\n/g,'<br>')}</p></section>`:''}
      ${s?.legenda?`<section><b>Legenda</b><p>${e(s.legenda).replace(/\n/g,'<br>')}</p></section>`:''}
      ${s?`<footer>Status do material: <b>${e(s.status||'Aguardando aprovação')}</b></footer>`:''}
    </article>`;
  }
  const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(c.nome)} — Semana ${w.numero}</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;background:#f5f6f8;color:#171717}.hero{background:#111;color:#fff;padding:38px 5vw}.hero b{color:#fca311}.hero h1{margin:8px 0}.wrap{max-width:1000px;margin:auto;padding:24px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}.meta div,article{background:#fff;border:1px solid #e8e8e8;border-radius:16px;padding:18px;margin-bottom:14px}.meta span,.top small{font-size:9px;color:#888;text-transform:uppercase}.top{display:flex;justify-content:space-between;align-items:center}.top>span{background:#fff1cf;color:#8a5600;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:bold}.when{font-size:11px;color:#777;margin:5px 0 14px}.media{width:100%;background:#111;border-radius:12px;padding:10px;margin:12px 0;display:flex;flex-direction:column;align-items:center;overflow:auto}.media img{display:block;width:auto;height:auto;max-width:100%;object-fit:contain;object-position:center}.media video{display:block;width:100%;height:auto;max-width:100%;aspect-ratio:auto;object-fit:contain;object-position:center;background:#000}.video-warning{margin-top:8px;padding:10px;border-radius:8px;background:#fff3cd;color:#664d03;font-size:11px;line-height:1.4}.media small{color:#bbb;margin-top:7px;font-size:9px}section{background:#f7f7f7;padding:12px;border-radius:10px;margin-top:10px}section b{font-size:9px;text-transform:uppercase;color:#777}section p{font-size:12px;line-height:1.6}.script{border-left:3px solid #fca311}footer{border-top:1px solid #eee;margin-top:12px;padding-top:10px;font-size:11px}@media(max-width:650px){.meta{grid-template-columns:1fr}.wrap{padding:14px}.hero{padding:28px 18px}}
  </style></head><body><div class="hero"><b>MOVE AGÊNCIA</b><h1>${e(c.nome)} — Semana ${w.numero}</h1><p>${date(w.inicio)} — ${date(w.fim)}</p></div><div class="wrap"><div class="meta"><div><span>OBJETIVO</span><h3>${e(w.objetivo||'—')}</h3></div><div><span>LINHA ESTRATÉGICA</span><h3>${e(w.linha||'—')}</h3></div></div>${cards||'<article>Sem conteúdos.</article>'}</div></body></html>`;
  dl(html,`MOVE_${safe(c.nome)}_Semana_${w.numero}.html`);
  toast('Planejamento com mídias baixado.');
}
async function approval(cid){let c=D.companies.find(x=>x.id===cid),it=D.scheduled.filter(x=>x.companyId===cid),cards='';for(let s of it){let data=await mediaData(s.mediaId),ct=D.contents.find(x=>x.id===s.contentId)||{};cards+=`<article><div class="pv">${s.mime?.startsWith('image/')?`<img src="${data}">`:s.mime?.startsWith('video/')?`<video controls playsinline preload="metadata" src="${data}" onloadedmetadata="if(!this.videoWidth){this.insertAdjacentHTML(\'afterend\',\'<div class=&quot;video-warning&quot;>O navegador conseguiu ler o áudio, mas não o codec de vídeo deste arquivo. Converta para MP4 H.264 para visualizar em qualquer navegador.</div>\')}</video>`:'ARQUIVO'}</div><div class="info"><span>${e(ct.tipo||'Material')}</span><small>${e(s.status)}</small><h2>${e(ct.titulo||s.fileName||'Material')}</h2><p>${date(s.data)} ${e(s.hora||'')}</p>${s.legenda?`<section><b>Legenda proposta</b><p>${e(s.legenda).replace(/\n/g,'<br>')}</p></section>`:''}</div></article>`}dl(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(c.nome)} — Aprovação</title><style>body{font-family:Arial;margin:0;background:#f5f6f8}.hero{background:#111;color:#fff;padding:42px}.hero b{color:#fca311}.wrap{max-width:1100px;margin:auto;padding:24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}article{background:#fff;border:1px solid #e8e8e8;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.05)}.pv{background:#111;display:flex;align-items:center;justify-content:center;padding:10px;overflow:auto}.pv img{display:block;max-width:100%;width:auto;height:auto;object-fit:contain;object-position:center}.pv video{display:block;width:100%;height:auto;max-width:100%;aspect-ratio:auto;object-fit:contain;object-position:center;background:#000}.video-warning{padding:10px;margin:8px;background:#fff3cd;color:#664d03;border-radius:8px;font-size:11px;line-height:1.4}.info{padding:14px}.info>span{background:#fff1cf;color:#8a5600;padding:5px 8px;border-radius:999px;font-size:9px;font-weight:bold}.info>small{float:right;color:#888}.info h2{font-size:15px}.info>p{font-size:10px;color:#888}section{background:#f7f7f7;border-radius:9px;padding:10px}section b{font-size:9px;color:#777}section p{font-size:11px;line-height:1.5}@media(max-width:850px){.grid{grid-template-columns:1fr}}

</style></head><body><div class="hero"><b>MOVE AGÊNCIA</b><h1>${e(c.nome)}</h1><p>Materiais para visualização e aprovação</p></div><div class="wrap"><div class="grid">${cards||'<article><div class="info">Nenhum material.</div></article>'}</div></div></body></html>`,`MOVE_${safe(c.nome)}_Aprovacao.html`);toast('HTML de aprovação baixado.')}
function backup(){dl(JSON.stringify(D,null,2),'MOVE_Backup_'+new Date().toISOString().slice(0,10)+'.json','application/json')}function restorePick(){const r=document.getElementById('restore');if(r)r.click()}const restoreEl=document.getElementById('restore');if(restoreEl)restoreEl.onchange=async()=>{try{const file=restoreEl.files&&restoreEl.files[0];if(!file)return;D=Object.assign(blank(),JSON.parse(await file.text()));delete D.finance;delete D.contracts;save();toast('Backup restaurado.')}catch(err){toast('Backup inválido.')}}
function mediaDB(){return new Promise((ok,no)=>{let r=indexedDB.open('MOVE_MEDIA',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('m'))r.result.createObjectStore('m')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}async function mediaPut(k,v){let db=await mediaDB();return new Promise((ok,no)=>{let t=db.transaction('m','readwrite');t.objectStore('m').put(v,k);t.oncomplete=ok;t.onerror=()=>no(t.error)})}async function mediaGet(k){if(!k)return null;let db=await mediaDB();return new Promise((ok,no)=>{let r=db.transaction('m').objectStore('m').get(k);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>no(r.error)})}async function mediaURL(k){let b=await mediaGet(k);return b?URL.createObjectURL(b):''}async function mediaData(k){let b=await mediaGet(k);if(!b)return'';return new Promise((ok,no)=>{let r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(b)})}


function injectMoveMultiCSS(){
  if(document.getElementById('move-multi-css'))return;
  const st=document.createElement('style');
  st.id='move-multi-css';
  st.textContent=`
    .move-check-grid{
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:8px;
    }
    .move-check-chip{
      position:relative;
      cursor:pointer;
      user-select:none;
    }
    .move-check-chip input{
      position:absolute;
      opacity:0;
      pointer-events:none;
    }
    .move-check-chip span{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-height:36px;
      padding:8px 12px;
      border:1px solid #e6e6e6;
      border-radius:999px;
      background:#fff;
      color:#333;
      font-size:12px;
      font-weight:700;
      transition:.18s ease;
    }
    .move-check-chip span:hover{
      transform:translateY(-1px);
      border-color:#cfcfcf;
      box-shadow:0 5px 14px rgba(0,0,0,.06);
    }
    .move-check-chip input:checked + span{
      background:#111;
      color:#fff;
      border-color:#111;
      box-shadow:0 5px 14px rgba(0,0,0,.12);
    }
    .move-check-chip input:checked + span::before{
      content:'✓';
      margin-right:6px;
      font-weight:900;
    }
    .move-check-help{
      display:block;
      margin-top:8px;
      color:#888;
      font-size:11px;
    }
    @media(max-width:600px){
      .move-check-grid{
        gap:6px;
      }
      .move-check-chip span{
        min-height:34px;
        padding:7px 10px;
        font-size:11px;
      }
    }
  `;
  document.head.appendChild(st);
}




function moveVideoCheck(v){
  if(!v)return;
  v.style.width='100%';
  v.style.height='auto';
  v.style.maxWidth='100%';
  v.style.objectFit='contain';
  v.style.objectPosition='center';
  v.style.background='#000';

  const old=v.parentElement?.querySelector('.move-video-warning');
  if(old)old.remove();

  if(v.videoWidth>0&&v.videoHeight>0){
    v.dataset.videoOk='1';
    return;
  }

  const warn=document.createElement('div');
  warn.className='move-video-warning';
  warn.style.cssText='padding:10px;margin:8px;background:#fff3cd;color:#664d03;border-radius:8px;font-size:11px;line-height:1.4';
  warn.innerHTML='<b>O áudio abriu, mas a imagem do vídeo não.</b><br>Isso indica codec de vídeo incompatível com este navegador. Para funcionar em Chrome/Edge/Android e no HTML baixado, use MP4 com vídeo H.264 + áudio AAC.';
  v.insertAdjacentElement('afterend',warn);
}

function injectMoveCalendarCSS(){
  if(document.getElementById('move-calendar-css'))return;
  const st=document.createElement('style');
  st.id='move-calendar-css';
  st.textContent=`
    .move-board-calendar-wrap{display:grid;gap:18px;margin-top:16px}
    .move-calendar-week{background:#fff;border:1px solid #e8e8e8;border-radius:18px;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,.04)}
    .move-calendar-week.is-complete{border-color:#bfe8cb}
    .move-week-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}
    .move-week-calendar{display:grid;grid-template-columns:repeat(7,minmax(150px,1fr));gap:8px;overflow-x:auto;padding-bottom:4px}
    .move-day{min-width:150px;min-height:190px;border:1px solid #ececec;border-radius:14px;background:#fafafa;overflow:hidden}
    .move-day.has-content{background:#fff}
    .move-day-head{display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #eee;background:#f7f7f7}
    .move-day-head>div{display:flex;align-items:center;gap:7px;text-transform:capitalize}
    .move-day-head b{font-size:11px}
    .move-day-head span{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#111;color:#fff;font-size:11px;font-weight:800}
    .move-day-add{width:27px;height:27px;border:0;border-radius:8px;background:#fca311;color:#111;cursor:pointer}
    .move-day-body{display:grid;gap:7px;padding:8px}
    .move-empty-day{border:1px dashed #d7d7d7;background:transparent;border-radius:10px;padding:18px 8px;color:#888;font-size:10px;cursor:pointer}
    .move-calendar-content{border:1px solid #ececec;border-radius:11px;padding:9px;background:#fff}
    .move-calendar-content strong{display:block;font-size:11px;line-height:1.35;margin:7px 0 4px}
    .move-calendar-content small{font-size:9px;color:#888}
    .move-calendar-content .actions{margin-top:8px;gap:4px}
    .move-calendar-tags{display:flex;gap:4px;flex-wrap:wrap}
    .move-undated{margin-top:10px;padding:10px;border-radius:12px;background:#fff8e8;display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:10px}
    .move-team-area{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}
    .move-team-column{background:#f7f7f8;border:1px solid #e8e8e8;border-radius:18px;padding:14px}
    .move-team-column>h3{margin:0 0 4px}.move-team-list{display:grid;gap:9px;margin-top:12px}
    .move-team-card{background:#fff;border:1px solid #e8e8e8;border-radius:13px;padding:11px}
    .move-team-card>strong{display:block;margin:8px 0 4px;font-size:12px}.move-team-card>small{display:block;color:#888;font-size:9px;margin-bottom:8px}
    .move-status-select{width:100%;border:1px solid #ddd;border-radius:9px;padding:8px;background:#fff;font-size:10px;margin:5px 0}
    .move-team-strategic{background:#eef3ff!important;color:#3156a3!important}.move-team-creative{background:#fff0d2!important;color:#805100!important}
    .move-upload-attached{display:inline-flex;align-items:center;gap:4px}
    .move-upload-done{display:inline-flex!important;align-items:center;gap:5px}
    .campaign-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
    .campaign-tab-count{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:rgba(255,255,255,.18);margin-left:4px;font-size:9px}
    .campaign-create-start{text-align:center;padding:34px!important;max-width:680px;margin:18px auto}
    .campaign-create-icon{width:60px;height:60px;border-radius:18px;background:#111;color:#fca311;display:grid;place-items:center;margin:0 auto 14px;font-size:22px}
    .campaign-create-start h3{margin:0 0 7px}
    .campaign-create-start p{max-width:520px;margin:0 auto 18px;line-height:1.6}
    .campaign-grid{align-items:stretch}.campaign-card{display:flex;flex-direction:column}.campaign-card-top{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.campaign-card h3{margin:12px 0 6px}.campaign-idea{font-size:11px;line-height:1.55;color:#555;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.campaign-objective{display:grid;gap:3px;padding:10px;background:#f7f7f7;border-radius:10px;margin:10px 0}.campaign-objective b{font-size:9px;text-transform:uppercase;color:#888}.campaign-objective span{font-size:11px}.campaign-card .actions{margin-top:auto;padding-top:12px}.campaign-editor-title{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:10px}.campaign-editor-title small{display:block;color:#888;font-size:9px;margin-top:4px}.campaign-creative-list{display:grid;gap:10px}.campaign-creative-editor{border:1px solid #e5e5e5;border-radius:13px;padding:12px;background:#fafafa}.campaign-creative-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}.campaign-creative-head small{font-size:9px;color:#888}.campaign-total-box{height:42px;display:flex;align-items:center;padding:0 12px;border-radius:10px;background:#111;color:#fca311;font-size:20px;font-weight:800}
    .move-board-schedule{margin-top:28px}
    .move-board-media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
    .move-board-media-card{background:#fff;border:1px solid #e8e8e8;border-radius:16px;overflow:hidden}
    .move-board-media{background:#111;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0}
    .move-board-media img,.move-board-media video{display:block;width:100%;height:auto;max-width:100%;object-fit:contain;object-position:center;background:#000}
    .move-board-media-info{padding:12px}
    .move-board-media-info h4{margin:9px 0 5px}
    .move-file-placeholder{font-size:32px;color:#aaa}
    @media(max-width:900px){
      .move-week-calendar{grid-template-columns:repeat(7,minmax(180px,1fr))}
    }
    @media(max-width:650px){
      .move-team-area{grid-template-columns:1fr}
      .move-week-top{flex-direction:column}
      .move-week-top>.actions{width:100%;flex-wrap:wrap}
      .move-calendar-week{padding:11px}
    }
  `;
  document.head.appendChild(st);
}

function injectMoveCelebrationCSS(){
  if(document.getElementById('move-celebration-css'))return;
  const st=document.createElement('style');
  st.id='move-celebration-css';
  st.textContent=`
    .move-company-progress,
    .move-board-progress,
    .move-content-progress,
    .move-week-done{
      display:inline-flex;
      align-items:center;
      gap:6px;
      border-radius:999px;
      font-size:11px;
      font-weight:800;
    }
    .move-company-progress{
      margin-top:10px;
      padding:7px 10px;
      background:#f3f4f6;
      color:#777;
    }
    .move-board-progress{
      padding:9px 12px;
      margin-right:5px;
      background:#f3f4f6;
      color:#666;
      vertical-align:middle;
    }
    .move-content-progress{
      margin-top:7px;
      padding:5px 8px;
      background:#f5f5f5;
      color:#777;
    }
    .move-company-progress.is-complete,
    .move-board-progress.is-complete,
    .move-content-progress.is-complete,
    .move-week-done{
      background:#eaf8ef;
      color:#16813b;
    }
    .move-week-done{
      padding:5px 8px;
    }
    .move-week-complete{
      border-color:#bfe8cb !important;
      box-shadow:0 0 0 2px rgba(34,197,94,.07);
    }
    .move-content-chip{
      position:relative;
      padding-right:38px !important;
    }
    .move-content-check{
      position:absolute;
      top:10px;
      right:10px;
      width:22px;
      height:22px;
      display:grid;
      place-items:center;
      border-radius:50%;
      background:#eaf8ef;
      color:#16813b;
      font-size:11px;
    }
    .move-confetti-layer{
      position:fixed;
      inset:0;
      pointer-events:none;
      overflow:hidden;
      z-index:999999;
    }
    .move-confetti-piece{
      position:absolute;
      top:-10vh;
      font-style:normal;
      font-size:12px;
      color:hsl(calc(var(--i,0) * 41deg),80%,55%);
      animation:moveConfettiFall linear forwards;
      will-change:transform,top,opacity;
    }
    .move-confetti-piece:nth-child(5n+1){color:#22c55e}
    .move-confetti-piece:nth-child(5n+2){color:#fca311}
    .move-confetti-piece:nth-child(5n+3){color:#3b82f6}
    .move-confetti-piece:nth-child(5n+4){color:#ef4444}
    .move-confetti-piece:nth-child(5n){color:#a855f7}
    @keyframes moveConfettiFall{
      0%{top:-10vh;transform:translateX(0) rotate(0deg);opacity:1}
      85%{opacity:1}
      100%{top:110vh;transform:translateX(var(--drift)) rotate(820deg);opacity:0}
    }
    @media(max-width:700px){
      .move-board-progress{
        width:100%;
        justify-content:center;
        margin:0 0 8px;
      }
    }
  `;
  document.head.appendChild(st);
}

try{injectMoveMultiCSS();injectMoveCalendarCSS();injectMoveCelebrationCSS();nav();render('home');}catch(err){console.error(err);document.getElementById('toast').textContent='Erro ao iniciar painel: '+err.message;document.getElementById('toast').style.display='block';}
window.addEventListener('DOMContentLoaded',applyAuthState);
