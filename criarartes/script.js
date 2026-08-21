/* ============================
   CONFIGURAÇÃO DO BACKEND
   Cole aqui a URL do Web App do Apps Script publicado.
   Ex.: https://script.google.com/macros/s/SEU_ID/exec
============================ */
const API_URL = 'https://script.google.com/macros/s/AKfycby9cUcQwX6C6ksb638Zx6HA_YdtKPLGjcpQxoU_DtcylX6NPrYZUN76fO2EfAFU8bis/exec';

const state = {
  format:'feed', zoom:1, images:[], records:[], currentIndex:0, selected:null,
  companies:[], currentCompany:null,
  analysisByImage:{}, layoutAssignments:{}, variantSeed:0,
  selectedElements:[], history:[], historyIndex:-1, historyLock:false,
  design:{elements:[]}
};

const $ = s => document.querySelector(s);
const stage = $('#stage');
const toast = msg => { const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); };
const uid = () => 'el_'+Math.random().toString(36).slice(2,9);

function canvasSize(){ return state.format==='story' ? {w:360,h:640,realW:1080,realH:1920} : {w:432,h:540,realW:1080,realH:1350}; }
function updateFormat(){
  state.format=$('#formatSelect').value;
  stage.className='stage '+(state.format==='story'?'story':'');
  autoCompose();
}


function showLoading(title='Carregando dados da empresa...',text='Aplicando identidade visual, logo, fontes e configurações do Brand Kit.'){
  const box=$('#appLoading'); if(!box)return;
  $('#loadingTitle').textContent=title;
  $('#loadingText').textContent=text;
  box.classList.remove('hidden');
}
function hideLoading(){
  const box=$('#appLoading'); if(!box)return;
  setTimeout(()=>box.classList.add('hidden'),180);
}
async function waitForStageAssets(){
  try{await document.fonts?.ready}catch(e){}
  const imgs=[...stage.querySelectorAll('img')];
  await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{
    img.addEventListener('load',r,{once:true});
    img.addEventListener('error',r,{once:true});
  })));
}

async function api(action, payload={}){
  if(!API_URL) return null;
  const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});
  if(!r.ok) throw new Error('Falha na API');
  return r.json();
}

async function loadCompanies(){
  showLoading('Carregando dados da empresa...','Buscando empresas, Brand Kits, logos, fontes e cores salvas.');
  try{
    const data=await api('listCompanies');
    state.companies=(data?.companies && data.companies.length) ? data.companies : localCompanies();
  }catch(e){
    state.companies=localCompanies();
    console.warn('API indisponível, usando dados locais.',e);
  }
  renderCompanies();
  hideLoading();
}



function demoCompanies(){return []}
function localCompanies(){try{return JSON.parse(localStorage.getItem('designflow_companies')||'[]')}catch(e){return []}}
function persistLocalCompanies(){localStorage.setItem('designflow_companies',JSON.stringify(state.companies))}

function renderCompanies(){
  const s=$('#companySelect'); s.innerHTML='<option value="">Selecione uma empresa cadastrada</option>'+state.companies.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}
async function selectCompany(){
  showLoading('Aplicando identidade da empresa...','Preparando logo, fontes, cores e contraste para a arte.');
  state.currentCompany=state.companies.find(c=>c.id===$('#companySelect').value)||null;
  const c=state.currentCompany;
  $('#brandName').textContent=c?.name||'Nenhuma empresa';
  $('#brandStyle').textContent=c?.style||'Cadastre uma empresa';
  $('#companyCurrentName').textContent=c?.name||'Nenhuma empresa selecionada';
  $('#companyCurrentMeta').textContent=c ? `${c.style||'Brand Kit'} • ${c.primary||'#ff4fa3'}` : 'Cadastre ou selecione uma marca';
  $('#companyCurrentDot').style.background=c?.primary||'#bbb';
  $('#palette').innerHTML=c?[c.primary,c.secondary,c.text,c.contrast].filter(Boolean).map(x=>`<div class="swatch" style="background:${x}" title="${x}"></div>`).join(''):'';
  try{await document.fonts?.ready}catch(e){}
  if(c?.logo){
    await new Promise(resolve=>{
      const im=new Image(); im.onload=im.onerror=resolve; im.src=c.logo;
    });
  }
  await autoCompose();
  hideLoading();
}

let companyLogoData='';
function normalizeHex(v,fallback='#ffffff'){v=String(v||'').trim();return /^#[0-9a-f]{6}$/i.test(v)?v:fallback}
function syncColorPair(colorId,textId){const c=$('#'+colorId),t=$('#'+textId);c.oninput=()=>t.value=c.value;t.oninput=()=>{const v=normalizeHex(t.value,c.value);if(/^#[0-9a-f]{6}$/i.test(t.value))c.value=v}}
['companyPrimary','companySecondary','companyText','companyContrast'].forEach(x=>syncColorPair(x+'Color',x+'Text'));
function resetCompanyForm(){
  $('#companyNameInput').value=''; $('#companyPrimaryColor').value=$('#companyPrimaryText').value='#00c217'; $('#companySecondaryColor').value=$('#companySecondaryText').value='#ffffff'; $('#companyTextColor').value=$('#companyTextText').value='#ffffff'; $('#companyContrastColor').value=$('#companyContrastText').value='#111827'; $('#companyStyleInput').value='Profissional / Clean'; $('#companyFontTitle').value='Inter'; $('#companyFontBody').value='Inter'; companyLogoData=''; $('#companyLogoPreview').hidden=true; $('#companyLogoPreview').src=''; $('#companyLogoHint').hidden=false; $('#companyModal').dataset.editId='';
}
function openCompanyModal(company=null){
  resetCompanyForm(); $('#companyModalTitle').textContent=company?'Editar empresa':'Cadastrar empresa';
  if(company){$('#companyModal').dataset.editId=company.id;$('#companyNameInput').value=company.name||'';$('#companyPrimaryColor').value=$('#companyPrimaryText').value=normalizeHex(company.primary,'#00c217');$('#companySecondaryColor').value=$('#companySecondaryText').value=normalizeHex(company.secondary,'#ffffff');$('#companyTextColor').value=$('#companyTextText').value=normalizeHex(company.text,'#ffffff');$('#companyContrastColor').value=$('#companyContrastText').value=normalizeHex(company.contrast,'#111827');$('#companyStyleInput').value=company.style||'Profissional / Clean';$('#companyFontTitle').value=company.fontTitle||'Inter';$('#companyFontBody').value=company.fontBody||'Inter';companyLogoData=company.logo||'';if(companyLogoData){$('#companyLogoPreview').src=companyLogoData;$('#companyLogoPreview').hidden=false;$('#companyLogoHint').hidden=true;}}
  $('#companyModal').classList.add('show'); setTimeout(()=>$('#companyNameInput').focus(),30);
}
function closeCompanyModal(){$('#companyModal').classList.remove('show')}
$('#btnNewCompany').onclick=()=>openCompanyModal();
$('#btnEditCompany').onclick=()=>{if(!state.currentCompany)return toast('Selecione uma empresa');openCompanyModal(state.currentCompany)};
$('#btnCloseCompany').onclick=$('#btnCancelCompany').onclick=closeCompanyModal; $('#btnResetCompany').onclick=resetCompanyForm;
$('#companyModal').addEventListener('click',e=>{if(e.target.id==='companyModal')closeCompanyModal()});
$('#companyLogoInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;companyLogoData=await fileToDataURL(f);$('#companyLogoPreview').src=companyLogoData;$('#companyLogoPreview').hidden=false;$('#companyLogoHint').hidden=true};
$('#btnSaveCompany').onclick=async()=>{
  const name=$('#companyNameInput').value.trim(); if(!name)return toast('Informe o nome da empresa');
  const editId=$('#companyModal').dataset.editId||'';
  const company={id:editId||('cmp_'+Date.now().toString(36)),name,primary:normalizeHex($('#companyPrimaryText').value,'#00c217'),secondary:normalizeHex($('#companySecondaryText').value,'#ffffff'),text:normalizeHex($('#companyTextText').value,'#ffffff'),contrast:normalizeHex($('#companyContrastText').value,'#111827'),fontTitle:$('#companyFontTitle').value,fontBody:$('#companyFontBody').value,style:$('#companyStyleInput').value,logo:companyLogoData};
  try{
    const r=await api('saveCompany',{company}); if(r?.ok&&r.company)Object.assign(company,r.company);
  }catch(e){console.warn(e)}
  const i=state.companies.findIndex(x=>x.id===company.id); if(i>=0)state.companies[i]=company;else state.companies.unshift(company); persistLocalCompanies(); renderCompanies(); $('#companySelect').value=company.id; selectCompany(); closeCompanyModal(); toast(editId?'Empresa atualizada':'Empresa cadastrada');
};
$('#btnDeleteCompany').onclick=async()=>{
  const c=state.currentCompany;if(!c)return toast('Selecione uma empresa');if(!confirm(`Excluir ${c.name}?`))return;
  try{await api('deleteCompany',{id:c.id})}catch(e){console.warn(e)}
  state.companies=state.companies.filter(x=>x.id!==c.id);persistLocalCompanies();state.currentCompany=null;renderCompanies();$('#companySelect').value='';selectCompany();toast('Empresa excluída');
};

$('#imageInput').addEventListener('change', async e=>{
  for(const f of [...e.target.files]){
    const data=await fileToDataURL(f); state.images.push({name:f.name,data});
  }
  renderAssets(); if(state.images[0]) setBackground(state.images[0].data);
});
function fileToDataURL(file){return new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file)});}
function renderAssets(){
  $('#assets').innerHTML=state.images.map((im,i)=>`<div class="asset" data-i="${i}"><img src="${im.data}"><span class="n">${String(i+1).padStart(2,'0')}</span><button class="remove" data-remove="${i}" title="Excluir imagem">×</button></div>`).join('');
  document.querySelectorAll('.asset').forEach(a=>a.onclick=e=>{if(e.target.closest('.remove'))return;state.currentIndex=+a.dataset.i;setBackground(state.images[state.currentIndex].data);if(state.records[state.currentIndex]) applyRecord(state.records[state.currentIndex]);});
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    const i=+b.dataset.remove;
    state.images.splice(i,1);
    if(state.currentIndex>=state.images.length)state.currentIndex=Math.max(0,state.images.length-1);
    renderAssets();
    if(state.images[state.currentIndex])setBackground(state.images[state.currentIndex].data);
    else{const bg=stage.querySelector('.bg');if(bg)bg.remove();}
    if(state.records[state.currentIndex])applyRecord(state.records[state.currentIndex]);else autoCompose();
    pushHistory();
  });
}
function setBackground(src){
  let bg=stage.querySelector('.bg');
  if(!bg){bg=document.createElement('img');bg.className='bg';stage.prepend(bg)}
  bg.src=src;
  bg.onload=()=>analyzeCurrentImage(true).then(()=>autoCompose());
}

