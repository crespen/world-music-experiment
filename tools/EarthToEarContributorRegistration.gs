/**
 * EARTH TO EAR — INVITATION-ONLY CONTRIBUTOR REGISTRATION
 * Add as a NEW .gs file in the existing journal archive Apps Script project.
 * Setup creates private Invitation Queue + two separate Google Forms.
 * Form settings MUST be checked manually for VERIFIED Google email collection.
 *
 * IMPORTANT: Add invited users to Invitation Queue (name/email/status=Queued).
 * A 15-minute scheduled trigger sends personalized one-use links automatically.
 * No credentials or invitation tokens are stored in the public GitHub code.
 */
const E2E_REG_SHEET_ID = '1m5R5LlypiluRzCHSPuJ4RH_u6RgFBaTp2vQOABMzjms';
const E2E_INVITE_TAB = 'Invitation Queue';
const E2E_REG_PREFIX = 'E2E_REG_';
const E2E_INVITE_DAYS = 14;
const E2E_QUEUE_HEADERS = [
  'Invitee name','Google account email','Status','Invitation sent UTC',
  'Expires UTC','Private invitation token','Registered UTC',
  'Participant ID','Notes'
];
const E2E_REG_FORM_TITLE = 'Earth to Ear — Contributor Registration';
const E2E_WITHDRAW_FORM_TITLE = 'Earth to Ear — Leave the Listening Experiment';

function e2eRegSs_() { return SpreadsheetApp.openById(E2E_REG_SHEET_ID); }
function e2eRegProps_() { return PropertiesService.getScriptProperties(); }
function e2eRegNormalize_(value) { return String(value || '').trim().toLowerCase(); }
function e2eRegNow_() { return new Date(); }
function e2eRegAdmin_(ss) {
  const email = String(ss.getSheetByName('Participants').getRange('C2').getDisplayValue()).trim();
  if (!email || email.indexOf('@') < 1) throw new Error('Founder email missing from Participants!C2.');
  return email;
}
function e2eRegLock_(callback) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Contributor registration is busy. Try again.');
  try { return callback(); } finally { lock.releaseLock(); }
}
function e2eRegQueue_(ss) {
  const sheet = ss.getSheetByName(E2E_INVITE_TAB);
  if (!sheet) throw new Error('Run setupEarthToEarContributorRegistration first.');
  return sheet;
}
function e2eRegParticipantRows_(sheet) {
  const count = Math.max(0,sheet.getLastRow()-1);
  return count ? sheet.getRange(2,1,count,9).getValues() : [];
}
function e2eRegFindParticipant_(rows, email) {
  return rows.findIndex(r => e2eRegNormalize_(r[2]) === email);
}
function e2eRegToken_() {
  return Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
}
function e2eRegNote_(sheet,row,notice) {
  sheet.getRange(row,9).setValue(String(notice).slice(0,1200));
}

/** One-time setup: creates an invitation queue and the two forms; idempotent. */
function setupEarthToEarContributorRegistration() {
  const ss = e2eRegSs_(), props=e2eRegProps_();
  e2eRegAdmin_(ss);
  let queue=ss.getSheetByName(E2E_INVITE_TAB);
  if (!queue) {
    queue=ss.insertSheet(E2E_INVITE_TAB);
    queue.getRange(1,1,1,E2E_QUEUE_HEADERS.length).setValues([E2E_QUEUE_HEADERS]);
    queue.setFrozenRows(1);
  } else {
    const current=queue.getRange(1,1,1,E2E_QUEUE_HEADERS.length).getDisplayValues()[0];
    if (current.join('|') !== E2E_QUEUE_HEADERS.join('|'))
      throw new Error('Invitation Queue columns were changed; refusing to overwrite.');
  }
  let regId=props.getProperty(E2E_REG_PREFIX+'REGISTER_FORM_ID');
  if (!regId) {
    const form=FormApp.create(E2E_REG_FORM_TITLE)
      .setDescription('Registration is by personal invitation only. Sign in with the exact Google account invited to Earth to Ear. Completing this form does not make your journal entries public.')
      .setCollectEmail(true)
      .setConfirmationMessage('Your response was received. Registration is complete only when you receive the confirmation email.');
    form.addTextItem().setTitle('Invitation code').setRequired(true);
    form.addCheckboxItem().setTitle('Participation acknowledgment')
      .setChoiceValues(['I wish to participate in the private Earth to Ear listening experiment.'])
      .setRequired(true);
    props.setProperty(E2E_REG_PREFIX+'REGISTER_FORM_ID',form.getId());
    regId=form.getId();
  }
  let leaveId=props.getProperty(E2E_REG_PREFIX+'LEAVE_FORM_ID');
  if (!leaveId) {
    const form=FormApp.create(E2E_WITHDRAW_FORM_TITLE)
      .setDescription('Sign in with the Google account you registered with. This ends your active contributor registration. Earlier research responses are retained under the project’s retention policy; contact the project owner for a separate deletion request.')
      .setCollectEmail(true)
      .setConfirmationMessage('Your request was received. Please check your email for the outcome.');
    form.addCheckboxItem().setTitle('Withdrawal confirmation')
      .setChoiceValues(['Please end my active Earth to Ear contributor registration.'])
      .setRequired(true);
    props.setProperty(E2E_REG_PREFIX+'LEAVE_FORM_ID',form.getId());
    leaveId=form.getId();
  }
  const reg=FormApp.openById(regId),leave=FormApp.openById(leaveId);
  if (!reg.collectsEmail() || !leave.collectsEmail())
    throw new Error('Forms must collect emails.');
  Logger.log('REGISTRATION FORM SETTINGS: '+reg.getEditUrl());
  Logger.log('WITHDRAWAL FORM SETTINGS: '+leave.getEditUrl());
  Logger.log('NEXT: In BOTH forms, Settings > Responses > Collect email addresses = Verified (not Responder input). Then run enableEarthToEarContributorRegistration.');
}

