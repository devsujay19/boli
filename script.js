const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function h(tag,a={},...c){const e=document.createElement(tag);for(const k in a){if(k.startsWith('on'))e.addEventListener(k.slice(2),a[k]);else e.setAttribute(k,a[k])}c.flat().forEach(x=>e.append(x));return e}
let lang='en';try{lang=localStorage.getItem('boli-lang')||'en'}catch(e){}
const t=k=>(T[lang]&&T[lang][k])||T.en[k]||k;
function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),3000)}
function save(name,text){const a=h('a',{href:URL.createObjectURL(new Blob([text],{type:'text/plain'})),download:name});document.body.append(a);a.click();a.remove();toast('Download started')}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied')}catch(e){toast('Copy failed — please select the text and copy manually.')}}
// logo fallback
$$('.logo').forEach(i=>{const f=()=>i.replaceWith(h('span',{class:'logo-ph'},'BOLI logo'));i.addEventListener('error',f);if(i.complete&&!i.naturalWidth)f()});
// nav
const nav=$('#nav'),mb=$('#menuBtn');mb.onclick=()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)};
$$('#nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');mb.setAttribute('aria-expanded',false)}));
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-40% 0px -55% 0px'});$$('main section[id]').forEach(s=>io.observe(s))}
$('#lang').value=lang;$('#lang').onchange=e=>{lang=e.target.value;try{localStorage.setItem('boli-lang',lang)}catch(x){}applyLang()};
function applyLang(){document.documentElement.lang=lang;$$('[data-i18n]').forEach(e=>e.textContent=t(e.dataset.i18n));renderSchemes();renderApply()}
// ---- Discover
let prof=null;$('#incOn').onchange=e=>{$('#incW').hidden=!e.target.checked};
$('#pf').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);if(!d.get('age')||!d.get('occ')){$('#pfErr').textContent=t('fill');return}$('#pfErr').textContent='';prof=Object.fromEntries(d);if(!$('#incOn').checked)prof.inc='';renderSchemes();$('#results').scrollIntoView()};
$('#pfReset').onclick=()=>{prof=null;$('#incW').hidden=true;$('#pfErr').textContent='';setTimeout(renderSchemes)};
$('#clr').onclick=()=>{$('#q').value='';$('#cat').value='';renderSchemes()};
$('#q').oninput=$('#cat').onchange=()=>renderSchemes();
function evalScheme(s){const cr=s.rules.map(r=>{const v=prof&&prof[r.f];return{l:r.l,st:!v?'unk':r.ok.includes(v)?'match':'nomatch'}});const m=cr.filter(c=>c.st==='match').length;return{s,cr,score:Math.round(100*m/cr.length)}}
const ico={match:'✓ ',unk:'? ',nomatch:'✗ '},cls={match:'m',unk:'u',nomatch:'n'};
function renderSchemes(){const q=$('#q').value.trim().toLowerCase(),c=$('#cat').value,box=$('#results');box.replaceChildren();
let list=SCHEMES.filter(s=>(!q||s.name.toLowerCase().includes(q))&&(!c||s.cat===c)).map(evalScheme).sort((a,b)=>b.score-a.score);
if(!list.length){box.append(h('p',{class:'note'},t('none')));return}
if(!prof)box.append(h('p',{class:'small'},'Fill the profile above to see how each sample scheme matches.'));
list.forEach(r=>box.append(h('article',{class:'card c1'},h('span',{class:'badge u'},'Demo · fictional'),h('h3',{},r.s.name),h('p',{},r.s.benefit),prof?h('p',{},'Relevance: '+r.score+'% of sample criteria matched (not a chance of approval)'):'',r.cr.map(x=>h('span',{class:'badge '+cls[x.st]},ico[x.st]+x.l+' — '+t(x.st))),h('p',{},h('button',{class:'btn ghost',onclick:()=>openScheme(r)},t('details'))))))}
function openScheme(r){const b=$('#dB');b.replaceChildren(h('h3',{id:'dT'},r.s.name),h('p',{class:'demo'},'Fictional demonstration scheme. Not real; no official source.'),h('p',{},r.s.benefit),h('h4',{},'Criteria'),h('ul',{},r.cr.map(x=>h('li',{},ico[x.st]+x.l+' — '+t(x.st)+(x.st==='unk'?' (answer needed)':'')))),h('h4',{},'Sample documents'),h('ul',{},r.s.docs.map(d=>h('li',{},d))),h('button',{class:'btn',onclick:()=>{$('#asch').value=r.s.id;A={i:-1,ans:{},st:'q'};$('#dlg').close();location.hash='#apply';startApply()}},t('prep')));$('#dlg').showModal()}
$('#dX').onclick=()=>$('#dlg').close();$('#dlg').addEventListener('click',e=>{if(e.target.id==='dlg')e.target.close()});
// ---- Apply
$('#asch').append(...SCHEMES.map(s=>h('option',{value:s.id},s.name+' (fictional)')));
let A={i:-1,ans:{},st:'q'};$('#asch').onchange=()=>{A={i:-1,ans:{},st:'q'};renderApply()};
const sch=()=>SCHEMES.find(s=>s.id===$('#asch').value);
function startApply(){A.i=0;renderApply()}
function renderApply(){const b=$('#applyBox');b.replaceChildren();const s=sch();
if(A.i<0){b.append(h('p',{},'Hi! I will ask '+QS.length+' short questions to help you prepare for '+s.name+'.'),h('p',{},'Sample requirements: '+s.rules.map(r=>r.l).join(', ')+'.'),h('button',{class:'btn',onclick:startApply},t('begin')));return}
if(A.st==='q'){const q=QS[A.i];let inp;const id='ai';
if(q.opts)inp=h('select',{id},h('option',{value:''},'…'),q.opts.map(o=>h('option',{value:o},t(o))));else if(q.long)inp=h('textarea',{id,rows:3});else inp=h('input',{id});
inp.value=A.ans[q.id]||'';inp.oninput=()=>{A.ans[q.id]=inp.value};
b.append(h('p',{role:'status'},(A.i+1)+' '+t('of')+' '+QS.length),h('div',{class:'bar2','aria-hidden':'true'},h('i',{style:'width:'+(100*(A.i+1)/QS.length)+'%'})),h('label',{for:id},t(q.k),h('small',{},t(q.w))),inp,h('p',{class:'err',role:'alert',id:'aErr'}),
h('button',{class:'btn ghost',onclick:()=>{if(A.i>0){A.i--}renderApply()}},t('back')),' ',h('button',{class:'btn',onclick:()=>{if(q.req&&!(A.ans[q.id]||'').trim()){$('#aErr').textContent=t('req');return}if(A.i<QS.length-1)A.i++;else A.st='r';renderApply()}},A.i<QS.length-1?t('next'):t('review')))}
else if(A.st==='r'){b.append(h('h3',{},t('review')),QS.map((q,i)=>{const v=A.ans[q.id]||'';return h('p',{},h('b',{},t(q.k)+' '),v?(q.opts?t(v):v):h('em',{},t('missing')+(q.req?' *':'')),' ',h('button',{class:'btn ghost',onclick:()=>{A.i=i;A.st='q';renderApply()}},t('edit')))}),h('button',{class:'btn',onclick:()=>{A.st='s';renderApply()}},t('gen')))}
else{const txt=summary();b.append(h('pre',{},txt),h('button',{class:'btn',onclick:()=>copy(txt)},t('copy')),' ',h('button',{class:'btn ghost',onclick:()=>save('boli-draft-summary.txt',txt)},t('dl')),' ',h('button',{class:'btn ghost',onclick:()=>{A={i:-1,ans:{},st:'q'};renderApply()}},t('reset')))}}
function summary(){const s=sch(),L=['BOLI DRAFT SUMMARY (preparation only)','Scheme: '+s.name+' (fictional demonstration)','','Answers:'],miss=[];
QS.forEach(q=>{const v=(A.ans[q.id]||'').trim();if(v)L.push('- '+T.en[q.k]+' '+(q.opts?T.en[v]:v));else if(q.req)miss.push(T.en[q.k])});
L.push('','Missing:');L.push(...(miss.length?miss.map(m=>'- '+m):['- none']));L.push('','Next steps:',...s.docs.map(d=>'[ ] Gather: '+d),'[ ] Confirm real requirements with an official source','','This is NOT an official application. Nothing has been submitted.');return L.join('\n')}
// ---- Docs
const CK=['Form A completed','Proof of age ready','Proof of enrolment ready','Calendar reminder set for 30 Nov'],ul=$('#chk');
function prog(){const n=$$('input',ul).filter(i=>i.checked).length;$('#pbar').style.width=100*n/CK.length+'%';$('#pct').textContent=n+' / '+CK.length+' done'}
CK.forEach((c,i)=>ul.append(h('li',{},h('label',{},h('input',{type:'checkbox',onchange:prog}),' '+c))));prog();
$('#chkReset').onclick=()=>{$$('input',ul).forEach(i=>i.checked=false);prog()};
const tts='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;
function idle(){$('#speak').disabled=false;$('#stop').disabled=true}
$('#speak').onclick=()=>{if(!tts){$('#ttsMsg').textContent='Text-to-speech is not available in this browser.';return}speechSynthesis.cancel();
const ft=$('#ftext');const u=new SpeechSynthesisUtterance(!ft.hidden&&ft.textContent?ft.textContent:$('#orig').textContent);u.lang=lang==='hi'?'hi-IN':'en-IN';
u.onend=idle;u.onerror=e=>{idle();$('#ttsMsg').textContent='Speech failed ('+(e.error||'unknown')+'). A voice for this language may not be installed.'};
$('#ttsMsg').textContent='Reading…';$('#speak').disabled=true;$('#stop').disabled=false;speechSynthesis.speak(u)};
$('#stop').onclick=()=>{if(tts)speechSynthesis.cancel();idle();$('#ttsMsg').textContent='Stopped.'};
$('#file').onchange=e=>{const f=e.target.files[0],i=$('#finfo'),p=$('#ftext');p.hidden=true;i.replaceChildren();if(!f)return;
i.append(h('p',{},f.name+' · '+(f.size/1024).toFixed(1)+' KB · '+(f.type||'unknown type')+' '),h('button',{class:'btn ghost',type:'button',onclick:()=>{e.target.value='';i.replaceChildren();p.hidden=true}},'Remove'));
const ok=f.type==='text/plain'||/\.txt$/i.test(f.name);
if(!ok){i.append(h('p',{class:'note'},'This file has been selected, but this demonstration cannot extract its contents. PDF, image and scanned-document processing would require an additional processing service or a future integration. Nothing was uploaded.'));return}
if(f.size>1048576){i.append(h('p',{class:'err'},'File too large (max 1 MB).'));return}
const r=new FileReader();r.onload=()=>{p.textContent=r.result;p.hidden=false};r.onerror=()=>i.append(h('p',{class:'err'},'Could not read this file.'));r.readAsText(f)};
// ---- Saathi
let stmt='';$('#sf').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(!d.l||!d.a){$('#sErr').textContent=t('req')+' (*)';return}$('#sErr').textContent='';
stmt=['BOLI Saathi pilot interest (local only)','Name: '+(d.n||'—'),'Region: '+(d.r||'—'),'Language: '+d.l,'Assistance: '+d.a,'Feedback: '+(d.f||'—')].join('\n');
const o=$('#sOut');o.hidden=false;o.replaceChildren(h('p',{class:'note'},'This stays in your browser session only. It has NOT been sent to BOLI or anyone else.'),h('pre',{},stmt),h('button',{class:'btn',onclick:()=>copy(stmt)},t('copy')),' ',h('button',{class:'btn ghost',onclick:()=>save('boli-interest.txt',stmt)},t('dl')),' ',h('button',{class:'btn ghost',onclick:()=>{e.target.reset();o.hidden=true;o.replaceChildren();stmt=''}},t('reset')))};
applyLang();