$('#csvInput').addEventListener('change', async e=>{
  const text=await e.target.files[0].text(); state.records=parseCSV(text); toast(`${state.records.length} linhas importadas`); if(state.records[0]) applyRecord(state.records[0]);
});
function parseCSV(text){
  const lines=text.replace(/\r/g,'').split('\n').filter(Boolean); if(!lines.length)return[];
  const sep=lines[0].includes(';')?';':','; const headers=splitCSVLine(lines[0],sep).map(x=>x.trim().toLowerCase());
  return lines.slice(1).map(line=>{const vals=splitCSVLine(line,sep),o={};headers.forEach((h,i)=>o[h]=vals[i]||'');return o});
}
function splitCSVLine(line,sep){let out=[],cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===sep&&!q){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
function applyRecord(r){
  $('#titleInput').value=r.titulo||r.title||''; $('#subtitleInput').value=r.subtitulo||r.subtitle||''; $('#highlightInput').value=r.destaque||r.highlight||''; $('#ctaInput').value=r.cta||''; autoCompose();
}

function clearElements(){ stage.querySelectorAll('.el').forEach(e=>e.remove()); state.design.elements=[]; state.selected=null; state.selectedElements=[]; }
function addText(text, type, opts={}){
  const el=document.createElement('div');
  el.className='el text'; el.dataset.id=uid(); el.dataset.type=type; el.textContent=text;
  Object.assign(el.style,{
    left:(opts.x??30)+'px', top:(opts.y??30)+'px', width:(opts.w??300)+'px',
    fontFamily:opts.fontFamily||'Inter', fontSize:(opts.size||30)+'px', fontWeight:opts.weight||'700',
    color:opts.color||'#fff', textAlign:opts.align||'left', letterSpacing:(opts.letterSpacing||0)+'px',
    lineHeight:String(opts.lineHeight||1.08), overflowWrap:'break-word', wordBreak:'normal',
    textShadow:opts.shadow||'0 2px 14px rgba(0,0,0,.28)'
  });
  if(type==='title') el.style.textWrap='balance';
  el.innerHTML=escapeHTML(text).replace(/\n/g,'<br>')+'<span class="handle"></span>';
  stage.appendChild(el); makeInteractive(el); state.design.elements.push(el); return el;
}
function addShape(opts={}){const el=document.createElement('div');el.className='el';el.dataset.id=uid();el.dataset.type='shape';Object.assign(el.style,{left:(opts.x||20)+'px',top:(opts.y||20)+'px',width:(opts.w||120)+'px',height:(opts.h||48)+'px',background:opts.bg||'#7c5cff',borderRadius:(opts.radius||12)+'px',opacity:opts.opacity??.9});el.innerHTML='<span class="handle"></span>';stage.appendChild(el);makeInteractive(el);state.design.elements.push(el);return el}
function escapeHTML(s){return String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}


/* =========================================================
   MOTOR V4 — LEITURA DA FOTO / PROTEÇÃO DO ASSUNTO PRINCIPAL
   Usa FaceDetector quando disponível e, como fallback, mede
   complexidade visual por regiões para procurar áreas "limpas".
========================================================= */
function currentImageKey(){
  return state.images[state.currentIndex]?.name || stage.querySelector('.bg')?.src || ('idx_'+state.currentIndex);
}
function rectsOverlap(a,b){
  return !(a.x+a.w<=b.x || b.x+b.w<=a.x || a.y+a.h<=b.y || b.y+b.h<=a.y);
}
function zoneRect(zone,w,h){
  const m=18;
  const map={
    left:{x:m,y:m,w:w*.48-m,h:h-2*m},
    right:{x:w*.52,y:m,w:w*.48-m,h:h-2*m},
    top:{x:m,y:m,w:w-2*m,h:h*.42},
    bottom:{x:m,y:h*.56,w:w-2*m,h:h*.44-m},
    center:{x:w*.20,y:h*.23,w:w*.60,h:h*.54},
    tl:{x:m,y:m,w:w*.46,h:h*.44},
    tr:{x:w*.54,y:m,w:w*.46-m,h:h*.44},
    bl:{x:m,y:h*.56,w:w*.46,h:h*.44-m},
    br:{x:w*.54,y:h*.56,w:w*.46-m,h:h*.44-m}
  };
  return map[zone]||map.center;
}
function imageCoverTransform(iw,ih,w,h){
  const scale=Math.max(w/iw,h/ih);
  return {scale,ox:(w-iw*scale)/2,oy:(h-ih*scale)/2};
}
async function analyzeCurrentImage(force=false){
  const bg=stage.querySelector('.bg');
  if(!bg?.src) return null;
  const key=currentImageKey();
  if(!force && state.analysisByImage[key]) return state.analysisByImage[key];
  const {w,h}=canvasSize();
  const img=new Image();
  img.src=bg.src;
  try{ await img.decode(); }catch(e){ await new Promise(r=>img.onload=r); }

  const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  const cx=cv.getContext('2d',{willReadFrequently:true});
  const tr=imageCoverTransform(img.naturalWidth,img.naturalHeight,w,h);
  cx.drawImage(img,tr.ox,tr.oy,img.naturalWidth*tr.scale,img.naturalHeight*tr.scale);

  const zones=['left','right','top','bottom','center','tl','tr','bl','br'];
  const energy={};
  zones.forEach(z=>{
    const r=zoneRect(z,w,h);
    const sx=Math.max(0,Math.floor(r.x)), sy=Math.max(0,Math.floor(r.y));
    const sw=Math.max(1,Math.floor(Math.min(w-sx,r.w))), sh=Math.max(1,Math.floor(Math.min(h-sy,r.h)));
    const data=cx.getImageData(sx,sy,sw,sh).data;
    let n=0,sum=0,sum2=0,edges=0,prev=null;
    const step=Math.max(4,Math.floor((sw*sh)/5000))*4;
    for(let i=0;i<data.length;i+=step){
      const lum=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];
      sum+=lum;sum2+=lum*lum;n++;
      if(prev!==null)edges+=Math.abs(lum-prev);
      prev=lum;
    }
    const variance=Math.max(0,(sum2/n)-(sum/n)*(sum/n));
    energy[z]=Math.sqrt(variance)+(edges/Math.max(1,n))*0.55;
  });

  let faces=[];
  if('FaceDetector' in window){
    try{
      const detector=new FaceDetector({fastMode:true,maxDetectedFaces:6});
      const found=await detector.detect(img);
      faces=found.map(f=>{
        const b=f.boundingBox;
        return {x:tr.ox+b.x*tr.scale,y:tr.oy+b.y*tr.scale,w:b.width*tr.scale,h:b.height*tr.scale};
      }).filter(r=>r.x+r.w>0&&r.y+r.h>0&&r.x<w&&r.y<h);
    }catch(e){ console.warn('FaceDetector indisponível:',e); }
  }

  const analysis={energy,faces,w,h};
  state.analysisByImage[key]=analysis;
  const label=faces.length ? `${faces.length} rosto${faces.length>1?'s':''} protegido${faces.length>1?'s':''}` : 'Área limpa analisada';
  const st=$('#analysisStatus'); if(st)st.textContent=label;
  return analysis;
}
function zoneConflict(zone,analysis){
  if(!analysis)return 0;
  const r=zoneRect(zone,analysis.w,analysis.h);
  let score=analysis.energy[zone]||analysis.energy.center||0;
  for(const f of analysis.faces||[]){
    if(rectsOverlap(r,{x:f.x-f.w*.25,y:f.y-f.h*.35,w:f.w*1.5,h:f.h*1.7})) score+=10000;
  }
  return score;
}
function bestSide(analysis){
  return zoneConflict('left',analysis)<=zoneConflict('right',analysis)?'left':'right';
}
function bestVertical(analysis){
  return zoneConflict('top',analysis)<=zoneConflict('bottom',analysis)?'top':'bottom';
}
function layoutZone(layout){
  if(['left','glass-left','split-left'].includes(layout))return'left';
  if(['right','glass-right','split-right'].includes(layout))return'right';
  if(layout==='top-left')return'tl';
  if(layout==='top-right')return'tr';
  if(['bottom','card','ribbon'].includes(layout))return'bottom';
  if(layout==='poster'||layout==='center'||layout==='minimal'||layout==='diagonal')return'center';
  return'center';
}