/**
 * RUN ONLY AFTER setting both generated Forms to collect VERIFIED emails.
 * Installs 2 form-response triggers and a scheduled invitations queue trigger.
 */
function enableEarthToEarContributorRegistration() {
  e2eRegLock_(() => {
    const props=e2eRegProps_();
    const regId=props.getProperty(E2E_REG_PREFIX+'REGISTER_FORM_ID');
    const leaveId=props.getProperty(E2E_REG_PREFIX+'LEAVE_FORM_ID');
    if (!regId || !leaveId) throw new Error('Run setupEarthToEarContributorRegistration first.');
    const reg=FormApp.openById(regId),leave=FormApp.openById(leaveId);
    if (!reg.collectsEmail() || !leave.collectsEmail()) throw new Error('Email collection disabled.');
    // Script cannot reliably verify the Google Forms Verified-vs-Responder-input
    // setting. Owner must visually confirm Verified in BOTH forms before running.
    const names=['e2eProcessContributorRegistration','e2eProcessContributorWithdrawal','sendQueuedEarthToEarInvitations'];
    ScriptApp.getProjectTriggers().filter(t=>names.indexOf(t.getHandlerFunction())>=0)
      .forEach(t=>ScriptApp.deleteTrigger(t));
    ScriptApp.newTrigger(names[0]).forForm(reg).onFormSubmit().create();
    ScriptApp.newTrigger(names[1]).forForm(leave).onFormSubmit().create();
    ScriptApp.newTrigger(names[2]).timeBased().everyMinutes(15).create();
    props.setProperty(E2E_REG_PREFIX+'ENABLED','true');
    Logger.log('Invitation-only registration enabled. Triggers installed: '+names.join(', '));
  });
}

