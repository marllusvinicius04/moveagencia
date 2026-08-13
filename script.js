const KEY='move_local_complete_v1',M=[['home','fa-house','Início'],['operacao','fa-rotate','Operação'],['empresas','fa-building','Empresas'],['quadro','fa-lightbulb','Quadro Criativo'],['pendencias','fa-triangle-exclamation','Pendências'],['textos','fa-file-lines','Meus Textos'],['agenda','fa-calendar-days','Agenda'],['tarefas','fa-list-check','Minhas Tarefas'],['agendamento','fa-photo-film','Agendamento'],['curadoria','fa-icons','Curadoria'],['financeiro','fa-wallet','Financeiro']];let D=load(),R='home',CID='',cal=new Date(),CUR='all';

const EL={saved:document.getElementById('saved'),title:document.getElementById('title'),restore:document.getElementById('restore'),nav:document.getElementById('nav'),modal:document.getElementById('modal')};

function blank(){return{companies:[],weeks:[],contents:[],scheduled:[],finance:[],contracts:[],tasks:[],texts:[],agenda:[],curadoria:[],operationWeeks:[]}}function load(){try{return Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return blank()}}function save(){localStorage.setItem(KEY,JSON.stringify(D));EL.saved.textContent='Salvo • '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});render(R)}function id(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}function e(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}function date(v){if(!v)return'—';return new Date(String(v).slice(0,10)+'T12:00').toLocaleDateString('pt-BR')}function ini(n){return String(n||'M').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}function toast(x){let t=document.getElementById('toast');t.textContent=x;t.style.display='block';setTimeout(()=>t.style.display='none',2500)}function nav(){const navEl=document.getElementById('nav');navEl.innerHTML=M.map(x=>`<button class="${R===x[0]?'active':''}" onclick="go('${x[0]}')"><i class="fa ${x[1]}"></i>${x[2]}</button>`).join('')}function go(r){R=r;document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('p-'+r).classList.add('active');EL.title.textContent=M.find(x=>x[0]===r)?.[2]||'MOVE';nav();render(r)}function head(t,d,b=''){return`<div class="head"><div><h2>${t}</h2><p>${d}</p></div>${b}</div>`}function empty(t){return`<div class="empty">${t}</div>`}function render(r){({home,operacao,empresas,quadro,pendencias,textos,agenda,tarefas,agendamento,curadoria,financeiro}[r]||home)()}function modal(t,b,fn){let m=document.getElementById('modal');m.innerHTML=`<div class="modal"><div class="mh"><b>${t}</b><button class="btn light sm" onclick="closeM()">✕</button></div><div class="mb">${b}</div><div class="mf"><button class="btn light" onclick="closeM()">Cancelar</button>${fn?'<button class="btn primary" id="saveM">Salvar</button>':''}</div></div>`;m.classList.add('open');if(fn){const b=document.getElementById('saveM');if(b)b.onclick=fn}}function closeM(){const modalEl=document.getElementById('modal');modalEl.classList.remove('open');modalEl.innerHTML=''}function obj(f){let o={};new FormData(f).forEach((v,k)=>{if(!(v instanceof File))o[k]=v});return o}

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
    +`<div class="card section" style="margin-top:14px"><div class="list">${pend().slice(0,8).map(x=>`<div class="item"><div><strong>${e(x.company)} — ${e(x.title)}</strong><small>${e(x.detail)}</small></div><span class="badge ${x.type==='financeiro'?'red':'warn'}">${x.type}</span></div>`).join('')||empty('Tudo em dia.')}</div></div>`
    +`<div style="margin-top:18px">${head('Demandas mensais','Cálculo por empresa usando o volume semanal x4 e as tarefas abertas.')}</div>`
    +`<div class="grid companies">${demandCards||empty('Cadastre empresas para calcular as demandas.')}</div>`;
}

