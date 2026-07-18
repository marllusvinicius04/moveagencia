const API_URL='https://script.google.com/macros/s/AKfycbwWvtC7voFQgy8jiCTZ7kSyeQEagyn_RJpbOuzbS1PC48IEJKwjixOH6cMnXOzTwbWpXg/exec';
let PASSWORD='';
let db={empresas:[],campanhas:[],conteudos:[],calendario:[],config:{}};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

async function api(action,payload={}){
  const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,password:PASSWORD,...payload})});
  const text=await response.text();
  let json;
  try{json=JSON.parse(text)}catch(_){throw new Error('Resposta inválida do Apps Script. Atualize a implantação e confira a URL /exec.')}
  if(!json.success)throw new Error(json.error||'Erro na API');
  return json.data;
}
async function login(){
  try{
    PASSWORD=$('password').value.trim();
    await api('login');
    localStorage.setItem('movePassword',PASSWORD);
    $('login').classList.add('hidden');$('app').classList.remove('hidden');
    await loadAll();
  }catch(e){alert(e.message)}
}
async function loadAll(){
  const btn=$('refreshBtn');if(btn)btn.disabled=true;
  try{
    const data=await api('bootstrap')||{};
    db={
      empresas:Array.isArray(data.empresas)?data.empresas:[],
      campanhas:Array.isArray(data.campanhas)?data.campanhas:[],
      conteudos:Array.isArray(data.conteudos)?data.conteudos:[],
      calendario:Array.isArray(data.calendario)?data.calendario:[]
    };
    fillFilters();renderAll();toast('Dados atualizados');
  }catch(e){alert(e.message)}
  finally{if(btn)btn.disabled=false}
}
function fillFilters(){
  const options='<option value="">Todas as empresas</option>'+db.empresas.map(x=>`<option value="${esc(x.ID)}">${esc(x.Nome)}</option>`).join('');
  $('campaignCompanyFilter').innerHTML=options;
}
function renderAll(){renderDashboard();renderEmpresas();renderCampanhas();renderCalendario()}
function renderDashboard(){
  const total=db.conteudos.length;
  const done=db.conteudos.filter(x=>['Publicado','Aprovado'].includes(x.Status)).length;
  const pct=total?Math.round(done/total*100):0;
  $('metrics').innerHTML=[['Empresas',db.empresas.length],['Campanhas',db.campanhas.length],['Conteúdos',total],['Concluídos',done]].map(x=>`<div class="card metric"><span class="muted">${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
  $('progressBar').style.width=pct+'%';
  $('progressText').textContent=`${pct}% concluído (${done} de ${total} conteúdos)`;
}
function companyName(id){return db.empresas.find(x=>String(x.ID)===String(id))?.Nome||'—'}

function renderEmpresas(){
  const q=($('companySearch').value||'').toLowerCase();
  const rows=db.empresas.filter(x=>(x.Nome||'').toLowerCase().includes(q));
  $('companyCards').innerHTML=rows.map(x=>`<div class="card company">
    <span class="tag">${esc(x.FormaPagamento||'Pagamento não definido')}</span>
    <h3>${esc(x.Nome)}</h3>
    <p class="muted">${esc(x.Objetivo||'Sem objetivo informado')}</p>
    <p><b>Mensalidade:</b> R$ ${esc(x.Mensalidade||'0')}</p>
    <p><b>Data de pagamento:</b> ${esc(x.DataPagamento||'Não informada')}</p>
    <p><b>Responsável:</b> ${esc(x.Responsavel||'—')}</p>
    <div class="actions">
      <button class="secondary" onclick='openEmpresa(${JSON.stringify(x)})'>Editar</button>
      <button class="secondary" onclick="exportCompanyCard('${esc(x.ID)}')">Baixar cartão HTML</button>
      <button class="danger" onclick="removeItem('deleteEmpresa','${esc(x.ID)}')">Excluir</button>
    </div></div>`).join('')||'<div class="card">Nenhuma empresa cadastrada.</div>';
}
function renderCampanhas(){
  const filter=$('campaignCompanyFilter').value;
  const rows=db.campanhas.filter(x=>!filter||String(x.EmpresaID)===String(filter));
  $('campaignCards').innerHTML=rows.map(x=>{
    const items=db.conteudos.filter(c=>String(c.CampanhaID)===String(x.ID));
    return `<div class="card item">
      <span class="tag">${esc(x.Status||'Planejada')}</span><h3>${esc(x.Nome)}</h3>
      <p class="muted">${esc(companyName(x.EmpresaID))}</p><p>${esc(x.Objetivo||'')}</p>
      <div class="campaign-content-list"><b>Conteúdos da campanha</b>
      ${items.map(c=>`<div class="mini-item"><span class="tag">${esc(c.Tipo)}</span> <b>${esc(c.Titulo)}</b><p class="muted">${esc(c.DataPostagem||'Sem data')} • ${esc(c.Status||'Pendente')}</p><div class="actions"><button class="secondary" onclick='openConteudo(${JSON.stringify(c)})'>Editar</button><button class="danger" onclick="removeItem('deleteConteudo','${esc(c.ID)}')">Excluir</button></div></div>`).join('')||'<p class="muted">Nenhum conteúdo nesta campanha.</p>'}
      </div>
      <div class="actions"><button class="secondary" onclick='openCampanha(${JSON.stringify(x)})'>Editar campanha</button><button class="primary" onclick="openConteudo({EmpresaID:'${esc(x.EmpresaID)}',CampanhaID:'${esc(x.ID)}'})">+ Conteúdo</button><button class="secondary" onclick="exportCampaign('${esc(x.ID)}')">Baixar HTML</button><button class="danger" onclick="removeItem('deleteCampanha','${esc(x.ID)}')">Excluir</button></div>
    </div>`;
  }).join('')||'<div class="card">Nenhuma campanha cadastrada.</div>';
}
function renderCalendario(){
  const rows=[...db.calendario].sort((a,b)=>(a.Data||'').localeCompare(b.Data||''));
  $('calendarRows').innerHTML=rows.map(x=>`<tr><td>${esc(x.Data)} ${esc(x.Hora||'')}</td><td>${esc(companyName(x.EmpresaID))}</td><td><b>${esc(x.Titulo)}</b><br><span class="muted">${esc(x.Descricao||'')}</span></td><td>${esc(x.Tipo||'')}</td><td><button class="danger" onclick="removeItem('deleteEvento','${esc(x.ID)}')">Excluir</button></td></tr>`).join('')||'<tr><td colspan="5">Nenhum evento cadastrado.</td></tr>';
}

function companyOptions(selected=''){return '<option value="">Selecione</option>'+db.empresas.map(x=>`<option value="${esc(x.ID)}" ${String(x.ID)===String(selected)?'selected':''}>${esc(x.Nome)}</option>`).join('')}
function campaignOptions(companyId='',selected=''){return '<option value="">Selecione</option>'+db.campanhas.filter(x=>!companyId||String(x.EmpresaID)===String(companyId)).map(x=>`<option value="${esc(x.ID)}" ${String(x.ID)===String(selected)?'selected':''}>${esc(x.Nome)}</option>`).join('')}
function showModal(title,html){$('modalTitle').textContent=title;$('modalBody').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){$('modal').classList.add('hidden')}

function openEmpresa(x={}){
  showModal(x.ID?'Editar empresa':'Nova empresa',`<form class="form-grid" onsubmit="saveEmpresa(event)"><input type="hidden" name="ID" value="${esc(x.ID||'')}">
  ${field('Nome',x.Nome,true)}${field('Responsavel',x.Responsavel)}${field('Telefone',x.Telefone)}${field('Email',x.Email,'email')}
  ${area('Dores',x.Dores)}${area('Dificuldades',x.Dificuldades)}${area('Objetivo',x.Objetivo)}${field('TomComunicacao',x.TomComunicacao)}
  ${field('Mensalidade',x.Mensalidade,'number')}${selectField('FormaPagamento',['Pagamento integral','Quinzenal 2x'],x.FormaPagamento)}
  ${field('DataPagamento',x.DataPagamento,'date')}${field('PostsSemana',x.PostsSemana,'number')}${field('StoriesSemana',x.StoriesSemana,'number')}
  ${area('Adicionais',x.Adicionais)}${area('Contrato',x.Contrato)}
  <div class="field full"><button class="primary">Salvar empresa</button></div></form>`);
}
function openCampanha(x={}){
  showModal(x.ID?'Editar campanha':'Nova campanha',`<form class="form-grid" onsubmit="saveCampanha(event)"><input type="hidden" name="ID" value="${esc(x.ID||'')}">
  <div class="field"><label>Empresa</label><select name="EmpresaID" required>${companyOptions(x.EmpresaID)}</select></div>
  ${field('Nome',x.Nome,true)}${area('Objetivo',x.Objetivo)}${selectField('TipoObjetivo',['Geral','Específico'],x.TipoObjetivo)}
  ${field('DataInicio',x.DataInicio,'date')}${field('DataFim',x.DataFim,'date')}${selectField('Status',['Planejada','Ativa','Concluída'],x.Status)}${area('Observacoes',x.Observacoes)}
  <div class="field full"><button class="primary">Salvar campanha</button></div></form>`);
}
function openConteudo(x={}){
  showModal(x.ID?'Editar conteúdo':'Novo conteúdo da campanha',`<form class="form-grid" onsubmit="saveConteudo(event)"><input type="hidden" name="ID" value="${esc(x.ID||'')}">
  <div class="field"><label>Empresa</label><select id="contentCompany" name="EmpresaID" required onchange="refreshCampaignSelect(this.value)">${companyOptions(x.EmpresaID)}</select></div>
  <div class="field"><label>Campanha</label><select id="contentCampaign" name="CampanhaID" required>${campaignOptions(x.EmpresaID,x.CampanhaID)}</select></div>
  ${selectField('Tipo',['Reel','Post','Story'],x.Tipo)}${field('Titulo',x.Titulo,true)}${area('Objetivo',x.Objetivo)}${area('Legenda',x.Legenda)}${area('Roteiro',x.Roteiro)}
  ${field('DataPostagem',x.DataPostagem,'date')}${selectField('Status',['Pendente','Em produção','Aguardando aprovação','Aprovado','Publicado'],x.Status)}${area('Observacoes',x.Observacoes)}
  <div class="field full"><button class="primary">Salvar conteúdo</button></div></form>`);
}
function openEvento(){
  showModal('Novo evento',`<form class="form-grid" onsubmit="saveEvento(event)">
  <div class="field"><label>Empresa</label><select name="EmpresaID" required>${companyOptions()}</select></div>
  ${field('Titulo','',true)}${field('Data','','date')}${field('Hora','','time')}${selectField('Tipo',['Captação','Reunião','Postagem','Entrega','Outro'],'')}${area('Descricao','')}
  <div class="field full"><button class="primary">Salvar evento</button></div></form>`);
}
function field(name,value='',type='text',step=''){const required=type===true?'required':'';if(type===true)type='text';return `<div class="field"><label>${name}</label><input name="${name}" type="${type}" value="${esc(value||'')}" ${required} ${step?`step="${step}"`:''}></div>`}
function area(name,value=''){return `<div class="field full"><label>${name}</label><textarea name="${name}">${esc(value||'')}</textarea></div>`}
function selectField(name,options,value=''){return `<div class="field"><label>${name}</label><select name="${name}">${options.map(option=>`<option value="${esc(option)}" ${String(option)===String(value)?'selected':''}>${esc(option)}</option>`).join('')}</select></div>`}
function formObj(form){return Object.fromEntries(new FormData(form).entries())}

async function submitForm(action,data){
  try{await api(action,{data});closeModal();await loadAll();toast('Salvo com sucesso')}
  catch(e){alert(e.message)}
}
async function saveEmpresa(e){e.preventDefault();await submitForm('saveEmpresa',formObj(e.target))}
async function saveCampanha(e){e.preventDefault();await submitForm('saveCampanha',formObj(e.target))}
async function saveConteudo(e){e.preventDefault();await submitForm('saveConteudo',formObj(e.target))}
async function saveEvento(e){e.preventDefault();await submitForm('saveEvento',formObj(e.target))}
async function removeItem(action,id){
  if(!id){alert('Registro sem ID. Execute configurarSistema novamente.');return}
  if(!confirm('Deseja excluir este registro?'))return;
  try{
    const result=await api(action,{id});
    if(!result||!result.deleted)throw new Error('O registro não foi encontrado na planilha.');
    await loadAll();toast('Excluído com sucesso');
  }catch(e){alert(e.message)}
}
function refreshCampaignSelect(companyId){$('contentCampaign').innerHTML=campaignOptions(companyId)}

function exportCampaign(id){
  const campaign=db.campanhas.find(x=>String(x.ID)===String(id));if(!campaign)return;
  const items=db.conteudos.filter(x=>String(x.CampanhaID)===String(id));
  downloadHTML(`campanha-${slug(campaign.Nome)}.html`,clientHTML(campaign.Nome,companyName(campaign.EmpresaID),`<h2>Objetivo</h2><p>${esc(campaign.Objetivo)}</p><h2>Conteúdos</h2>${items.map(contentBlock).join('')||'<p>Nenhum conteúdo.</p>'}`));
}
function exportCompanyCard(id){
  const x=db.empresas.find(e=>String(e.ID)===String(id));if(!x)return;
  const body=`<h2>Informações da empresa</h2><p><b>Responsável:</b> ${esc(x.Responsavel||'—')}</p><p><b>Telefone:</b> ${esc(x.Telefone||'—')}</p><p><b>E-mail:</b> ${esc(x.Email||'—')}</p><p><b>Objetivo:</b> ${nl(x.Objetivo)}</p><p><b>Tom de comunicação:</b> ${esc(x.TomComunicacao||'—')}</p><h2>Plano contratado</h2><p><b>Mensalidade:</b> R$ ${esc(x.Mensalidade||'0')}</p><p><b>Forma de pagamento:</b> ${esc(x.FormaPagamento||'—')}</p><p><b>Data de pagamento:</b> ${esc(x.DataPagamento||'—')}</p><p><b>Posts por semana:</b> ${esc(x.PostsSemana||'0')}</p><p><b>Stories por semana:</b> ${esc(x.StoriesSemana||'0')}</p><p><b>Adicionais:</b> ${nl(x.Adicionais)}</p>`;
  downloadHTML(`cartao-${slug(x.Nome)}.html`,clientHTML('Cartão de cadastro',x.Nome,body));
}
function contentBlock(x){return `<article><span>${esc(x.Tipo)} • ${esc(x.DataPostagem||'Data a definir')}</span><h2>${esc(x.Titulo)}</h2><h3>Objetivo</h3><p>${nl(x.Objetivo)}</p><h3>Legenda</h3><p>${nl(x.Legenda)}</p>${x.Roteiro?`<h3>Roteiro</h3><p>${nl(x.Roteiro)}</p>`:''}<p><b>Status:</b> ${esc(x.Status)}</p></article>`}
function clientHTML(title,company,body){return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>*{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;background:#f5f6f8;color:#171717;font-family:Arial,sans-serif}.wrap{width:min(850px,100%);margin:auto;padding:28px}.head{background:#111;color:#fff;padding:28px;border-radius:24px}.head b{color:#ffd400}.card,article{width:100%;min-width:0;background:#fff;border:1px solid #e6e6e6;border-radius:20px;padding:22px;margin-top:16px;overflow:hidden}h1,h2,h3,p,span,a{max-width:100%;overflow-wrap:anywhere;word-break:break-word}h1{font-size:clamp(26px,6vw,42px);line-height:1.1}h2{font-size:clamp(20px,4.5vw,28px)}span{display:inline-block;margin-top:12px;background:#fff2a8;padding:7px 10px;border-radius:99px;font-size:13px}p{line-height:1.65;white-space:pre-wrap}@media(max-width:600px){.wrap{padding:12px}.head{padding:18px;border-radius:18px}.card,article{padding:16px;border-radius:16px}}</style></head><body><div class="wrap"><div class="head"><h1>MOVE <b>AGÊNCIA</b></h1><p>${esc(company)}</p></div><div class="card"><h1>${esc(title)}</h1>${body}</div></div></body></html>`}
function downloadHTML(name,html){const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function nl(s){return esc(s||'').replace(/\n/g,'<br>')}
function slug(s){return String(s||'arquivo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
function toast(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),2200)}

document.querySelectorAll('.nav button').forEach(button=>button.onclick=()=>{
  document.querySelectorAll('.nav button').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.section').forEach(section=>section.classList.remove('active'));
  $(button.dataset.section).classList.add('active');
  $('pageTitle').textContent=button.textContent;
  $('sidebar').classList.remove('open');
});
window.addEventListener('load',()=>{const saved=localStorage.getItem('movePassword');if(saved){PASSWORD=saved;$('password').value=saved;login()}});