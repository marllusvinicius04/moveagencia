const KEY='move_local_complete_v1',M=[['home','fa-house','Início'],['empresas','fa-building','Empresas'],['quadro','fa-lightbulb','Quadro Criativo'],['campanhas','fa-bullhorn','Campanhas'],['pendencias','fa-triangle-exclamation','Pendências'],['textos','fa-file-lines','Meus Textos'],['agenda','fa-calendar-days','Agenda'],['tarefas','fa-list-check','Minhas Tarefas'],['curadoria','fa-icons','Curadoria']];let D=load(),R='home',CID='',cal=new Date(),CUR='all';

const MOVE_ACCESS_PASSWORD='DEUS2604';
const MOVE_AUTH_KEY='move_local_auth_v1';


// COLE AQUI A URL /exec GERADA AO IMPLANTAR O APPS SCRIPT COMO APLICATIVO DA WEB.
const MOVE_API_URL='https://script.google.com/macros/s/AKfycbzrhYinwPd4i8OPVTJJMO_NNPnqUods24eZl_db4a9H-K18-nSzKm3fwyRBrHsmKNg5/exec';

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
  try{await moveSyncTodayPointsFromCloud();nav();render(R||'home');moveShowTeamMessageOnce()}catch(err){console.error(err)}
}


function ensureLogoutButton(){
  const topActions=document.querySelector('.top-actions')||document.querySelector('.top>div:last-child');
  if(!topActions)return;
  if(document.getElementById('logoutAccessBtn')){ensureMagicPlannerButton();return;}
  const b=document.createElement('button');
  b.id='logoutAccessBtn';
  b.className='btn dark sm';
  b.innerHTML='<i class="fa fa-right-from-bracket"></i> Sair';
  b.onclick=logoutAccess;
  topActions.appendChild(b);
  ensureMagicPlannerButton();
}


function ensureMagicPlannerButton(){
  const topActions=document.querySelector('.top-actions')||document.querySelector('.top>div:last-child');
  if(!topActions||document.getElementById('magicPlannerBtn'))return;

  const wrap=document.createElement('div');
  wrap.className='move-magic-top-wrap';
  wrap.innerHTML=`
    <button id="magicPlannerBtn" class="btn primary sm move-magic-main-btn" onclick="magicPlannerMenu(event)">
      <i class="fa fa-wand-magic-sparkles"></i> Planner Mágico
    </button>
    <div id="magicPlannerDrop" class="move-magic-drop">
      <button onclick="magicCopyPrompt();magicCloseMenu()"><i class="fa fa-copy"></i><span><b>Copiar prompt</b><small>Gerar o JSON estratégico de todas as empresas</small></span></button>
      <button onclick="magicPickUpload();magicCloseMenu()"><i class="fa fa-file-arrow-up"></i><span><b>Fazer upload</b><small>Importar o JSON e criar o planejamento mágico</small></span></button>
      <button onclick="magicPlannerPage();magicCloseMenu()"><i class="fa fa-folder-open"></i><span><b>Ver planejamentos</b><small>Abrir os planejamentos mágicos importados</small></span></button>
    </div>
    <input id="magicPlannerFile" type="file" accept=".json,application/json" class="hidden" onchange="magicImportFile(this.files?.[0]);this.value=''">
  `;
  topActions.insertBefore(wrap,topActions.firstChild);
  magicInjectCSS();
}
function magicPlannerMenu(ev){
  ev?.stopPropagation();
  const d=document.getElementById('magicPlannerDrop');
  if(d)d.classList.toggle('open');
}
function magicCloseMenu(){document.getElementById('magicPlannerDrop')?.classList.remove('open')}
document.addEventListener('click',e=>{
  if(!e.target.closest?.('.move-magic-top-wrap'))magicCloseMenu();
});
function magicPickUpload(){
  document.getElementById('magicPlannerFile')?.click();
}
function magicCompanyPayload(c){
  return {
    companyId:c.id,
    empresa:c.nome||'',
    sobre:c.sobre||'',
    responsavel:c.responsavel||'',
    cor:c.cor||'',
    tons:c.tons||'',
    objetivos:c.objetivos||'',
    linhas:c.linhas||'',
    demandaSemanal:{
      reels:Number(c.reels||0),
      posts:Number(c.posts||0),
      stories:Number(c.stories||0),
      captacoes:Number(c.captacoes||0)
    }
  };
}
function magicPlannerPrompt(){
  const companies=D.companies.map(magicCompanyPayload);
  const today=new Date().toISOString().slice(0,10);

  return `Você é o PLANNER ESTRATÉGICO da MOVE AGÊNCIA.

MISSÃO:
Planejar o movimento completo das empresas abaixo para que a equipe da agência precise apenas revisar, organizar e executar a produção.

DATA DE REFERÊNCIA: ${today}

O planejamento deve ser estratégico e prático. Não crie posts genéricos. Use os dados reais de cada empresa: posicionamento, público, objetivos, tom, linhas editoriais, cor e quantidade semanal contratada.

VOCÊ DEVE ENTREGAR UM ÚNICO ARQUIVO JSON VÁLIDO.
Não escreva explicações antes ou depois do JSON.
Não use markdown.
Não use comentários dentro do JSON.

REGRAS OBRIGATÓRIAS:
1. Planeje 4 semanas para CADA empresa.
2. Em CADA semana respeite EXATAMENTE a quantidade de Reels, Posts e Stories cadastrada para aquela empresa.
3. Cada conteúdo deve ser PROFISSIONAL, CRIATIVO, específico para a empresa e diretamente ligado aos objetivos, público, posicionamento e linha editorial cadastrados.
4. NÃO REPITA ideias, títulos, ganchos, conceitos, campanhas ou estruturas entre empresas. Mesmo empresas do mesmo nicho precisam receber abordagens diferentes.
5. Cada conteúdo deve ter:
   - tipo
   - titulo
   - ideia
   - objetivo
   - roteiro/estrutura completa
   - data sugerida
   - horário sugerido
   - linha editorial
   - direção criativa
   - observações de produção
6. Para REELS, o campo "roteiro" DEVE obrigatoriamente seguir este esqueleto, adaptado ao conteúdo:
# REELS — <NOME DO REEL>

### GANCHO

**FALA:**
"<fala exata do gancho>"

**IDEIA CRIATIVA PARA O GANCHO:**
<como gravar/executar visualmente o gancho>

### CENA 01

**FALA:**
"<fala>"

**CENA:**
<orientação visual/take/ação>

### CENA 02

**FALA:**
"<fala>"

**CENA:**
<orientação visual/take/ação>

[adicione CENA 03, CENA 04 etc. somente quando necessário]

### FECHAMENTO

**FALA:**
"<fala final>"

**TEXTO NA TELA:**
"<texto curto para aparecer na tela>"

**CTA:**
"<chamada para ação específica da empresa>"

O Reel deve ser executável pela equipe de produção, ter gancho forte e, preferencialmente, até 30 segundos quando fizer sentido.
7. Para POSTS, o roteiro/estrutura deve trazer: TÍTULO PRINCIPAL, SUBTEXTO, IDEIA VISUAL/BACK DE CRIAÇÃO, COPY/INFORMAÇÕES DA ARTE e CTA.
8. Para STORIES, o roteiro/estrutura deve trazer: GANCHO/TÍTULO, TEXTO PRINCIPAL, INTERAÇÃO quando fizer sentido (enquete, caixa, reação etc.), DIREÇÃO VISUAL e CTA.
6. PESQUISE datas comemorativas, profissionais, comerciais, sazonais, locais e temáticas do mês/período para o NICHO de CADA empresa. Não se limite às datas mais famosas. Selecione somente datas realmente relevantes para aquela marca e informe se deve virar homenagem, Post, Stories, Reels, ação ou campanha. Não invente datas: confirme a existência e a data correta antes de incluí-las.
7. Crie ideias de CAMPANHAS ESTRATÉGICAS quando houver oportunidade real. Campanha não deve ser apenas um post: precisa ter conceito, objetivo e criativos.
8. Pense no "movimento da empresa": o que a marca deve comunicar naquele mês, qual percepção construir e qual sequência de mensagens faz sentido.
9. Evite repetição entre semanas e entre empresas.
10. Não invente informações sensíveis, preços, condições ou promessas não fornecidas.
11. A cor cadastrada deve aparecer somente como referência de identidade/direção criativa; não altere o HEX.
12. O planejamento criado aqui é PLANNER MÁGICO e será importado em uma área SEPARADA do planejamento manual.
13. Preserve exatamente o companyId informado para cada empresa.
14. Gere IDs únicos em strings para semanas, conteúdos, datas e campanhas.
15. O JSON precisa obedecer EXATAMENTE ao schema abaixo.

SCHEMA OBRIGATÓRIO:
{
  "plannerVersion": "MOVE_MAGIC_V1",
  "titulo": "Planejamento Mágico - <período>",
  "periodo": {
    "inicio": "YYYY-MM-DD",
    "fim": "YYYY-MM-DD"
  },
  "empresas": [
    {
      "companyId": "ID ORIGINAL",
      "empresa": "NOME",
      "movimentoEstrategico": "Qual movimento/percepção deve ser construído no período",
      "direcaoCriativa": "Direção geral visual e de comunicação",
      "datasComemorativas": [
        {
          "id": "ID",
          "data": "YYYY-MM-DD",
          "nome": "Nome da data/oportunidade",
          "tipo": "Homenagem|Post|Stories|Reels|Campanha|Ação",
          "ideia": "Ideia",
          "objetivo": "Objetivo",
          "observacoes": "Como executar"
        }
      ],
      "semanas": [
        {
          "id": "ID",
          "numero": 1,
          "inicio": "YYYY-MM-DD",
          "fim": "YYYY-MM-DD",
          "objetivo": "Objetivo estratégico da semana",
          "linha": "Linha/editorial predominante",
          "movimento": "O papel desta semana no movimento do mês",
          "conteudos": [
            {
              "id": "ID",
              "tipo": "Reels|Post|Stories",
              "titulo": "Nome do conteúdo",
              "ideia": "Ideia e intenção",
              "objetivo": "Objetivo",
              "linhaEditorial": "Linha editorial",
              "roteiro": "Roteiro/estrutura completa e executável",
              "postDate": "YYYY-MM-DD",
              "postTime": "HH:MM",
              "direcaoCriativa": "Orientação visual/produção",
              "observacoes": "Observações"
            }
          ]
        }
      ],
      "campanhas": [
        {
          "id": "ID",
          "nome": "Nome da campanha",
          "ideia": "Conceito central",
          "objetivo": "Objetivo estratégico",
          "periodo": "Quando executar",
          "justificativa": "Por que faz sentido para esta empresa",
          "criativos": [
            {
              "id": "ID",
              "tipo": "Reels|Post|Stories",
              "titulo": "Nome do criativo",
              "estrutura": "Roteiro/copy/estrutura completa"
            }
          ]
        }
      ]
    }
  ]
}

PESQUISA DE DATAS:
Antes de montar o planejamento, faça pesquisa atualizada das datas comemorativas do período para cada nicho presente nas empresas. Cruze o calendário geral com datas específicas de odontologia, educação, alimentação, finanças, saúde, varejo, tecnologia, profissões e demais nichos existentes no cadastro. Use somente oportunidades pertinentes à empresa.

VALIDAÇÃO DE QUALIDADE:
Antes de finalizar, compare TODOS os conteúdos de TODAS as empresas e elimine repetições ou ideias excessivamente parecidas. O planejamento deve parecer criado individualmente para cada cliente, e não replicado em massa.

VALIDAÇÃO DE VOLUME:
Antes de finalizar o JSON, confira empresa por empresa e semana por semana se o total de conteúdos é EXATAMENTE igual à demanda semanal fornecida.

EMPRESAS E COORDENADAS:
${JSON.stringify(companies,null,2)}

Retorne somente o JSON final válido.`;
}
async function magicCopyPrompt(){
  const txt=magicPlannerPrompt();
  try{
    await navigator.clipboard.writeText(txt);
    toast('Prompt do Planner Mágico copiado.');
  }catch(_){
    const ta=document.createElement('textarea');
    ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    toast('Prompt do Planner Mágico copiado.');
  }
}
function magicValidatePlan(data){
  if(!data||typeof data!=='object')throw new Error('JSON inválido.');
  if(data.plannerVersion!=='MOVE_MAGIC_V1')throw new Error('plannerVersion precisa ser MOVE_MAGIC_V1.');
  if(!Array.isArray(data.empresas)||!data.empresas.length)throw new Error('O JSON não possui empresas.');

  const known=new Set(D.companies.map(c=>c.id));
  const problems=[];

  data.empresas.forEach(ep=>{
    if(!known.has(ep.companyId))problems.push(`Empresa desconhecida: ${ep.empresa||ep.companyId}`);
    if(!Array.isArray(ep.semanas)||ep.semanas.length!==4)problems.push(`${ep.empresa||ep.companyId}: precisa ter 4 semanas.`);
    const c=D.companies.find(x=>x.id===ep.companyId);
    if(c&&Array.isArray(ep.semanas)){
      ep.semanas.forEach(w=>{
        const counts={Reels:0,Post:0,Stories:0};
        (w.conteudos||[]).forEach(ct=>{if(counts[ct.tipo]!==undefined)counts[ct.tipo]++});
        if(counts.Reels!==Number(c.reels||0)||counts.Post!==Number(c.posts||0)||counts.Stories!==Number(c.stories||0)){
          problems.push(`${c.nome} / Semana ${w.numero}: volume diferente do cadastro.`);
        }
      });
    }
  });
  if(problems.length)throw new Error(problems.slice(0,8).join('\n'));
  return true;
}
async function magicImportFile(file){
  if(!file)return;
  moveShowLoading('Criando o Planejamento Mágico...');
  try{
    const raw=await file.text();
    const parsed=JSON.parse(raw);
    magicValidatePlan(parsed);

    const plan={
      id:id(),
      importedAt:new Date().toISOString(),
      title:parsed.titulo||'Planejamento Mágico',
      periodo:parsed.periodo||{},
      sourceFile:file.name||'planner.json',
      data:parsed
    };
    D.magicPlans.unshift(plan);
    save();
    await moveSleep(700);
    moveHideLoading();
    toast('Planejamento Mágico criado com sucesso.');
    magicPlannerPage(plan.id);
  }catch(err){
    moveHideLoading();
    console.error(err);
    modal('Não foi possível importar',`<div class="notice red" style="white-space:pre-wrap">${e(err.message||String(err))}</div>`);
  }
}
function magicEnsurePage(){
  let page=document.getElementById('p-magicplanner');
  if(page)return page;
  page=document.createElement('section');
  page.className='page';
  page.id='p-magicplanner';
  document.querySelector('.wrap')?.appendChild(page);
  return page;
}
function magicPlannerPage(openId=''){
  const page=magicEnsurePage();
  R='magicplanner';
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  page.classList.add('active');
  if(EL?.title)EL.title.textContent='Planner Mágico';
  nav();

  const runs=(D.magicPlans||[]).map(p=>{
    const companies=p.data?.empresas||[];
    const totalWeeks=companies.reduce((n,c)=>n+(c.semanas?.length||0),0);
    const totalContents=companies.reduce((n,c)=>n+(c.semanas||[]).reduce((m,w)=>m+(w.conteudos?.length||0),0),0);
    const totalCampaigns=companies.reduce((n,c)=>n+(c.campanhas?.length||0),0);
    return `<article class="card magic-run-card ${openId===p.id?'active':''}">
      <div class="magic-run-top">
        <div>
          <span class="badge warn"><i class="fa fa-wand-magic-sparkles"></i> PLANNER MÁGICO</span>
          <h3>${e(p.title)}</h3>
          <div class="meta">${date(p.periodo?.inicio)} — ${date(p.periodo?.fim)} • Importado em ${new Date(p.importedAt).toLocaleString('pt-BR')}</div>
        </div>
        <div class="actions">
          <button class="btn primary sm" onclick="magicOpenPlan('${p.id}')"><i class="fa fa-eye"></i> Abrir</button>
          <button class="btn light sm" onclick="magicDownload('${p.id}')"><i class="fa fa-download"></i> JSON</button>
          <button class="btn danger sm" onclick="magicDelete('${p.id}')"><i class="fa fa-trash"></i></button>
        </div>
      </div>
      <div class="stats magic-stats">
        <div class="mini"><b>${companies.length}</b><span>EMPRESAS</span></div>
        <div class="mini"><b>${totalWeeks}</b><span>SEMANAS</span></div>
        <div class="mini"><b>${totalContents}</b><span>CONTEÚDOS</span></div>
        <div class="mini"><b>${totalCampaigns}</b><span>CAMPANHAS</span></div>
      </div>
    </article>`;
  }).join('');

  page.innerHTML=
    head('Planner Mágico','Planejamento estratégico gerado por JSON. Esta área é independente do planejamento manual.',`
      <button class="btn light" onclick="magicCopyPrompt()"><i class="fa fa-copy"></i> Copiar prompt</button>
      <button class="btn primary" onclick="magicPickUpload()"><i class="fa fa-file-arrow-up"></i> Fazer upload</button>
    `)
    +`<div class="notice"><b>Área separada.</b> Nada importado aqui entra automaticamente no Quadro Criativo manual. Use este espaço como o cérebro estratégico para revisar e organizar o movimento das empresas.</div>`
    +`<div class="magic-runs">${runs||empty('Nenhum Planejamento Mágico importado ainda.')}</div>`;
}
function magicOpenPlan(planId){
  const p=(D.magicPlans||[]).find(x=>x.id===planId);
  if(!p)return toast('Planejamento não encontrado.');
  const page=magicEnsurePage();
  const companyCards=(p.data?.empresas||[]).map(ep=>{
    const c=D.companies.find(x=>x.id===ep.companyId);
    const contentCount=(ep.semanas||[]).reduce((n,w)=>n+(w.conteudos?.length||0),0);
    return `<article class="card magic-company-card">
      <div class="magic-company-color" style="background:${e(c?.cor||'#fca311')}"></div>
      <div class="magic-company-body">
        <div class="magic-company-head">
          <div><span class="badge">${e(c?.nome||ep.empresa)}</span><h3>${e(ep.empresa||c?.nome||'Empresa')}</h3></div>
          <button class="btn primary sm" onclick="magicCompanyDetail('${planId}','${ep.companyId}')"><i class="fa fa-arrow-right"></i> Ver plano</button>
        </div>
        <p>${e(ep.movimentoEstrategico||'')}</p>
        <div class="stats">
          <div class="mini"><b>${ep.semanas?.length||0}</b><span>SEMANAS</span></div>
          <div class="mini"><b>${contentCount}</b><span>CONTEÚDOS</span></div>
          <div class="mini"><b>${ep.campanhas?.length||0}</b><span>CAMPANHAS</span></div>
        </div>
      </div>
    </article>`;
  }).join('');

  page.innerHTML=
    head(p.title||'Planejamento Mágico',`${date(p.periodo?.inicio)} — ${date(p.periodo?.fim)}`,`
      <button class="btn light" onclick="magicPlannerPage()"><i class="fa fa-arrow-left"></i> Voltar</button>
      <button class="btn light" onclick="magicClientDownload('${p.id}')"><i class="fa fa-file-arrow-down"></i> Versão para empresas</button>
      <button class="btn dark" onclick="magicDownload('${p.id}')"><i class="fa fa-download"></i> Baixar JSON</button>
    `)
    +`<div class="notice">Este planejamento continua isolado do manual. Abra uma empresa para revisar semanas, conteúdos, datas e campanhas.</div>`
    +`<div class="grid companies magic-company-grid">${companyCards||empty('Nenhuma empresa no planejamento.')}</div>`;
}

