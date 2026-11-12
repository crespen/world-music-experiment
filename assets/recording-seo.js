/* Earth to Ear static, crawlable recording pages — browser-only save, copy, return. */
(function(){
 'use strict';
 const save=document.getElementById('e2e-seo-save'),status=document.getElementById('e2e-seo-feedback');
 if(save){
  const id=save.dataset.recordingId;
  const memory=window.E2EListening;
  const refresh=()=>{
   const chosen=Boolean(memory?.hasRecording(id));
   save.setAttribute('aria-pressed',String(chosen));
   save.textContent=chosen?'✓ Saved':'☆ Save for later';
   save.setAttribute('aria-label',chosen?'Remove recording from Saved Listening':'Save recording for later');
  };
  refresh();
  save.addEventListener('click',()=>{
   const res=memory?.toggleRecording(id);
   if(!res?.ok){if(status)status.textContent='This browser cannot save listening selections.';return;}
   refresh();if(status)status.textContent=res.saved?'Recording added to your Saved Listening shelf.':'Recording removed from your Saved Listening shelf.';
  });
 }
 const copy=document.getElementById('e2e-seo-copy');
 if(copy)copy.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(location.origin+location.pathname);if(status)status.textContent='Recording page link copied.';}
  catch(e){if(status)status.textContent='Copy this page address: '+location.origin+location.pathname;}
 });
 const back=document.getElementById('e2e-seo-back');
 if(back){
  const raw=new URLSearchParams(location.search).get('return');
  if(raw){
   try{
    const u=new URL(raw,location.origin);
    if(u.origin===location.origin&&!/^\/(founder|contributor|bulletin|recording)/.test(u.pathname)){
     back.href=u.pathname+u.search+u.hash;
    }
   }catch(e){}
  }
 }
})();