/** Queue names/emails in Invitation Queue, status Queued; scheduled task sends. */
function sendQueuedEarthToEarInvitations() {
  if (e2eRegProps_().getProperty(E2E_REG_PREFIX+'ENABLED')!=='true')
    throw new Error('Registration not enabled. Verify form settings and run enableEarthToEarContributorRegistration.');
  e2eRegLock_(() => {
    const ss=e2eRegSs_(),queue=e2eRegQueue_(ss),people=ss.getSheetByName('Participants');
    const admin=e2eRegAdmin_(ss), pRows=e2eRegParticipantRows_(people);
    const regId=e2eRegProps_().getProperty(E2E_REG_PREFIX+'REGISTER_FORM_ID');
    const form=FormApp.openById(regId);
    const codeItem=form.getItems(FormApp.ItemType.TEXT).find(i=>i.getTitle()==='Invitation code');
    if(!codeItem)throw new Error('Registration form invitation-code question missing.');
    const last=queue.getLastRow();
    if(last<2)return;
    const rows=queue.getRange(2,1,last-1,9).getValues();
    rows.forEach((v,index)=>{
      const n=index+2, name=String(v[0]||'').trim(),
        email=e2eRegNormalize_(v[1]), status=String(v[2]||'').trim();
      if (status!=='Queued') return;
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e2eRegNote_(queue,n,'Invalid name or Google email. Correct and keep status Queued.');
        return;
      }
      const existing=e2eRegFindParticipant_(pRows,email);
      if(existing>=0 && String(pRows[existing][3]).trim()==='Active') {
        queue.getRange(n,3).setValue('Already active');
        e2eRegNote_(queue,n,'This Google account is already an active contributor.');
        return;
      }
      if(rows.some((other,j)=>j!==index && e2eRegNormalize_(other[1])===email &&
         ['Sent','Registered'].indexOf(String(other[2]).trim())>=0)) {
        queue.getRange(n,3).setValue('Duplicate');
        e2eRegNote_(queue,n,'A sent or completed invitation exists for this address.');
        return;
      }
      if (MailApp.getRemainingDailyQuota()<1) {
        Logger.log('Mail quota exhausted. Remaining invitations still queued.');
        return;
      }
      const now=e2eRegNow_(),expiration=new Date(now.getTime()+E2E_INVITE_DAYS*86400000),
            token=e2eRegToken_();
      const response=form.createResponse()
        .withItemResponse(codeItem.asTextItem().createResponse(token));
      const link=response.toPrefilledUrl();
      // Record token first to reject untracked forwarded links. Failed email
      // becomes an Error state, and is not silently resent with a new token.
      queue.getRange(n,4,1,3).setValues([[now,expiration,token]]);
      queue.getRange(n,3).setValue('Preparing');
      try {
        MailApp.sendEmail({
          to:email,
          subject:'Your personal invitation to Earth to Ear',
          body:'Hello '+name+',\n\nYou are invited to become a registered contributor to Earth to Ear — a world music listening experiment.\n\nExplore: https://earthtoear.com/\n\nRegister using the Google account that received this invitation, before '+expiration.toUTCString()+':\n'+link+'\n\nYour invitation is personal, single-use, and expires in 14 days. Please do not forward it.\n\nAfter you register, you will receive a confirmation email.\n\nJoin us.\n\nEarth to Ear'
        });
        queue.getRange(n,3).setValue('Sent');
        e2eRegNote_(queue,n,'Invitation sent by Earth to Ear.');
      } catch(err) {
        queue.getRange(n,3).setValue('Send error');
        e2eRegNote_(queue,n,'Delivery attempt failed: '+err.message+'. Owner may set back to Queued to generate a fresh link.');
      }
    });
    Logger.log('Invitation queue processing complete.');
  });
}

/** Form installable trigger. Rejects non-invited and mismatched accounts. */
function e2eProcessContributorRegistration(e) {
  if(!e || !e.response) throw new Error('Run by form-submit trigger only.');
  if(e2eRegProps_().getProperty(E2E_REG_PREFIX+'ENABLED')!=='true')return;
  e2eRegLock_(()=>{
    const ss=e2eRegSs_(),queue=e2eRegQueue_(ss),people=ss.getSheetByName('Participants'),
          email=e2eRegNormalize_(e.response.getRespondentEmail()),
          answers=e.response.getItemResponses(),
          codeAnswer=answers.find(a=>a.getItem().getTitle()==='Invitation code'),
          consent=answers.find(a=>a.getItem().getTitle()==='Participation acknowledgment');
    const token=String(codeAnswer ? codeAnswer.getResponse() : '').trim();
    if(!email || !token || !consent || !String(consent.getResponse()).includes('I wish to participate')) {
      Logger.log('Invalid registration: missing verified email, invitation code, or acknowledgment.'); return;
    }
    const count=Math.max(0,queue.getLastRow()-1);
    const invites=count?queue.getRange(2,1,count,9).getValues():[];
    const idx=invites.findIndex(r=>String(r[5]||'')===token);
    if(idx<0){Logger.log('Unknown invitation token: registration rejected.');return;}
    const q=invites[idx], row=idx+2;
    if(String(q[2])!=='Sent' || e2eRegNormalize_(q[1])!==email ||
       !(q[4] instanceof Date) || q[4].getTime()<Date.now()){
      e2eRegNote_(queue,row,'Attempt with expired, used, or mismatched invitation; not registered.');
      Logger.log('Invitation validation failed for row '+row);return;
    }
    const records=e2eRegParticipantRows_(people);
    const found=e2eRegFindParticipant_(records,email);
    if(found>=0 && String(records[found][3])==='Active'){
      queue.getRange(row,3).setValue('Already active');
      e2eRegNote_(queue,row,'Contributor already active; no duplicate assigned.');return;
    }
    if(found>=0){
      // Former contributors do not automatically reactivate or reuse identities.
      queue.getRange(row,3).setValue('Manual review');
      e2eRegNote_(queue,row,'Prior withdrawn/removed contributor: founder review required.');return;
    }
    const nextNum=Math.max(0,...records.map(r=>{const m=/^P-(\d+)$/.exec(String(r[0]));return m?Number(m[1]):0;}))+1;
    const participantId='P-'+String(nextNum).padStart(4,'0');
    const joined=e2eRegNow_();
    const record=[participantId,String(q[0]),email,'Active',q[3]||joined,'','','Invited registration; acknowledged',joined];
    people.getRange(people.getLastRow()+1,1,1,9).setValues([record]);
    queue.getRange(row,3).setValue('Registered');
    queue.getRange(row,7,1,2).setValues([[joined,participantId]]);
    e2eRegNote_(queue,row,'Activated and registered.');
    const admin=e2eRegAdmin_(ss);
    const leaveUrl=FormApp.openById(e2eRegProps_().getProperty(E2E_REG_PREFIX+'LEAVE_FORM_ID')).getPublishedUrl();
    MailApp.sendEmail({
      to:email,subject:'Earth to Ear — registration confirmed',
      body:'Hello '+q[0]+',\n\nYour Earth to Ear contributor registration is complete.\n\nYou may now listen and submit journals using this same Google account.\n\nWebsite: https://earthtoear.com/\nYour private participant reference: '+participantId+'\n\nIf you decide to withdraw, submit this form using the same Google account: '+leaveUrl+'\n\nYour previous journal observations are not automatically deleted when you withdraw.\n\nJoin us.\nEarth to Ear'
    });
    MailApp.sendEmail({
      to:admin,subject:'Earth to Ear — new contributor registered',
      body:'A new contributor has registered.\n\nName: '+q[0]+'\nGoogle account: '+email+'\nParticipant ID: '+participantId+'\nRegistered: '+joined.toUTCString()+'\n\nSee the private Participants and Invitation Queue sheets.'
    });
  });
}