function magicEditContent(planId,companyId,weekId,contentId){
  const p=(D.magicPlans||[]).find(x=>x.id===planId);
  const ep=p?.data?.empresas?.find(x=>x.companyId===companyId);
  const w=ep?.semanas?.find(x=>x.id===weekId);
  const ct=w?.conteudos?.find(x=>x.id===contentId);
  if(!ct)return toast('Conteúdo não encontrado.');

  modal('Editar conteúdo do Planner Mágico',`<form id="magicEditForm" class="fg">
    <div class="field"><label>Tipo</label><select name="tipo">${['Reels','Post','Stories'].map(v=>`<option ${ct.tipo===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class="field"><label>Data</label><input type="date" name="postDate" value="${e(ct.postDate||'')}"></div>
    <div class="field"><label>Horário</label><input type="time" name="postTime" value="${e(ct.postTime||'')}"></div>
    <div class="field"><label>Linha editorial</label><input name="linhaEditorial" value="${e(ct.linhaEditorial||'')}"></div>
    <div class="field span"><label>Título</label><input name="titulo" value="${e(ct.titulo||'')}"></div>
    <div class="field span"><label>Ideia</label><textarea name="ideia">${e(ct.ideia||'')}</textarea></div>
    <div class="field span"><label>Objetivo</label><textarea name="objetivo">${e(ct.objetivo||'')}</textarea></div>
    <div class="field span"><label>Roteiro / estrutura</label><textarea name="roteiro" style="min-height:360px">${e(ct.roteiro||'')}</textarea></div>
    <div class="field span"><label>Direção criativa</label><textarea name="direcaoCriativa">${e(ct.direcaoCriativa||'')}</textarea></div>
    <div class="field span"><label>Observações de produção</label><textarea name="observacoes">${e(ct.observacoes||'')}</textarea></div>
  </form>`,()=>{
    const q=obj(document.getElementById('magicEditForm'));
    Object.assign(ct,q);
    closeM();save();magicCompanyDetail(planId,companyId);toast('Conteúdo atualizado.');
  });
}
function magicClientDownload(planId,companyId=''){
  const p=(D.magicPlans||[]).find(x=>x.id===planId);
  if(!p)return toast('Planejamento não encontrado.');
  const empresas=companyId?(p.data?.empresas||[]).filter(x=>x.companyId===companyId):(p.data?.empresas||[]);
  let html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(p.title||'Planejamento')}</title>
  <style>body{font-family:Arial,sans-serif;color:#171717;max-width:1000px;margin:0 auto;padding:40px;background:#fff}h1{font-size:30px}h2{margin-top:40px;border-bottom:2px solid #111;padding-bottom:10px}h3{margin-top:28px}.meta{color:#666;font-size:13px}.box{border:1px solid #ddd;border-radius:14px;padding:18px;margin:14px 0}.content{border-left:4px solid #fca311;background:#f7f7f7;padding:16px;margin:12px 0;border-radius:8px}pre{white-space:pre-wrap;font:inherit;line-height:1.55}.badge{font-size:11px;font-weight:bold;text-transform:uppercase}.no-print{margin-bottom:25px}@media print{.no-print{display:none}body{padding:0}}</style></head><body>
  <button class="no-print" onclick="window.print()">Imprimir / Salvar em PDF</button><h1>${e(p.title||'Planejamento Estratégico')}</h1><div class="meta">${date(p.periodo?.inicio)} — ${date(p.periodo?.fim)}</div>`;
  empresas.forEach(ep=>{
    html+=`<h2>${e(ep.empresa)}</h2><div class="box"><b>Movimento estratégico</b><p>${e(ep.movimentoEstrategico||'')}</p><b>Direção criativa</b><p>${e(ep.direcaoCriativa||'')}</p></div>`;
    (ep.semanas||[]).forEach(w=>{
      html+=`<h3>Semana ${w.numero} — ${date(w.inicio)} a ${date(w.fim)}</h3><div class="meta">${e(w.objetivo||'')} • ${e(w.linha||'')}</div>`;
      (w.conteudos||[]).forEach(ct=>{
        html+=`<div class="content"><span class="badge">${e(ct.tipo)}</span><h3>${e(ct.titulo)}</h3><p><b>Ideia:</b> ${e(ct.ideia||'')}</p><p><b>Objetivo:</b> ${e(ct.objetivo||'')}</p><pre>${e(ct.roteiro||'')}</pre><p class="meta">${date(ct.postDate)} ${e(ct.postTime||'')} • ${e(ct.direcaoCriativa||'')}</p></div>`;
      });
    });
    if((ep.datasComemorativas||[]).length){html+=`<h3>Datas e oportunidades</h3>`;(ep.datasComemorativas||[]).forEach(d=>html+=`<div class="box"><b>${date(d.data)} — ${e(d.nome)}</b><p>${e(d.ideia||'')}</p></div>`)}
    if((ep.campanhas||[]).length){html+=`<h3>Campanhas estratégicas</h3>`;(ep.campanhas||[]).forEach(cp=>html+=`<div class="box"><b>${e(cp.nome)}</b><p>${e(cp.ideia||'')}</p><p><b>Objetivo:</b> ${e(cp.objetivo||'')}</p></div>`)}
  });
  html+=`</body></html>`;
  dl(html,`MOVE_Planejamento_Cliente_${safe(companyId?(empresas[0]?.empresa||'empresa'):(p.title||'planejamento'))}.html`);
}

function magicCompanyDetail(planId,companyId){
  const p=(D.magicPlans||[]).find(x=>x.id===planId);
  const ep=p?.data?.empresas?.find(x=>x.companyId===companyId);
  if(!p||!ep)return toast('Plano da empresa não encontrado.');
  const c=D.companies.find(x=>x.id===companyId);
  const page=magicEnsurePage();

  const weeks=(ep.semanas||[]).map(w=>`
    <section class="card magic-week">
      <div class="magic-week-head">
        <div><span class="badge warn">SEMANA ${w.numero}</span><h3>${date(w.inicio)} — ${date(w.fim)}</h3><p>${e(w.movimento||'')}</p></div>
        <div class="meta"><b>Objetivo:</b> ${e(w.objetivo||'—')}<br><b>Linha:</b> ${e(w.linha||'—')}</div>
      </div>
      <div class="magic-content-list">
        ${(w.conteudos||[]).map(ct=>`<article class="magic-content-card">
          <div class="move-calendar-tags"><span class="badge">${e(ct.tipo)}</span><span class="badge move-team-strategic">${e(ct.linhaEditorial||'Estratégico')}</span></div>
          <h4>${e(ct.titulo)}</h4>
          <p><b>Ideia:</b> ${e(ct.ideia||'')}</p>
          <p><b>Objetivo:</b> ${e(ct.objetivo||'')}</p>
          <div class="magic-script"><b>ROTEIRO / ESTRUTURA</b><pre>${e(ct.roteiro||'')}</pre></div>
          <div class="meta">${date(ct.postDate)} ${e(ct.postTime||'')} • ${e(ct.direcaoCriativa||'')}</div>
          <div class="actions"><button class="btn light sm" onclick="magicEditContent('${planId}','${companyId}','${w.id}','${ct.id}')"><i class="fa fa-pen"></i> Editar conteúdo</button></div>
        </article>`).join('')}
      </div>
    </section>`).join('');

  const dates=(ep.datasComemorativas||[]).map(d=>`<article class="item"><div><strong>${date(d.data)} — ${e(d.nome)}</strong><small>${e(d.ideia||'')} • ${e(d.observacoes||'')}</small></div><span class="badge warn">${e(d.tipo||'Oportunidade')}</span></article>`).join('');
  const campaigns=(ep.campanhas||[]).map(cp=>`<article class="card campaign-card">
    <span class="badge warn"><i class="fa fa-bullhorn"></i> CAMPANHA</span>
    <h3>${e(cp.nome)}</h3><p class="campaign-idea">${e(cp.ideia||'')}</p>
    <div class="campaign-objective"><b>OBJETIVO</b><span>${e(cp.objetivo||'')}</span></div>
    <div class="meta">${e(cp.periodo||'')} • ${e(cp.justificativa||'')}</div>
    <div class="magic-campaign-creatives">${(cp.criativos||[]).map(cr=>`<div class="magic-mini-creative"><b>${e(cr.tipo)} — ${e(cr.titulo)}</b><pre>${e(cr.estrutura||'')}</pre></div>`).join('')}</div>
  </article>`).join('');

  page.innerHTML=
    head(ep.empresa||c?.nome||'Empresa',ep.movimentoEstrategico||'',`<button class="btn light" onclick="magicOpenPlan('${planId}')"><i class="fa fa-arrow-left"></i> Voltar ao plano</button> <button class="btn dark" onclick="magicClientDownload('${planId}','${companyId}')"><i class="fa fa-download"></i> Baixar versão para empresa</button>`)
    +`<div class="card section magic-direction"><span class="eyebrow">DIREÇÃO CRIATIVA</span><p>${e(ep.direcaoCriativa||'—')}</p><div class="meta">Cor registrada: <b>${e(c?.cor||'Não informada')}</b></div></div>`
    +`<div style="margin-top:18px">${head('Semanas planejadas','Conteúdo completo para a equipe revisar e executar.')}</div>`
    +`<div class="magic-weeks">${weeks||empty('Sem semanas.')}</div>`
    +`<div style="margin-top:22px">${head('Datas & oportunidades','Datas comemorativas, homenagens e oportunidades selecionadas para a marca.')}</div>`
    +`<div class="card section"><div class="list">${dates||empty('Nenhuma data selecionada.')}</div></div>`
    +`<div style="margin-top:22px">${head('Campanhas estratégicas','Ideias maiores para movimentar a empresa além da grade semanal.')}</div>`
    +`<div class="grid companies campaign-grid">${campaigns||empty('Nenhuma campanha sugerida.')}</div>`;
}
function magicDownload(planId){
  const p=(D.magicPlans||[]).find(x=>x.id===planId);
  if(!p)return;
  dl(JSON.stringify(p.data,null,2),`MOVE_Planner_Magico_${safe(p.title||'planejamento')}.json`);
}
function magicDelete(planId){
  const p=(D.magicPlans||[]).find(x=>x.id===planId);
  if(!p)return;
  if(!confirm(`Excluir "${p.title||'Planejamento Mágico'}"?\n\nO planejamento manual não será afetado.`))return;
  D.magicPlans=D.magicPlans.filter(x=>x.id!==planId);
  save();
  magicPlannerPage();
  toast('Planejamento Mágico excluído.');
}
function magicInjectCSS(){
  if(document.getElementById('move-magic-css'))return;
  const st=document.createElement('style');
  st.id='move-magic-css';
  st.textContent=`
    .move-magic-top-wrap{position:relative}
    .move-magic-main-btn{box-shadow:0 8px 22px rgba(252,163,17,.22)}
    .move-magic-drop{position:absolute;right:0;top:calc(100% + 9px);width:320px;padding:7px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;box-shadow:0 20px 55px rgba(0,0,0,.16);display:none;z-index:999}
    .move-magic-drop.open{display:grid}
    .move-magic-drop button{border:0;background:#fff;border-radius:10px;padding:11px;display:grid;grid-template-columns:28px 1fr;gap:8px;text-align:left;align-items:center}
    .move-magic-drop button:hover{background:#f7f7f8}.move-magic-drop button>i{color:#9a6100;text-align:center}
    .move-magic-drop b{display:block;font-size:11px}.move-magic-drop small{display:block;color:#888;font-size:8px;margin-top:3px}
    .magic-runs{display:grid;gap:12px}.magic-run-card{padding:16px}.magic-run-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
    .magic-run-top h3{margin:9px 0 4px}.magic-stats{grid-template-columns:repeat(4,1fr)}
    .magic-company-card{overflow:hidden;display:grid;grid-template-columns:7px 1fr}.magic-company-color{height:100%}.magic-company-body{padding:15px}
    .magic-company-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.magic-company-head h3{margin:7px 0}.magic-company-body>p{font-size:10px;color:#62666c;line-height:1.55}
    .magic-weeks{display:grid;gap:14px}.magic-week{padding:16px}.magic-week-head{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #eee;padding-bottom:13px;margin-bottom:12px}
    .magic-week-head h3{margin:8px 0 4px;font-size:15px}.magic-week-head p{font-size:10px;color:#666;margin:0}
    .magic-content-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.magic-content-card{border:1px solid #e7e9ed;border-radius:12px;padding:12px;background:#fafbfc}
    .magic-content-card h4{font-size:12px;margin:9px 0}.magic-content-card p{font-size:9px;line-height:1.5;color:#5f646b}
    .magic-script{margin:9px 0;padding:10px;border-left:3px solid #fca311;border-radius:8px;background:#fff}.magic-script>b{font-size:8px;color:#7d8288}.magic-script pre,.magic-mini-creative pre{white-space:pre-wrap;word-break:break-word;font:inherit;font-size:9px;line-height:1.55;margin:7px 0 0}
    .magic-direction p{font-size:12px;line-height:1.65}.magic-campaign-creatives{display:grid;gap:7px;margin-top:10px}.magic-mini-creative{padding:9px;border-radius:9px;background:#f7f7f8}.magic-mini-creative b{font-size:9px}
    @media(max-width:820px){.move-magic-drop{right:auto;left:0;max-width:calc(100vw - 24px)}.magic-content-list{grid-template-columns:1fr}.magic-run-top,.magic-week-head,.magic-company-head{flex-direction:column}.magic-stats{grid-template-columns:repeat(2,1fr)}}

    .production-command{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;background:#111;color:#fff;border-radius:15px;padding:16px 18px;margin:16px 0;border:1px solid #222}.production-command.has-critical{box-shadow:inset 4px 0 0 #b42318}.production-command h3{margin:5px 0 3px;font-size:18px}.production-command p{margin:0;color:#aaa;font-size:9px}.production-command .eyebrow{color:#fca311}.production-command-kpis{display:grid;grid-template-columns:repeat(4,minmax(74px,1fr));gap:6px}.production-command-kpis>div{background:#1c1c1c;border-radius:9px;padding:9px;text-align:center}.production-command-kpis b{display:block;font-size:17px}.production-command-kpis span{font-size:7px;color:#aaa}.production-command-kpis .danger-kpi{background:#351817}.production-command-kpis .danger-kpi b{color:#ff8d86}
    .production-rule{display:grid;grid-template-columns:32px 1fr;gap:9px;background:#fff1ef;border:1px solid #ffd2cc;border-radius:10px;padding:10px;margin-bottom:10px;color:#8f251c}.production-rule>i{width:32px;height:32px;border-radius:8px;background:#b42318;color:#fff;display:grid;place-items:center}.production-rule b{display:block;font-size:8px}.production-rule span{display:block;font-size:8px;line-height:1.45;margin-top:3px}.prod-late-card{border-color:#f3b5ae!important;box-shadow:inset 3px 0 0 #d92d20}.prod-critical-card{border-color:#d92d20!important;background:#fffafa!important;box-shadow:inset 4px 0 0 #b42318}.prod-meta{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0;padding-top:8px;border-top:1px dashed #e5e7eb;font-size:8px;color:#666}.prod-meta i{color:#9a6100;margin-right:3px}.prod-blocker{margin:7px 0;background:#fff4e5;border-radius:8px;padding:8px}.prod-blocker b{display:block;font-size:7px;color:#8a5300}.prod-blocker span{display:block;font-size:8px;color:#6f5a37;margin-top:3px}
    @media(max-width:900px){.production-command{grid-template-columns:1fr}.production-command-kpis{grid-template-columns:repeat(4,1fr)}}@media(max-width:520px){.production-command-kpis{grid-template-columns:1fr 1fr}.prod-meta{flex-direction:column;gap:5px}}

    
    .move-task-title-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.move-task-title-row strong{flex:1;min-width:140px}
    .move-priority{white-space:nowrap}.move-priority-baixa{opacity:.78}.move-priority-normal{background:#f1f2f4;color:#555}.move-priority-alta{background:#fff2d1;color:#875100}.move-priority-urgente{background:#fff0ef;color:#b42318}.move-priority-crítica,.move-priority-critica{background:#b42318!important;color:#fff!important}
    .move-task-priority-card.move-task-priority-crítica,.move-task-priority-card.move-task-priority-critica{box-shadow:inset 4px 0 0 #b42318}.move-task-priority-card.move-task-priority-urgente{box-shadow:inset 3px 0 0 #d92d20}.move-task-priority-card.move-task-priority-alta{box-shadow:inset 3px 0 0 #fca311}

    
    .move-op{margin-bottom:24px}.move-op-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:13px}.move-op-head h2{margin:4px 0 3px;font-size:21px;letter-spacing:-.5px}.move-op-head p{margin:0;color:#777;font-size:9px}.move-op-alerts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.move-op-alert{border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:12px;text-align:left;transition:.15s}.move-op-alert:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(0,0,0,.06)}.move-op-alert span{display:block;font-size:7px;font-weight:900;color:#777}.move-op-alert b{display:block;font-size:25px;margin:5px 0 1px}.move-op-alert small{font-size:8px;color:#999}.move-op-alert.danger{border-color:#f2b8b3;background:#fffafa;box-shadow:inset 3px 0 0 #b42318}.move-op-alert.danger b{color:#b42318}.move-op-alert.warning{border-color:#f7d58b;background:#fffdf7;box-shadow:inset 3px 0 0 #fca311}
    .move-op-health{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e5e7eb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:8px 0}.move-op-health>div{background:#111;color:#fff;padding:11px 13px}.move-op-health span{display:block;font-size:7px;color:#aaa;font-weight:800}.move-op-health b{display:block;font-size:18px;margin-top:3px}.move-op-health b small{font-size:9px;color:#888}
    .move-op-table-card{overflow:hidden}.move-op-table-head{padding:13px 15px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #eee}.move-op-table-head b{display:block;font-size:11px}.move-op-table-head small{display:block;color:#888;font-size:8px;margin-top:3px}.move-op-table-wrap{overflow:auto}.move-op-table{min-width:720px}.move-op-table td>small{display:block;margin-top:4px;color:#888;font-size:8px}.move-op-company{display:flex;align-items:center;gap:8px}.move-op-color{width:9px;height:28px;border-radius:5px;flex:0 0 auto}
    @media(max-width:850px){.move-op-alerts,.move-op-health{grid-template-columns:1fr 1fr}}@media(max-width:520px){.move-op-head{align-items:flex-start;flex-direction:column}.move-op-alerts{grid-template-columns:1fr 1fr}.move-op-health{grid-template-columns:1fr 1fr}.move-op-alert b{font-size:21px}}

    
    .move-approval-note{margin-top:7px;padding:8px 9px;border-radius:8px;background:#fff4e5;color:#76520b;font-size:8px;line-height:1.45}.move-approval-note b{display:block;font-size:7px;margin-bottom:2px}

    
    .task-sector-choice-inline{display:flex;gap:7px;flex-wrap:wrap}.task-sector-choice-inline .move-check-chip span{min-height:38px;padding:0 12px}.task-transfer-note{margin-top:7px;padding:7px 9px;border-radius:8px;background:#f2f4f7;color:#667085;font-size:8px;display:flex;align-items:center;gap:5px}.task-transfer-note b{color:#344054}

    
    .move-pp-cycle{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:10px;background:#111;color:#fff;border-radius:18px;padding:16px;margin-bottom:16px;overflow:hidden;border:1px solid #222;box-shadow:0 14px 32px rgba(0,0,0,.08)}
    .move-pp-cycle:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#fca311}.move-pp-cycle.transition:before{background:#d92d20}.move-pp-cycle.production:before{background:#12b76a}
    .move-pp-main{display:flex;gap:13px;align-items:flex-start}.move-pp-icon{width:45px;height:45px;border-radius:12px;background:#242424;color:#fca311;display:grid;place-items:center;font-size:17px;flex:0 0 auto}.move-pp-cycle.transition .move-pp-icon{color:#ff7b72}.move-pp-cycle.production .move-pp-icon{color:#6ce9a6}
    .move-pp-label{font-size:7px;font-weight:900;letter-spacing:1.2px;color:#999}.move-pp-copy h2{font-size:24px;margin:4px 0 2px;letter-spacing:-.7px}.move-pp-clock{font-size:9px;font-weight:800;color:#fca311;text-transform:capitalize}.move-pp-copy p{font-size:9px;line-height:1.5;color:#aaa;margin:8px 0 0;max-width:720px}
    .move-pp-next{background:#1d1d1d;border:1px solid #292929;border-radius:12px;padding:12px;display:flex;flex-direction:column;justify-content:center}.move-pp-next span{font-size:7px;color:#888;font-weight:900}.move-pp-next b{font-size:14px;margin:5px 0 2px}.move-pp-next small{font-size:8px;color:#aaa}
    .move-pp-rule{grid-column:1/-1;background:#1a1a1a;border-top:1px solid #2b2b2b;margin:2px -16px -16px;padding:9px 16px;display:flex;align-items:center;gap:9px}.move-pp-rule>i{color:#fca311}.move-pp-rule b{display:block;font-size:7px;color:#ddd}.move-pp-rule span{display:block;font-size:8px;color:#888;margin-top:2px}
    @media(max-width:700px){.move-pp-cycle{grid-template-columns:1fr}.move-pp-next{min-height:76px}.move-pp-copy h2{font-size:21px}}

    
    .monthly-report-preview{display:grid;gap:12px}.report-hero{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px;border-radius:14px;background:#111;color:#fff}.report-hero h2{margin:5px 0 3px}.report-hero p{margin:0;color:#aaa;font-size:9px}.report-color{width:52px;height:52px;border-radius:15px;flex:0 0 auto}.report-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.report-summary-grid>div{background:#f7f7f8;border-radius:10px;padding:10px}.report-summary-grid span{display:block;font-size:7px;color:#888;font-weight:800}.report-summary-grid b{display:block;font-size:20px;margin-top:4px}.report-summary-grid small{font-size:8px;color:#999}.report-goal-card,.report-development{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fff}.report-goal-card p{font-size:10px;line-height:1.55}.report-month-total{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.report-month-total>div{background:#111;color:#fff;border-radius:10px;padding:10px;text-align:center}.report-month-total b{display:block;font-size:18px;color:#fca311}.report-month-total span{font-size:7px;color:#aaa}.report-weeks{display:grid;gap:10px}.report-week-card{border:1px solid #e5e7eb;border-radius:13px;padding:12px;background:#fafbfc}.report-week-head{display:flex;justify-content:space-between;gap:12px}.report-week-head h3{font-size:13px;margin:6px 0 3px}.report-week-head p{font-size:9px;color:#666;margin:0}.report-week-kpis{display:flex;gap:6px}.report-week-kpis span{background:#fff;border:1px solid #eee;border-radius:8px;padding:7px;font-size:8px;color:#777}.report-week-kpis b{display:block;color:#111}.report-content-list{display:grid;gap:6px}.report-content-line{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;background:#fff;border-radius:9px;padding:8px}.report-content-line b{display:block;font-size:9px}.report-content-line small{display:block;font-size:7px;color:#888;margin-top:2px}
    @media(max-width:700px){.report-summary-grid,.report-month-total{grid-template-columns:1fr 1fr}.report-week-head{flex-direction:column}.report-content-line{grid-template-columns:auto 1fr}.report-content-line>.badge:last-child{grid-column:2}}

    
    .move-board-guide{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#111;color:#fff;border-radius:14px;margin-bottom:18px;overflow:auto}.move-board-guide>i{color:#555;font-size:10px}.move-board-guide-item{display:flex;align-items:center;gap:8px;min-width:max-content}.move-board-guide-item>span{width:28px;height:28px;border-radius:9px;background:#2a2a2a;display:grid;place-items:center;color:#fca311;font-size:10px;font-weight:900}.move-board-guide-item b{display:block;font-size:9px}.move-board-guide-item small{display:block;font-size:7px;color:#888;margin-top:2px}.move-board-guide-item.active>span{background:#fca311;color:#111}
    .move-board-section{background:#fff;border:1px solid #e7e9ed;border-radius:18px;padding:16px;margin-top:16px;box-shadow:0 8px 28px rgba(15,23,42,.04)}.move-board-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;padding-bottom:13px;margin-bottom:13px;border-bottom:1px solid #eceef0}.move-board-section-head h2{font-size:18px;margin:4px 0 3px}.move-board-section-head p{margin:0;color:#777;font-size:9px;line-height:1.5}
    .move-week-title-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.move-step-number{width:30px;height:30px;border-radius:9px;background:#111;color:#fca311;display:grid;place-items:center;font-size:11px;font-weight:900}.move-week-title-row h3{margin:0;font-size:14px}.move-week-purpose{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;padding-left:39px;color:#666;font-size:8px}.move-week-actions{justify-content:flex-end}.move-week-actions>.primary{min-height:34px}
    .move-board-first-week{text-align:center;padding:34px 18px;border:1px dashed #d9dde3;border-radius:14px;background:#fafbfc}.move-board-first-icon{width:52px;height:52px;border-radius:15px;background:#111;color:#fca311;display:grid;place-items:center;margin:0 auto 12px;font-size:18px}.move-board-first-week h3{margin:0 0 5px}.move-board-first-week p{font-size:9px;color:#777;margin:0 auto 14px;max-width:440px}
    .move-production-summary{display:flex;gap:7px;flex-wrap:wrap}.move-production-summary span{padding:7px 9px;border-radius:9px;background:#f5f6f7;font-size:8px}.danger-text{color:#b42318!important;background:#fff0ef!important}.move-production-list{display:grid;gap:8px}.move-production-simple{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #e7e9ed;border-radius:12px;padding:11px;background:#fff}.move-production-simple.late{box-shadow:inset 3px 0 0 #d92d20}.move-production-simple.critical{box-shadow:inset 4px 0 0 #b42318;background:#fffafa}.move-production-main>strong{display:block;margin:7px 0;font-size:10px}.move-production-controls{display:flex;gap:5px;align-items:center;flex-wrap:wrap}.move-production-controls .move-status-select{width:auto;min-width:135px;margin:0}.materials-section{margin-bottom:20px}
    @media(max-width:760px){.move-board-section-head,.move-production-simple{grid-template-columns:1fr;display:flex;flex-direction:column;align-items:stretch}.move-week-purpose{padding-left:0}.move-week-actions{justify-content:flex-start}.move-week-actions .btn{flex:1 1 auto}.move-production-controls{justify-content:flex-start}.move-board-guide{align-items:flex-start}}

    
    .move-real-calendar-card{background:#fff;border:1px solid #e7e9ed;border-radius:18px;padding:16px;margin-bottom:18px;box-shadow:0 8px 28px rgba(15,23,42,.04)}
    .move-real-calendar-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px}.move-real-calendar-head h2{font-size:19px;margin:4px 0 3px}.move-real-calendar-head p{margin:0;color:#777;font-size:9px}.move-real-calendar-legend{display:flex;gap:10px;flex-wrap:wrap}.move-real-calendar-legend span{display:flex;align-items:center;gap:5px;font-size:8px;font-weight:800;color:#666}.move-real-calendar-legend i{width:9px;height:9px;border-radius:3px;display:block}.legend-transition i{background:#d92d20}.legend-planning i{background:#12b76a}.legend-production i{background:#2e5aac}
    .move-real-cal-weekdays{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px}.move-real-cal-weekdays span{text-align:center;font-size:7px;font-weight:900;color:#8a8f96;letter-spacing:.6px}
    .move-real-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.move-real-cal-day{min-height:76px;border-radius:11px;padding:8px;border:1px solid transparent;position:relative;overflow:hidden}.move-real-cal-day.empty{background:#fafbfc;border-color:#f0f1f3}.move-real-cal-day.transition{background:#fff1ef;border-color:#f3c2bc}.move-real-cal-day.planning{background:#edfdf3;border-color:#bde9cc}.move-real-cal-day.production{background:#eef4ff;border-color:#c7d7fb}.move-real-cal-day.today{box-shadow:0 0 0 3px rgba(252,163,17,.22);border-color:#fca311}.move-real-cal-number{font-size:12px;font-weight:900;color:#111}.move-real-cal-type{position:absolute;left:8px;right:8px;bottom:8px;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.transition .move-real-cal-type{color:#b42318}.planning .move-real-cal-type{color:#087443}.production .move-real-cal-type{color:#244c97}
    .move-real-calendar-rule{display:flex;align-items:center;gap:8px;margin-top:12px;padding:9px 10px;border-radius:10px;background:#111;color:#c7c7c7;font-size:8px}.move-real-calendar-rule i{color:#fca311}.move-real-calendar-rule b{color:#fff}
    @media(max-width:760px){.move-real-calendar-head{align-items:flex-start;flex-direction:column}.move-real-cal-grid{gap:4px}.move-real-cal-day{min-height:64px;padding:6px}.move-real-cal-type{font-size:6px;left:6px;right:6px;bottom:6px}.move-real-cal-number{font-size:10px}}
    @media(max-width:520px){.move-real-calendar-card{padding:11px}.move-real-calendar-legend{gap:7px}.move-real-cal-day{min-height:52px;border-radius:8px}.move-real-cal-type{font-size:5px;letter-spacing:0}.move-real-cal-weekdays span{font-size:6px}}

    
    .move-employee-welcome{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,360px);gap:12px;align-items:stretch;margin-bottom:14px}.move-employee-welcome-main{padding:18px 19px;border:1px solid #e7e9ed;border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(15,23,42,.04)}.move-employee-welcome-main h1{font-size:25px;margin:4px 0 4px;letter-spacing:-.7px}.move-employee-welcome-main p{margin:0;color:#777;font-size:9px;text-transform:capitalize}.move-employee-welcome-cycle{padding:15px;border-radius:16px;background:#111;color:#fff;border-left:5px solid #fca311;display:flex;flex-direction:column;justify-content:center}.move-employee-welcome-cycle.transition{border-left-color:#d92d20}.move-employee-welcome-cycle.planning{border-left-color:#12b76a}.move-employee-welcome-cycle.production{border-left-color:#2e5aac}.move-employee-welcome-cycle>span{font-size:7px;font-weight:900;color:#999;letter-spacing:.8px}.move-employee-welcome-cycle>b{font-size:17px;margin:4px 0 5px}.move-employee-welcome-cycle>small{font-size:8px;line-height:1.5;color:#aaa}
    .move-team-message-modal{text-align:center;padding:10px 4px}.move-team-message-icon{width:58px;height:58px;margin:0 auto 15px;border-radius:17px;background:#111;color:#fca311;display:grid;place-items:center;font-size:20px}.move-team-message-modal h2{font-size:22px;letter-spacing:-.6px;margin:7px 0}.move-team-message-modal>p{max-width:560px;margin:0 auto;color:#62666d;font-size:11px;line-height:1.65}.move-team-message-rule{max-width:560px;margin:17px auto 0;padding:11px 12px;border-radius:11px;background:#fff5dc;color:#744d00;display:flex;align-items:center;gap:8px;text-align:left;font-size:9px;line-height:1.45}.move-team-message-rule i{color:#b77900}
    @media(max-width:760px){.move-employee-welcome{grid-template-columns:1fr}.move-employee-welcome-main h1{font-size:22px}}

    
    .move-employee-welcome{grid-template-columns:minmax(0,1fr) minmax(260px,340px)}.move-employee-point-card{padding:15px;border:1px solid #e7e9ed;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 8px 26px rgba(15,23,42,.04)}.move-employee-point-card b{display:block;font-size:14px;margin:4px 0 2px}.move-employee-point-card small{display:block;color:#888;font-size:8px}
    .move-clock-modal{display:grid;gap:13px}.move-clock-status{text-align:center}.move-clock-status h2{font-size:22px;margin:5px 0 3px}.move-clock-status p{font-size:9px;color:#777;margin:0}.move-clock-camera-wrap{position:relative;max-width:460px;width:100%;aspect-ratio:4/3;margin:0 auto;border-radius:18px;overflow:hidden;background:#090909;display:grid;place-items:center}.move-clock-camera-wrap video,.move-clock-photo-preview img{width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(-1)}.move-clock-camera-guide{position:absolute;left:12px;right:12px;bottom:12px;background:rgba(0,0,0,.7);color:#fff;border-radius:10px;padding:9px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:8px}.move-clock-photo-preview{position:absolute;inset:0}.move-clock-photo-preview .btn{position:absolute;right:10px;bottom:10px}.move-clock-actions{justify-content:center}.move-clock-day-list{border-top:1px solid #eceef0;padding-top:12px}.move-clock-day-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.move-clock-day-head b{display:block;font-size:10px}.move-clock-day-head small{display:block;font-size:8px;color:#888;margin-top:2px}.move-clock-entries{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.move-clock-entry{display:grid;grid-template-columns:46px 1fr;gap:9px;align-items:center;padding:8px;border:1px solid #e7e9ed;border-radius:11px;background:#fafbfc}.move-clock-photo{width:46px;height:46px;border-radius:10px;overflow:hidden;background:#eee;display:grid;place-items:center}.move-clock-photo img{width:100%;height:100%;object-fit:cover}.move-clock-entry b{display:block;font-size:11px;margin:4px 0 2px}.move-clock-entry small{font-size:7px;color:#888}.move-clock-home-summary{padding:11px 13px;border:1px solid #e7e9ed;border-radius:14px;background:#fff;margin-bottom:12px}.move-clock-home-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.move-clock-home-head h3{margin:4px 0 0;font-size:13px}.move-clock-home-pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.move-clock-pill{display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border-radius:999px;font-size:8px}.move-clock-pill.entry{background:#eaf8f0;color:#087443}.move-clock-pill.exit{background:#fff3d5;color:#815200}
    @media(max-width:700px){.move-employee-welcome{grid-template-columns:1fr}.move-employee-point-card{align-items:stretch;flex-direction:column}.move-clock-entries{grid-template-columns:1fr}.move-clock-home-head{align-items:flex-start;flex-direction:column}}

    @media(max-width:520px){.move-magic-main-btn{width:100%}.move-magic-top-wrap{width:100%}.move-magic-drop{width:100%;position:fixed;left:12px;right:12px;top:auto;bottom:12px;max-width:none}.magic-stats{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(st);
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

const MOVE_LOGIN_CACHE_KEY='move_auth_login_v1';

function saveLoginCache(){
  try{
    localStorage.setItem(MOVE_LOGIN_CACHE_KEY,JSON.stringify({
      logged:true,
      savedAt:new Date().toISOString()
    }));
  }catch(err){}
}

function hasLoginCache(){
  try{
    const data=JSON.parse(localStorage.getItem(MOVE_LOGIN_CACHE_KEY)||'null');
    return !!(data&&data.logged===true);
  }catch(err){
    return false;
  }
}

function clearLoginCache(){
  try{localStorage.removeItem(MOVE_LOGIN_CACHE_KEY)}catch(err){}
}

function restoreLoginCache(){
  if(!hasLoginCache())return false;
  const login=document.getElementById('loginScreen');
  const app=document.getElementById('appShell');
  if(login)login.style.display='none';
  if(app)app.classList.remove('auth-hidden');
  return true;
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
  clearLoginCache();
  sessionStorage.removeItem(MOVE_AUTH_KEY);
  window.__MOVE_CLOUD_BOOTED=false;
  applyAuthState();
}


if(D.finance)delete D.finance;if(D.contracts)delete D.contracts;

const EL={saved:document.getElementById('saved'),title:document.getElementById('title'),restore:document.getElementById('restore'),nav:document.getElementById('nav'),modal:document.getElementById('modal')};

function blank(){return{companies:[],weeks:[],contents:[],scheduled:[],tasks:[],texts:[],agenda:[],curadoria:[],campaigns:[],magicPlans:[]}}function load(){try{return Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return blank()}}function save(){localStorage.setItem(KEY,JSON.stringify(D));moveSetSavedStatus('Salvo local • sincronizando...');render(R);moveScheduleSync()}function id(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}function e(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}function date(v){if(!v)return'—';return new Date(String(v).slice(0,10)+'T12:00').toLocaleDateString('pt-BR')}function ini(n){return String(n||'M').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}function toast(x){let t=document.getElementById('toast');t.textContent=x;t.style.display='block';setTimeout(()=>t.style.display='none',2500)}function nav(){
  const navEl=document.getElementById('nav');
  if(!navEl)return;
  navEl.innerHTML=M.map(x=>`<button class="${R===x[0]?'active':''}" onclick="go('${x[0]}')"><i class="fa ${x[1]}"></i>${x[2]}</button>`).join('');
}
function go(r){
  const page=document.getElementById('p-'+r);
  if(!page){toast('Área não encontrada: '+r);return;}
  R=r;
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  page.classList.add('active');
  if(EL?.title)EL.title.textContent=M.find(x=>x[0]===r)?.[2]||'MOVE';
  nav();
  render(r);
}
function head(t,d,b=''){return`<div class="head"><div><h2>${t}</h2><p>${d}</p></div>${b}</div>`}
function empty(t){return`<div class="empty">${t}</div>`}
function render(r){
  const routes={home,empresas,quadro,campanhas,pendencias,textos,agenda,tarefas,agendamento,curadoria};
  const fn=routes[r]||home;
  try{fn()}catch(err){
    console.error('Erro ao renderizar '+r,err);
    const page=document.getElementById('p-'+r)||document.getElementById('p-home');
    if(page)page.innerHTML=`<div class="notice red"><b>Não foi possível abrir esta área.</b><br>${e(err.message||String(err))}</div>`;
    toast('Erro em '+(M.find(x=>x[0]===r)?.[2]||r));
  }
}function modal(t,b,fn){let m=document.getElementById('modal');m.innerHTML=`<div class="modal"><div class="mh"><b>${t}</b><button class="btn light sm" onclick="closeM()">✕</button></div><div class="mb">${b}</div><div class="mf"><button class="btn light" onclick="closeM()">Cancelar</button>${fn?'<button class="btn primary" id="saveM">Salvar</button>':''}</div></div>`;m.classList.add('open');if(fn){const b=document.getElementById('saveM');if(b)b.onclick=fn}}function closeM(){const modalEl=document.getElementById('modal');modalEl.classList.remove('open');modalEl.innerHTML=''}function obj(f){let o={};new FormData(f).forEach((v,k)=>{if(!(v instanceof File))o[k]=v});return o}

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



const MOVE_PP_CYCLE_START='2026-08-17'; // primeira segunda-feira oficial: PLANEJAMENTO
const MOVE_PP_TRANSITION_END='2026-08-16T23:59:59';

function movePPCycleInfo(now=new Date()){
  const transitionEnd=new Date(MOVE_PP_TRANSITION_END);
  const start=new Date(MOVE_PP_CYCLE_START+'T00:00:00');

  if(now<=transitionEnd){
    return {
      type:'TRANSIÇÃO',
      icon:'fa-triangle-exclamation',
      cls:'transition',
      weekNumber:0,
      nextType:'PLANEJAMENTO',
      nextDate:MOVE_PP_CYCLE_START,
      instruction:'Fechar pendências e deixar materiais agendados. Não quebrar o próximo ciclo.'
    };
  }

  const localNow=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const localStart=new Date(start.getFullYear(),start.getMonth(),start.getDate());
  const days=Math.floor((localNow-localStart)/86400000);
  const weekIndex=Math.max(0,Math.floor(days/7));
  const planning=weekIndex%2===0;
  const currentMonday=new Date(localStart);
  currentMonday.setDate(localStart.getDate()+weekIndex*7);
  const nextMonday=new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate()+7);

  return {
    type:planning?'PLANEJAMENTO':'PRODUÇÃO',
    icon:planning?'fa-lightbulb':'fa-clapperboard',
    cls:planning?'planning':'production',
    weekNumber:weekIndex+1,
    currentMonday:currentMonday.toISOString().slice(0,10),
    nextType:planning?'PRODUÇÃO':'PLANEJAMENTO',
    nextDate:nextMonday.toISOString().slice(0,10),
    instruction:planning
      ?'Semana protegida para pensar, roteirizar, organizar campanhas, legendas, datas e preparar tudo que a Produção executará.'
      :'Semana protegida para executar: captação, design, edição, ajustes e finalização. O planejamento estratégico não deve ser refeito aqui.'
  };
}

function movePPClock(){
  const el=document.getElementById('movePPClock');
  if(!el)return;
  const now=new Date();
  el.textContent=now.toLocaleString('pt-BR',{
    weekday:'long',day:'2-digit',month:'2-digit',year:'numeric',
    hour:'2-digit',minute:'2-digit',second:'2-digit'
  });
}

function movePPCycleBanner(){
  const c=movePPCycleInfo();
  setTimeout(()=>{
    movePPClock();
    if(window.__movePPClockTimer)clearInterval(window.__movePPClockTimer);
    window.__movePPClockTimer=setInterval(movePPClock,1000);
  },0);

  return `<section class="move-pp-cycle ${c.cls}">
    <div class="move-pp-main">
      <div class="move-pp-icon"><i class="fa ${c.icon}"></i></div>
      <div class="move-pp-copy">
        <span class="move-pp-label">CICLO P + P • SEMANA ATUAL</span>
        <h2>${e(c.type)}</h2>
        <div id="movePPClock" class="move-pp-clock">Carregando data e hora...</div>
        <p>${e(c.instruction)}</p>
      </div>
    </div>
    <div class="move-pp-next">
      <span>PRÓXIMA SEMANA</span>
      <b>${e(c.nextType)}</b>
      <small>A partir de ${date(c.nextDate)}</small>
    </div>
    <div class="move-pp-rule">
      <i class="fa fa-lock"></i>
      <div><b>ORDEM OPERACIONAL FIXA</b><span>PLANEJAMENTO → PRODUÇÃO → PLANEJAMENTO → PRODUÇÃO. Atrasos não mudam o tipo da semana.</span></div>
    </div>
  </section>`;
}

function moveOperationalOverview(){
  const today=new Date(); today.setHours(0,0,0,0);
  const in7=new Date(today); in7.setDate(in7.getDate()+7);

  const companies=D.companies||[];
  const contents=D.contents||[];
  const tasks=D.tasks||[];

  const planningTasks=tasks.filter(t=>taskSector(t)==='Planejamento');
  const productionTasks=tasks.filter(t=>taskSector(t)==='Produção');

  const planningPending=planningTasks.filter(t=>!['Concluído','Finalizado'].includes(t.status)).length;
  const productionPending=productionTasks.filter(t=>!['Concluído','Finalizado'].includes(t.status)).length;

  const prodContents=contents.filter(c=>contentTeam(c)==='criativa');
  const prodLate=prodContents.filter(c=>['late','critical'].includes(productionDeadlineState(c).key));
  const prodToday=prodContents.filter(c=>productionDeadlineState(c).key==='today');
  const prodCritical=prodContents.filter(c=>productionDeadlineState(c).key==='critical');
  const prodDone=prodContents.filter(c=>productionDeadlineState(c).key==='done');

  const waitingApproval=contents.filter(c=>['Revisão','Ajustes'].includes(c.workflowStatus)).length;
  const attached=(D.scheduled||[]).length;

  const companyRows=companies.map(c=>{
    const ws=(D.weeks||[]).filter(w=>w.companyId===c.id);
    const cs=contents.filter(x=>x.companyId===c.id);
    const prod=cs.filter(x=>contentTeam(x)==='criativa');
    const late=prod.filter(x=>['late','critical'].includes(productionDeadlineState(x).key)).length;
    const todayCount=prod.filter(x=>productionDeadlineState(x).key==='today').length;
    const pendingPlan=planningTasks.filter(t=>t.companyId===c.id&&!['Concluído','Finalizado'].includes(t.status)).length;
    const pendingProd=productionTasks.filter(t=>t.companyId===c.id&&!['Concluído','Finalizado'].includes(t.status)).length;
    const future=cs.filter(x=>x.postDate&&new Date(x.postDate+'T00:00:00')>=today).length;
    let health='Em dia',cls='ok',score=0,reason='Operação sem alerta imediato';
    if(late){health='Em risco';cls='red';score=100+late*10;reason=`${late} conteúdo${late>1?'s':''} atrasado${late>1?'s':''}`}
    else if(todayCount){health='Atenção';cls='warn';score=70+todayCount;reason=`${todayCount} entrega${todayCount>1?'s':''} vence${todayCount>1?'m':''} hoje`}
    else if(!future&&ws.length){health='Preparar';cls='warn';score=55;reason='Sem conteúdo futuro preparado'}
    else if(pendingPlan){health='Planejamento';cls='';score=35;reason=`${pendingPlan} tarefa${pendingPlan>1?'s':''} de planejamento pendente${pendingPlan>1?'s':''}`}
    return {c,health,cls,score,reason,pendingPlan,pendingProd,late,todayCount,future};
  }).sort((a,b)=>b.score-a.score||a.c.nome.localeCompare(b.c.nome));

  return {companies,contents,tasks,planningPending,productionPending,prodContents,prodLate,prodToday,prodCritical,prodDone,waitingApproval,attached,companyRows};
}
function moveOverviewSection(){
  const o=moveOperationalOverview();
  const plannedCompanies=o.companyRows.filter(x=>x.future>0).length;
  const healthy=o.companyRows.filter(x=>x.health==='Em dia').length;
  const risk=o.companyRows.filter(x=>['Em risco','Atenção'].includes(x.health)).length;
  const rows=o.companyRows.slice(0,12).map(x=>`<tr>
    <td><div class="move-op-company"><span class="move-op-color" style="background:${e(x.c.cor||'#fca311')}"></span><b>${e(x.c.nome)}</b></div></td>
    <td><span class="badge ${x.cls}">${e(x.health)}</span><small>${e(x.reason)}</small></td>
    <td>${x.pendingPlan}</td><td>${x.pendingProd}</td><td>${x.future}</td>
    <td><button class="btn light sm" onclick="board('${x.c.id}')">Abrir empresa</button></td>
  </tr>`).join('');

  return movePPCycleBanner()+`<section class="move-op">
    <div class="move-op-head">
      <div><span class="eyebrow">VISÃO GERAL DA OPERAÇÃO</span><h2>O que precisa da sua atenção agora</h2><p>Uma leitura rápida para você trabalhar por prioridade, sem procurar problema empresa por empresa.</p></div>
      <button class="btn light sm" onclick="home()"><i class="fa fa-rotate"></i> Atualizar</button>
    </div>

    <div class="move-op-alerts">
      <button class="move-op-alert ${o.prodLate.length?'danger':''}" onclick="go('tarefas')"><span>ATRASADAS</span><b>${o.prodLate.length}</b><small>${o.prodCritical.length} críticas</small></button>
      <button class="move-op-alert ${o.prodToday.length?'warning':''}" onclick="go('tarefas')"><span>VENCEM HOJE</span><b>${o.prodToday.length}</b><small>produção</small></button>
      <button class="move-op-alert" onclick="go('tarefas')"><span>PLANEJAMENTO</span><b>${o.planningPending}</b><small>tarefas pendentes</small></button>
      <button class="move-op-alert" onclick="go('tarefas')"><span>PRODUÇÃO</span><b>${o.productionPending}</b><small>tarefas pendentes</small></button>
    </div>

    <div class="move-op-health">
      <div><span>EMPRESAS EM DIA</span><b>${healthy}<small> / ${o.companies.length}</small></b></div>
      <div><span>COM PLANEJAMENTO FUTURO</span><b>${plannedCompanies}<small> / ${o.companies.length}</small></b></div>
      <div><span>EM RISCO</span><b>${risk}</b></div>
      <div><span>MATERIAIS ANEXADOS</span><b>${o.attached}</b></div>
    </div>

    <div class="card move-op-table-card">
      <div class="move-op-table-head"><div><b>Radar das empresas</b><small>As empresas que mais precisam de atenção aparecem primeiro.</small></div><span class="badge ${risk?'red':'ok'}">${risk?risk+' precisam de atenção':'Tudo sob controle'}</span></div>
      <div class="move-op-table-wrap"><table class="table move-op-table"><thead><tr><th>Empresa</th><th>Situação</th><th>Planejamento</th><th>Produção</th><th>Futuros</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>
  </section>`;
}


function movePPWeekTypeForDate(dateObj){
  const d=new Date(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate());
  const transitionEnd=new Date(2026,7,16,23,59,59);
  const cycleStart=new Date(2026,7,17,0,0,0);

  if(d<=transitionEnd){
    return {type:'TRANSIÇÃO',cls:'transition',label:'Transição'};
  }

  const days=Math.floor((d-cycleStart)/86400000);
  const weekIndex=Math.floor(days/7);
  const planning=weekIndex%2===0;

  return planning
    ?{type:'PLANEJAMENTO',cls:'planning',label:'Planejamento'}
    :{type:'PRODUÇÃO',cls:'production',label:'Produção'};
}

function movePPMonthCalendar(baseDate=new Date()){
  const year=baseDate.getFullYear();
  const month=baseDate.getMonth();
  const first=new Date(year,month,1);
  const last=new Date(year,month+1,0);

  // Monday-first calendar
  let startDay=(first.getDay()+6)%7;
  const totalCells=Math.ceil((startDay+last.getDate())/7)*7;
  const monthName=baseDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});

  let cells='';
  for(let i=0;i<totalCells;i++){
    const dayNum=i-startDay+1;

    if(dayNum<1||dayNum>last.getDate()){
      cells+=`<div class="move-real-cal-day empty"></div>`;
      continue;
    }

    const d=new Date(year,month,dayNum);
    const info=movePPWeekTypeForDate(d);
    const today=new Date();
    const isToday=d.getFullYear()===today.getFullYear()&&d.getMonth()===today.getMonth()&&d.getDate()===today.getDate();

    cells+=`<div class="move-real-cal-day ${info.cls} ${isToday?'today':''}">
      <div class="move-real-cal-number">${dayNum}</div>
      <div class="move-real-cal-type">${info.label}</div>
    </div>`;
  }

  return `<section class="move-real-calendar-card">
    <div class="move-real-calendar-head">
      <div>
        <span class="eyebrow">CALENDÁRIO OPERACIONAL</span>
        <h2>${monthName.charAt(0).toUpperCase()+monthName.slice(1)}</h2>
        <p>As cores mostram automaticamente qual é o tipo de semana do ciclo P + P.</p>
      </div>

      <div class="move-real-calendar-legend">
        <span class="legend-transition"><i></i> Transição</span>
        <span class="legend-planning"><i></i> Planejamento</span>
        <span class="legend-production"><i></i> Produção</span>
      </div>
    </div>

    <div class="move-real-cal-weekdays">
      <span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span>
    </div>

    <div class="move-real-cal-grid">${cells}</div>

    <div class="move-real-calendar-rule">
      <i class="fa fa-lock"></i>
      <span>Ordem fixa: <b>Planejamento → Produção → Planejamento → Produção</b>. Atrasos não alteram o ciclo.</span>
    </div>
  </section>`;
}


const MOVE_TEAM_MESSAGES=[
  {
    title:'Que seu dia seja leve e produtivo ✨',
    text:'Que hoje você consiga avançar com tranquilidade, criatividade e boas ideias. Um passo de cada vez também leva longe.',
    icon:'fa-sun'
  },
  {
    title:'Hoje é um novo começo 🌱',
    text:'Que seu dia traga boas oportunidades, foco no que importa e orgulho pelo trabalho construído junto com a equipe.',
    icon:'fa-seedling'
  },
  {
    title:'Que seja um dia de boas entregas 💛',
    text:'Faça o seu melhor dentro do possível, celebre cada avanço e lembre que consistência vale mais do que perfeição.',
    icon:'fa-star'
  },
  {
    title:'Boas ideias começam com calma ☀️',
    text:'Que hoje você encontre espaço para criar, colaborar e transformar pequenas tarefas em grandes resultados.',
    icon:'fa-lightbulb'
  },
  {
    title:'Que seu trabalho floresça hoje 🌻',
    text:'Desejamos um dia produtivo, organizado e cheio de boas conquistas. Cada detalhe bem feito ajuda a construir algo maior.',
    icon:'fa-heart'
  },
  {
    title:'Tenha um excelente dia 🚀',
    text:'Que não faltem energia, criatividade e disposição para transformar planejamento em movimento e movimento em resultado.',
    icon:'fa-rocket'
  }
];

function moveGreetingInfo(){
  const now=new Date();
  const h=now.getHours();
  const greeting=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  const dateText=now.toLocaleDateString('pt-BR',{
    weekday:'long',day:'2-digit',month:'long',year:'numeric'
  });
  return {greeting,dateText,now};
}

function moveEmployeeWelcome(){
  const g=moveGreetingInfo();

  return `<section class="move-employee-welcome">
    <div class="move-employee-welcome-main">
      <span class="eyebrow">MOVE • OPERAÇÃO</span>
      <h1>${g.greeting} 👋</h1>
      <p>${g.dateText.charAt(0).toUpperCase()+g.dateText.slice(1)}</p>
    </div>

    <div class="move-employee-point-card">
      <div>
        <span class="eyebrow">REGISTRO DO DIA</span>
        <b>Meu Ponto</b>
        <small>Entrada e saída com registro por foto.</small>
      </div>
      <button class="btn dark" onclick="moveOpenTimeClock()">
        <i class="fa fa-clock"></i> Meu Ponto
      </button>
    </div>
  </section>`;
}

const MOVE_TIME_CLOCK_KEY='move_time_clock_v1';

function moveLoadTimeClock(){
  try{return JSON.parse(localStorage.getItem(MOVE_TIME_CLOCK_KEY)||'[]')}catch(_){return []}
}
function moveSaveTimeClock(list){
  localStorage.setItem(MOVE_TIME_CLOCK_KEY,JSON.stringify(list));
}
function moveTodayKey(d=new Date()){
  return d.toISOString().slice(0,10);
}
function moveTodayClockEntries(){
  const today=moveTodayKey();
  return moveLoadTimeClock().filter(x=>x.day===today).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
}
function moveClockEntryLabel(index){
  // Automatically interprets the sequence of the day.
  // Supports morning-only, afternoon-only, or full commercial day.
  return index%2===0?'Entrada':'Saída';
}
function moveClockNextType(){
  const entries=moveTodayClockEntries();
  return moveClockEntryLabel(entries.length);
}
function moveClockExpectedHint(){
  const h=new Date().getHours();
  if(h<12)return 'Horário comercial de referência: 08h às 12h.';
  if(h<18)return 'Horário comercial de referência: 14h às 18h.';
  return 'Registro fora do horário comercial de referência.';
}
function moveClockTableHTML(){
  const rows=moveTodayClockEntries();
  return `<div class="move-clock-day-list">
    <div class="move-clock-day-head">
      <div><b>Pontos de hoje</b><small>${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</small></div>
      <span class="badge">${rows.length} registro${rows.length===1?'':'s'}</span>
    </div>

    <div class="move-clock-entries">
      ${rows.map((x,i)=>`<article class="move-clock-entry">
        <div class="move-clock-photo">${x.photo?`<img src="${x.photo}" alt="Foto do ponto">`:x.photoUrl?`<a href="${e(x.photoUrl)}" target="_blank" rel="noopener" title="Abrir foto no Drive"><i class="fa fa-image"></i></a>`:`<i class="fa fa-user"></i>`}</div>
        <div>
          <span class="badge ${x.type==='Entrada'?'ok':'warn'}">${e(x.type)}</span>
          <b>${new Date(x.timestamp).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</b>
          <small>${new Date(x.timestamp).toLocaleDateString('pt-BR')}</small>
        </div>
      </article>`).join('')||`<div class="empty">Nenhum ponto registrado hoje.</div>`}
    </div>
  </div>`;
}
async function moveOpenTimeClock(){
  await moveSyncTodayPointsFromCloud();
  const next=moveClockNextType();

  modal('Meu Ponto',`
    <div class="move-clock-modal">
      <div class="move-clock-status">
        <span class="eyebrow">PRÓXIMO REGISTRO</span>
        <h2>${e(next)}</h2>
        <p>${e(moveClockExpectedHint())}</p>
      </div>

      <div class="move-clock-camera-wrap">
        <video id="moveClockVideo" autoplay playsinline muted></video>
        <canvas id="moveClockCanvas" class="hidden"></canvas>
        <div id="moveClockPhotoPreview" class="move-clock-photo-preview hidden"></div>
        <div class="move-clock-camera-guide">
          <i class="fa fa-face-smile"></i>
          <span>Olhe para a câmera e centralize seu rosto.</span>
        </div>
      </div>

      <div class="actions move-clock-actions">
        <button class="btn primary" type="button" onclick="moveCaptureClockPhoto()">
          <i class="fa fa-camera"></i> Tirar foto
        </button>
        <button id="moveClockConfirmBtn" class="btn dark hidden" type="button" onclick="moveConfirmClock()">
          <i class="fa fa-clock"></i> Registrar ${e(next)}
        </button>
      </div>

      ${moveClockTableHTML()}
    </div>
  `);

  const saveBtn=document.getElementById('saveM');
  if(saveBtn)saveBtn.classList.add('hidden');

  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
    window.__MOVE_CLOCK_STREAM=stream;
    const v=document.getElementById('moveClockVideo');
    if(v)v.srcObject=stream;
  }catch(err){
    console.error(err);
    const wrap=document.querySelector('.move-clock-camera-wrap');
    if(wrap)wrap.innerHTML=`<div class="notice red"><b>Não foi possível abrir a câmera.</b><br>Verifique a permissão do navegador.</div>`;
  }
}
function moveStopClockCamera(){
  const stream=window.__MOVE_CLOCK_STREAM;
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    window.__MOVE_CLOCK_STREAM=null;
  }
}
function moveCaptureClockPhoto(){
  const v=document.getElementById('moveClockVideo');
  const canvas=document.getElementById('moveClockCanvas');
  const preview=document.getElementById('moveClockPhotoPreview');
  const btn=document.getElementById('moveClockConfirmBtn');
  if(!v||!canvas||!preview)return;

  const w=v.videoWidth||640,h=v.videoHeight||480;
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(v,0,0,w,h);

  const photo=canvas.toDataURL('image/jpeg',0.72);
  window.__MOVE_CLOCK_PHOTO=photo;
  preview.innerHTML=`<img src="${photo}" alt="Foto capturada"><button class="btn light sm" onclick="moveRetakeClockPhoto()"><i class="fa fa-rotate"></i> Tirar outra</button>`;
  preview.classList.remove('hidden');
  v.classList.add('hidden');
  if(btn)btn.classList.remove('hidden');
}
function moveRetakeClockPhoto(){
  window.__MOVE_CLOCK_PHOTO='';
  document.getElementById('moveClockPhotoPreview')?.classList.add('hidden');
  document.getElementById('moveClockVideo')?.classList.remove('hidden');
  document.getElementById('moveClockConfirmBtn')?.classList.add('hidden');
}

async function moveRegisterPointCloud(point){
  if(!moveApiConfigured())throw new Error('Conexão com a planilha não configurada.');

  const body=new URLSearchParams();
  body.set('action','registerPoint');
  body.set('id',point.id);
  body.set('day',point.day);
  body.set('timestamp',point.timestamp);
  body.set('type',point.type);
  body.set('photo',point.photo);

  const r=await fetch(MOVE_API_URL,{method:'POST',body,redirect:'follow'});
  if(!r.ok)throw new Error('Falha ao registrar ponto: HTTP '+r.status);

  const out=await r.json();
  if(!out?.ok)throw new Error(out?.error||'Falha ao registrar ponto na planilha.');
  return out.point||null;
}

async function moveFetchTodayPointsCloud(){
  if(!moveApiConfigured())return [];
  const day=moveTodayKey();
  const r=await fetch(MOVE_API_URL+'?action=points&day='+encodeURIComponent(day)+'&_='+Date.now(),{
    method:'GET',cache:'no-store',redirect:'follow'
  });
  if(!r.ok)return [];
  const out=await r.json();
  return out?.ok&&Array.isArray(out.data)?out.data:[];
}

async function moveSyncTodayPointsFromCloud(){
  try{
    const cloud=await moveFetchTodayPointsCloud();
    if(!cloud.length)return;

    const local=moveLoadTimeClock();
    const byId=new Map(local.map(x=>[x.id,x]));

    cloud.forEach(x=>{
      const existing=byId.get(x.id);
      if(existing){
        existing.photoUrl=x.photoUrl||existing.photoUrl||'';
        existing.timestamp=x.timestamp||existing.timestamp;
        existing.type=x.type||existing.type;
        existing.day=x.day||existing.day;
        existing.synced=true;
      }else{
        local.push({...x,synced:true});
      }
    });

    moveSaveTimeClock(local);
  }catch(err){
    console.warn('Não foi possível sincronizar pontos do dia:',err);
  }
}

async function moveConfirmClock(){
  const photo=window.__MOVE_CLOCK_PHOTO||'';
  if(!photo)return toast('Tire a foto antes de registrar o ponto.');

  const now=new Date();
  const type=moveClockNextType();
  const point={
    id:id(),
    day:moveTodayKey(now),
    timestamp:now.toISOString(),
    type,
    photo,
    synced:false
  };

  const confirmBtn=document.getElementById('moveClockConfirmBtn');
  if(confirmBtn){
    confirmBtn.disabled=true;
    confirmBtn.innerHTML='<i class="fa fa-spinner fa-spin"></i> Registrando...';
  }

  try{
    const cloud=await moveRegisterPointCloud(point);
    point.synced=true;
    point.photoUrl=cloud?.photoUrl||'';

    // Keep only a lightweight local copy after cloud success.
    const localPoint={
      id:point.id,
      day:point.day,
      timestamp:point.timestamp,
      type:point.type,
      photo:point.photo,
      photoUrl:point.photoUrl,
      synced:true
    };

    const list=moveLoadTimeClock();
    list.push(localPoint);
    moveSaveTimeClock(list);

    window.__MOVE_CLOCK_PHOTO='';
    moveStopClockCamera();
    closeM();
    toast(`${type} registrada às ${now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}.`);
    if(R==='home')home();
  }catch(err){
    console.error('Erro ao registrar ponto na nuvem:',err);

    // Offline contingency: do not lose the punch; mark pending sync.
    const list=moveLoadTimeClock();
    list.push(point);
    moveSaveTimeClock(list);

    window.__MOVE_CLOCK_PHOTO='';
    moveStopClockCamera();
    closeM();
    toast(`${type} salva neste aparelho. Sincronização com a planilha pendente.`);
    if(R==='home')home();
  }
}
function moveClockHomeSummary(){
  const rows=moveTodayClockEntries();
  if(!rows.length)return '';

  return `<section class="move-clock-home-summary">
    <div class="move-clock-home-head">
      <div><span class="eyebrow">MEUS PONTOS DE HOJE</span><h3>${rows.length} registro${rows.length===1?'':'s'}</h3></div>
      <button class="btn light sm" onclick="moveOpenTimeClock()"><i class="fa fa-clock"></i> Abrir Meu Ponto</button>
    </div>
    <div class="move-clock-home-pills">
      ${rows.map(x=>`<span class="move-clock-pill ${x.type==='Entrada'?'entry':'exit'}"><b>${e(x.type)}</b>${new Date(x.timestamp).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>`).join('')}
    </div>
  </section>`;
}

function moveShowTeamMessageOnce(){
  const key='move_team_message_session_v1';
  if(sessionStorage.getItem(key)==='1')return;
  if(!isAuthenticated() && !hasLoginCache())return;

  sessionStorage.setItem(key,'1');

  const day=new Date().getDate();
  const msg=MOVE_TEAM_MESSAGES[day % MOVE_TEAM_MESSAGES.length];

  setTimeout(()=>{
    modal('Mensagem para a equipe',`
      <div class="move-team-message-modal">
        <div class="move-team-message-icon"><i class="fa ${msg.icon}"></i></div>
        <span class="eyebrow">ANTES DE COMEÇAR</span>
        <h2>${e(msg.title)}</h2>
        <p>${e(msg.text)}</p>

        <div class="move-team-message-rule">
          <i class="fa fa-heart"></i>
          <span>Que seja um dia de boas ideias, boas entregas e boas conquistas. 💛</span>
        </div>
      </div>
    `);
    const saveBtn=document.getElementById('saveM');
    if(saveBtn){
      saveBtn.innerHTML='<i class="fa fa-check"></i> Entendido';
      saveBtn.onclick=closeM;
      saveBtn.className='btn primary';
    }
  },500);
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
  document.getElementById('p-home').innerHTML=moveEmployeeWelcome()+moveClockHomeSummary()+movePPCycleBanner()+movePPMonthCalendar()+
    head('Visão geral','Operação sincronizada com o Google Sheets e cache local para velocidade.')
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
  items.forEach(ct=>{
    ct.workflowStatus='Fila de produção';
    ct.productionDeadline=ct.productionDeadline||ct.postDate||w.fim||'';
    ct.productionResponsible=ct.productionResponsible||'';
    ct.productionBlocker=ct.productionBlocker||'';
    ct.sentToProductionAt=new Date().toISOString();
  });
  save();
  if(CID)board(CID);
  toast(`Semana ${w.numero} enviada para produção.`);
}

function sendToProduction(contentId){
  const ct=D.contents.find(x=>x.id===contentId);if(!ct)return toast('Conteúdo não encontrado.');
  const w=D.weeks.find(x=>x.id===ct.weekId);
  ct.workflowStatus='Fila de produção';
  ct.productionDeadline=ct.productionDeadline||ct.postDate||w?.fim||'';
  ct.productionResponsible=ct.productionResponsible||'';
  ct.productionBlocker=ct.productionBlocker||'';
  ct.sentToProductionAt=new Date().toISOString();
  save();if(CID)board(CID);toast('Enviado para a Equipe Criativa com prazo de entrega.');
}
function productionDeadlineState(ct){
  if(['Finalizado','Agendado','Publicado'].includes(ct?.workflowStatus))return {key:'done',label:'FINALIZADO',cls:'ok'};
  const deadline=ct?.productionDeadline||ct?.postDate||'';
  if(!deadline)return {key:'none',label:'SEM PRAZO',cls:'red'};
  const end=new Date(deadline+'T23:59:59');
  const diff=end.getTime()-Date.now();
  if(diff<0){
    const days=Math.max(1,Math.ceil(Math.abs(diff)/86400000));
    return {key:days>=2?'critical':'late',label:days>=2?`ATRASO CRÍTICO • ${days}D`:`ATRASADO • ${days}D`,cls:'red'};
  }
  const hours=Math.ceil(diff/3600000);
  if(hours<=24)return {key:'today',label:'VENCE HOJE',cls:'red'};
  if(hours<=72)return {key:'soon',label:`PRAZO PRÓXIMO • ${Math.ceil(hours/24)}D`,cls:'warn'};
  return {key:'ok',label:`NO PRAZO • ${Math.ceil(hours/24)}D`,cls:'ok'};
}
function productionControl(contentId){
  const ct=D.contents.find(x=>x.id===contentId);if(!ct)return;
  modal('Controle de prazo da Produção',`<form id="productionControlForm" class="fg">
    <div class="field"><label>Prazo obrigatório</label><input type="date" name="productionDeadline" value="${e(ct.productionDeadline||ct.postDate||'')}"></div>
    <div class="field"><label>Responsável pela entrega</label><input name="productionResponsible" value="${e(ct.productionResponsible||'')}" placeholder="Nome do responsável"></div>
    <div class="field span"><label>Impedimento / justificativa de atraso</label><textarea name="productionBlocker" placeholder="Se houver risco ou atraso, registre o motivo e o que está sendo feito para resolver.">${e(ct.productionBlocker||'')}</textarea></div>
  </form>`,()=>{
    const q=obj(document.getElementById('productionControlForm'));
    if(!q.productionDeadline)return toast('O prazo é obrigatório.');
    Object.assign(ct,q);closeM();save();if(CID)board(CID);toast('Controle de produção atualizado.');
  });
}
function setWorkflowStatus(contentId,status){
  const ct=D.contents.find(x=>x.id===contentId);if(!ct)return;
  const ds=productionDeadlineState(ct);
  if(['late','critical'].includes(ds.key)&&status!=='Finalizado'&&!String(ct.productionBlocker||'').trim()){
    toast('Entrega atrasada: registre a justificativa antes de continuar.');
    productionControl(contentId);
    return;
  }
  ct.workflowStatus=status;
  if(status==='Finalizado')ct.productionDoneAt=new Date().toISOString();
  save();if(CID)board(CID);toast('Etapa atualizada.');
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

function productionSummary(cid){
  const arr=D.contents.filter(x=>x.companyId===cid&&contentTeam(x)==='criativa');
  const states=arr.map(productionDeadlineState);
  return {
    total:arr.length,
    done:states.filter(x=>x.key==='done').length,
    today:states.filter(x=>x.key==='today').length,
    late:states.filter(x=>['late','critical'].includes(x.key)).length,
    critical:states.filter(x=>x.key==='critical').length
  };
}

async function board(cid){
  CID=cid;
  R='quadro';

  const c=D.companies.find(x=>x.id===cid);
  if(!c)return quadro();

  const ws=D.weeks.filter(x=>x.companyId===cid).sort((a,b)=>Number(a.numero)-Number(b.numero));
  const done=completedWeeksCount(cid);

  let weeksHTML=ws.map(w=>{
    const progress=weekProgress(w,c);
    const contents=D.contents.filter(x=>x.weekId===w.id).sort((a,b)=>Number(a.ordem||0)-Number(b.ordem||0));
    const days=boardDays(w);
    const withoutDate=contents.filter(x=>!x.postDate||!days.some(d=>boardDateKey(d)===x.postDate));

    const calendar=days.length
      ?`<div class="move-week-calendar">
        ${days.map(d=>{
          const k=boardDateKey(d);
          const dayContents=contents.filter(x=>x.postDate===k);

          return `<div class="move-day ${dayContents.length?'has-content':''}">
            <div class="move-day-head">
              <div><b>${boardDayName(d)}</b><span>${d.getDate()}</span></div>
              <button class="move-day-add" onclick="content('${cid}','${w.id}','','${k}')" title="Adicionar conteúdo neste dia">
                <i class="fa fa-plus"></i>
              </button>
            </div>

            <div class="move-day-body">
              ${dayContents.map(ct=>{
                const media=D.scheduled.find(s=>s.contentId===ct.id);
                return `<article class="move-calendar-content">
                  <div class="move-calendar-tags">
                    <span class="badge">${e(ct.tipo||'Conteúdo')}</span>
                    ${workflowBadge(ct.workflowStatus)}
                    ${media?`<span class="badge ok"><i class="fa fa-circle-check"></i> Anexado</span>`:''}
                  </div>

                  <strong>${e(ct.titulo||'Sem título')}</strong>
                  <small>${e(ct.postTime||'Sem horário')}</small>

                  <div class="actions">
                    <button class="btn light sm" onclick="content('${cid}','${w.id}','${ct.id}')">
                      <i class="fa fa-pen"></i> Editar
                    </button>

                    ${media
                      ?`<button class="btn ok sm" onclick="upload('${cid}','${media.id}')"><i class="fa fa-circle-check"></i> Anexado</button>`
                      :`<button class="btn dark sm" onclick="attachContent('${cid}','${ct.id}')"><i class="fa fa-paperclip"></i> Upload</button>`}

                    <button class="btn danger sm" onclick="deleteContent('${ct.id}')">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </article>`;
              }).join('')||`
                <button class="move-empty-day" onclick="content('${cid}','${w.id}','','${k}')">
                  <i class="fa fa-plus"></i> Adicionar neste dia
                </button>
              `}
            </div>
          </div>`;
        }).join('')}
      </div>`
      :`<div class="notice">
        Esta semana ainda não tem período definido.
        <button class="btn light sm" onclick="week('${cid}','${w.id}')">Definir datas</button>
      </div>`;

    return `<section class="move-calendar-week ${progress.complete?'is-complete':''}">
      <div class="move-week-top">
        <div>
          <div class="move-week-title-row">
            <span class="move-step-number">${w.numero}</span>
            <div>
              <h3>Semana ${w.numero}</h3>
              <div class="meta">${date(w.inicio)} — ${date(w.fim)} • ${progress.created}/${progress.expected} conteúdos planejados</div>
            </div>
            ${progress.complete?`<span class="move-week-done"><i class="fa fa-check"></i> Planejamento completo</span>`:''}
          </div>

          <div class="move-week-purpose">
            <span><b>Objetivo:</b> ${e(w.objetivo||'Não definido')}</span>
            <span><b>Linha:</b> ${e(w.linha||'Não definida')}</span>
          </div>
        </div>

        <div class="actions move-week-actions">
          <button class="btn primary" onclick="content('${cid}','${w.id}')">
            <i class="fa fa-plus"></i> Adicionar conteúdo
          </button>

          <button class="btn light sm" onclick="week('${cid}','${w.id}')">
            <i class="fa fa-pen"></i> Editar semana
          </button>

          <button class="btn dark sm" onclick="sendWeekToProduction('${w.id}')">
            <i class="fa fa-paper-plane"></i> Enviar para produção
          </button>

          <button class="btn light sm" onclick="weekHTML('${w.id}')">
            <i class="fa fa-download"></i> Baixar
          </button>

          <button class="btn danger sm" onclick="deleteWeek('${w.id}')" title="Excluir semana">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>

      ${calendar}

      ${withoutDate.length?`
        <div class="move-undated">
          <b><i class="fa fa-triangle-exclamation"></i> Sem data definida:</b>
          ${withoutDate.map(ct=>`<button class="btn light sm" onclick="content('${cid}','${w.id}','${ct.id}')">${e(ct.titulo||'Sem título')}</button>`).join('')}
        </div>
      `:''}
    </section>`;
  }).join('');

  if(!weeksHTML){
    weeksHTML=`<div class="move-board-first-week">
      <div class="move-board-first-icon"><i class="fa fa-calendar-plus"></i></div>
      <h3>Comece criando a Semana 1</h3>
      <p>Crie a semana, defina as datas e depois adicione os conteúdos que serão produzidos.</p>
      <button class="btn primary" onclick="week('${cid}')"><i class="fa fa-plus"></i> Criar primeira semana</button>
    </div>`;
  }

  const prodItems=D.contents
    .filter(x=>x.companyId===cid&&contentTeam(x)==='criativa')
    .sort((a,b)=>String(a.productionDeadline||a.postDate||'9999').localeCompare(String(b.productionDeadline||b.postDate||'9999')));

  const prod=productionSummary(cid);
  const prodProgress=prod.total?Math.round(prod.done/prod.total*100):0;

  const productionHTML=prodItems.map(ct=>{
    const ds=productionDeadlineState(ct);
    const sm=D.scheduled.find(x=>x.contentId===ct.id);

    return `<article class="move-production-simple ${ds.key==='critical'?'critical':['late','today'].includes(ds.key)?'late':''}">
      <div class="move-production-main">
        <div class="move-calendar-tags">
          <span class="badge">${e(ct.tipo||'Conteúdo')}</span>
          <span class="badge ${ds.cls}">${e(ds.label)}</span>
          ${sm?`<span class="badge ok"><i class="fa fa-circle-check"></i> Mídia anexada</span>`:''}
        </div>

        <strong>${e(ct.titulo||'Sem título')}</strong>

        <div class="prod-meta">
          <span><i class="fa fa-calendar-day"></i> Prazo: <b>${ct.productionDeadline?date(ct.productionDeadline):'Não definido'}</b></span>
          <span><i class="fa fa-user"></i> Responsável: <b>${e(ct.productionResponsible||'Não definido')}</b></span>
        </div>
      </div>

      <div class="move-production-controls">
        <select class="move-status-select" onchange="setWorkflowStatus('${ct.id}',this.value)">
          ${MOVE_TEAM_STATUS.criativa.map(st=>`<option ${((ct.workflowStatus||'Fila de produção')===st)?'selected':''}>${st}</option>`).join('')}
        </select>

        <button class="btn light sm" onclick="productionControl('${ct.id}')"><i class="fa fa-sliders"></i> Prazo</button>
        <button class="btn light sm" onclick="content('${cid}','${ct.weekId||''}','${ct.id}')"><i class="fa fa-eye"></i> Abrir</button>
        ${sm
          ?`<button class="btn ok sm" onclick="upload('${cid}','${sm.id}')"><i class="fa fa-circle-check"></i> Anexado</button>`
          :`<button class="btn dark sm" onclick="attachContent('${cid}','${ct.id}')"><i class="fa fa-paperclip"></i> Upload</button>`}
      </div>
    </article>`;
  }).join('')||empty('Nenhum conteúdo foi enviado para a Produção ainda.');

  const scheduled=D.scheduled
    .filter(x=>x.companyId===cid)
    .sort((a,b)=>String(a.data||'').localeCompare(String(b.data||''))||String(a.hora||'').localeCompare(String(b.hora||'')));

  let materialsHTML='';
  for(const sm of scheduled){
    const ct=D.contents.find(x=>x.id===sm.contentId)||{};
    const u=await mediaURL(sm.mediaId);

    const preview=sm.mime?.startsWith('image/')
      ?`<img src="${u}" alt="${e(ct.titulo||sm.fileName||'Material')}">`
      :sm.mime?.startsWith('video/')
        ?`<video class="move-video-player" controls playsinline preload="metadata" src="${u}" onloadedmetadata="moveVideoCheck(this)"></video>`
        :`<div class="move-file-placeholder"><i class="fa fa-file"></i></div>`;

    materialsHTML+=`<article class="move-board-media-card">
      <div class="move-board-media">${preview}</div>
      <div class="move-board-media-info">
        <span class="badge">${e(ct.tipo||'Material')}</span>
        <h4>${e(ct.titulo||sm.fileName||'Material')}</h4>
        <div class="meta">${date(sm.data)} ${e(sm.hora||'')}</div>

        <div class="actions">
          ${ct.id?`<button class="btn light sm" onclick="content('${cid}','${ct.weekId||''}','${ct.id}')"><i class="fa fa-pen"></i> Conteúdo</button>`:''}
          <button class="btn dark sm" onclick="upload('${cid}','${sm.id}')"><i class="fa fa-paperclip"></i> Abrir mídia</button>
          <button class="btn danger sm" onclick="deleteScheduled('${sm.id}','${cid}')"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    </article>`;
  }

  document.getElementById('p-quadro').innerHTML=
    head(
      c.nome,
      'Planeje primeiro. Depois envie para Produção. Os materiais ficam organizados no final.',
      `<button class="btn light" onclick="quadro()"><i class="fa fa-arrow-left"></i> Empresas</button>
       <button class="btn light" onclick="copyCompanyData('${cid}')"><i class="fa fa-copy"></i> Copiar dados</button>
       <button class="btn light" onclick="monthlyReport('${cid}')"><i class="fa fa-chart-column"></i> Relatório mensal</button>
       <button class="btn primary" onclick="week('${cid}')"><i class="fa fa-plus"></i> Nova semana</button>`
    )

    +`<div class="move-board-guide">
      <div class="move-board-guide-item active">
        <span>1</span><div><b>Planejamento</b><small>Crie semanas e conteúdos.</small></div>
      </div>
      <i class="fa fa-arrow-right"></i>
      <div class="move-board-guide-item">
        <span>2</span><div><b>Produção</b><small>Envie a semana pronta.</small></div>
      </div>
      <i class="fa fa-arrow-right"></i>
      <div class="move-board-guide-item">
        <span>3</span><div><b>Materiais</b><small>Anexe e finalize.</small></div>
      </div>
    </div>`

    +`<section class="move-board-section">
      <div class="move-board-section-head">
        <div>
          <span class="eyebrow">ETAPA 1</span>
          <h2>Planejamento das semanas</h2>
          <p>Crie a semana e adicione os conteúdos no calendário. Esta é a área principal da equipe de Planejamento.</p>
        </div>
        <span class="move-board-progress ${done===4?'is-complete':''}"><i class="fa fa-check"></i> ${done}/4 semanas completas</span>
      </div>

      <div class="move-board-calendar-wrap">${weeksHTML}</div>
    </section>`

    +`<section class="move-board-section production-section">
      <div class="move-board-section-head">
        <div>
          <span class="eyebrow">ETAPA 2</span>
          <h2>Produção</h2>
          <p>Aqui aparecem somente os conteúdos que já foram enviados para execução.</p>
        </div>

        <div class="move-production-summary">
          <span><b>${prodProgress}%</b> concluído</span>
          <span class="${prod.late?'danger-text':''}"><b>${prod.late}</b> atrasados</span>
          <span><b>${prod.today}</b> vencem hoje</span>
        </div>
      </div>

      ${prod.late?`<div class="production-rule"><i class="fa fa-triangle-exclamation"></i><div><b>ATENÇÃO À PRODUÇÃO</b><span>Há entregas atrasadas. Elas devem ser priorizadas antes de novas demandas.</span></div></div>`:''}

      <div class="move-production-list">${productionHTML}</div>
    </section>`

    +`<section class="move-board-section materials-section">
      <div class="move-board-section-head">
        <div>
          <span class="eyebrow">ETAPA 3</span>
          <h2>Materiais da empresa</h2>
          <p>Imagens e vídeos anexados aos conteúdos ficam reunidos aqui.</p>
        </div>

        <div class="actions">
          <button class="btn primary" onclick="upload('${cid}')"><i class="fa fa-plus"></i> Anexar material</button>
          <button class="btn dark" onclick="approval('${cid}')"><i class="fa fa-download"></i> Baixar aprovação</button>
        </div>
      </div>

      <div class="move-board-media-grid">${materialsHTML||empty('Nenhum material anexado ainda.')}</div>
    </section>`;
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
  planejamento:{title:'Planejamento',subtitle:'Equipe Estratégica',icon:'fa-lightbulb',desc:'Planejamento, roteiros, legendas, campanhas, calendário, aprovações e organização estratégica.'},
  producao:{title:'Produção',subtitle:'Equipe Criativa / Operacional',icon:'fa-clapperboard',desc:'Design, edição, captação, ajustes, uploads, finalização e publicação.'}
};
const MOVE_TASK_PRIORITIES=['Baixa','Normal','Alta','Urgente','Crítica'];
const MOVE_TASK_PRIORITY_WEIGHT={Baixa:1,Normal:2,Alta:3,Urgente:4,'Crítica':5};

function taskSectorKey(t){
  const raw=String(t?.setor||t?.sector||t?.team||'planejamento').toLowerCase();
  return raw.includes('produ')?'producao':'planejamento';
}
function taskSector(t){return taskSectorKey(t)==='producao'?'Produção':'Planejamento'}
function taskPriority(t){
  const p=t?.prioridade||t?.priority||'Normal';
  return MOVE_TASK_PRIORITIES.includes(p)?p:'Normal';
}
function taskPriorityBadge(t){
  const p=taskPriority(t),cls=(p==='Crítica'||p==='Urgente')?'red':p==='Alta'?'warn':p==='Baixa'?'ok':'';
  return `<span class=\"badge ${cls}\"><i class=\"fa fa-flag\"></i> ${e(p)}</span>`;
}
function taskNormalize(t){
  const key=taskSectorKey(t);
  t.setor=key;
  t.sector=key==='producao'?'Produção':'Planejamento';
  t.team=t.sector;
  t.prioridade=taskPriority(t);
  t.priority=t.prioridade;
  if(!t.titulo&&t.title)t.titulo=t.title;
  if(!t.title&&t.titulo)t.title=t.titulo;
  if(!t.descricao&&t.desc)t.descricao=t.desc;
  if(!t.desc&&t.descricao)t.desc=t.descricao;
  if(!t.data&&(t.prazo||t.deadline))t.data=t.prazo||t.deadline;
  if(!t.prazo&&t.data)t.prazo=t.data;
  if(typeof t.feita!=='boolean')t.feita=['Concluída','Concluído','Finalizado'].includes(t.status);
  return t;
}
function taskSort(a,b){
  const doneA=taskNormalize(a).feita,doneB=taskNormalize(b).feita;
  if(doneA!==doneB)return doneA?1:-1;
  const p=(MOVE_TASK_PRIORITY_WEIGHT[taskPriority(b)]||2)-(MOVE_TASK_PRIORITY_WEIGHT[taskPriority(a)]||2);
  if(p)return p;
  return String(a.data||'9999-12-31').localeCompare(String(b.data||'9999-12-31'))||String(a.hora||'').localeCompare(String(b.hora||''));
}
function taskDeadlineBadge(t){
  if(t.feita||!t.data)return '';
  const end=new Date(t.data+'T23:59:59'),now=new Date();
  if(end<now){const days=Math.max(1,Math.ceil((now-end)/86400000));return `<span class=\"badge red\"><i class=\"fa fa-clock\"></i> ${days}d atrasada</span>`}
  const hours=Math.ceil((end-now)/3600000);
  if(hours<=24)return `<span class=\"badge red\"><i class=\"fa fa-clock\"></i> Vence hoje</span>`;
  if(hours<=72)return `<span class=\"badge warn\"><i class=\"fa fa-clock\"></i> Prazo próximo</span>`;
  return '';
}
function tarefas(){
  D.tasks.forEach(taskNormalize);
  const sector=TASK_SECTORS[TASK_SECTOR]||TASK_SECTORS.planejamento;
  const list=D.tasks.filter(t=>taskSectorKey(t)===TASK_SECTOR).sort(taskSort);
  const pendingPlan=D.tasks.filter(t=>taskSectorKey(t)==='planejamento'&&!taskNormalize(t).feita).length;
  const pendingProd=D.tasks.filter(t=>taskSectorKey(t)==='producao'&&!taskNormalize(t).feita).length;

  const cards=list.map(t=>{
    const c=D.companies.find(x=>x.id===t.companyId);
    return `<article class=\"task-card-pro ${t.feita?'is-done':''}\">
      <button class=\"task-check-pro ${t.feita?'checked':''}\" onclick=\"toggleTask('${t.id}')\" title=\"${t.feita?'Reabrir tarefa':'Concluir tarefa'}\"><i class=\"fa ${t.feita?'fa-check':'fa-circle'}\"></i></button>
      <div class=\"task-content-pro\">
        <div class=\"task-tags-pro\">
          <span class=\"badge ${TASK_SECTOR==='planejamento'?'move-team-strategic':'move-team-creative'}\"><i class=\"fa ${sector.icon}\"></i> ${sector.title}</span>
          ${c?`<span class=\"badge\"><i class=\"fa fa-building\"></i> ${e(c.nome)}</span>`:''}
          ${taskPriorityBadge(t)}${taskDeadlineBadge(t)}
        </div>
        <h4>${e(t.titulo||'Sem título')}</h4>
        ${t.descricao?`<p>${e(t.descricao)}</p>`:''}
        ${t.transferredFrom?`<div class=\"task-transfer-note\"><i class=\"fa fa-arrow-right-arrow-left\"></i> Enviada de <b>${e(t.transferredFrom)}</b> para <b>${e(t.transferredTo||taskSector(t))}</b></div>`:''}
        <div class=\"task-meta-pro\"><span><i class=\"fa fa-calendar\"></i> ${t.data?date(t.data):'Sem prazo'}</span>${t.hora?`<span><i class=\"fa fa-clock\"></i> ${e(t.hora)}</span>`:''}</div>
      </div>
      <div class=\"task-actions-pro\">
        ${TASK_SECTOR==='planejamento'
          ?`<button class=\"btn primary sm\" onclick=\"sendTaskToProduction('${t.id}')\"><i class=\"fa fa-clapperboard\"></i> Produção</button>`
          :`<button class=\"btn primary sm\" onclick=\"sendTaskToPlanning('${t.id}')\"><i class=\"fa fa-lightbulb\"></i> Planejamento</button>`}
        <button class=\"btn light sm\" onclick=\"task('${t.id}','${TASK_SECTOR}')\"><i class=\"fa fa-pen\"></i></button>
        <button class=\"btn danger sm\" onclick=\"deleteTask('${t.id}')\"><i class=\"fa fa-trash\"></i></button>
      </div>
    </article>`;
  }).join('');

  document.getElementById('p-tarefas').innerHTML=
    head('Minhas Tarefas','Planejamento e Produção têm filas separadas, mas podem enviar demandas entre si.')+
    `<div class=\"task-sector-grid\">
      <button class=\"task-sector-option ${TASK_SECTOR==='planejamento'?'active':''}\" onclick=\"TASK_SECTOR='planejamento';tarefas()\"><span class=\"task-sector-icon strategic\"><i class=\"fa fa-lightbulb\"></i></span><span class=\"task-sector-copy\"><b>Planejamento</b><small>Equipe Estratégica</small></span><span class=\"task-sector-number\">${pendingPlan}</span></button>
      <button class=\"task-sector-option ${TASK_SECTOR==='producao'?'active':''}\" onclick=\"TASK_SECTOR='producao';tarefas()\"><span class=\"task-sector-icon production\"><i class=\"fa fa-clapperboard\"></i></span><span class=\"task-sector-copy\"><b>Produção</b><small>Equipe Criativa / Operacional</small></span><span class=\"task-sector-number\">${pendingProd}</span></button>
    </div>`+
    `<section class=\"task-workspace\"><div class=\"task-workspace-head\"><div><span class=\"eyebrow\">SETOR ATUAL</span><h3><i class=\"fa ${sector.icon}\"></i> ${sector.title}</h3><p>${sector.desc}</p></div><button class=\"btn primary\" onclick=\"task('','${TASK_SECTOR}')\"><i class=\"fa fa-plus\"></i> Nova tarefa</button></div><div class=\"task-list-pro\">${cards||empty(`Nenhuma tarefa em ${sector.title}.`)}</div></section>`;
}
function moveTaskToSector(taskId,targetKey){
  const t=D.tasks.find(x=>x.id===taskId);if(!t)return toast('Tarefa não encontrada.');
  taskNormalize(t);
  const target=String(targetKey).toLowerCase().includes('produ')?'producao':'planejamento';
  const current=taskSectorKey(t);
  if(current===target)return toast('Esta tarefa já está neste setor.');
  const from=current==='producao'?'Produção':'Planejamento',to=target==='producao'?'Produção':'Planejamento';
  if(!confirm(`Enviar a tarefa \"${t.titulo||'Sem título'}\" de ${from} para ${to}?\n\nPrioridade, empresa, prazo e descrição serão mantidos.`))return;
  t.setor=target;t.sector=to;t.team=to;t.status='Pendente';t.feita=false;t.transferredAt=new Date().toISOString();t.transferredFrom=from;t.transferredTo=to;
  save();TASK_SECTOR=target;tarefas();toast(`Tarefa enviada para ${to}.`);
}
function sendTaskToPlanning(taskId){moveTaskToSector(taskId,'planejamento')}
function sendTaskToProduction(taskId){moveTaskToSector(taskId,'producao')}
function task(x='',setor=TASK_SECTOR){
  let t=D.tasks.find(a=>a.id===x)||{};if(t.id)taskNormalize(t);
  let current=t.id?taskSectorKey(t):(String(setor).toLowerCase().includes('produ')?'producao':'planejamento');
  modal(t.id?'Editar tarefa':'Nova tarefa',`<form id=\"f\" class=\"fg\">
    <div class=\"field span\"><label>Enviar tarefa para qual setor?</label><div class=\"task-sector-choice-inline\">
      <label class=\"move-check-chip\"><input type=\"radio\" name=\"setor\" value=\"planejamento\" ${current==='planejamento'?'checked':''}><span><i class=\"fa fa-lightbulb\"></i> Planejamento</span></label>
      <label class=\"move-check-chip\"><input type=\"radio\" name=\"setor\" value=\"producao\" ${current==='producao'?'checked':''}><span><i class=\"fa fa-clapperboard\"></i> Produção</span></label>
    </div><small class=\"move-check-help\">Produção pode pedir legenda/roteiro ao Planejamento e Planejamento pode enviar demandas de execução para Produção.</small></div>
    <div class=\"field span\"><label>Tarefa *</label><input name=\"titulo\" value=\"${e(t.titulo||'')}\" placeholder=\"Ex.: Criar as legendas dos Reels da Jacobina\"></div>
    <div class=\"field span\"><label>Empresa</label><select name=\"companyId\"><option value=\"\">Sem empresa específica</option>${[...D.companies].sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value=\"${c.id}\" ${t.companyId===c.id?'selected':''}>${e(c.nome)}</option>`).join('')}</select></div>
    <div class=\"field\"><label>Prazo</label><input type=\"date\" name=\"data\" value=\"${t.data||''}\"></div>
    <div class=\"field\"><label>Horário</label><input type=\"time\" name=\"hora\" value=\"${e(t.hora||'')}\"></div>
    <div class=\"field\"><label>Prioridade</label><select name=\"prioridade\">${MOVE_TASK_PRIORITIES.map(v=>`<option ${taskPriority(t)===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class=\"field span\"><label>Descrição / observações</label><textarea name=\"descricao\">${e(t.descricao||'')}</textarea></div>
  </form>`,()=>{
    const q=obj(document.getElementById('f'));if(!q.titulo)return toast('Informe a tarefa.');
    q.setor=q.setor==='producao'?'producao':'planejamento';q.sector=q.setor==='producao'?'Produção':'Planejamento';q.team=q.sector;q.priority=q.prioridade;q.feita=!!t.feita;q.title=q.titulo;q.desc=q.descricao||'';q.prazo=q.data||'';
    if(t.id)Object.assign(t,q);else D.tasks.unshift({...q,id:id(),status:'Pendente'});
    closeM();save();TASK_SECTOR=q.setor;tarefas();toast('Tarefa salva em '+q.sector+'.');
  });
}
function toggleTask(taskId){const t=D.tasks.find(x=>x.id===taskId);if(!t)return;taskNormalize(t);t.feita=!t.feita;t.status=t.feita?'Concluída':'Pendente';save();tarefas();toast(t.feita?'Tarefa concluída.':'Tarefa reaberta.');}
function deleteTask(taskId){const t=D.tasks.find(x=>x.id===taskId);if(!t)return;if(!confirm(`Excluir a tarefa \"${t.titulo||'Sem título'}\"?`))return;D.tasks=D.tasks.filter(x=>x.id!==taskId);save();tarefas();toast('Tarefa excluída.');}

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

function moveBoot(){
  try{injectMoveMultiCSS();injectMoveCalendarCSS();injectMoveCelebrationCSS();nav();render('home');applyAuthState();}
  catch(err){console.error('Erro ao iniciar painel',err);const t=document.getElementById('toast');if(t){t.textContent='Erro ao iniciar painel: '+err.message;t.style.display='block';}}
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',moveBoot);else moveBoot();
window.addEventListener('DOMContentLoaded',()=>{restoreLoginCache();});
