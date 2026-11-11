/* Earth to Ear Stage 2 — focused, shareable musical journeys without duplicating their source-linked history. */
(function(){
'use strict';
const arcs=[
 {id:'jazz-voice',name:'The Jazz Voice',tagline:'Seven stops through changing jazz vocal expression'},
 {id:'reggae',name:'Jamaican Reggae',tagline:'Five stops through rhythm, memory and renewal'},
 {id:'ghana-highlife',name:'Ghanaian Highlife',tagline:'Six stops through the evolving guitar and band sound'}
];
function setup(){
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
   if(intro)intro.textContent=arc.tagline+'. Follow the historical context, hear the actual recordings and return whenever you like.';
   document.title=arc.name+' | Earth to Ear Musical Journeys';
   const meta=document.querySelector('meta[name="description"]');
   if(meta)meta.content=arc.name+': a historical listening arc with source-linked recordings on Earth to Ear.';
  }
  const wrap=section.querySelector('.wrap');if(!wrap)return;
  const controls=document.createElement('div');
  controls.className='journey-link-tools';
  const focusUrl='/journeys/?arc='+encodeURIComponent(arc.id);
  const select=document.createElement('a');
  select.href=current?'/journeys/':focusUrl;
  select.textContent=current?'← View all musical journeys':'Open this journey on its own →';
  const share=document.createElement('button');
  share.type='button';share.textContent='Copy journey link';
  share.setAttribute('aria-label','Copy link to '+arc.name);
  const status=document.createElement('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  share.addEventListener('click',async()=>{
   const url=location.origin+focusUrl;
   try{await navigator.clipboard.writeText(url);status.textContent='Link copied.';}
   catch(error){status.textContent='Link: '+url;}
  });
  controls.append(select,share,status);
  wrap.insertBefore(controls,wrap.firstChild);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();