/* ====================== LOGO INTELIGENTE ====================== */
function addSmartLogo(contentBounds,analysis,model=null){
  const c=state.currentCompany||{}; if(!c.logo)return null;
  const {w,h}=canvasSize(), area=safeArea();
  const logoW=clamp(w*(state.format==='story'?.25:.22),78,118), logoH=state.format==='story'?54:48;
  const gap=16, pad=10;
  const textRects=[...stage.querySelectorAll('.el.text')].map(e=>({
    x:parseFloat(e.style.left||0)-gap,y:parseFloat(e.style.top||0)-gap,
    w:e.offsetWidth+gap*2,h:e.offsetHeight+gap*2
  }));
  const shapeRects=[...stage.querySelectorAll('.el')].filter(e=>e.dataset.type==='shape').map(e=>({
    x:parseFloat(e.style.left||0)-4,y:parseFloat(e.style.top||0)-4,w:e.offsetWidth+8,h:e.offsetHeight+8
  }));
  const xs=[area.left,(w-logoW)/2,w-area.right-logoW];
  const ys=[area.top,h*.16,h*.42,h*.66,h-area.bottom-logoH];
  const candidates=[];
  xs.forEach((x,xi)=>ys.forEach((y,yi)=>candidates.push({x,y,name:`grid-${xi}-${yi}`})));
  if(contentBounds){
    candidates.unshift(
      {x:contentBounds.x,y:Math.max(area.top,contentBounds.y-logoH-gap),name:'aligned-top'},
      {x:contentBounds.x+contentBounds.w-logoW,y:Math.max(area.top,contentBounds.y-logoH-gap),name:'aligned-top-r'},
      {x:contentBounds.x,y:Math.min(h-area.bottom-logoH,contentBounds.y+contentBounds.h+gap),name:'aligned-bottom'},
      {x:contentBounds.x+contentBounds.w-logoW,y:Math.min(h-area.bottom-logoH,contentBounds.y+contentBounds.h+gap),name:'aligned-bottom-r'}
    );
  }
  const scorePos=p=>{
    const r={x:p.x-pad,y:p.y-pad,w:logoW+pad*2,h:logoH+pad*2}; let score=0;
    // Texto é área proibida absoluta: logo nunca deve encostar no copy.
    textRects.forEach(t=>{if(rectsOverlap(r,t))score+=100000;});
    // Evita também CTA/faixas pequenas quando possível.
    shapeRects.forEach(t=>{if(rectsOverlap(r,t))score+=2200;});
    for(const f of analysis?.faces||[]){
      const face={x:f.x-f.w*.40,y:f.y-f.h*.50,w:f.w*1.8,h:f.h*2};
      if(rectsOverlap(r,face))score+=80000;
    }
    const cx=p.x+logoW/2,cy=p.y+logoH/2;
    const zone=cx<w/2?(cy<h/2?'tl':'bl'):(cy<h/2?'tr':'br');
    score+=(analysis?.energy?.[zone]||0)*1.5;
    if(model?.logoStrategy==='aligned'&&p.name.startsWith('aligned'))score-=80;
    if(model?.logoStrategy==='opposite'&&contentBounds){
      const cc=contentBounds.x+contentBounds.w/2;
      if((cc<w/2&&cx>w/2)||(cc>w/2&&cx<w/2))score-=90;
    }
    return score;
  };
  const ranked=candidates.map(p=>({p,score:scorePos(p)})).sort((a,b)=>a.score-b.score);
  let pos=ranked[0]?.p||{x:area.left,y:area.top};
  // Se todas as posições colidirem, reduz a logo e ainda escolhe a área de menor conflito.
  const el=document.createElement('div'); el.className='el logo-mark'; el.dataset.id=uid();el.dataset.type='logo';
  Object.assign(el.style,{left:Math.round(pos.x)+'px',top:Math.round(pos.y)+'px',width:logoW+'px',height:logoH+'px'});
  const im=document.createElement('img');
  im.alt=c.name||'Logo';
  im.style.width='auto';
  im.style.height='auto';
  im.style.maxWidth='100%';
  im.style.maxHeight='100%';
  im.style.objectFit='contain';

  im.onload=()=>{
    const nw=im.naturalWidth||1, nh=im.naturalHeight||1;
    const ratio=nw/nh;

    // Mantém a largura prevista pelo motor, mas calcula a altura pela proporção real.
    // Se ficar alto demais, limita pela altura máxima e recalcula a largura.
    let finalW=logoW;
    let finalH=finalW/ratio;
    const maxH=state.format==='story'?64:56;

    if(finalH>maxH){
      finalH=maxH;
      finalW=finalH*ratio;
    }

    // Proteção extra para logos muito horizontais/verticais.
    finalW=clamp(finalW,58,Math.min(logoW,132));
    finalH=clamp(finalH,22,maxH);

    el.style.width=Math.round(finalW)+'px';
    el.style.height=Math.round(finalH)+'px';
  };

  im.src=c.logo;
  el.appendChild(im);
  stage.appendChild(el);
  makeInteractive(el);
  state.design.elements.push(el);
  return el;
}

