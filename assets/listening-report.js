/* Earth to Ear: public, privacy-minimal reporting for unsuitable music links.
   No account or email required. Reports go into founder-only review. */
(function(){
 'use strict';
 const endpoint='https://jhgyjqafpnzwfpzwtpki.supabase.co/functions/v1/e2e-link-report';
 const key='sb_publishable_fO6g2GnCm-jCXOxdcwE4kA_Hzr6AR-r';
 const css=`
.e2e-report-link{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:38px;border:1px solid #94b9ae;border-radius:9px;padding:8px 12px;background:#1e4650;color:#f5e3c5;font:650 12px/1.4 "DM Sans",Arial,sans-serif;cursor:pointer}
.e2e-report-link:hover{background:#315964;border-color:#f1d29e}
.e2e-report-link:focus-visible{outline:3px solid #f3ce83;outline-offset:3px}
.e2e-report-dialog{box-sizing:border-box;width:min(500px,calc(100vw - 24px));max-height:88dvh;overflow:auto;background:#12343e;color:#f7f0e6;border:1px solid #b9a17e;border-radius:16px;padding:26px;font:14px/1.55 "DM Sans",Arial,sans-serif;box-shadow:0 20px 80px #07141b99}
.e2e-report-dialog::backdrop{background:#031319b9}
.e2e-report-dialog *{box-sizing:border-box}
.e2e-report-dialog h2{font:500 29px/1.18 "Fraunces",Georgia,serif;margin:0 0 12px;color:#f8dfb7}
.e2e-report-dialog p{margin:8px 0 17px;color:#d5e4dc}
.e2e-report-dialog label{display:block;font-weight:650;margin:15px 0 6px;color:#f4d49d}
.e2e-report-dialog select,.e2e-report-dialog textarea{display:block;width:100%;min-height:45px;padding:11px;border:1px solid #8badab;border-radius:8px;background:#0b2630;color:#fff;font:inherit}
.e2e-report-dialog textarea{min-height:95px;resize:vertical}
.e2e-report-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.e2e-report-actions button{cursor:pointer;min-height:44px;border:1px solid #a1c4bc;border-radius:8px;padding:9px 14px;font:700 13px "DM Sans",Arial,sans-serif;background:#f0d1a1;color:#092c32}
.e2e-report-actions button[type="button"]{background:#234953;color:#f0e1c6}
.e2e-report-dialog :focus-visible{outline:3px solid #f5d99b;outline-offset:3px}
.e2e-report-feedback{min-height:20px;color:#d4f0df;font-size:13px;margin-top:14px}
`;
 const style=document.createElement('style');style.textContent=css;document.head.append(style);
 let dialog=null,formerFocus=null;
 function ensureDialog(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.className='e2e-report-dialog';dialog.setAttribute('aria-labelledby','e2e-report-title');
  dialog.innerHTML='<h2 id="e2e-report-title">Report a listening link</h2>'+
   '<p id="e2e-report-context"></p>'+
   '<p>Tell us if the link fails, leads to an extra page instead of music, or plays the wrong recording. No sign-in or contact details needed.</p>'+
   '<form id="e2e-report-form">'+
   '<label for="e2e-report-kind">What went wrong?</label>'+
   '<select id="e2e-report-kind" required><option value="not_direct">Does not lead directly to the music</option><option value="broken">Broken link / unavailable recording</option><option value="wrong_recording">Wrong music or performer</option><option value="paywall">Paywall or no usable preview</option><option value="other">Something else</option></select>'+
   '<label for="e2e-report-note">What happened? (optional)</label>'+
   '<textarea id="e2e-report-note" maxlength="700" placeholder="For example: opens a catalog search page; no Play button is visible."></textarea>'+
   '<div class="e2e-report-actions"><button type="submit" id="e2e-report-submit">Send report</button><button type="button" id="e2e-report-close">Cancel</button></div>'+
   '<p id="e2e-report-feedback" class="e2e-report-feedback" role="status" aria-live="polite"></p>'+
   '<input type="text" id="e2e-report-website" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" value="">'+
   '</form>';
  document.body.append(dialog);
  const close=()=>dialog.close();
  dialog.querySelector('#e2e-report-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>{if(formerFocus?.isConnected)formerFocus.focus({preventScroll:true});});
  dialog.querySelector('form').addEventListener('submit',async e=>{
   e.preventDefault();
   const btn=dialog.querySelector('#e2e-report-submit'),feedback=dialog.querySelector('#e2e-report-feedback');
   const id=dialog.dataset.recordingId;
   if(!id)return;
   btn.disabled=true;feedback.textContent='Sending your report…';
   try{
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    let response;
    try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:key},signal:controller.signal,body:JSON.stringify({
      recording_id:id,issue_kind:dialog.querySelector('#e2e-report-kind').value,
      note:dialog.querySelector('#e2e-report-note').value,
      website:dialog.querySelector('#e2e-report-website').value
    })});}finally{clearTimeout(timeout);}
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||'Unable to submit this report.');
    feedback.textContent=data.status==='already_reported'?'This issue has already been reported from this device. Thank you.':'Thank you. Your report has been sent for review.';
    dialog.querySelector('#e2e-report-note').value='';
    dialog.querySelector('#e2e-report-submit').hidden=true;
   }catch(error){
    feedback.textContent=error.name==='AbortError'?'Report timed out. Please retry.':error.message||'Unable to submit.';
   }finally{btn.disabled=false;}
  });
  return dialog;
 }
 document.addEventListener('click',e=>{
  const target=e.target.closest?.('[data-e2e-report]');
  if(!target)return;
  e.preventDefault();
  const id=target.dataset.e2eReport;
  if(!/^[A-Z]{3}-\d{4,6}$/.test(id))return;
  const d=ensureDialog();
  formerFocus=target;
  d.dataset.recordingId=id;
  d.querySelector('#e2e-report-context').textContent='Recording: '+(target.dataset.e2eTitle||id);
  d.querySelector('#e2e-report-kind').value='not_direct';
  d.querySelector('#e2e-report-note').value='';
  d.querySelector('#e2e-report-feedback').textContent='';
  d.querySelector('#e2e-report-submit').hidden=false;
  if(!d.open)d.showModal();
  d.querySelector('#e2e-report-kind').focus();
 });
})();