function isoLocal(d){
  const x=new Date(d);
  const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),day=String(x.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function mondayOf(v=new Date()){
  const d=new Date(v),day=d.getDay(),diff=d.getDate()-day+(day===0?-6:1);
  d.setDate(diff);d.setHours(12,0,0,0);return d;
}
function addDaysISO(iso,n){const d=new Date(iso+'T12:00');d.setDate(d.getDate()+n);return isoLocal(d)}
function operationWeekByStart(start){return D.operationWeeks.find(x=>x.start===start)}
function operationType(start){
  const base=mondayOf(new Date());
  const target=mondayOf(new Date(start+'T12:00'));
  const diff=Math.round((target-base)/(7*86400000));
  return Math.abs(diff)%2===0?'Planejamento':'Captação e Produção';
}
function operationLabel(type){return type==='Planejamento'?'SEMANA DE PLANEJAMENTO':'SEMANA DE CAPTAÇÃO E PRODUÇÃO'}
function operationDefaults(type){
  return type==='Planejamento'
    ?[
      ['Revisar pendências das 13 empresas','09:00','10:00','Operação'],
      ['Planejar conteúdos das próximas 2 semanas','10:00','12:00','Planejamento'],
      ['Criar roteiros, ideias e referências','14:00','16:00','Estratégia'],
      ['Fechar calendário e preparar próxima captação','16:00','17:30','Preparação']
    ]
    :[
      ['Conferir roteiro e ordem das captações','08:00','09:00','Preparação'],
      ['Captações programadas','09:00','12:00','Captação'],
      ['Organizar arquivos e backups','13:30','14:30','Organização'],
      ['Editar materiais captados','14:30','17:00','Edição'],
      ['Enviar materiais para aprovação / Kiiru','17:00','18:00','Entrega']
    ];
}
function ensureOperationWeek(start,type=''){
  let w=operationWeekByStart(start);
  if(!w){
    w={id:id(),start,type:type||operationType(start),prepared:false,notes:'',createdAt:new Date().toISOString()};
    D.operationWeeks.push(w);
  }
  return w;
}
function weekTasks(start){return D.tasks.filter(t=>t.operationWeek===start).sort((a,b)=>(a.operationDate||'').localeCompare(b.operationDate||'')||(a.horaInicio||'').localeCompare(b.horaInicio||''))}
function operationProgress(start){
  const ts=weekTasks(start),done=ts.filter(t=>t.status==='Concluída').length;
  return {total:ts.length,done,pct:ts.length?Math.round(done/ts.length*100):0};
}
function prepararSemana(start='',forcedType=''){
  const base=start?new Date(start+'T12:00'):mondayOf(new Date());
  const monday=isoLocal(mondayOf(base)),w=ensureOperationWeek(monday,forcedType||operationType(monday));
  const days=['Segunda','Terça','Quarta','Quinta','Sexta'];
  const body=`<form id="f" class="fg">
    <div class="field"><label>Semana referente</label><input type="date" name="start" value="${w.start}"></div>
    <div class="field"><label>Tipo da semana</label><select name="type">${['Planejamento','Captação e Produção'].map(v=>`<option ${w.type===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class="field span"><label>Objetivo / observações da semana</label><textarea name="notes" placeholder="Ex.: deixar semanas 2 e 3 prontas, finalizar aprovações, organizar captações...">${e(w.notes||'')}</textarea></div>
    <div class="field span"><label>Adicionar tarefa à preparação</label>
      <div class="fg" style="margin-top:8px">
        <div class="field"><label>Dia</label><select id="opDay">${days.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select></div>
        <div class="field"><label>Empresa</label><select id="opCompany"><option value="">Operação geral</option>${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value="${c.id}">${e(c.nome)}</option>`).join('')}</select></div>
        <div class="field span"><label>Tarefa</label><input id="opTitle" placeholder="Ex.: editar Reel da empresa X"></div>
        <div class="field"><label>Início</label><input type="time" id="opStart" value="09:00"></div>
        <div class="field"><label>Fim</label><input type="time" id="opEnd" value="10:00"></div>
      </div>
      <button type="button" class="btn dark sm" style="margin-top:10px" onclick="addOperationTaskFromModal('${w.id}')">+ Adicionar tarefa</button>
    </div>
    <div class="field span"><label>Rotina sugerida</label><div class="notice">Você pode gerar uma base automática para esta semana e depois editar/excluir as tarefas normalmente em Minhas Tarefas.</div>
      <button type="button" class="btn light sm" style="margin-top:8px" onclick="generateOperationRoutine('${w.id}')"><i class="fa fa-wand-magic-sparkles"></i> Gerar rotina base</button>
    </div>
  </form>`;
  modal('Preparar semana',body,()=>{
    const q=obj(document.getElementById('f'));
    const old=w.start;
    w.start=q.start||w.start;w.type=q.type||w.type;w.notes=q.notes||'';w.prepared=true;
    if(old!==w.start)D.tasks.filter(t=>t.operationWeek===old).forEach(t=>t.operationWeek=w.start);
    closeM();save();operacao();toast('Semana preparada.');
  });
}
function addOperationTaskFromModal(wid){
  const w=D.operationWeeks.find(x=>x.id===wid);if(!w)return;
  const title=document.getElementById('opTitle').value.trim();if(!title)return toast('Informe a tarefa.');
  const day=Number(document.getElementById('opDay').value||0);
  D.tasks.push({id:id(),companyId:document.getElementById('opCompany').value,lista:operationLabel(w.type),titulo:title,descricao:'',prazo:addDaysISO(w.start,day),operationDate:addDaysISO(w.start,day),operationWeek:w.start,horaInicio:document.getElementById('opStart').value,horaFim:document.getElementById('opEnd').value,status:'Pendente'});
  document.getElementById('opTitle').value='';save();toast('Tarefa adicionada à semana.');
}
function generateOperationRoutine(wid){
  const w=D.operationWeeks.find(x=>x.id===wid);if(!w)return;
  if(D.tasks.some(t=>t.operationWeek===w.start)&&!confirm('Essa semana já possui tarefas. Adicionar a rotina base mesmo assim?'))return;
  const defs=operationDefaults(w.type);
  defs.forEach((x,i)=>D.tasks.push({id:id(),companyId:'',lista:operationLabel(w.type),titulo:x[0],descricao:x[3],prazo:addDaysISO(w.start,Math.min(i,4)),operationDate:addDaysISO(w.start,Math.min(i,4)),operationWeek:w.start,horaInicio:x[1],horaFim:x[2],status:'Pendente'}));
  save();toast('Rotina base adicionada.');
}
function setOperationWeekType(start,type){
  const w=ensureOperationWeek(start,type);w.type=type;save();operacao();
}
function operacao(){
  const current=isoLocal(mondayOf(new Date()));
  const starts=[-1,0,1,2].map(n=>addDaysISO(current,n*7));
  starts.forEach(s=>ensureOperationWeek(s,operationType(s)));
  const cards=starts.map(s=>{
    const w=operationWeekByStart(s),p=operationProgress(s),ts=weekTasks(s),end=addDaysISO(s,4);
    return `<div class="card section move-op-week ${s===current?'move-op-current':''}">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap">
        <div><span class="badge ${w.type==='Planejamento'?'warn':'ok'}">${operationLabel(w.type)}</span><h3 style="margin:8px 0 3px">${date(s)} — ${date(end)}</h3><div class="meta">${w.notes?e(w.notes):'Semana ainda sem observações.'}</div></div>
        <button class="btn primary sm" onclick="prepararSemana('${s}','${w.type}')"><i class="fa fa-calendar-check"></i> Preparar semana</button>
      </div>
      <div class="move-op-progress"><div style="width:${p.pct}%"></div></div>
      <div class="meta" style="margin:7px 0 10px"><b>${p.done}/${p.total}</b> tarefas concluídas • ${p.pct}%</div>
      <div class="list">${ts.slice(0,8).map(t=>{const c=D.companies.find(x=>x.id===t.companyId);return `<div class="item"><div><strong>${e(t.horaInicio||'')} ${e(t.titulo)}</strong><small>${date(t.operationDate||t.prazo)}${c?' • '+e(c.nome):' • Operação geral'}${t.horaFim?' • até '+e(t.horaFim):''}</small></div><span class="badge ${t.status==='Concluída'?'ok':'warn'}">${e(t.status||'Pendente')}</span></div>`}).join('')||empty('Nenhuma tarefa preparada para esta semana.')}</div>
    </div>`;
  }).join('');
  document.getElementById('p-operacao').innerHTML=
    head('Operação quinzenal','Seu método alternando planejamento e captação/produção. Prepare cada semana antes dela começar.',`<button class="btn primary" onclick="prepararSemana('${current}')"><i class="fa fa-calendar-plus"></i> Preparar semana atual</button>`)
    +`<div class="notice"><b>Método MOVE:</b> Semana de Planejamento = criar e fechar o que será produzido nas próximas semanas. Semana de Captação e Produção = captar, editar, enviar para aprovação e deixar o conteúdo seguinte pronto. As tarefas criadas aqui também aparecem em Minhas Tarefas.</div>`
    +`<div style="display:grid;gap:14px;margin-top:14px">${cards}</div>`;
}

function empresas(){
  document.getElementById('p-empresas').innerHTML=
    head('Empresas','Cadastre clientes e volume semanal.',`<button class="btn primary" onclick="company()">+ Nova empresa</button>`)
    +`<div class="grid companies">${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`
      <div class="card company">
        <div class="avatar">${ini(c.nome)}</div>
        <h3>${e(c.nome)}</h3>
        <div class="meta">${e(c.responsavel||'—')} • ${e(c.telefone||'')}</div>
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
  const finance=D.finance.filter(x=>x.companyId===companyId);
  const contracts=D.contracts.filter(x=>x.companyId===companyId);
  const refs=D.curadoria.filter(x=>x.companyId===companyId);

  const msg=`Excluir a empresa "${c.nome}"?

Isso também removerá os dados vinculados:
• ${weeks.length} semana(s)
• ${contents.length} conteúdo(s)
• ${tasks.length} tarefa(s)
• ${scheduled.length} material(is) agendado(s)
• ${finance.length} registro(s) financeiro(s)
• ${contracts.length} contrato(s)
• ${refs.length} referência(s) de curadoria

Essa ação não pode ser desfeita.`;

  if(!confirm(msg))return;

  const contentIds=new Set(contents.map(x=>x.id));
  const mediaIds=scheduled.map(x=>x.mediaId).filter(Boolean);

  D.companies=D.companies.filter(x=>x.id!==companyId);
  D.weeks=D.weeks.filter(x=>x.companyId!==companyId);
  D.contents=D.contents.filter(x=>x.companyId!==companyId);
  D.tasks=D.tasks.filter(x=>x.companyId!==companyId);
  D.scheduled=D.scheduled.filter(x=>x.companyId!==companyId);
  D.finance=D.finance.filter(x=>x.companyId!==companyId);
  D.contracts=D.contracts.filter(x=>x.companyId!==companyId);
  D.curadoria=D.curadoria.filter(x=>x.companyId!==companyId);

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

function board(cid){
  CID=cid;
  R='quadro';
  let c=D.companies.find(x=>x.id===cid),
      ws=D.weeks.filter(x=>x.companyId===cid).sort((a,b)=>a.numero-b.numero),
      done=completedWeeksCount(cid);

  document.getElementById('p-quadro').innerHTML=
    head(
      c.nome,
      'Semanas, conteúdos, roteiros e HTML para compartilhar.',
      `<span class="move-board-progress ${done===4?'is-complete':''}"><i class="fa fa-check"></i> ${done}/4 semanas concluídas</span> <button class="btn light" onclick="quadro()">← Empresas</button> <button class="btn dark" onclick="copyCompanyData('${cid}')"><i class="fa fa-copy"></i> Copiar dados da empresa</button> <button class="btn primary" onclick="week('${cid}')">+ Semana</button>`
    )
    +`<div class="card section"><div class="board">${ws.map(w=>{
      const progress=weekProgress(w,c);
      const contents=D.contents.filter(x=>x.weekId===w.id).sort((a,b)=>a.ordem-b.ordem);

      return `<div class="week ${progress.complete?'move-week-complete':''}">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <h4 style="margin:0">Semana ${w.numero}</h4>
              ${progress.complete?`<span class="move-week-done"><i class="fa fa-check"></i> Concluída</span>`:''}
            </div>
            <div class="meta">${date(w.inicio)} — ${date(w.fim)}</div>
            <div class="move-content-progress ${progress.complete?'is-complete':''}">
              <i class="fa fa-check"></i> ${progress.created}/${progress.expected} conteúdos
            </div>
          </div>
          <div style="display:flex;gap:5px;align-items:flex-start">
            <button class="btn dark sm" onclick="weekHTML('${w.id}')" title="Baixar planejamento"><i class="fa fa-download"></i></button>
            <button class="btn danger sm" onclick="deleteWeek('${w.id}')" title="Excluir quadro/semana"><i class="fa fa-trash"></i></button>
          </div>
        </div>

        <div class="meta" style="margin:8px 0"><b>Objetivo:</b> ${e(w.objetivo||'—')}<br><b>Linha:</b> ${e(w.linha||'—')}</div>

        ${contents.map(ct=>`<div class="chip move-content-chip">
          <span>${e(ct.tipo)}</span>
          <strong>${e(ct.titulo)}</strong>
          <small>${date(ct.postDate)} ${e(ct.postTime||'')}</small>
          <i class="fa fa-check move-content-check" title="Conteúdo criado"></i>
          <div class="actions">
            <button class="btn light sm" onclick="content('${cid}','${w.id}','${ct.id}')">Editar</button>
            <button class="btn danger sm" onclick="deleteContent('${ct.id}')" title="Excluir conteúdo"><i class="fa fa-trash"></i> Excluir</button>
          </div>
        </div>`).join('')||empty('Sem conteúdo')}

        <button class="btn primary sm" style="width:100%;margin-top:8px" onclick="content('${cid}','${w.id}')">+ Conteúdo</button>
        <button class="btn light sm" style="width:100%;margin-top:6px" onclick="weekHTML('${w.id}')">Baixar planejamento HTML</button>
      </div>`;
    }).join('')||empty('Crie as semanas.')}</div></div>`;
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

function deleteContent(contentId){
  const ct=D.contents.find(x=>x.id===contentId);
  if(!ct)return;
  if(!confirm(`Excluir o conteúdo "${ct.titulo||'Sem título'}"?\n\nO material produzido/agendado vinculado a ele não será apagado automaticamente.`))return;
  D.contents=D.contents.filter(x=>x.id!==contentId);
  save();
  if(CID)board(CID);
  toast('Conteúdo excluído.');
}
function deleteWeek(weekId){
  const w=D.weeks.find(x=>x.id===weekId);
  if(!w)return;
  const contents=D.contents.filter(x=>x.weekId===weekId);
  const msg=`Excluir a Semana ${w.numero} e seu quadro?\n\n${contents.length} conteúdo(s) planejado(s) dentro dela também serão excluídos.\n\nOs arquivos já produzidos no Agendamento serão preservados.`;
  if(!confirm(msg))return;
  const ids=new Set(contents.map(x=>x.id));
  D.contents=D.contents.filter(x=>x.weekId!==weekId);
  D.weeks=D.weeks.filter(x=>x.id!==weekId);
  // Keep scheduled media, but remove broken content link
  D.scheduled.forEach(s=>{if(ids.has(s.contentId))s.contentId=''});
  save();
  if(CID)board(CID);
  toast('Quadro/semana excluído.');
}

function week(cid,x=''){let w=D.weeks.find(a=>a.id===x)||{},n=w.numero||Math.min(4,D.weeks.filter(a=>a.companyId===cid).length+1);modal('Semana',`<form id="f" class="fg"><div class="field"><label>Número</label><select name="numero">${[1,2,3,4].map(i=>`<option ${i==n?'selected':''}>${i}</option>`).join('')}</select></div><div></div><div class="field"><label>Início</label><input type="date" name="inicio" value="${w.inicio||''}"></div><div class="field"><label>Fim</label><input type="date" name="fim" value="${w.fim||''}"></div>${multiSelectField('objetivo','Objetivo',OBJETIVOS_OPCOES,w.objetivo||'')}${multiSelectField('linha','Linha estratégica',LINHAS_CONTEUDO_OPCOES,w.linha||'')}</form>`,()=>{let q=objMulti(document.getElementById('f'));q.numero=Number(q.numero);if(w.id)Object.assign(w,q);else D.weeks.push({...q,id:id(),companyId:cid});closeM();save();board(cid)})}
function content(cid,wid,x=''){
  let c=D.contents.find(a=>a.id===x)||{},
      n=c.ordem||D.contents.filter(a=>a.weekId===wid).length+1,
      company=D.companies.find(a=>a.id===cid),
      wasComplete=company?weekProgress(D.weeks.find(w=>w.id===wid),company).complete:false;

  modal('Conteúdo',`<form id="f" class="fg"><div class="field"><label>Ordem</label><input type="number" name="ordem" value="${n}"></div><div class="field"><label>Tipo</label><select name="tipo">${['Reels','Post','Stories'].map(t=>`<option ${c.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="field span"><label>Título *</label><input name="titulo" value="${e(c.titulo||'')}"></div><div class="field span"><label>Descrição</label><textarea name="descricao">${e(c.descricao||'')}</textarea></div><div class="field span"><label>Roteiro / desenvolvimento</label><textarea name="roteiro" style="min-height:180px">${e(c.roteiro||'')}</textarea></div><div class="field"><label>Data postagem</label><input type="date" name="postDate" value="${c.postDate||''}"></div><div class="field"><label>Hora</label><input type="time" name="postTime" value="${e(c.postTime||'')}"></div></form>`,()=>{
    let q=obj(document.getElementById('f'));
    if(!q.titulo)return toast('Informe o título.');
    q.ordem=Number(q.ordem);

    if(c.id)Object.assign(c,q);
    else D.contents.push({...q,id:id(),companyId:cid,weekId:wid});

    const w=D.weeks.find(z=>z.id===wid);
    const nowComplete=company&&w?weekProgress(w,company).complete:false;

    closeM();
    save();
    board(cid);

    if(!wasComplete&&nowComplete){
      setTimeout(()=>celebrateWeek(wid),120);
    }
  });
}
function pend(){let a=[];D.companies.forEach(c=>{let ws=D.weeks.filter(w=>w.companyId===c.id);for(let i=1;i<=4;i++){let w=ws.find(z=>z.numero===i);if(!w)a.push({company:c.nome,title:'Semana '+i+' não criada',detail:'O mês precisa de 4 semanas planejadas.',type:'planejamento'});else{let exp=Number(c.reels||0)+Number(c.posts||0)+Number(c.stories||0),got=D.contents.filter(x=>x.weekId===w.id).length;if(got<exp)a.push({company:c.nome,title:'Semana '+i+' incompleta',detail:got+'/'+exp+' conteúdos.',type:'conteúdo'})}}});D.finance.filter(x=>x.statusMes!=='Pago').forEach(f=>{let c=D.companies.find(x=>x.id===f.companyId);if(c)a.push({company:c.nome,title:'Pagamento pendente',detail:money(f.valorTotal),type:'financeiro'})});return a}function pendencias(){document.getElementById('p-pendencias').innerHTML=head('Pendências','Planejamento e financeiro sob controle.')+`<div class="card section"><div class="list">${pend().map(x=>`<div class="item"><div><strong>${e(x.company)} — ${e(x.title)}</strong><small>${e(x.detail)}</small></div><span class="badge ${x.type==='financeiro'?'red':'warn'}">${x.type}</span></div>`).join('')||empty('Nenhuma pendência.')}</div></div>`}
function textos(){document.getElementById('p-textos').innerHTML=head('Meus Textos','Prompts, legendas e modelos.',`<button class="btn primary" onclick="text()">+ Texto</button>`)+`<div class="grid companies">${D.texts.map(t=>`<div class="card section"><span class="badge">${e(t.categoria||'Texto')}</span><h3>${e(t.titulo)}</h3><p class="meta" style="white-space:pre-wrap">${e(t.conteudo)}</p><div class="actions"><button class="btn light sm" onclick='navigator.clipboard.writeText(${JSON.stringify(t.conteudo||"")});toast("Copiado")'>Copiar</button><button class="btn light sm" onclick="text('${t.id}')">Editar</button></div></div>`).join('')||empty('Nenhum texto.')}</div>`}function text(x=''){let t=D.texts.find(a=>a.id===x)||{};modal('Texto',`<form id="f"><div class="field"><label>Título</label><input name="titulo" value="${e(t.titulo||'')}"></div><div class="field"><label>Categoria</label><input name="categoria" value="${e(t.categoria||'')}"></div><div class="field"><label>Conteúdo</label><textarea name="conteudo" style="min-height:260px">${e(t.conteudo||'')}</textarea></div></form>`,()=>{let q=obj(document.getElementById('f'));if(t.id)Object.assign(t,q);else D.texts.push({...q,id:id()});closeM();save()})}
function tarefas(){
  const cols=[
    {key:'Pendente',title:'Pendente',cls:'st-pend'},
    {key:'Em andamento',title:'Em andamento',cls:'st-and'},
    {key:'Concluída',title:'Finalizado',cls:'st-done'}
  ];
  document.getElementById('p-tarefas').innerHTML=
    head('Minhas Tarefas','Fluxo rápido estilo Trello: cada tarefa pode ser vinculada a uma empresa.',`<button class="btn primary" onclick="task()">+ Nova tarefa</button>`)
    +`<div class="lab-board">${cols.map(col=>{
      const items=D.tasks.filter(t=>(t.status||'Pendente')===col.key);
      return `<section class="lab-col">
        <div class="lab-col-head"><h3>${col.title}</h3><span class="lab-count">${items.length}</span></div>
        ${items.map(t=>{
          const company=D.companies.find(c=>c.id===t.companyId);
          return `<article class="task-card">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="badge">${e(t.lista||'Semana atual')}</span>
              ${company?`<span class="badge warn"><i class="fa fa-building"></i> ${e(company.nome)}</span>`:`<span class="badge">Sem empresa</span>`}
            </div>
            <h4>${e(t.titulo||'Sem título')}</h4>
            ${t.descricao?`<div class="task-desc">${e(t.descricao)}</div>`:''}
            <div class="meta" style="margin-top:8px">${t.prazo?`Prazo: ${date(t.prazo)}`:'Sem prazo'}${t.horaInicio?` • ${e(t.horaInicio)}${t.horaFim?`–${e(t.horaFim)}`:''}`:''}</div>
            <div class="task-footer">
              <div class="task-statuses">
                <button class="status-dot st-pend" onclick="taskStatus('${t.id}','Pendente')">Pendente</button>
                <button class="status-dot st-and" onclick="taskStatus('${t.id}','Em andamento')">Andamento</button>
                <button class="status-dot st-done" onclick="taskStatus('${t.id}','Concluída')">Finalizado</button>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn light sm" onclick="task('${t.id}')" title="Editar tarefa"><i class="fa fa-pen"></i></button>
                <button class="btn danger sm" onclick="deleteTask('${t.id}')" title="Excluir tarefa"><i class="fa fa-trash"></i></button>
              </div>
            </div>
          </article>`;
        }).join('')||`<div class="empty">Nenhuma tarefa aqui.</div>`}
      </section>`;
    }).join('')}</div>`;
}
function deleteTask(idTask){
  const t=D.tasks.find(x=>x.id===idTask);
  if(!t)return;
  if(!confirm(`Excluir a tarefa "${t.titulo||'Sem título'}"?\n\nEssa ação não pode ser desfeita.`))return;
  D.tasks=D.tasks.filter(x=>x.id!==idTask);
  save();
  tarefas();
  toast('Tarefa excluída.');
}

function taskStatus(idTask,status){
  const t=D.tasks.find(x=>x.id===idTask);
  if(!t)return;
  t.status=status;
  save();
  tarefas();
  toast(status==='Concluída'?'Tarefa finalizada.':'Status atualizado.');
}
function task(x=''){
  let t=D.tasks.find(a=>a.id===x)||{};
  modal('Tarefa',`<form id="f" class="fg">
    <div class="field span"><label>Empresa</label><select name="companyId"><option value="">Sem empresa</option>${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value="${c.id}" ${t.companyId===c.id?'selected':''}>${e(c.nome)}</option>`).join('')}</select></div>
    <div class="field"><label>Lista</label><input name="lista" value="${e(t.lista||'Semana atual')}"></div>
    <div class="field"><label>Prazo</label><input type="date" name="prazo" value="${t.prazo||''}"></div><div class="field"><label>Hora início</label><input type="time" name="horaInicio" value="${e(t.horaInicio||'')}"></div><div class="field"><label>Hora fim</label><input type="time" name="horaFim" value="${e(t.horaFim||'')}"></div>
    <div class="field span"><label>Título</label><input name="titulo" value="${e(t.titulo||'')}"></div>
    <div class="field span"><label>Descrição</label><textarea name="descricao">${e(t.descricao||'')}</textarea></div>
    <div class="field"><label>Status</label><select name="status">${['Pendente','Em andamento','Concluída'].map(s=>`<option ${t.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
  </form>`,()=>{
    let q=obj(document.getElementById('f'));
    if(t.id)Object.assign(t,q);else D.tasks.push({...q,id:id()});
    closeM();save();tarefas();
  })
}
function agenda(){let y=cal.getFullYear(),m=cal.getMonth(),s=new Date(y,m,1-new Date(y,m,1).getDay()),days=[];for(let i=0;i<42;i++){let z=new Date(s);z.setDate(s.getDate()+i);days.push(z)}document.getElementById('p-agenda').innerHTML=head('Agenda','Calendário local.',`<button class="btn primary" onclick="eventM()">+ Compromisso</button>`)+`<div class="card section"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><button class="btn light sm" onclick="cal=new Date(${y},${m-1},1);agenda()">←</button><b>${cal.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</b><button class="btn light sm" onclick="cal=new Date(${y},${m+1},1);agenda()">→</button></div><div class="calendar">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>`<b style="font-size:9px;text-align:center">${x}</b>`).join('')}${days.map(d=>{let k=d.toISOString().slice(0,10),ev=D.agenda.filter(x=>x.data===k);return`<div class="day" onclick="eventM('','${k}')"><b>${d.getDate()}</b>${ev.map(v=>`<div class="event">${e(v.hora)} ${e(v.titulo)}</div>`).join('')}</div>`}).join('')}</div></div>`}function eventM(x='',dt=''){let a=D.agenda.find(v=>v.id===x)||{};modal('Compromisso',`<form id="f" class="fg"><div class="field span"><label>Título</label><input name="titulo" value="${e(a.titulo||'')}"></div><div class="field"><label>Data</label><input type="date" name="data" value="${a.data||dt}"></div><div class="field"><label>Hora</label><input type="time" name="hora" value="${a.hora||'08:00'}"></div><div class="field span"><label>Descrição</label><textarea name="descricao">${e(a.descricao||'')}</textarea></div></form>`,()=>{let q=obj(document.getElementById('f'));if(a.id)Object.assign(a,q);else D.agenda.push({...q,id:id()});closeM();save()})}
function agendamento(){document.getElementById('p-agendamento').innerHTML=head('Agendamento e Aprovação','Artes, vídeos, legendas e HTML para o cliente.')+`<div class="notice">Os arquivos ficam neste navegador em IndexedDB. O HTML de aprovação incorpora as mídias para o cliente abrir sem painel.</div><div class="grid companies">${D.companies.map(c=>`<div class="card company"><div class="avatar">${ini(c.nome)}</div><h3>${e(c.nome)}</h3><div class="meta">${D.scheduled.filter(x=>x.companyId===c.id).length} materiais</div><div class="actions"><button class="btn dark sm" onclick="materials('${c.id}')">Abrir</button><button class="btn light sm" onclick="approval('${c.id}')">Baixar HTML aprovação</button></div></div>`).join('')||empty('Cadastre empresa.')}</div>`}async function materials(cid){
  let c=D.companies.find(x=>x.id===cid),it=D.scheduled.filter(x=>x.companyId===cid),cards='';
  for(let s of it){
    let u=await mediaURL(s.mediaId),ct=D.contents.find(x=>x.id===s.contentId)||{};
    let media=s.mime?.startsWith('image/')?`<img src="${u}" alt="${e(ct.titulo||s.fileName||'Material')}">`
      :s.mime?.startsWith('video/')?`<video controls preload="metadata" src="${u}"></video>`
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
        <div class="actions"><button class="btn light sm" onclick="upload('${cid}','${s.id}')"><i class="fa fa-pen"></i> Editar</button></div>
      </div>
    </article>`;
  }
  document.getElementById('p-agendamento').innerHTML=
    head(c.nome,'Materiais produzidos em cards estilo post, preservando o formato original.',`<button class="btn light" onclick="agendamento()">← Empresas</button> <button class="btn primary" onclick="upload('${cid}')">+ Material</button> <button class="btn dark" onclick="approval('${cid}')">Baixar HTML aprovação</button>`)
    +`<div style="display:grid;gap:18px">${cards||empty('Nenhum material.')}</div>`;
}
function upload(cid,x=''){let s=D.scheduled.find(a=>a.id===x)||{},opts=D.contents.filter(a=>a.companyId===cid).map(c=>`<option value="${c.id}" ${s.contentId===c.id?'selected':''}>${e(c.tipo)} — ${e(c.titulo)}</option>`).join('');modal('Material',`<form id="f" class="fg"><div class="field span"><label>Conteúdo</label><select name="contentId"><option value="">Sem vínculo</option>${opts}</select></div><div class="field span"><label>Imagem ou vídeo</label><input type="file" id="file" accept="image/*,video/*"></div><div class="field span"><label>Legenda</label><textarea name="legenda">${e(s.legenda||'')}</textarea></div><div class="field"><label>Data</label><input type="date" name="data" value="${s.data||''}"></div><div class="field"><label>Hora</label><input type="time" name="hora" value="${e(s.hora||'')}"></div><div class="field"><label>Status</label><select name="status">${['Aguardando aprovação','Aprovado','Ajustar','Agendado','Publicado'].map(v=>`<option ${s.status===v?'selected':''}>${v}</option>`).join('')}</select></div></form>`,async()=>{let q=obj(document.getElementById('f')),fl=document.getElementById('file').files[0],mid=s.mediaId||id();if(!x&&!fl)return toast('Selecione um arquivo.');if(fl&&fl.size>35*1024*1024)return toast('Use arquivo até 35 MB.');if(fl){await mediaPut(mid,fl);q.mediaId=mid;q.mime=fl.type;q.fileName=fl.name}else{q.mediaId=mid;q.mime=s.mime;q.fileName=s.fileName}if(s.id)Object.assign(s,q);else D.scheduled.push({...q,id:id(),companyId:cid});closeM();save();materials(cid)})}

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

function financeiro(){let mp=new Map(D.finance.map(f=>[f.companyId,f]));document.getElementById('p-financeiro').innerHTML=head('Financeiro','Controle de valores, status, contratos, cobranças e boleto HTML com PIX.')+`<div class="grid companies">${D.companies.map(c=>{let f=mp.get(c.id);return`<div class="card company"><div class="avatar">${ini(c.nome)}</div><h3>${e(c.nome)}</h3><div class="meta">${f?money(f.valorTotal)+' • '+e(f.statusMes):'Não configurado'}</div><div class="actions"><button class="btn primary sm" onclick="fin('${c.id}','${f?.id||''}')">${f?'Editar':'Configurar'}</button>${f?`<button class="btn dark sm" onclick="boleto('${c.id}','${f.id}')"><i class="fa fa-receipt"></i> Baixar boleto HTML</button><button class="btn light sm" onclick="charge('${c.id}','${f.id}')">Copiar cobrança</button><button class="btn light sm" onclick="chargeToday('${c.id}','${f.id}')">Cobrança do dia</button><button class="btn dark sm" onclick="paid('${f.id}')">${f.statusMes==='Pago'?'Pendente':'Pago'}</button>`:''}<button class="btn light sm" onclick="contract('${c.id}')">Contrato</button></div></div>`}).join('')||empty('Cadastre empresas.')}</div>`}function fin(cid,x=''){let f=D.finance.find(a=>a.id===x)||{},c=D.companies.find(a=>a.id===cid);modal('Financeiro — '+c.nome,`<form id="f" class="fg"><div class="field"><label>Responsável</label><input name="responsavel" value="${e(f.responsavel||c.responsavel||'')}"></div><div class="field"><label>Telefone</label><input name="telefone" value="${e(f.telefone||c.telefone||'')}"></div><div class="field"><label>E-mail</label><input name="email" value="${e(f.email||c.email||'')}"></div><div class="field"><label>Referência</label><input name="referencia" value="${e(f.referencia||new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'}))}"></div><div class="field span"><label>Serviço</label><input name="descricao" value="${e(f.descricao||'Gestão de redes sociais')}"></div><div class="field"><label>Valor total</label><input type="number" step="0.01" name="valorTotal" value="${f.valorTotal||''}"></div><div class="field"><label>Parcelas</label><select name="parcelas"><option value="1">1x</option><option value="2" ${f.parcelas==2?'selected':''}>2x quinzenal</option></select></div><div class="field"><label>Vencimento 1</label><input type="number" name="v1" value="${f.v1||5}"></div><div class="field"><label>Vencimento 2</label><input type="number" name="v2" value="${f.v2||20}"></div><div class="field"><label>Multa após 3 dias</label><input type="number" step="0.01" name="multa" value="${f.multa||0}"></div><div class="field"><label>Status</label><select name="statusMes">${['Pendente','Pago','Negociado'].map(v=>`<option ${f.statusMes===v?'selected':''}>${v}</option>`).join('')}</select></div></form>`,()=>{let q=obj(document.getElementById('f'));q.valorTotal=Number(q.valorTotal||0);q.parcelas=Number(q.parcelas||1);if(f.id)Object.assign(f,q);else D.finance.push({...q,id:id(),companyId:cid});closeM();save()})}function paid(x){let f=D.finance.find(a=>a.id===x);f.statusMes=f.statusMes==='Pago'?'Pendente':'Pago';save()}function crc16(s){let crc=0xFFFF;for(let i=0;i<s.length;i++){crc^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1)}return(crc&0xFFFF).toString(16).toUpperCase().padStart(4,'0')}function emv(i,v){v=String(v);return i+String(v.length).padStart(2,'0')+v}function pix(valor,tx='MOVE'){let key='57293143000156',mai=emv('26',emv('00','BR.GOV.BCB.PIX')+emv('01',key)),p=emv('00','01')+mai+emv('52','0000')+emv('53','986');if(Number(valor)>0)p+=emv('54',Number(valor).toFixed(2));p+=emv('58','BR')+emv('59','MARLLUS VINICIUS S ARAUJO')+emv('60','URUCUI')+emv('62',emv('05',String(tx).replace(/[^A-Z0-9]/gi,'').slice(0,25)||'MOVE'))+'6304';return p+crc16(p)}
function charge(cid,fid){let c=D.companies.find(x=>x.id===cid),f=D.finance.find(x=>x.id===fid),v=Number(f.valorTotal||0)/Math.max(1,f.parcelas||1),r=f.responsavel||c.responsavel||'';let m=`Olá${r?', '+r:''}! Tudo bem?

Passando para lembrar sobre o pagamento referente ao serviço de ${f.descricao||'Gestão de redes sociais'} da ${c.nome}.

Valor ${f.parcelas>1?'da parcela':'do pagamento'}: ${money(v)}.
Referência: ${f.referencia||'mês atual'}.

Pagamento via PIX:
Chave: 57293143000156
Mercado Pago
MARLLUS VINICIUS S ARAUJO

Caso já tenha realizado, pode desconsiderar e nos enviar o comprovante para atualizarmos o controle.

Muito obrigado pela parceria! 💛
MOVE AGÊNCIA`;navigator.clipboard.writeText(m);toast('Cobrança copiada.')}
function chargeToday(cid,fid){let c=D.companies.find(x=>x.id===cid),f=D.finance.find(x=>x.id===fid),v=Number(f.valorTotal||0)/Math.max(1,f.parcelas||1),r=f.responsavel||c.responsavel||'';let m=`Olá${r?', '+r:''}! Tudo bem?

Passando para avisar que o pagamento referente ao serviço de ${f.descricao||'Gestão de redes sociais'} da ${c.nome} vence hoje.

Valor: ${money(v)}.

PIX:
57293143000156
Mercado Pago
MARLLUS VINICIUS S ARAUJO

Se já efetuou o pagamento, pode nos encaminhar o comprovante para atualizarmos o financeiro.

Obrigado pela parceria! 💛
MOVE AGÊNCIA`;navigator.clipboard.writeText(m);toast('Cobrança do dia copiada.')}
function boleto(cid,fid){let c=D.companies.find(x=>x.id===cid),f=D.finance.find(x=>x.id===fid),v=Number(f.valorTotal||0)/Math.max(1,f.parcelas||1),payload=pix(v,'MOVE'+String(fid).slice(0,8)),dues=[f.v1,f.v2].filter(Boolean).join(' e '),h=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cobrança - ${e(c.nome)}</title><script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script><style>body{margin:0;background:#f4f5f7;font-family:Arial;color:#171717}.w{max-width:760px;margin:30px auto;padding:0 18px}.b{background:#fff;border:1px solid #e7e7e7;border-radius:20px;overflow:hidden}.h{background:#111;color:#fff;padding:28px}.h b{color:#fca311}.h h1{margin:8px 0 4px}.h p{margin:0;color:#bbb}.ct{padding:24px}.amount{font-size:42px;font-weight:800;margin:10px 0}.g{display:grid;grid-template-columns:1fr 1fr;gap:10px}.box{border:1px solid #eee;border-radius:12px;padding:12px}.box small{display:block;font-size:9px;color:#888;text-transform:uppercase}.pix{margin-top:18px;background:#111;color:#fff;border-radius:14px;padding:18px;display:grid;grid-template-columns:1fr 190px;gap:16px;align-items:center}.pix b{color:#fca311}.qr{background:#fff;padding:8px;width:190px;height:190px;border-radius:10px}.copy{background:#f5f5f5;color:#444;padding:10px;border-radius:8px;font-size:9px;word-break:break-all;margin-top:10px}.btn{border:0;background:#fca311;padding:9px 12px;border-radius:9px;font-weight:bold}@media(max-width:600px){.g,.pix{grid-template-columns:1fr}.qr{margin:auto}}</style></head><body><div class="w"><div class="b"><div class="h"><b>MOVE AGÊNCIA</b><h1>Cobrança • ${e(c.nome)}</h1><p>${e(f.descricao||'Gestão de redes sociais')}</p></div><div class="ct"><div class="amount">${money(v)}</div><div class="g"><div class="box"><small>Responsável</small><b>${e(f.responsavel||c.responsavel||'—')}</b></div><div class="box"><small>Referência</small><b>${e(f.referencia||'Mês atual')}</b></div><div class="box"><small>Vencimento</small><b>Dia ${e(dues||'—')}</b></div><div class="box"><small>Situação</small><b>${e(f.statusMes||'Pendente')}</b></div></div><div class="pix"><div><h2>Pagamento via PIX</h2><p>Chave: <b>57293143000156</b><br>Mercado Pago<br>MARLLUS VINICIUS S ARAUJO</p><button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('p').textContent)">Copiar PIX copia e cola</button><div class="copy" id="p">${payload}</div></div><div id="q" class="qr"></div></div></div></div></div><script>new QRCode(document.getElementById('q'),{text:${JSON.stringify(payload)},width:174,height:174});<\/script></body></html>`;dl(h,`MOVE_Cobranca_${safe(c.nome)}.html`);toast('Boleto HTML baixado.')}
function contract(cid){let c=D.contracts.find(x=>x.companyId===cid)||{},co=D.companies.find(x=>x.id===cid);modal('Contrato — '+co.nome,`<form id="f" class="fg"><div class="field"><label>Contratante</label><input name="nome" value="${e(c.nome||co.nome)}"></div><div class="field"><label>CPF/CNPJ</label><input name="doc" value="${e(c.doc||'')}"></div><div class="field span"><label>Endereço</label><input name="endereco" value="${e(c.endereco||'')}"></div><div class="field span"><label>Serviço</label><input name="servico" value="${e(c.servico||'Gestão de redes sociais')}"></div><div class="field"><label>Valor</label><input type="number" name="valor" value="${c.valor||''}"></div><div class="field"><label>Status</label><select name="status"><option>Contrato pendente</option><option ${c.status==='Contrato assinado'?'selected':''}>Contrato assinado</option></select></div></form>`,()=>{let q=obj(document.getElementById('f'));if(c.id)Object.assign(c,q);else D.contracts.push({...q,id:id(),companyId:cid});closeM();save()})}
function dl(txt,name,type='text/html'){let u=URL.createObjectURL(new Blob([txt],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}function safe(s){return String(s||'arquivo').replace(/[^a-z0-9_-]/gi,'_')}
function weekHTML(wid){let w=D.weeks.find(x=>x.id===wid),c=D.companies.find(x=>x.id===w.companyId),it=D.contents.filter(x=>x.weekId===wid).sort((a,b)=>a.ordem-b.ordem),cards=it.map((x,i)=>`<article><span>${e(x.tipo)}</span><small>CONTEÚDO ${i+1}</small><h2>${e(x.titulo)}</h2>${x.descricao?`<section><b>Descrição</b><p>${e(x.descricao)}</p></section>`:''}${x.roteiro?`<section class="script"><b>Roteiro / Desenvolvimento</b><p>${e(x.roteiro).replace(/\n/g,'<br>')}</p></section>`:''}<footer>Postagem: <b>${date(x.postDate)} ${e(x.postTime||'')}</b></footer></article>`).join('');dl(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(c.nome)}</title><style>body{font-family:Arial;margin:0;background:#f5f6f8;color:#171717}.hero{background:#111;color:#fff;padding:42px}.hero b{color:#fca311}.wrap{max-width:950px;margin:auto;padding:24px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px}.meta div,article{background:#fff;border:1px solid #e8e8e8;border-radius:14px;padding:16px;margin-bottom:12px}.meta span,article small{font-size:9px;color:#888}article>span{background:#fff1cf;color:#8a5600;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:bold}article small{float:right}section{background:#f7f7f7;padding:11px;border-radius:10px;margin-top:10px}section b{font-size:9px;text-transform:uppercase;color:#777}section p{font-size:12px;line-height:1.6}.script{border-left:3px solid #fca311}footer{border-top:1px solid #eee;margin-top:12px;padding-top:10px;font-size:11px}@media(max-width:600px){.meta{grid-template-columns:1fr}}

</style></head><body><div class="hero"><b>MOVE AGÊNCIA</b><h1>${e(c.nome)} — Semana ${w.numero}</h1><p>${date(w.inicio)} — ${date(w.fim)}</p></div><div class="wrap"><div class="meta"><div><span>OBJETIVO</span><h3>${e(w.objetivo||'—')}</h3></div><div><span>LINHA ESTRATÉGICA</span><h3>${e(w.linha||'—')}</h3></div></div>${cards||'<article>Sem conteúdos.</article>'}</div></body></html>`,`MOVE_${safe(c.nome)}_Semana_${w.numero}.html`);toast('Planejamento baixado.')}
async function approval(cid){let c=D.companies.find(x=>x.id===cid),it=D.scheduled.filter(x=>x.companyId===cid),cards='';for(let s of it){let data=await mediaData(s.mediaId),ct=D.contents.find(x=>x.id===s.contentId)||{};cards+=`<article><div class="pv">${s.mime?.startsWith('image/')?`<img src="${data}">`:s.mime?.startsWith('video/')?`<video controls src="${data}"></video>`:'ARQUIVO'}</div><div class="info"><span>${e(ct.tipo||'Material')}</span><small>${e(s.status)}</small><h2>${e(ct.titulo||s.fileName||'Material')}</h2><p>${date(s.data)} ${e(s.hora||'')}</p>${s.legenda?`<section><b>Legenda proposta</b><p>${e(s.legenda).replace(/\n/g,'<br>')}</p></section>`:''}</div></article>`}dl(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(c.nome)} — Aprovação</title><style>body{font-family:Arial;margin:0;background:#f5f6f8}.hero{background:#111;color:#fff;padding:42px}.hero b{color:#fca311}.wrap{max-width:1100px;margin:auto;padding:24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}article{background:#fff;border:1px solid #e8e8e8;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.05)}.pv{background:#111;display:grid;place-items:center;padding:10px}.pv img,.pv video{display:block;max-width:100%;width:auto;height:auto;max-height:82vh;object-fit:contain}.info{padding:14px}.info>span{background:#fff1cf;color:#8a5600;padding:5px 8px;border-radius:999px;font-size:9px;font-weight:bold}.info>small{float:right;color:#888}.info h2{font-size:15px}.info>p{font-size:10px;color:#888}section{background:#f7f7f7;border-radius:9px;padding:10px}section b{font-size:9px;color:#777}section p{font-size:11px;line-height:1.5}@media(max-width:850px){.grid{grid-template-columns:1fr}}

</style></head><body><div class="hero"><b>MOVE AGÊNCIA</b><h1>${e(c.nome)}</h1><p>Materiais para visualização e aprovação</p></div><div class="wrap"><div class="grid">${cards||'<article><div class="info">Nenhum material.</div></article>'}</div></div></body></html>`,`MOVE_${safe(c.nome)}_Aprovacao.html`);toast('HTML de aprovação baixado.')}
function backup(){dl(JSON.stringify(D,null,2),'MOVE_Backup_'+new Date().toISOString().slice(0,10)+'.json','application/json')}function restorePick(){const r=document.getElementById('restore');if(r)r.click()}const restoreEl=document.getElementById('restore');if(restoreEl)restoreEl.onchange=async()=>{try{const file=restoreEl.files&&restoreEl.files[0];if(!file)return;D=Object.assign(blank(),JSON.parse(await file.text()));save();toast('Backup restaurado.')}catch(err){toast('Backup inválido.')}}
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


function injectOperationUI(){
  if(!document.getElementById('p-operacao')){
    const page=document.createElement('section');
    page.id='p-operacao';page.className='page';
    const anchor=document.getElementById('p-home');
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(page,anchor.nextSibling);
    else document.querySelector('main')?.appendChild(page);
  }
  if(!document.getElementById('move-operation-css')){
    const st=document.createElement('style');st.id='move-operation-css';st.textContent=`
      .move-op-week{border:1px solid #ececec}
      .move-op-current{box-shadow:0 0 0 2px rgba(252,163,17,.14);border-color:#fca311}
      .move-op-progress{height:8px;background:#eee;border-radius:999px;overflow:hidden;margin-top:14px}
      .move-op-progress>div{height:100%;background:#111;border-radius:999px;transition:.25s}
      @media(max-width:700px){.move-op-week .item{align-items:flex-start}}
    `;document.head.appendChild(st);
  }
}

try{injectOperationUI();injectMoveMultiCSS();injectMoveCelebrationCSS();nav();render('home');}catch(err){console.error(err);document.getElementById('toast').textContent='Erro ao iniciar painel: '+err.message;document.getElementById('toast').style.display='block';}