/* =========================================================
   MOTOR V4 DE COMPOSIÇÃO RESPONSIVA
   - mede a altura real de cada texto
   - mantém título/subtítulo/CTA como um único grupo visual
   - reduz tipografia quando necessário
   - respeita safe areas e espaçamentos proporcionais
========================================================= */
function textHeight(el){ return Math.ceil(el.scrollHeight || el.getBoundingClientRect().height || 0); }
function setY(el,y){ el.style.top=Math.round(y)+'px'; }
function safeArea(){
  const {h}=canvasSize();
  return state.format==='story'
    ? {top:44,bottom:54,left:26,right:26}
    : {top:30,bottom:34,left:30,right:30};
}
function hexToRgba(hex,alpha){
  const v=normalizeHex(hex,'#111827').slice(1);
  const n=parseInt(v,16);
  const r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  return `rgba(${r},${g},${b},${alpha})`;
}
function contrastColor(alpha=.72){
  return hexToRgba(state.currentCompany?.contrast||'#111827',alpha);
}
function brandFonts(){
  const c=state.currentCompany||{};
  return {title:c.fontTitle||'Inter', body:c.fontBody||c.fontTitle||'Inter'};
}
function applyBrandTypography(){
  const f=brandFonts();
  // Todos os textos auxiliares seguem a fonte de corpo da empresa.
  stage.querySelectorAll('.el.text').forEach(el=>{
    if(el.dataset.type==='title') el.style.fontFamily=f.title;
    else el.style.fontFamily=f.body;
  });
}
function responsiveType(){
  return state.format==='story'
    ? {title:46,titleMin:29,sub:18,subMin:13,hi:11,cta:13,gapHi:11,gapTitle:16,gapSub:24,ctaH:40}
    : {title:43,titleMin:27,sub:17,subMin:12,hi:10.5,cta:12,gapHi:10,gapTitle:14,gapSub:21,ctaH:38};
}
function initialTitleSize(text,max){
  const len=String(text||'').trim().length;
  let s=max;
  if(len>105)s-=13; else if(len>78)s-=9; else if(len>55)s-=5; else if(len>34)s-=2;
  return s;
}
function blockPosition(mode,total,area,h){
  const minY=area.top, maxY=h-area.bottom-total;
  if(mode==='bottom') return Math.max(minY,maxY);
  if(mode==='center') return clamp((h-total)/2,minY,maxY);
  if(mode==='upper') return clamp(h*.20,minY,maxY);
  if(mode==='lower') return clamp(h*.50,minY,maxY);
  return clamp(h*.28,minY,maxY);
}
function createResponsiveBlock(cfg){
  const {w,h}=canvasSize(); const area=safeArea(); const type=responsiveType();
  const c=state.currentCompany||{};
  const primary=cfg.primary||c.primary||'#7c5cff', textColor=c.text||'#ffffff';
  const fontTitle=c.fontTitle||'Inter', fontBody=c.fontBody||'Inter';
  const width=Math.min(cfg.width,w-area.left-area.right);
  const x=clamp(cfg.x,area.left,w-area.right-width);
  const els=[];
  let titleSize=initialTitleSize(cfg.title,cfg.titleMax||type.title), subSize=cfg.subSize||type.sub;
  let gapHi=type.gapHi, gapTitle=type.gapTitle, gapSub=type.gapSub;

  const hi=cfg.hi ? addText(cfg.hi,'highlight',{x,y:0,w:width,size:type.hi,weight:'850',color:primary,letterSpacing:1.25,fontFamily:fontBody,align:cfg.align,lineHeight:1.15,shadow:'0 1px 9px rgba(0,0,0,.32)'}) : null;
  const title=addText(cfg.title,'title',{x,y:0,w:width,size:titleSize,weight:'900',color:textColor,fontFamily:fontTitle,align:cfg.align,lineHeight:1.02,letterSpacing:-.45,shadow:'0 3px 18px rgba(0,0,0,.34)'});
  const sub=cfg.sub ? addText(cfg.sub,'subtitle',{x,y:0,w:width,size:subSize,weight:'500',color:'rgba(255,255,255,.94)',fontFamily:fontBody,align:cfg.align,lineHeight:1.30,shadow:'0 2px 12px rgba(0,0,0,.32)'}) : null;
  if(hi) els.push(hi); els.push(title); if(sub) els.push(sub);

  const maxHeight=cfg.maxHeight || (h-area.top-area.bottom);
  const ctaH=cfg.cta ? type.ctaH : 0;
  const ctaGap=cfg.cta ? gapSub : 0;
  let heights,total;
  function measure(){
    heights={hi:hi?textHeight(hi):0,title:textHeight(title),sub:sub?textHeight(sub):0};
    total=heights.title + (hi?heights.hi+gapHi:0) + (sub?heights.sub+gapTitle:0) + (cfg.cta?ctaGap+ctaH:0);
    return total;
  }
  measure();
  let guard=0;
  while(total>maxHeight && guard++<30){
    if(titleSize>type.titleMin){ titleSize=Math.max(type.titleMin,titleSize-1.5); title.style.fontSize=titleSize+'px'; }
    if(sub && subSize>type.subMin && guard%2===0){ subSize=Math.max(type.subMin,subSize-.7); sub.style.fontSize=subSize+'px'; }
    if(gapTitle>8) gapTitle-=.5;
    if(gapSub>12) gapSub-=.5;
    if(gapHi>6) gapHi-=.25;
    measure();
  }

  let y=blockPosition(cfg.position||'bottom',total,area,h);
  if(hi){ setY(hi,y); y+=heights.hi+gapHi; }
  setY(title,y); y+=heights.title;
  if(sub){ y+=gapTitle; setY(sub,y); y+=heights.sub; }

  let ctaShape=null,ctaText=null;
  if(cfg.cta){
    y+=ctaGap;
    const ctaW=clamp(82+cfg.cta.length*4.8,112,Math.min(width*.78,210));
    let ctaX=x;
    if(cfg.align==='center') ctaX=x+(width-ctaW)/2;
    if(cfg.align==='right') ctaX=x+width-ctaW;
    ctaShape=addShape({x:ctaX,y,w:ctaW,h:ctaH,bg:primary,radius:ctaH/2,opacity:.98});
    ctaShape.style.boxShadow='0 8px 24px rgba(0,0,0,.18)';
    ctaText=addText(cfg.cta,'cta',{x:ctaX+10,y:y+(ctaH-(type.cta*1.1))/2-1,w:ctaW-20,size:type.cta,weight:'800',fontFamily:fontBody,align:'center',lineHeight:1.1,shadow:'none'}); ctaText.style.height=ctaH+'px'; ctaText.style.top=y+'px'; ctaText.style.display='flex'; ctaText.style.alignItems='center'; ctaText.style.justifyContent='center';
    els.push(ctaShape,ctaText);
  }

  // Validação final: nenhum elemento textual pode ultrapassar a safe area inferior.
  let maxBottom=Math.max(...els.map(e=>parseFloat(e.style.top||0)+(e.offsetHeight||parseFloat(e.style.height)||0)));
  const overflow=maxBottom-(h-area.bottom);
  if(overflow>0){
    els.forEach(e=>{ const top=parseFloat(e.style.top||0); e.style.top=Math.max(area.top,top-overflow)+'px'; });
  }
  return {elements:els,x,width,total};
}



/* =========================================================
   MOTOR V11 — 100 MODELOS INTERNOS
   O CSV fornece apenas conteúdo. A direção de arte é do painel.
   Em lote, cada arte recebe um modelo diferente enquanto houver
   modelos seguros disponíveis. A foto continua sendo analisada.
========================================================= */
function creativeModels(){
  /* 100 composições: 25 famílias-base × 4 direções de arte.
     As variações mudam escala, largura, contraste, acento e tratamento de cor,
     mantendo o mesmo motor responsivo e a proteção do assunto principal. */
  const bases=[
    ['bottom','Headline inferior','bottom','left','bottom',.86,42,.46,'bottom-gradient','minimal'],
    ['left','Editorial esquerdo','left','left','center',.57,44,.72,'left-gradient','clean'],
    ['right','Editorial direito','right','right','center',.57,44,.72,'right-gradient','clean'],
    ['center','Central premium','center','center','center',.74,45,.56,'center-darken','premium'],
    ['card','Card translúcido inferior','bottom','left','lower',.82,38,.46,'bottom-gradient','glass-card'],
    ['top-left','Superior esquerdo','tl','left','upper',.58,42,.48,'top-left-gradient','minimal'],
    ['top-right','Superior direito','tr','right','upper',.58,42,.48,'top-right-gradient','minimal'],
    ['glass-left','Glass esquerdo','left','left','center',.59,39,.56,'left-gradient','glass-card'],
    ['glass-right','Glass direito','right','right','center',.59,39,.56,'right-gradient','glass-card'],
    ['split-left','Painel lateral esquerdo','left','left','center',.45,38,.72,'split-left','solid-band'],
    ['split-right','Painel lateral direito','right','right','center',.45,38,.72,'split-right','solid-band'],
    ['poster-left','Poster editorial esquerdo','left','left','center',.68,50,.58,'left-gradient','vertical-accent'],
    ['poster-right','Poster editorial direito','right','right','center',.68,50,.58,'right-gradient','vertical-accent-right'],
    ['bottom-center','Impacto inferior central','bottom','center','bottom',.82,44,.44,'bottom-gradient','premium'],
    ['top-center','Impacto superior central','top','center','upper',.78,43,.44,'top-gradient','premium'],
    ['lower-left','Bloco inferior esquerdo','bl','left','bottom',.57,40,.46,'bottom-left-gradient','minimal'],
    ['lower-right','Bloco inferior direito','br','right','bottom',.57,40,.46,'bottom-right-gradient','minimal'],
    ['upper-left','Bloco alto esquerdo','tl','left','upper',.54,39,.46,'top-left-gradient','horizontal-accent'],
    ['upper-right','Bloco alto direito','tr','right','upper',.54,39,.46,'top-right-gradient','horizontal-accent-right'],
    ['minimal-left','Minimal esquerdo','left','left','center',.52,37,.46,'soft-darken','minimal-dot'],
    ['minimal-right','Minimal direito','right','right','center',.52,37,.46,'soft-darken','minimal-dot-right'],
    ['ribbon-left','Faixa editorial esquerda','bottom','left','bottom',.80,38,.36,'bottom-gradient','horizontal-band'],
    ['ribbon-right','Faixa editorial direita','bottom','right','bottom',.80,38,.36,'bottom-gradient','horizontal-band-right'],
    ['diagonal-left','Diagonal esquerda','bottom','left','bottom',.76,39,.38,'bottom-gradient','diagonal-band'],
    ['diagonal-right','Diagonal direita','bottom','right','bottom',.76,39,.38,'bottom-gradient','diagonal-band-right']
  ];
  const moods=[
    {key:'clean',label:'Clean',width:0,title:0,height:0,tint:.00,accent:'primary'},
    {key:'bold',label:'Bold',width:.035,title:4,height:.035,tint:.08,accent:'secondary'},
    {key:'air',label:'Air',width:-.045,title:-3,height:-.025,tint:-.05,accent:'primary'},
    {key:'brand',label:'Brand',width:.015,title:1,height:.015,tint:.14,accent:'mixed'}
  ];
  const out=[];
  bases.forEach((b,bi)=>moods.forEach((v,vi)=>{
    const [slug,name,contentZone,preferredAlign,preferredPosition,widthRatio,titleMax,maxHeightRatio,overlayType,decorativeStyle]=b;
    out.push({
      slug:`${slug}-${v.key}`, name:`${name} • ${v.label}`,
      familySlug:slug, contentZone, preferredAlign, preferredPosition,
      widthRatio:clamp(widthRatio+v.width,.42,.91), titleMax:titleMax+v.title,
      maxHeightRatio:clamp(maxHeightRatio+v.height,.34,.76), overlayType, decorativeStyle,
      colorMood:v.key, tintStrength:v.tint, accentMode:v.accent,
      logoStrategy:(bi+vi)%3===0?'opposite':((bi+vi)%3===1?'aligned':'smart'),
      artIndex:bi*4+vi+1
    });
  }));
  return out.slice(0,100);
}
function modelBySlug(slug){const ms=creativeModels();return ms.find(m=>m.slug===slug)||ms.find(m=>m.familySlug===slug)||null}
function modelConflict(model,analysis){
  if(!analysis)return 0;
  let z=model.contentZone||'center';
  // bottom-center etc. score through their actual protected zone.
  let score=zoneConflict(z,analysis);
  // Mild penalty for very busy center-heavy models.
  if(z==='center') score+=8;
  return score;
}
function usedModelSlugsBeforeCurrent(){
  const used=[];
  for(let i=0;i<state.currentIndex;i++){
    const k='batch_'+i+'_'+state.variantSeed;
    if(state.layoutAssignments[k])used.push(state.layoutAssignments[k]);
  }
  return used;
}
function chooseCreativeModel(analysis){
  const manual=$('#layoutSelect').value;
  if(manual!=='auto')return modelBySlug(manual)||creativeModels()[0];

  const models=creativeModels();
  const avoidRepeat=$('#randomBatch')?.checked!==false;
  const used=avoidRepeat?usedModelSlugsBeforeCurrent():[];
  let candidates=models.filter(m=>!used.includes(m.slug));
  if(!candidates.length)candidates=models.slice();

  const ranked=candidates.map(m=>({m,score:modelConflict(m,analysis)}))
    .sort((a,b)=>a.score-b.score);

  // Never deliberately choose a model covering a detected face when safer models exist.
  const safe=ranked.filter(x=>x.score<9000);
  const pool=(safe.length?safe:ranked).slice(0,Math.min(6,(safe.length?safe:ranked).length));

  // Deterministic variety by image index + variant seed, but among the safest choices.
  const pick=pool[(state.currentIndex+state.variantSeed)%pool.length]?.m || ranked[0]?.m || models[0];
  state.layoutAssignments['batch_'+state.currentIndex+'_'+state.variantSeed]=pick.slug;
  return pick;
}