/** Form installable trigger: withdrawal deactivates, not deletes, contributor. */
function e2eProcessContributorWithdrawal(e) {
  if(!e || !e.response)throw new Error('Run by form-submit trigger only.');
  if(e2eRegProps_().getProperty(E2E_REG_PREFIX+'ENABLED')!=='true')return;
  e2eRegLock_(()=>{
    const ss=e2eRegSs_(),people=ss.getSheetByName('Participants'),
          queue=e2eRegQueue_(ss),email=e2eRegNormalize_(e.response.getRespondentEmail()),
          checked=e.response.getItemResponses().some(a=>
            a.getItem().getTitle()==='Withdrawal confirmation' &&
            String(a.getResponse()).includes('Please end my active'));
    if(!email || !checked){Logger.log('Invalid withdrawal: missing verified email/confirmation.');return;}
    const records=e2eRegParticipantRows_(people),i=e2eRegFindParticipant_(records,email);
    if(i<0 || String(records[i][3])!=='Active'){
      Logger.log('Withdrawal from unregistered or inactive account; no change.');return;
    }
    if(i===0 || records[i][0]==='P-0001'){
      Logger.log('Founder registration protected; no change.');return;
    }
    const now=e2eRegNow_(),pid=String(records[i][0]);
    people.getRange(i+2,4).setValue('Withdrawn');
    people.getRange(i+2,6).setValue(now);
    const queueRows=queue.getLastRow()>1?
      queue.getRange(2,1,queue.getLastRow()-1,9).getValues():[];
    queueRows.forEach((r,index)=>{
      if(e2eRegNormalize_(r[1])===email && String(r[2])==='Registered')
        queue.getRange(index+2,3).setValue('Withdrawn');
    });
    const admin=e2eRegAdmin_(ss);
    MailApp.sendEmail({to:email,subject:'Earth to Ear — withdrawal confirmed',
      body:'Your Earth to Ear contributor registration has ended. You will no longer be able to submit new research journals using this account.\n\nExisting contributions are retained under the project’s retention policy; if you would like to request deletion of earlier submissions, please contact the project owner.\n\nThank you for exploring music with us.\nEarth to Ear'});
    MailApp.sendEmail({to:admin,subject:'Earth to Ear — contributor withdrew',
      body:'Contributor '+pid+' ('+email+') withdrew on '+now.toUTCString()+'. Their status is now Withdrawn. Previous research entries were not deleted.'});
  });
}

/** Optional: disable these THREE triggers; other journal triggers stay intact. */
function stopEarthToEarContributorRegistration() {
  const names=['e2eProcessContributorRegistration','e2eProcessContributorWithdrawal','sendQueuedEarthToEarInvitations'];
  ScriptApp.getProjectTriggers().filter(t=>names.indexOf(t.getHandlerFunction())>=0)
    .forEach(t=>ScriptApp.deleteTrigger(t));
  e2eRegProps_().deleteProperty(E2E_REG_PREFIX+'ENABLED');
  Logger.log('Contributor invitation automations stopped; archive triggers untouched.');
}
