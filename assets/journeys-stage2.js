/* Earth to Ear — historical journeys: focused share links, previous/next steps and optional browser-only resumption. */
(function(){
'use strict';
const arcs=[
 {id:'jazz-voice',name:'The Jazz Voice',tagline:'Seven stops through changing jazz vocal expression'},
 {id:'reggae',name:'Jamaican Reggae',tagline:'Five stops through rhythm, memory and renewal'},
 {id:'ghana-highlife',name:'Ghanaian Highlife',tagline:'Six stops through the evolving guitar and band sound'}
];
function setup(){
 const memory=window.E2EListening;
 const selected=new URLSearchParams(location.search).get('arc');
 const current=arcs.find(a=>a.id===selected)||null;
 const hero=document.querySelector('.j-hero h1');
 const intro=document.querySelector('.j-hero p');
 const nav=document.querySelector('.quicknav .quickgrid');
 if(nav){
  nav.querySelectorAll('a[href^="#"]').forEach(link=>{
   const id=link.getAttribute('href').slice(1);
   if(arcs.some(a=>a.id===id))link.href='/journeys/?arc='+encodeURIComponent(id);
  });
 }
 document.querySelectorAll('section.arc[id]').forEach(section=>{
  const arc=arcs.find(a=>a.id===section.id);if(!arc)return;
  if(current&&current.id!==section.id)section.hidden=true;
  if(current&&current.id===section.id){
   section.classList.add('journey-is-current');
   if(hero)hero.textContent=arc.name;
   if(intro)intro.textContent=arc.tagline+'. Follow the history, hear the recordings and return whenever you like.';
   document.title=arc.name+' | Earth to Ear Musical Journeys';
   const meta=document.querySelector('meta[name="description"]');
   if(meta)meta.content=arc.name+': a historical listening arc with source-linked recordings on Earth to Ear.';
  }
  const wrap=section.querySelector('.wrap'),stages=[...section.querySelectorAll('.timeline > .stage')];
  if(!wrap||!stages.length)return;
  const count=stages.length;
  stages.forEach((stage,i)=>{
   const n=i+1;
   stage.id='e2e-'+arc.id+'-stop-'+n;
   stage.setAttribute('aria-label','Stop '+n+' of '+count+' in '+arc.name);
  });
  const focusUrl='/journeys/?arc='+encodeURIComponent(arc.id);
  const controls=document.createElement('div');
  controls.className='journey-link-tools';
  const select=document.createElement('a');
  select.href=current?'/journeys/':focusUrl;
  select.textContent=current?'← View all musical journeys':'Open this journey on its own →';
  const share=document.createElement('button');
  share.type='button';share.textContent='Copy journey link';
  share.setAttribute('aria-label','Copy link to '+arc.name);
  const status=document.createElement('span');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  share.addEventListener('click',async()=>{
   const url=location.origin+focusUrl;
   try{await navigator.clipboard.writeText(url);status.textContent='Link copied.';}
   catch(error){status.textContent='Link: '+url;}
  });
  controls.append(select,share,status);
  const progress=document.createElement('div');
  progress.className='journey-progress';
  progress.setAttribute('aria-label','Your position in '+arc.name);
  function updateProgress(){
   const last=memory?.getJourney(arc.id);
   progress.replaceChildren();
   const text=document.createElement('span');
   text.textContent=last?'Last opened: stop '+last.stop+' of '+count+'. Your place is saved in this browser.':'Take the journey at your own pace. Your last opened stop can be remembered on this browser.';
   progress.append(text);
   if(last&&last.stop<=count){
    const go=document.createElement('a');
    go.href=focusUrl+'#e2e-'+arc.id+'-stop-'+last.stop;
    go.textContent='Continue at stop '+last.stop+' →';
    progress.append(go);
    const clear=document.createElement('button');
    clear.type='button';clear.textContent='Clear saved position';
    clear.addEventListener('click',()=>{
     if(memory?.clearJourney(arc.id))updateProgress();
     else status.textContent='Browser storage is unavailable. Your saved position could not be cleared.';
    });
    progress.append(clear);
   }
  }
  function remember(stop){
   if(memory?.saveJourney(arc.id,stop,count))updateProgress();
   else status.textContent='Browser storage unavailable; you can still use all music links.';
  }
  stages.forEach((stage,i)=>{
   const n=i+1;
   const listen=stage.querySelector('.listen');
   if(listen){
    listen.querySelectorAll('a[href]').forEach(link=>link.addEventListener('click',()=>remember(n)));
   }
   const main=stage.querySelector('.stage-main');if(!main)return;
   const nav=document.createElement('nav');
   nav.className='journey-stop-nav';nav.setAttribute('aria-label','Navigate stops in '+arc.name);
   const counter=document.createElement('span');counter.textContent='Stop '+n+' / '+count;nav.append(counter);
   if(i>0){
    const previous=document.createElement('a');
    previous.href='#e2e-'+arc.id+'-stop-'+(n-1);previous.textContent='← Previous stop';
    previous.addEventListener('click',()=>remember(n-1));nav.append(previous);
   }
   if(i<count-1){
    const next=document.createElement('a');
    next.href='#e2e-'+arc.id+'-stop-'+(n+1);next.textContent='Next stop →';
    next.addEventListener('click',()=>remember(n+1));nav.append(next);
   }else{
    const all=document.createElement('a');
    all.href='/journeys/';all.textContent='Explore another journey →';nav.append(all);
   }
   main.append(nav);
  });
  updateProgress();
  wrap.insertBefore(progress,wrap.firstChild);
  wrap.insertBefore(controls,progress);
 });
 const hash=location.hash.slice(1);
 if(/^e2e-(jazz-voice|reggae|ghana-highlife)-stop-([1-9][0-9]?)$/.test(hash)){
  requestAnimationFrame(()=>{
   const target=document.getElementById(hash);
   if(target&&!target.closest('section[hidden]'))target.scrollIntoView({block:'start'});
  });
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