function resolveModelPlacement(model,analysis){
  const {w,h}=canvasSize(), area=safeArea();
  let zone=model?.contentZone||'center';
  if(zone==='smart'){
    const side=bestSide(analysis);
    const vertical=bestVertical(analysis);
    zone=side==='left'?(vertical==='top'?'tl':'left'):(vertical==='top'?'tr':'right');
  }

  const width=clamp(w*Number(model?.widthRatio||.70),w*.42,w-area.left-area.right);
  let x=area.left, align=model?.preferredAlign||'left', position=model?.preferredPosition||'center';

  if(align==='smart')align=(zone==='right'||zone==='tr'||zone==='br')?'right':'left';
  if(position==='smart')position=(zone==='top'||zone==='tl'||zone==='tr')?'upper':((zone==='bottom'||zone==='bl'||zone==='br')?'bottom':'center');

  if(zone==='right'||zone==='tr'||zone==='br') x=w-area.right-width;
  else if(zone==='center'||zone==='top'||zone==='bottom') x=(w-width)/2;
  else x=area.left;

  return {zone,x,width,align,position};
}
function brandPalette(){
  const c=state.currentCompany||{};
  return {primary:c.primary||'#7c5cff',secondary:c.secondary||'#ffffff',text:c.text||'#ffffff',contrast:c.contrast||'#111827'};
}
function mixHex(a,b,t=.5){
  const A=normalizeHex(a,'#000000').slice(1),B=normalizeHex(b,'#ffffff').slice(1);
  const ar=parseInt(A.slice(0,2),16),ag=parseInt(A.slice(2,4),16),ab=parseInt(A.slice(4,6),16);
  const br=parseInt(B.slice(0,2),16),bg=parseInt(B.slice(2,4),16),bb=parseInt(B.slice(4,6),16);
  const h=n=>Math.round(n).toString(16).padStart(2,'0');
  return '#'+h(ar+(br-ar)*t)+h(ag+(bg-ag)*t)+h(ab+(bb-ab)*t);
}
function modelAccent(model){
  const p=brandPalette();
  if(model?.accentMode==='secondary')return p.secondary;
  if(model?.accentMode==='mixed')return mixHex(p.primary,p.secondary,.34);
  return p.primary;
}
function modelContrast(model,alpha=.72){
  const p=brandPalette();
  const mood=model?.colorMood||'clean';
  let base=p.contrast;
  if(mood==='brand')base=mixHex(p.contrast,p.primary,.28);
  if(mood==='bold')base=mixHex(p.contrast,p.primary,.14);
  if(mood==='air')alpha=Math.max(.08,alpha-.10);
  return hexToRgba(base,clamp(alpha+(model?.tintStrength||0),.02,.94));
}
function applyOverlayFromModel(model){
  const type=model?.overlayType||'soft-darken';
  let o=stage.querySelector('.overlay'); if(!o)return;
  const c=(a)=>modelContrast(model,a);
  const map={
    'bottom-gradient':`linear-gradient(180deg,${c(.02)},${c(.08)} 42%,${c(.82)} 100%)`,
    'left-gradient':`linear-gradient(90deg,${c(.70)},${c(.10)} 74%)`,
    'right-gradient':`linear-gradient(270deg,${c(.70)},${c(.10)} 74%)`,
    'center-darken':`linear-gradient(180deg,${c(.28)},${c(.38)})`,
    'soft-darken':`linear-gradient(180deg,${c(.12)},${c(.22)})`,
    'split-left':`linear-gradient(90deg,${c(.72)},${c(.18)} 55%,${c(.05)})`,
    'split-right':`linear-gradient(270deg,${c(.72)},${c(.18)} 55%,${c(.05)})`,
    'top-gradient':`linear-gradient(180deg,${c(.72)},${c(.12)} 48%,${c(.02)})`,
    'bottom-left-gradient':`linear-gradient(145deg,${c(.08)} 20%,${c(.10)} 44%,${c(.76)} 100%)`,
    'bottom-right-gradient':`linear-gradient(215deg,${c(.08)} 20%,${c(.10)} 44%,${c(.76)} 100%)`,
    'top-left-gradient':`linear-gradient(35deg,${c(.05)} 38%,${c(.68)} 100%)`,
    'top-right-gradient':`linear-gradient(325deg,${c(.05)} 38%,${c(.68)} 100%)`
  };
  o.style.background=map[type]||map['soft-darken'];
}
function addDecorationForModel(model,placement){
  const {w,h}=canvasSize(), area=safeArea();
  const c=state.currentCompany||{};
  const primary=modelAccent(model);
  const style=model?.decorativeStyle||'minimal';

  if(style==='glass-card'){
    const cardW=Math.min(w*.64,placement.width+34);
    const left=placement.x < w/2;
    const cardX=left?Math.max(area.left-6,placement.x-16):Math.min(w-area.right-cardW,placement.x-16);
    const cardY=h*.20, cardH=h*.60;
    const glass=addShape({x:cardX,y:cardY,w:cardW,h:cardH,bg:modelContrast(model,.55),radius:22,opacity:1});
    glass.style.backdropFilter='blur(14px)';
    glass.style.border='1px solid rgba(255,255,255,.13)';
  }else if(style==='solid-band'){
    const left=placement.x<w/2, bandW=w*.50, bandX=left?0:w-bandW;
    const band=addShape({x:bandX,y:0,w:bandW,h,bg:modelContrast(model,.82),radius:0,opacity:1});
    band.style.backdropFilter='blur(8px)';
  }else if(style==='vertical-accent'){
    addShape({x:area.left,y:h*.18,w:8,h:h*.42,bg:primary,radius:8,opacity:1});
  }else if(style==='horizontal-band'){
    const ribbonY=h*.60;
    const ribbon=addShape({x:0,y:ribbonY,w,h:h*.40,bg:modelContrast(model,.78),radius:0,opacity:1});
    ribbon.style.backdropFilter='blur(8px)';
    addShape({x:0,y:ribbonY,w:9,h:h*.40,bg:primary,radius:0,opacity:1});
  }else if(style==='diagonal-band'){
    const deco=addShape({x:-w*.12,y:h*.58,w:w*1.24,h:h*.34,bg:modelContrast(model,.72),radius:24,opacity:1});
    deco.style.transform='rotate(-5deg)'; deco.style.transformOrigin='center';
  }else if(style==='premium'){
    const line=addShape({x:(w-72)/2,y:h*.22,w:72,h:3,bg:primary,radius:3,opacity:1});
  }else if(style==='vertical-accent-right'){
    addShape({x:w-area.right-8,y:h*.18,w:8,h:h*.42,bg:primary,radius:8,opacity:1});
  }else if(style==='horizontal-accent'){
    addShape({x:area.left,y:h*.16,w:74,h:4,bg:primary,radius:4,opacity:1});
  }else if(style==='horizontal-accent-right'){
    addShape({x:w-area.right-74,y:h*.16,w:74,h:4,bg:primary,radius:4,opacity:1});
  }else if(style==='minimal-dot'){
    addShape({x:area.left,y:h*.46,w:10,h:10,bg:primary,radius:10,opacity:1});
  }else if(style==='minimal-dot-right'){
    addShape({x:w-area.right-10,y:h*.46,w:10,h:10,bg:primary,radius:10,opacity:1});
  }else if(style==='horizontal-band-right'){
    const ribbonY=h*.60;
    const ribbon=addShape({x:0,y:ribbonY,w,h:h*.40,bg:modelContrast(model,.78),radius:0,opacity:1});
    ribbon.style.backdropFilter='blur(8px)';
    addShape({x:w-9,y:ribbonY,w:9,h:h*.40,bg:primary,radius:0,opacity:1});
  }else if(style==='diagonal-band-right'){
    const deco=addShape({x:-w*.12,y:h*.58,w:w*1.24,h:h*.34,bg:modelContrast(model,.72),radius:24,opacity:1});
    deco.style.transform='rotate(5deg)'; deco.style.transformOrigin='center';
  }
}
function renderModel(model,{title,sub,hi,cta,analysis}){
  const {h}=canvasSize();
  const placement=resolveModelPlacement(model,analysis);
  applyOverlayFromModel(model);
  addDecorationForModel(model,placement);

  const block=createResponsiveBlock({
    x:placement.x,
    y:0,
    width:placement.width,
    title,sub,hi,cta,
    align:placement.align,
    position:placement.position,
    maxHeight:h*Number(model?.maxHeightRatio||.55),
    titleMax:Number(model?.titleMax||40),
    primary:modelAccent(model)
  });
  return block;
}

async function autoCompose(){
  clearElements();
  const analysis=await analyzeCurrentImage();
  const model=chooseCreativeModel(analysis);

  const title=$('#titleInput').value.trim()||'Título principal';
  const sub=$('#subtitleInput').value.trim();
  const hi=$('#highlightInput').value.trim();
  const cta=$('#ctaInput').value.trim();

  const block=renderModel(model,{title,sub,hi,cta,analysis});
  const contentRectFromBlock=(b)=>b?{
    x:b.x-8,
    y:Math.min(...b.elements.map(e=>parseFloat(e.style.top||0)))-8,
    w:b.width+16,
    h:b.total+24
  }:null;

  applyBrandTypography();
  addSmartLogo(contentRectFromBlock(block),analysis,model);

  const status=$('#analysisStatus');
  if(status) status.textContent=(status.textContent||'')+' • '+model.name;
}
function ensureOverlay(layout){
  let o=stage.querySelector('.overlay'); if(!o)return;
  if(['bottom','card','ribbon','diagonal'].includes(layout))
    o.style.background='linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.08) 42%,rgba(0,0,0,.82) 100%)';
  else if(['left','glass-left','split-left','top-left'].includes(layout))
    o.style.background='linear-gradient(90deg,rgba(0,0,0,.70),rgba(0,0,0,.10) 74%)';
  else if(['right','glass-right','split-right','top-right'].includes(layout))
    o.style.background='linear-gradient(270deg,rgba(0,0,0,.70),rgba(0,0,0,.10) 74%)';
  else if(layout==='minimal') o.style.background='linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.22))';
  else o.style.background='linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.38))';
}

function makeInteractive(el){
  el.addEventListener('pointerdown',e=>{
    if(e.target.classList.contains('handle')) return startResize(e,el);
    if(e.ctrlKey||e.metaKey) toggleMultiSelect(el); else selectEl(el); const r=stage.getBoundingClientRect(), startX=e.clientX,startY=e.clientY, left=parseFloat(el.style.left),top=parseFloat(el.style.top);
    el.setPointerCapture(e.pointerId);
    const move=ev=>{el.style.left=clamp(left+(ev.clientX-startX)/state.zoom,0,stage.clientWidth-el.offsetWidth)+'px';el.style.top=clamp(top+(ev.clientY-startY)/state.zoom,0,stage.clientHeight-el.offsetHeight)+'px'};
    const up=ev=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);pushHistory()};
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);
  });
  el.addEventListener('click',e=>{e.stopPropagation();if(e.ctrlKey||e.metaKey)toggleMultiSelect(el);else selectEl(el)});
}
function startResize(e,el){
  e.stopPropagation();selectEl(el);
  const sx=e.clientX,sy=e.clientY,sw=el.offsetWidth,sh=el.offsetHeight;
  const fs=parseFloat(getComputedStyle(el).fontSize)||0;
  const move=ev=>{
    const dx=(ev.clientX-sx)/state.zoom,dy=(ev.clientY-sy)/state.zoom;
    const nw=Math.max(40,sw+dx), nh=Math.max(24,sh+dy);
    el.style.width=nw+'px';
    if(el.dataset.type==='shape'||el.dataset.type==='logo')el.style.height=nh+'px';
    if(el.dataset.type!=='shape'&&el.dataset.type!=='logo'&&fs){
      const scale=Math.max(.45,Math.min(2.5,nw/sw));
      el.style.fontSize=(fs*scale)+'px';
    }
  };
  const up=()=>{
    window.removeEventListener('pointermove',move);
    window.removeEventListener('pointerup',up);
    pushHistory();
  };
  window.addEventListener('pointermove',move);
  window.addEventListener('pointerup',up);
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function refreshSelectionClasses(){
  document.querySelectorAll('.el').forEach(x=>x.classList.remove('selected','multi-selected'));
  if(state.selectedElements.length===1){
    state.selectedElements[0]?.classList.add('selected');
    state.selected=state.selectedElements[0]||null;
  }else if(state.selectedElements.length>1){
    state.selectedElements.forEach(x=>x.classList.add('multi-selected'));
    state.selected=state.selectedElements[state.selectedElements.length-1]||null;
  }else state.selected=null;
  syncInspector();
}
function selectEl(el){
  state.selectedElements=el?[el]:[];
  refreshSelectionClasses();
}
function toggleMultiSelect(el){
  const i=state.selectedElements.indexOf(el);
  if(i>=0)state.selectedElements.splice(i,1);
  else state.selectedElements.push(el);
  refreshSelectionClasses();
}
function alignSelection(mode){
  const els=state.selectedElements.length?state.selectedElements:(state.selected?[state.selected]:[]);
  if(!els.length)return toast('Selecione um ou mais elementos');

  if(els.length===1){
    const e=els[0];
    const left=parseFloat(e.style.left||0), w=e.offsetWidth;
    if(mode==='c')e.style.left=((stage.clientWidth-w)/2)+'px';
    if(mode==='l')e.style.left=safeArea().left+'px';
    if(mode==='r')e.style.left=(stage.clientWidth-safeArea().right-w)+'px';
    pushHistory();return;
  }

  // Objeto principal = último selecionado.
  const primary=els[els.length-1];
  const pLeft=parseFloat(primary.style.left||0);
  const pWidth=primary.offsetWidth;
  const pCenter=pLeft+pWidth/2;
  const pRight=pLeft+pWidth;

  els.filter(e=>e!==primary).forEach(e=>{
    const w=e.offsetWidth;
    if(mode==='c')e.style.left=(pCenter-w/2)+'px';
    if(mode==='l')e.style.left=pLeft+'px';
    if(mode==='r')e.style.left=(pRight-w)+'px';
  });
  toast(mode==='c'?'Elementos centralizados ao principal':mode==='l'?'Alinhados à esquerda do principal':'Alinhados à direita do principal');
  pushHistory();
}
stage.addEventListener('click',()=>selectEl(null));
document.addEventListener('keydown',e=>{
  const tag=(document.activeElement?.tagName||'').toLowerCase();
  const typing=['input','textarea','select'].includes(tag);

  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z'){
    e.preventDefault();
    if(e.shiftKey)redoHistory();else undoHistory();
    return;
  }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='y'){
    e.preventDefault();redoHistory();return;
  }
  if(!typing){
    const k=e.key.toLowerCase();
    if(['c','l','r'].includes(k)){e.preventDefault();alignSelection(k);}
  }
});
function syncInspector(){const e=state.selected;$('#elType').value=e?.dataset.type||'';if(!e)return;if(e.dataset.type!=='shape'){const cs=getComputedStyle(e);$('#fontFamily').value=cs.fontFamily.replace(/["']/g,'').split(',')[0];$('#fontSize').value=parseInt(cs.fontSize);$('#fontWeight').value=cs.fontWeight;$('#fontColor').value=rgbToHex(cs.color);$('#textAlign').value=cs.textAlign}else{$('#fontColor').value=rgbToHex(getComputedStyle(e).backgroundColor)}$('#opacity').value=Math.round(parseFloat(getComputedStyle(e).opacity)*100)}
function rgbToHex(rgb){const m=rgb.match(/\d+/g);if(!m)return'#ffffff';return'#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('')}
['fontFamily','fontSize','fontWeight','fontColor','opacity','textAlign'].forEach(id=>$('#'+id).addEventListener('input',()=>{
  const e=state.selected;
  if(!e)return toast('Selecione primeiro o texto que deseja alterar');
  // Alteração LOCAL: somente o elemento selecionado. Nunca altera o Brand Kit nem os outros textos.
  const v=$('#'+id).value;
  if(id==='fontColor'){
    if(e.dataset.type==='shape')e.style.background=v;
    else e.style.color=v;
  }else if(id==='opacity'){
    e.style.opacity=v/100;
  }else if(id==='fontSize'){
    if(e.dataset.type!=='shape' && e.dataset.type!=='logo') e.style.fontSize=v+'px';
  }else if(id==='fontFamily'){
    if(e.dataset.type!=='shape' && e.dataset.type!=='logo') e.style.fontFamily=v;
  }else if(id==='fontWeight'){
    if(e.dataset.type!=='shape' && e.dataset.type!=='logo') e.style.fontWeight=v;
  }else if(id==='textAlign'){
    if(e.dataset.type!=='shape' && e.dataset.type!=='logo') e.style.textAlign=v;
  }
}));
['fontFamily','fontSize','fontWeight','fontColor','opacity','textAlign'].forEach(id=>$('#'+id).addEventListener('change',pushHistory));

$('#btnApplyText').onclick=autoCompose;
$('#btnReflow').onclick=()=>{delete state.layoutAssignments['art_'+state.currentIndex+'_'+state.variantSeed];autoCompose();};
$('#btnVariant').onclick=()=>{state.variantSeed++;state.layoutAssignments={};autoCompose();toast('Nova composição criada')}; $('#formatSelect').onchange=updateFormat; $('#companySelect').onchange=selectCompany; $('#layoutSelect').onchange=autoCompose;
$('#btnDelete').onclick=()=>{
  const els=state.selectedElements.length?state.selectedElements:(state.selected?[state.selected]:[]);
  els.forEach(e=>e.remove());
  state.selectedElements=[];state.selected=null;syncInspector();pushHistory();
};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const t=b.dataset.add;if(t==='shape')selectEl(addShape({x:50,y:50,w:130,h:50,bg:state.currentCompany?.primary||'#7c5cff'}));else{const f=brandFonts();selectEl(addText(t==='title'?'Novo título':'Novo texto',t,{x:50,y:50,w:240,size:t==='title'?32:18,weight:t==='title'?'800':'500',fontFamily:t==='title'?f.title:f.body}))}});
$('#zoomRange').oninput=e=>{state.zoom=e.target.value/100;stage.style.transform=`scale(${state.zoom})`;$('#zoomValue').textContent=e.target.value+'%'};

$('#btnGenerate').onclick=async()=>{
  if(!state.images.length)return toast('Adicione pelo menos uma imagem');
  state.layoutAssignments={};
  state.currentIndex=0;
  if(state.images[0])setBackground(state.images[0].data);
  if(state.records[0])applyRecord(state.records[0]);else await autoCompose();
  pushHistory();
  toast(state.records.length?`${state.records.length} artes prontas • modelos sem repetição`:'Composição gerada');
};

$('#btnSave').onclick=async()=>{
  const payload={project:{name:$('#projectName').value,companyId:state.currentCompany?.id||'',format:state.format,records:state.records,images:state.images.map(x=>({name:x.name})),design:serializeDesign()}};
  try{const r=await api('saveProject',payload);toast(r?.ok?'Projeto salvo':'Projeto salvo localmente')}catch(e){localStorage.setItem('designflow_project',JSON.stringify(payload.project));toast('Projeto salvo localmente')}
};

function setMagicStatus(msg){
  const el=$('#magicStatus'); if(el)el.textContent=msg;
}
function getContentElements(){
  return [...stage.querySelectorAll('.el')].filter(e=>['title','subtitle','highlight','cta','shape','logo'].includes(e.dataset.type));
}
function normalizeTextHierarchy(){
  const title=stage.querySelector('[data-type="title"]');
  const sub=stage.querySelector('[data-type="subtitle"]');
  const hi=stage.querySelector('[data-type="highlight"]');
  const cta=stage.querySelector('[data-type="cta"]');
  if(title){
    const current=parseFloat(title.style.fontSize)||42;
    title.style.fontSize=clamp(current,30,state.format==='story'?54:50)+'px';
    title.style.fontWeight='900';
    title.style.lineHeight='1.02';
    title.style.letterSpacing='-.45px';
  }
  if(sub){
    sub.style.fontSize=(state.format==='story'?17:16)+'px';
    sub.style.fontWeight='500';
    sub.style.lineHeight='1.32';
  }
  if(hi){
    hi.style.fontSize=(state.format==='story'?11:10.5)+'px';
    hi.style.fontWeight='850';
    hi.style.letterSpacing='1.2px';
  }
  if(cta){
    cta.style.fontWeight='800';
    cta.style.lineHeight='1.1';
  }
}
function smartColorElements(){
  const c=state.currentCompany||{};
  const primary=c.primary||'#ff4fa3';
  const secondary=c.secondary||'#ff9f43';
  const text=c.text||'#ffffff';
  const contrast=c.contrast||'#111827';
  const title=stage.querySelector('[data-type="title"]');
  const sub=stage.querySelector('[data-type="subtitle"]');
  const hi=stage.querySelector('[data-type="highlight"]');
  const cta=stage.querySelector('[data-type="cta"]');
  if(title)title.style.color=text;
  if(sub)sub.style.color=hexToRgba(text,.92);
  if(hi)hi.style.color=primary;
  if(cta)cta.style.color='#ffffff';
  [...stage.querySelectorAll('[data-type="shape"]')].forEach((sh,i)=>{
    if(sh.offsetHeight<60)sh.style.background=i%2===0?primary:secondary;
  });
}
function rebalanceCurrentBlock(){
  const texts=[...stage.querySelectorAll('.el.text')].filter(e=>e.dataset.type!=='logo');
  if(!texts.length)return;
  const sorted=texts.sort((a,b)=>(parseFloat(a.style.top)||0)-(parseFloat(b.style.top)||0));
  const area=safeArea();
  const first=sorted[0];
  const left=Math.min(...sorted.map(e=>parseFloat(e.style.left)||area.left));
  const widths=sorted.map(e=>e.offsetWidth);
  const maxW=Math.max(...widths);
  let y=Math.max(area.top,parseFloat(first.style.top)||area.top);
  const gaps={highlight:10,title:14,subtitle:20,cta:18};
  sorted.forEach((e,i)=>{
    if(i>0)y+=gaps[e.dataset.type]||14;
    e.style.top=Math.round(y)+'px';
    y+=e.offsetHeight;
  });
  const overflow=y-(stage.clientHeight-area.bottom);
  if(overflow>0)sorted.forEach(e=>e.style.top=(parseFloat(e.style.top)-overflow)+'px');
}
function simplifyDecorations(){
  const shapes=[...stage.querySelectorAll('[data-type="shape"]')];
  shapes.slice(3).forEach(e=>e.remove());
  shapes.slice(0,3).forEach((e,i)=>{
    e.style.boxShadow=i===0?'0 10px 28px rgba(0,0,0,.14)':'none';
    if(e.offsetHeight>80)e.style.opacity='.80';
  });
}
async function repositionLogoMagic(){
  const old=stage.querySelector('[data-type="logo"]');
  if(old)old.remove();
  const analysis=await analyzeCurrentImage();
  const texts=[...stage.querySelectorAll('.el.text')];
  let bounds=null;
  if(texts.length){
    const xs=texts.map(e=>parseFloat(e.style.left)||0), ys=texts.map(e=>parseFloat(e.style.top)||0);
    const rights=texts.map(e=>(parseFloat(e.style.left)||0)+e.offsetWidth);
    const bottoms=texts.map(e=>(parseFloat(e.style.top)||0)+e.offsetHeight);
    bounds={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...rights)-Math.min(...xs),h:Math.max(...bottoms)-Math.min(...ys)};
  }
  addSmartLogo(bounds,analysis,null);
}
async function magicDesign(){
  setMagicStatus('Analisando imagem, contraste e hierarquia...');
  state.variantSeed++;
  state.layoutAssignments={};
  await autoCompose();
  normalizeTextHierarchy();
  smartColorElements();
  await repositionLogoMagic();
  setMagicStatus('Design refeito com direção de arte automática.');
  pushHistory();
}
$('#magicDesign').addEventListener('click',magicDesign);
$('#magicBalance').addEventListener('click',()=>{
  rebalanceCurrentBlock();
  setMagicStatus('Proporções e alinhamentos equilibrados.');
  pushHistory();
});
$('#magicContrast').addEventListener('click',()=>{
  const model=modelBySlug($('#layoutSelect').value)||creativeModels()[state.currentIndex%creativeModels().length];
  applyOverlayFromModel(model||{overlayType:'soft-darken'});
  smartColorElements();
  setMagicStatus('Contraste recalculado com o Brand Kit.');
  pushHistory();
});
$('#magicHierarchy').addEventListener('click',()=>{
  normalizeTextHierarchy();
  rebalanceCurrentBlock();
  setMagicStatus('Hierarquia tipográfica otimizada.');
  pushHistory();
});
$('#magicLogo').addEventListener('click',async()=>{
  await repositionLogoMagic();
  setMagicStatus('Logo reposicionada em área segura.');
  pushHistory();
});
$('#magicPalette').addEventListener('click',()=>{
  smartColorElements();
  const c=state.currentCompany||{};
  const shapes=[...stage.querySelectorAll('[data-type="shape"]')];
  shapes.forEach((e,i)=>{
    if(e.offsetHeight<70){
      e.style.background=i%2===0?(c.primary||'#ff4fa3'):(c.secondary||'#ff9f43');
    }else{
      e.style.background=hexToRgba(c.contrast||'#111827',.72);
    }
  });
  setMagicStatus('Paleta da empresa aplicada com mais equilíbrio.');
  pushHistory();
});
$('#magicSpacing').addEventListener('click',()=>{
  rebalanceCurrentBlock();
  setMagicStatus('Respiros e espaçamentos padronizados.');
  pushHistory();
});
$('#magicClean').addEventListener('click',()=>{
  simplifyDecorations();
  rebalanceCurrentBlock();
  setMagicStatus('Composição simplificada e mais premium.');
  pushHistory();
});

function snapshotState(){
  return {
    elements:[...stage.querySelectorAll('.el')].map(e=>({
      type:e.dataset.type,
      html:e.innerHTML,
      style:e.getAttribute('style')||'',
      classes:e.className
    }))
  };
}
function restoreSnapshot(snap){
  if(!snap)return;
  state.historyLock=true;
  stage.querySelectorAll('.el').forEach(e=>e.remove());
  state.design.elements=[];
  state.selectedElements=[];state.selected=null;
  (snap.elements||[]).forEach(o=>{
    const el=document.createElement('div');
    el.className=o.classes||'el';
    el.dataset.id=uid();
    el.dataset.type=o.type||'shape';
    el.innerHTML=o.html||'';
    el.setAttribute('style',o.style||'');
    stage.appendChild(el);
    makeInteractive(el);
    state.design.elements.push(el);
  });
  state.historyLock=false;
  refreshSelectionClasses();
}
function pushHistory(){
  if(state.historyLock)return;
  const snap=snapshotState();
  state.history=state.history.slice(0,state.historyIndex+1);
  state.history.push(JSON.stringify(snap));
  if(state.history.length>80)state.history.shift();
  state.historyIndex=state.history.length-1;
}
function undoHistory(){
  if(state.historyIndex<=0)return toast('Nada para desfazer');
  state.historyIndex--;
  restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
}
function redoHistory(){
  if(state.historyIndex>=state.history.length-1)return toast('Nada para refazer');
  state.historyIndex++;
  restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
}
function serializeDesign(){return [...stage.querySelectorAll('.el')].map(e=>({type:e.dataset.type,text:e.dataset.type==='shape'?'':e.childNodes[0]?.textContent||e.textContent,style:e.getAttribute('style')}))}

$('#btnExport').onclick=async()=>{
  showLoading('Preparando arquivo em alta qualidade...','Mantendo exatamente as posições, textos, botão, logo e imagem como aparecem no editor.');
  if(!window.html2canvas){
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  }
  await waitForStageAssets();

  // Tamanho lógico do editor e tamanho final do arquivo.
  const {w,h,realW,realH}=canvasSize();
  const exportScale=realW/w;

  // Clona a arte sem tocar no editor.
  const clone=stage.cloneNode(true);
  clone.classList.add('export-clean');
  clone.querySelectorAll('.selected,.multi-selected').forEach(x=>x.classList.remove('selected','multi-selected'));
  clone.querySelectorAll('.handle').forEach(x=>x.remove());

  // A área de segurança é apenas uma referência visual do editor.
  // Remove qualquer guia criada como elemento HTML antes de gerar o PNG.
  clone.querySelectorAll([
    '.safe-area',
    '.safe-area-guide',
    '.safe-guide',
    '.margin-guide',
    '.margins-guide',
    '.guide',
    '.guides',
    '[data-guide]',
    '[data-safe-area]',
    '[data-export="false"]'
  ].join(',')).forEach(x=>x.remove());

  // Também desativa guias desenhadas por CSS com ::before ou ::after.
  // Esta regra vale somente para o clone usado na exportação.
  const exportGuardStyle=document.createElement('style');
  exportGuardStyle.dataset.exportGuard='true';
  exportGuardStyle.textContent=`
    .stage.export-clean::before,
    .stage.export-clean::after,
    #stage.export-clean::before,
    #stage.export-clean::after {
      content: none !important;
      display: none !important;
      border: 0 !important;
      outline: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
    }
  `;
  document.head.appendChild(exportGuardStyle);

  // O clone usa EXATAMENTE as dimensões lógicas da área de trabalho.
  Object.assign(clone.style,{
    transform:'none',
    transformOrigin:'top left',
    width:w+'px',
    height:h+'px',
    position:'fixed',
    left:'-10000px',
    top:'0',
    margin:'0',
    overflow:'hidden'
  });

  // Congela geometria e tipografia de cada elemento para o html2canvas
  // não recalcular linha, altura, botão ou logo durante a exportação.
  const originalEls=[...stage.querySelectorAll('.el')];
  const cloneEls=[...clone.querySelectorAll('.el')];

  originalEls.forEach((orig,i)=>{
    const el=cloneEls[i]; if(!el)return;
    const cs=getComputedStyle(orig);

    el.style.left=orig.style.left;
    el.style.top=orig.style.top;
    el.style.width=orig.style.width || orig.offsetWidth+'px';

    if(orig.dataset.type==='shape' || orig.dataset.type==='logo'){
      el.style.height=orig.style.height || orig.offsetHeight+'px';
    }

    if(orig.classList.contains('text')){
      el.style.fontFamily=cs.fontFamily;
      el.style.fontSize=cs.fontSize;
      el.style.fontWeight=cs.fontWeight;
      el.style.lineHeight=cs.lineHeight;
      el.style.letterSpacing=cs.letterSpacing;
      el.style.textAlign=cs.textAlign;
      el.style.color=cs.color;
      el.style.whiteSpace='pre-wrap';
      el.style.overflowWrap='break-word';
      el.style.wordBreak='normal';
      el.style.textWrap=orig.dataset.type==='title'?'balance':'wrap';
      el.style.textShadow=cs.textShadow;
    }

    el.style.opacity=cs.opacity;
    el.style.borderRadius=cs.borderRadius;
    el.style.boxShadow=cs.boxShadow;
    el.style.transform=cs.transform==='none'?'none':cs.transform;
    el.style.transformOrigin=cs.transformOrigin;
  });

  // Logo sempre preserva aspect ratio.
  clone.querySelectorAll('.logo-mark').forEach(l=>{
    l.style.display='flex';
    l.style.alignItems='center';
    l.style.justifyContent='center';
  });
  clone.querySelectorAll('.logo-mark img').forEach(img=>{
    img.style.width='auto';
    img.style.height='auto';
    img.style.maxWidth='100%';
    img.style.maxHeight='100%';
    img.style.objectFit='contain';
    img.style.display='block';
  });

  // Botão: shape e texto permanecem nas mesmas coordenadas do editor.
  clone.querySelectorAll('[data-type="cta"]').forEach(t=>{
    t.style.display='flex';
    t.style.alignItems='center';
    t.style.justifyContent='center';
    t.style.boxSizing='border-box';
  });

  document.body.appendChild(clone);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

  let canvas;
  try{
    canvas=await html2canvas(clone,{
      backgroundColor:null,
      useCORS:true,
      allowTaint:true,
      logging:false,
      scale:exportScale,
      width:w,
      height:h,
      scrollX:0,
      scrollY:0,
      windowWidth:document.documentElement.clientWidth,
      windowHeight:document.documentElement.clientHeight,
      imageTimeout:0
    });
  }finally{
    clone.remove();
    exportGuardStyle.remove();
  }

  // Segurança: se navegador devolver algum pixel diferente da resolução alvo,
  // normaliza sem alterar a proporção.
  let output=canvas;
  if(canvas.width!==realW || canvas.height!==realH){
    output=document.createElement('canvas');
    output.width=realW; output.height=realH;
    const ctx=output.getContext('2d');
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(canvas,0,0,realW,realH);
  }

  const blob=await new Promise(res=>output.toBlob(res,'image/png',1));
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.download=`${($('#projectName').value||'arte').replace(/\s+/g,'-').toLowerCase()}-${state.currentIndex+1}.png`;
  a.href=url;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);

  hideLoading();
  toast(`PNG HQ ${realW}×${realH} baixado exatamente como no editor`);
};
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}

loadCompanies().then(()=>{
  const sel=$('#layoutSelect');
  const auto=sel.querySelector('option[value="auto"]')?.outerHTML||'<option value="auto">✨ Automático inteligente — 100 modelos</option>';
  sel.innerHTML=auto+creativeModels().map(m=>`<option value="${m.slug}">${String(m.artIndex).padStart(3,'0')} • ${m.name}</option>`).join('');
  updateFormat();
  $('#zoomRange').dispatchEvent(new Event('input'));
  setTimeout(pushHistory,250);
});

window.addEventListener('load',()=>setTimeout(hideLoading,500));
