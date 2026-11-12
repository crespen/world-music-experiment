
const CATALOG_ENDPOINT='https://jhgyjqafpnzwfpzwtpki.supabase.co/rest/v1/music_catalog';
const PUBLISHABLE_KEY='sb_publishable_fO6g2GnCm-jCXOxdcwE4kA_Hzr6AR-r';
let R=[];
let catalogLoadError=null;
let homeFeatureIds=[];
async function loadHomepageFeatures(){
 const url='https://jhgyjqafpnzwfpzwtpki.supabase.co/rest/v1/e2e_home_features?select=recording_id,featured_at&retired_at=is.null&order=featured_at.desc&limit=8';
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),9000);
 let rows;
 try{
  const response=await fetch(url,{headers:{apikey:PUBLISHABLE_KEY},signal:controller.signal});
  if(!response.ok)throw Error('Editorial selections unavailable ('+response.status+')');
  rows=await response.json();
 }finally{clearTimeout(timer);}
 if(!Array.isArray(rows))throw Error('Unexpected featured-list response');
 homeFeatureIds=rows.map(r=>r.recording_id).filter(id=>typeof id==='string');
}
async function loadCatalog(){
 const all=[];const batchSize=500;
 for(let offset=0;;offset+=batchSize){
  const url=CATALOG_ENDPOINT+'?select=id,title,artist,country,tradition,era,expedition,listen,description,c1,c2,continent,region,period,access,sort_order,source_credit&active=eq.true&order=sort_order.asc&limit='+batchSize+'&offset='+offset;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  let batch;
  try{
   const response=await fetch(url,{headers:{'apikey':PUBLISHABLE_KEY},signal:controller.signal});
   if(!response.ok)throw new Error('Catalog unavailable ('+response.status+')');
   batch=await response.json();
  }finally{clearTimeout(timer);}
  if(!Array.isArray(batch))throw new Error('Unexpected catalog response');
  all.push(...batch);if(batch.length<batchSize)break;
 }
 R=all;
 africaCountries=[...new Set(R.filter(r=>r.continent==='Africa').map(r=>r.country==='Ethiopia / United States'?'Ethiopia':r.country))].sort((a,b)=>a.localeCompare(b));
}
const continentList=['Africa','Asia','Europe','North America','South America','Oceania'];
const countryMatches=(r,country)=>r.country===country||(country==='Ethiopia'&&r.country==='Ethiopia / United States');
let africaCountries=[...new Set(R.filter(r=>r.continent==='Africa').map(r=>r.country==='Ethiopia / United States'?'Ethiopia':r.country))].sort((a,b)=>a.localeCompare(b));
const recordingCount=n=>n+' recording'+(n===1?'':'s');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const nav=route=>window.E2ESiteShell.header(route);
// Keep the listening library fully public. Account navigation is an enhancement,
// and server-side permissions are always authoritative.
let accountClientPromise;
function cachedAccountToken(){
 try{
  const stored=JSON.parse(localStorage.getItem('sb-jhgyjqafpnzwfpzwtpki-auth-token')||'null');
  return stored&&typeof stored.access_token==='string'&&Number(stored.expires_at)>Date.now()/1000+40?stored.access_token:null;
 }catch(error){return null;}
}
async function accountToken(){
 const token=cachedAccountToken();
 if(token)return token;
 let timer;
 try{
  if(!accountClientPromise){
   accountClientPromise=import('https://esm.sh/@supabase/supabase-js@2.81.1').then(({createClient})=>
    createClient('https://jhgyjqafpnzwfpzwtpki.supabase.co',PUBLISHABLE_KEY,
     {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}));
  }
  const sb=await Promise.race([
   accountClientPromise,
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Client import timeout')),6000);})
  ]);
  clearTimeout(timer);
  const session=await Promise.race([
   sb.auth.getSession(),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Session check timeout')),6000);})
  ]);
  return session.data?.session?.access_token||null;
 }finally{clearTimeout(timer);}
}
async function hydrateAccountPortal(){
 const link=document.getElementById('accountPortalLink');
 if(!link)return;
 try{
  const token=await accountToken();
  if(!token)return;
  const endpoint='https://jhgyjqafpnzwfpzwtpki.supabase.co/functions/v1/e2e-contributor';
  const check=async action=>{
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),9000);
   try{
    const response=await fetch(endpoint,{method:'POST',signal:controller.signal,
     headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':PUBLISHABLE_KEY},
     body:JSON.stringify({action})});
    return response.ok?response.json():null;
   }finally{clearTimeout(timeout);}
  };
  // Founders do not have to enroll in the contributor journal to get a dashboard.
  const admin=await check('admin-status').catch(()=>null);
  const current=document.getElementById('accountPortalLink');
  if(!current)return;
  if(admin?.administrator===true){
   current.href='/founder.html?v=editorial-v1';current.textContent='Founder Dashboard';
   current.setAttribute('aria-label','Open Founder Dashboard');
   return;
  }
  const status=await check('status').catch(()=>null);
  if(status?.status==='active'){
   current.href='/contributor.html';current.textContent='My Journal';
   current.setAttribute('aria-label','Open My Listening Journal');
  }else if(status?.status==='withdrawn'){
   current.textContent='My Account';
  }else if(status?.status==='unregistered'){
   current.textContent='My Registration';
  }
 }catch(error){
  // No authentication dependency is allowed to block the public library.
 }
}
const footer=()=>window.E2ESiteShell.footer();
const continentHref=c=>'/'+slug(c)+'/';
const recordingPublicUrl=id=>'/recording/'+encodeURIComponent(String(id||'').toLowerCase())+'/';
const tiles=()=>`<div class="tiles">${continentList.map(c=>
 `<a class="region active" href="${continentHref(c)}" aria-label="Explore the ${safe(c)} collection">
 <span class="caps">${R.filter(r=>r.continent===c).length<=3?"STARTER COLLECTION":"GROWING COLLECTION"}</span><b>${safe(c)}</b>
 <small>${catalogLoadError?'Recordings unavailable · retry':recordingCount(R.filter(r=>r.continent===c).length)+' to explore →'}</small></a>`
).join('')}</div>`;
function bindNewsCarousel(){
 const rail=document.getElementById('newsRail'),previous=document.getElementById('newsPrevious'),next=document.getElementById('newsNext');
 if(!rail||!previous||!next)return;
 const update=()=>{previous.disabled=rail.scrollLeft<8;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-8;};
 const move=direction=>{const first=rail.querySelector('.ed-news-card');const width=first?first.getBoundingClientRect().width:300;const gap=17;rail.scrollBy({left:direction*(width+gap),behavior:window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
}
// Original-audio listening sources verified from Wikimedia Commons.
// Music files remain hosted by Wikimedia; do not download, republish, or relabel.
// Source pages and licence attribution stay visible in the embedded player.
const commonsIntroAudio={
 'AFR-0027':{
  audio:'https://upload.wikimedia.org/wikipedia/commons/b/b0/Drumming_and_Singing_in_Northern_Ghana.ogg',
  credit:'Ibn Shiraz',license:'https://creativecommons.org/licenses/by-sa/4.0/'
 },
 'AFR-0028':{
  audio:'https://upload.wikimedia.org/wikipedia/commons/0/0a/Okonko_drum_beat.ogg',
  credit:'Dappasolomon001',license:'https://creativecommons.org/licenses/by-sa/4.0/'
 },
 'AFR-0029':{
  audio:'https://upload.wikimedia.org/wikipedia/commons/2/24/The_sound_of_the_talking_drum_when_its_been_played.ogg',
  credit:'Bamidele S. Ajayi',license:'https://creativecommons.org/licenses/by-sa/4.0/'
 }
};
function introCandidates(){
 const youtube=R.filter(r=>{
  try{const u=new URL(r.listen);return (u.hostname==='www.youtube.com'||u.hostname==='youtube.com')&&u.pathname==='/watch'&&/^[A-Za-z0-9_-]{11}$/.test(u.searchParams.get('v')||'');}catch{return false;}
 }).slice(0,10);
 const commons=R.filter(r=>Object.prototype.hasOwnProperty.call(commonsIntroAudio,r.id));
 return [...youtube,...commons];
}
function bindIntroListeningStrip(){
 const options=introCandidates();
 const panel=document.getElementById('introListeningPanel');
 if(!panel)return;
 const title=document.getElementById('introListeningTitle');
 const metadata=document.getElementById('introListeningMetadata');
 const source=document.getElementById('introListeningSource');
 const reportLink=document.getElementById('introListeningReport');
 const stage=document.getElementById('introListeningStage');
 const play=document.getElementById('introListenPlay');
 const previous=document.getElementById('introListenPrevious');
 const next=document.getElementById('introListenNext');
 const counter=document.getElementById('introListenCounter');
 if(!options.length){
  metadata.textContent='No embedded listening selections are currently available. Browse the library instead.';
  play.disabled=true;previous.disabled=true;next.disabled=true;counter.textContent='0 of 0';
  return;
 }
 let index=0;
 let playing=false;
 const embed=()=>{
  const r=options[index];
  const commons=commonsIntroAudio[r.id];
  stage.replaceChildren();
  if(commons){
   const box=document.createElement('div');
   box.className='e2e-commons-player';
   const audio=document.createElement('audio');
   audio.controls=true;
   audio.preload='none';
   audio.src=commons.audio;
   audio.setAttribute('playsinline','');
   audio.setAttribute('aria-label','Audio excerpt: '+r.title);
   audio.addEventListener('timeupdate',()=>{
    if(audio.currentTime>=30){audio.pause();audio.currentTime=30;}
   });
   const credit=document.createElement('div');
   credit.className='e2e-commons-attribution';
   credit.append(document.createTextNode('Original audio: '+commons.credit+' · '));
   const license=document.createElement('a');
   license.href=commons.license;
   license.target='_blank';license.rel='noopener noreferrer';
   license.textContent='CC BY-SA 4.0';
   credit.append(license,document.createTextNode(' · 30-second playback, no file modification'));
   box.append(audio,credit);
   stage.append(box);
   stage.hidden=false;
   audio.play().catch(()=>{
    // Browser autoplay policy: native audio controls remain available.
    play.textContent='Use player controls';
   });
  }else{
   const u=new URL(r.listen);
   const id=u.searchParams.get('v');
   if(!id||!/^[A-Za-z0-9_-]{11}$/.test(id))return;
   const iframe=document.createElement('iframe');
   iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&start=0&end=30&controls=1&playsinline=1&rel=0';
   iframe.title='30-second excerpt: '+r.title+' — YouTube player';
   iframe.allow='autoplay; encrypted-media; picture-in-picture';
   iframe.referrerPolicy='strict-origin-when-cross-origin';
   iframe.setAttribute('allowfullscreen','');
   stage.append(iframe);
   stage.hidden=false;
  }
  playing=true;
  play.textContent='Replay 30 seconds';
 };
 const render=()=>{
  const r=options[index];
  title.textContent=r.title;
  metadata.textContent=[r.artist,r.country,r.tradition].filter(Boolean).join(' · ');
  source.href=r.listen;
  if(reportLink){reportLink.dataset.e2eReport=r.id;reportLink.dataset.e2eTitle=r.title;}
  counter.textContent=(index+1)+' of '+options.length;
  stage.replaceChildren();
  stage.hidden=true;
  playing=false;
  play.textContent='Hear 30 seconds';
 };
 const skip=direction=>{
  const wasPlaying=playing;
  index=(index+direction+options.length)%options.length;
  render();
  if(wasPlaying)embed();
 };
 play.addEventListener('click',embed);
 previous.addEventListener('click',()=>skip(-1));
 next.addEventListener('click',()=>skip(1));
 render();
}
function home(){
const featured=homeFeatureIds.map(id=>R.find(r=>r.id===id)).filter(Boolean);
const newsCards=featured.length?featured.map((r,i)=>{
 const path=continentList.includes(r.continent)?continentHref(r.continent):'/explore/';
 return `<a class="ed-news-card" href="${path}?recording=${encodeURIComponent(r.id)}" aria-label="Explore ${safe(r.title)} in the ${safe(r.continent)} collection"><span class="ed-news-art ed-news-art-${i}" style="--a:${safe(r.c1)};--b:${safe(r.c2)}" aria-hidden="true"><span class="ed-sound-symbol">${['♫','◌','≋'][i%3]}</span></span><span class="ed-news-copy"><span class="ed-news-type">♪ Featured listening · ${safe(r.continent)}</span><strong>${safe(r.title)}</strong><span>${safe(r.country)} · ${safe(r.tradition)}</span><span class="ed-news-arrow" aria-hidden="true">↗</span></span></a>`;
}).join(''):'<p class="intro">'+(catalogLoadError?'Featured music will return when the catalog is available.':'Featured listening selections are being prepared.')+'</p>';
const options=R.filter(r=>/^https?:\/\//i.test(r.listen||''));
const surprise=options.length?options[Math.floor(Math.random()*options.length)]:null;
const memory=window.E2EListening;
const savedActive=memory?memory.saved().filter(id=>R.some(r=>r.id===id)).length:0;
const savedJourney=memory?Object.entries(memory.allJourneys()).filter(([id,entry])=>entry&&entry.at).sort((a,b)=>b[1].at-a[1].at)[0]:null;
const journeyNames={'jazz-voice':'The Jazz Voice',reggae:'Jamaican Reggae','ghana-highlife':'Ghanaian Highlife'};
const resume=savedJourney?'<a class="ed-resume-link" href="/journeys/?arc='+encodeURIComponent(savedJourney[0])+'#e2e-'+savedJourney[0]+'-stop-'+savedJourney[1].stop+'">Continue '+safe(journeyNames[savedJourney[0]])+' · stop '+savedJourney[1].stop+' →</a>':'';
const recent=savedActive?'<a class="ed-resume-link" href="/saved/">Your saved recordings · '+savedActive+' →</a>':'<a class="ed-resume-link" href="/saved/">Your Saved Listening shelf →</a>';
const whyVisit=`<section class="ed-why-section" aria-labelledby="ed-why-heading"><div class="wrap">
 <span class="ed-kicker">WHY VISIT EARTH TO EAR?</span>
 <h2 id="ed-why-heading">Come for the music. Leave with a discovery.</h2>
 <p class="ed-why-lead">Get to know remarkable recordings, the people who perform them, and the histories and connections that shaped their sound. Follow your curiosity as far as you wish.</p>
 <div class="ed-why-grid">
 <div class="ed-why-card"><span aria-hidden="true">♪</span><h3>Meet the music</h3><p>Find a performer, a tradition, a musical instrument, or a way of listening you did not know before.</p><a href="/explore/">Find a recording →</a></div>
 <div class="ed-why-card"><span aria-hidden="true">↝</span><h3>Follow its story</h3><p>Listen through changing musical styles and explore cross-cultural exchange in our Musical Journeys.</p><a href="/journeys/">Explore a journey →</a></div>
 <div class="ed-why-card"><span aria-hidden="true">✧</span><h3>Choose your involvement</h3><p>Anyone can listen and save recordings on this device. Invited contributors may also add private reflections.</p><a href="/about/">About the experiment →</a></div>
 </div><p class="ed-why-access">Public music discovery does not require an invitation. The private research journal does.</p>
 </div></section>`;
const startHere=`<section class="ed-entry-section section" aria-labelledby="ed-entry-title"><div class="wrap">
 <div class="ed-section-head"><span class="ed-kicker">YOUR LISTENING STARTS HERE</span><h2 id="ed-entry-title">Where will you listen next?</h2><p>No expertise needed. Choose a surprise, follow a musical story, or explore by place.</p></div>
 <div class="ed-entry-grid">
  <a class="ed-entry-card" href="${surprise?recordingPublicUrl(surprise.id):'/explore/'}"><span class="ed-entry-symbol" aria-hidden="true">✦</span><h3>Surprise Me</h3><p>Open an unexpected recording from the library.</p><small>${surprise?'Find out what you will hear':'Explore recordings when the library is available'} →</small></a>
  <a class="ed-entry-card" href="/journeys/"><span class="ed-entry-symbol" aria-hidden="true">↝</span><h3>Follow a Journey</h3><p>Hear how jazz vocals, reggae and Ghanaian highlife changed over time.</p><small>Choose a historical listening arc →</small></a>
  <a class="ed-entry-card" href="/explore/"><span class="ed-entry-symbol" aria-hidden="true">◎</span><h3>Explore by Place</h3><p>Find music by continent, country, performer or tradition.</p><small>Browse the listening library →</small></a>
 </div>
 <div class="ed-entry-place"><div><strong>Or choose a continent</strong><span>All six collections are open; no account needed.</span></div>${tiles()}</div>
 <div class="ed-return-rail" aria-label="Pick up where you left off"><span class="ed-return-label">Returning listener?</span>${recent}${resume}<small>Saved recordings and journey position remain on this browser only, not in your private journal.</small></div>
 </div></section>`;

return `
<section class="ed-hero" aria-labelledby="welcome-title">
 <div class="ed-hero-backdrop" aria-hidden="true"></div>
 <div class="wrap ed-hero-inner">
  <div class="ed-hero-copy">
   <div class="ed-kicker"><span class="ed-kicker-dot"></span> A GLOBAL LISTENING EXPERIMENT</div>
   <h1 id="welcome-title">A world of music. A lifetime of discovery.</h1>
   <p>For anyone curious about music: hear performances you might never encounter, meet the artists and traditions behind them, and explore how sounds travel and change across generations. No musical expertise, account, or invitation required.</p><p class="ed-hero-access"><strong>Here to listen?</strong> The music is open to everyone. <strong>Invited to contribute?</strong> You can also share private reflections with the experiment.</p>
   <div class="ed-hero-ctas"><a href="/explore/" class="ed-btn ed-btn-primary"><span aria-hidden="true">▶</span> Start Listening</a><a href="/how-to/" class="ed-btn ed-btn-outline">New here? How to Listen</a><a href="/journeys/" class="ed-btn ed-btn-outline">Follow a Musical Journey</a></div>
  </div>
  <div class="ed-hero-art"><img src="/assets/earth-to-ear-hero.svg" alt="Decorative golden sonic waves crossing a teal and gold globe"></div>
   </div>
 <aside id="introListeningPanel" class="e2e-intro-listening wrap" aria-label="Optional listening introduction">
 <div class="e2e-intro-topline"><span class="ed-kicker">♪ THE SOUND OF EARTH TO EAR</span><span class="e2e-intro-detail">30-second introductions · complete recordings at their sources</span></div>
 <div class="e2e-intro-row">
  <div class="e2e-intro-mark" aria-hidden="true">≋</div>
  <div class="e2e-intro-information"><strong id="introListeningTitle">Choose a recording</strong><span id="introListeningMetadata" class="intro-listening-detail">A short selection drawn from the listening library</span><a id="introListeningSource" href="/africa/" target="_blank" rel="noopener noreferrer">Open the original recording ↗</a><button id="introListeningReport" type="button" class="e2e-report-link" data-e2e-report="AFR-0001">⚑ Report link issue</button></div>
  <div class="e2e-intro-controls"><button id="introListenPrevious" type="button" class="e2e-intro-skip" aria-label="Previous recording" title="Previous recording">‹</button><span id="introListenCounter" class="e2e-intro-counter" aria-live="polite">1 of 13</span><button id="introListenNext" type="button" class="e2e-intro-skip" aria-label="Next recording" title="Next recording">›</button><button id="introListenPlay" type="button">Hear 30 seconds</button></div>
 </div>
 <div id="introListeningStage" class="e2e-intro-stage" hidden></div>
 <p class="e2e-intro-footnote">Use the arrows to move through the playlist. YouTube videos and Wikimedia Commons audio use their original hosted players. Playback provides pause and volume controls; source availability may vary by region or provider.</p>
</aside>
${startHere}
${whyVisit}
<section class="ed-news-section" aria-labelledby="news-title"><div class="wrap ed-news-layout">
<div class="ed-news-intro"><span class="ed-news-eyebrow">CURATED LISTENING · NEW TO OUR LIBRARY</span><h2 id="news-title">What's New in the<br>Listening Community</h2><span class="ed-gold-rule"></span><p>Discover selected recordings from across our open collections. Features stay visible for at least 30 days; one or two new selections may join on the 1st and 15th when ready.</p><a href="/explore/" class="ed-quiet-link">Explore the full library</a></div>
<div class="ed-news-wrap"><div class="ed-news-controls"><button type="button" id="newsPrevious" aria-label="Previous listening selections" aria-controls="newsRail">‹</button><button type="button" id="newsNext" aria-label="Next listening selections" aria-controls="newsRail">›</button></div><div class="ed-news-grid" id="newsRail" role="region" aria-label="Browse featured listening selections" tabindex="0">${newsCards}</div></div>
</div></section>
<section class="ed-orientation section"><div class="wrap"><div class="ed-section-head"><span class="ed-kicker">HOW THE EXPERIMENT WORKS</span><h2>Start with curiosity.</h2><p>You don't need musical training, and there is no requirement to listen to every selection. Each recording is an invitation to discover something.</p></div>
<div class="ed-steps"><div><span class="ed-step-num">01</span><h3>Choose a recording</h3><p>Begin with any open collection. Browse by geography, artist, tradition, or period.</p></div><div><span class="ed-step-num">02</span><h3>Listen at its source</h3><p>Open complete recordings or substantial live performances at their original sources.</p></div><div><span class="ed-step-num">03</span><h3>Reflect, if you wish</h3><p>Registered contributors can record private impressions through their listening journal.</p></div></div>
</div></section>
<section class="ed-contribute-section section"><div class="wrap ed-contribute-inner"><div><span class="ed-kicker">REGISTERED CONTRIBUTORS</span><h2>What you hear matters.</h2><p>Share unexpected associations, impressions, and musical discoveries with the private research archive. Our experiment values listening—not musical expertise.</p><a href="/contributor.html" class="ed-btn ed-btn-primary">My Listening Journal</a></div><div class="ed-contribute-side"><span class="ed-sparkle" aria-hidden="true">✦</span><h3>Contribute to the discoveries.</h3><p>By invitation, contributors can suggest music, earn private Listening Milestones, and receive updates through the Listening Bulletin.</p><a href="/participate/">Learn about contributing →</a></div></div></section>`;
}
function breadcrumbs(parts){return `<div class="bread"><a href="/">Home</a> / ${parts.map(p=>p.href?`<a href="${p.href}">${safe(p.text)}</a>`:safe(p.text)).join(' / ')}</div>`;}
function playbackLabel(r){
 const u=(r.listen||'').toLowerCase();
 if(u.includes('youtube.com/watch'))return 'Video · YouTube';
 if(u.includes('commons.wikimedia.org/wiki/file:'))return 'Audio · Wikimedia Commons';
 if(u.includes('loc.gov/item/jukebox'))return 'Historical audio · Library of Congress';
 if(u.includes('loc.gov/item/webcast-'))return 'Concert video · Library of Congress';
 if(u.includes('bandcamp.com'))return u.includes('/album/')?'Album · Bandcamp':'Track · Bandcamp';
 if(u.includes('samap.ukzn.ac.za'))return 'Archive audio · South African Music Archive';
 if(u.includes('digitalarchives.ru.ac.za'))return 'Archive audio · International Library of African Music';
 if(u.includes('archives.crem-cnrs.fr'))return 'Archive audio · CREM-CNRS';
 if(u.includes('alashensemble.com/audio/'))return 'Audio · Alash official artist source';
 if(u.includes('folkways.si.edu')){
  if(u.includes('/video/'))return 'Video · Smithsonian Folkways';
  if(u.includes('/album/'))return 'Album excerpts · Smithsonian Folkways';
  return 'Track / preview · Smithsonian Folkways';
 }
 return 'Recording · Original source';
}
function publicAccessSummary(r){
 const notes=String(r.access||'').trim(),url=String(r.listen||'').toLowerCase();
 if(!notes)return '';
 const n=notes.toLowerCase();
 const match=notes.match(/\b\d{1,2}:\d{2}\b/);
 const duration=match?' · '+match[0]:'';
 if(n.includes('30-second')||n.includes('30 second'))return 'Short preview · Separate provider access may be required';
 if(url.includes('commons.wikimedia.org'))return 'Audio'+duration+' · Free on Wikimedia Commons';
 if(url.includes('digitalarchives.ru.ac.za'))return 'Archive audio'+duration+' · International Library of African Music';
 if(url.includes('archives.crem-cnrs.fr'))return 'Archival recording'+duration+' · CREM-CNRS';
 if(url.includes('samap.ukzn.ac.za'))return 'Research archive audio'+duration+' · SAMAP';
 if(url.includes('loc.gov/item/jukebox'))return 'Historical audio'+duration+' · Library of Congress';
 if(url.includes('loc.gov'))return 'Library of Congress recording'+duration;
 if(url.includes('youtube.com')||url.includes('youtu.be'))return 'Performance video'+duration+' · YouTube';
 if(url.includes('bandcamp.com'))return 'Artist/label release'+duration+' · Bandcamp';
 if(url.includes('folkways.si.edu'))return 'Smithsonian Folkways source'+duration;
 if(url.includes('alashensemble.com'))return 'Official artist audio'+duration;
 if(url.includes('audiomack.com'))return 'Audio'+duration+' · Audiomack';
 return 'Original source'+duration+' · Access notes available';
}
function publicAccessNotice(r,full){
 const label=publicAccessSummary(r);
 if(!label)return '';
 const summary='<p class="access-notice"><strong>Listening access:</strong> '+safe(label)+'</p>';
 if(!full)return summary;
 const notes=String(r.access||'').trim();
 return summary+(notes?'<details class="access-detail"><summary>Provider, licensing and verification details</summary><p>'+safe(notes)+'</p></details>':'');
}
function listenLabel(r){
 const u=(r.listen||'').toLowerCase();
 if(u.includes('youtube.com/watch')||u.includes('/video/'))return '▶ Watch performance';
 if(u.includes('commons.wikimedia.org'))return '▶ Listen to audio';
 if(u.includes('loc.gov/item/jukebox'))return '▶ Listen at Library of Congress';
 if(u.includes('loc.gov/item/webcast-'))return '▶ Watch Library of Congress concert';
 if(u.includes('bandcamp.com'))return '▶ Listen on Bandcamp';
 if(u.includes('samap.ukzn.ac.za'))return '▶ Hear recording at research archive';
 if(u.includes('digitalarchives.ru.ac.za')||u.includes('archives.crem-cnrs.fr'))return '▶ Listen at research archive';
 if(u.includes('alashensemble.com/audio/'))return '▶ Hear artist-hosted recording';
 if(u.includes('folkways.si.edu'))return '▶ Hear recording or preview';
 return '▶ Listen at source';
}
function saveButton(r){
 const isSaved=Boolean(window.E2EListening?.hasRecording(r.id));
 return '<button type="button" class="e2e-save-button" data-e2e-save="'+safe(r.id)+'" aria-pressed="'+isSaved+'" aria-label="'+(isSaved?'Remove '+safe(r.title)+' from Saved Listening':'Save '+safe(r.title)+' for later')+'">'+(isSaved?'✓ Saved':'☆ Save for later')+'</button>';
}
function bindSaveButtons(){
 if(window.__e2eSaveDelegated)return;
 window.__e2eSaveDelegated=true;
 // Event delegation: Explore regenerates results whenever a filter changes.
 // Bind once per page render to handle buttons added later without duplicate handlers.
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-e2e-save]');
  if(!button)return;
  const memory=window.E2EListening;
  if(!memory){button.textContent='Saving unavailable';return;}
  const id=button.dataset.e2eSave,result=memory.toggleRecording(id);
  if(!result.ok){button.textContent='Cannot save on this browser';return;}
  document.querySelectorAll('[data-e2e-save]').forEach(item=>{
   if(item.dataset.e2eSave===id){
    item.setAttribute('aria-pressed',String(result.saved));
    item.textContent=result.saved?'✓ Saved':'☆ Save for later';
    item.setAttribute('aria-label',(result.saved?'Remove':'Save')+' recording '+id+(result.saved?' from Saved Listening':' for later'));
   }
  });
  if(location.pathname.startsWith('/saved/')&&!result.saved){
   const card=button.closest('[data-saved-card]');
   if(card){
    card.remove();
    const count=document.getElementById('saved-count');
    if(count)count.textContent=String(document.querySelectorAll('[data-saved-card]').length)+' recordings currently saved on this browser.';
    if(!document.querySelector('[data-saved-card]')){
     const panel=document.querySelector('.e2e-saved-grid');
     if(panel){
      panel.innerHTML='<div class="e2e-saved-empty"><h2>No recordings saved yet</h2><p>Choose Save for later on any recording that interests you.</p><a href="/explore/">Explore Music →</a></div>';
     }
    }
   }
  }
 },{once:false});
}
function savedListening(){
 const ids=window.E2EListening?.saved()||[];
 const recordings=ids.map(id=>R.find(r=>r.id===id)).filter(Boolean);
 const missing=ids.length-recordings.length;
 return '<section class="rxd-hero"><div class="wrap">'+breadcrumbs([{text:'Explore Music',href:'/explore/'},{text:'Saved Listening'}])+
 '<div class="rxd-kicker">Your listening shelf · Browser only</div><h1>Saved Listening</h1><p class="rxd-subtitle">Keep recordings close while you explore. No sign-in is needed; this shelf is stored on this device and browser, not your contributor journal.</p></div></section>'+
 '<section class="section"><div class="wrap"><p id="saved-count" role="status">'+recordings.length+' recordings currently saved on this browser.</p>'+
 (catalogLoadError?'<p>The live library is unavailable. Your saved IDs remain on this browser; reload when the catalog is available.</p>':'')+
 (recordings.length?'<div class="e2e-saved-grid">'+recordings.map(r=>'<article class="e2e-saved-card" data-saved-card="'+safe(r.id)+'"><div class="caps">'+safe(r.continent)+' · '+safe(r.country)+'</div><h2><a href="'+recordingPublicUrl(r.id)+'?return=%2Fsaved%2F">'+safe(r.title)+'</a></h2><p>'+safe(r.artist)+' · '+safe(r.tradition)+'</p><div class="e2e-saved-actions"><a href="'+recordingPublicUrl(r.id)+'?return=%2Fsaved%2F">Explore recording →</a>'+saveButton(r)+'</div></article>').join('')+'</div>':'<div class="e2e-saved-empty"><h2>No recordings saved yet</h2><p>Find a recording that interests you and choose Save for later.</p><a class="ed-btn ed-btn-primary" href="/explore/">Explore Music →</a></div>')+
 (missing?'<p class="note">'+missing+' saved recording IDs are not currently in the active library. They have not been deleted from this browser.</p>':'')+
 '<p class="e2e-saved-note">If you clear browser data or use another device, this shelf will not follow you. We do not save names, email addresses, or reflection text here.</p></div></section>';
}
function reportLinkButton(r){
 return '<button type="button" class="e2e-report-link" data-e2e-report="'+safe(r.id)+'" data-e2e-title="'+safe(r.title)+'" aria-label="Report a broken or indirect music link for '+safe(r.title)+'">⚑ Report link issue</button>';
}
function recordingCard(r){return `<article class="card"><div class="cover" style="--c1:${safe(r.c1)};--c2:${safe(r.c2)}"><span class="id">${safe(r.id)} · ${safe((r.continent||'World').toUpperCase())}</span><div class="covertext">${safe(r.tradition)}</div></div><div class="cardmain"><div class="caps">${safe(String(r.region||"").toLowerCase().includes(String(r.country||"").toLowerCase())?r.region:[r.region,r.country].filter(Boolean).join(" · "))}</div><h3><a class="recording-title-link" href="${safe(recordingHref(r))}">${safe(r.title)}</a></h3><div class="meta">${safe(r.artist)} · ${safe(r.period)}</div><p>${safe(r.description)}</p>${r.source_credit?`<div class="source-credit">Source: ${safe(r.source_credit)}</div>`:""}${publicAccessNotice(r,false)}<span class="tag">${safe(playbackLabel(r))}</span><div class="actions"><a href="${safe(r.listen)}" target="_blank" rel="noopener noreferrer" class="action">${safe(listenLabel(r))}</a><a href="/contributor.html?recording=${encodeURIComponent(r.id)}" class="action secondary" title="Sign in to your private listening journal; available to registered contributors by invitation only">✎ My Journal</a>${reportLinkButton(r)}${saveButton(r)}</div></div></article>`;}
function filterPanel(list, idPrefix, heading){
 if(catalogLoadError)return `<section class="panel" role="status" aria-live="polite"><h2>The music catalog is temporarily unavailable</h2><p>Our listening sources could not be loaded. You can still read About the Experiment, How to Listen, and Musical Journeys. Please retry when ready.</p><button type="button" class="cta" data-catalog-retry="1">Retry loading recordings</button></section>`;
 return `<div class="playback-legend"><strong>How to listen:</strong> Select a recording to hear it at the original source. Our library prioritizes complete songs and substantial performances, rather than 30-second paywalled samples. Access may vary by source and region.</div><div class="searchrow"><input class="searchbox" id="${idPrefix}query" type="search" placeholder="Search recordings, traditions, artists..." aria-label="Search music"><select class="select" id="${idPrefix}era" aria-label="Filter by era"><option value="all">All recording types</option><option>Historical recordings</option><option>Living traditions</option><option>20th-century transformations</option><option>Contemporary</option></select></div><div class="meta" id="${idPrefix}count"></div><div class="cardgrid" id="${idPrefix}grid" style="margin-top:18px"></div>`;}
function bindFilters(idPrefix,list){const search=document.getElementById(idPrefix+'query'),era=document.getElementById(idPrefix+'era'),grid=document.getElementById(idPrefix+'grid'),count=document.getElementById(idPrefix+'count');if(!search||!era||!grid||!count)return;if(['africa','northamerica','explore'].includes(idPrefix)){const id=new URLSearchParams(location.search).get('recording');if(id&&list.some(r=>r.id===id))search.value=id;}function render(){const q=search.value.toLowerCase().trim(),e=era.value;const found=list.filter(r=>(e==='all'||r.period===e)&&[r.title,r.artist,r.tradition,r.country,r.region,r.id,r.continent].join(' ').toLowerCase().includes(q));count.textContent=`${found.length} selection${found.length===1?'':'s'} shown`;if(!found.length){grid.innerHTML='<div class="no-results">No recordings match these filters. Try another artist, region or tradition.</div>';return;}
if(idPrefix==='explore'){
 const preferred=continentList;
 const groups=[...new Set(found.map(r=>r.continent))].sort((a,b)=>preferred.indexOf(a)-preferred.indexOf(b));
 grid.innerHTML=groups.map(continent=>{
  const items=found.filter(r=>r.continent===continent).sort((a,b)=>a.id.localeCompare(b.id));
  return '<h3 class="catalog-group-label">'+safe(continent)+' <small>'+items.length+' selections</small></h3>'+items.map(recordingCard).join('');
 }).join('');
}else{grid.innerHTML=found.slice().sort((a,b)=>a.id.localeCompare(b.id)).map(recordingCard).join('');}}search.addEventListener('input',render);era.addEventListener('change',render);render()}
function africa(){const africaList=R.filter(r=>r.continent==='Africa');return `<section class="countryhero"><div class="wrap">${breadcrumbs([{text:'Explore Music',href:'/explore/'},{text:'Africa'}])}<div class="eyebrow">Continent collection</div><h1>Africa: <span style="font-weight:350;color:#bbd7d3">a living musical landscape</span></h1><p class="lead">Explore historical recordings, living traditions, twentieth-century innovation and contemporary sounds. Every tradition has its own musical history, and every recording is a starting point.</p><div class="pills"><span class="pill">${catalogLoadError?'Recordings temporarily unavailable':africaList.length+' selections'}</span><span class="pill">Africa collection</span><span class="pill">Traditions · Transformations · Contemporary</span></div></div></section><section class="section"><div class="wrap"><div class="sectionhead"><div><div class="caps">Find a place</div><h2>Countries represented</h2></div></div><div class="tiles">${africaCountries.map(country=>`<a href="/#/country/${encodeURIComponent(country)}" class="region" style="min-height:130px"><div class="caps">AFRICA · ${recordingCount(africaList.filter(r=>countryMatches(r,country)).length)}</div><b style="font-size:21px">${safe(country)}</b><small>Explore the music →</small></a>`).join('')}</div></div></section><section class="section soft"><div class="wrap"><div class="sectionhead"><div><div class="caps">Listening library</div><h2>All Africa recordings</h2><p class="intro"><strong>Listen selectively:</strong> You are not expected to hear every recording. Our selections favor complete recordings and substantial performances. If a source unexpectedly offers a short preview or requires payment, use Report link issue.</p><p class="intro">Select a recording to hear it at its source. The prefilled My Journal form is reserved for invited contributors signed in with their registered email address. Playback availability varies by source and region.</p></div></div>${filterPanel(africaList,'africa')}</div></section>`;}
function country(name){const selected=R.filter(r=>r.continent==='Africa'&&countryMatches(r,name));if(!selected.length)return explore();let regions=[...new Set(selected.map(r=>r.region))];let traditions=[...new Set(selected.map(r=>r.tradition))];return `<section class="countryhero"><div class="wrap">${breadcrumbs([{text:'Explore Music',href:'/explore/'},{text:'Africa',href:'/africa/'},{text:name}])}<div class="eyebrow">${safe(regions.join(' / '))} · Africa</div><h1>Explore ${safe(name)}</h1><p class="lead">A growing selection of recordings associated with ${safe(name)}. Explore multiple eras and musical forms without assuming that a small sample represents the whole country.</p><div class="pills"><span class="pill">${recordingCount(selected.length)} cataloged</span>${traditions.map(t=>`<span class="pill">${safe(t)}</span>`).join('')}</div></div></section><section class="section"><div class="wrap two"><div><div class="caps">Country collection</div><h2>Music across time</h2><p class="intro">The selections below include historical documentation and modern creative work. Traditional practices are living forms too; the date of a recording is not the origin date of its musical lineage.</p></div><div class="panel"><div class="caps">A research note</div><p>Country, recording location and cultural ancestry may differ. Some traditions cross national borders and diasporic communities. The archive preserves these distinctions for later study.</p></div></div></section><section class="section soft"><div class="wrap"><div class="sectionhead"><div><div class="caps">Listening selection</div><h2>Hear the recordings</h2><p class="intro">Open a recording at its original source. Then open the linked journal, which already identifies that selection.</p></div></div>${filterPanel(selected,'country')}</div></section><section class="minihero"><div class="wrap"><a href="/africa/" class="inline-link">← Back to all Africa recordings</a></div></section>`;}

/* Stage 2 — listener-first discovery; all filtering uses public catalog metadata. */
function recordingHref(r,from){
 const returnPath=from||location.pathname+location.search+location.hash;
 return recordingPublicUrl(r.id)+'?return='+encodeURIComponent(returnPath);
}
function explore(){
 const spots=continentList.map(c=>R.find(r=>r.continent===c)).filter(Boolean).slice(0,3);
 const spotHtml=spots.map((r,i)=>'<a class="edx-spotlight" href="'+safe(recordingHref(r,'/explore/'))+'"><span>'+safe(r.continent)+' · A starting point</span><strong>'+safe(r.title)+'</strong><small>'+safe(r.country)+' · '+safe(r.artist)+' · Explore recording →</small></a>').join('');
 const regionHtml='<button type="button" class="edx-region" data-edx-region="all" aria-pressed="true"><span>Everywhere</span><small>'+R.length+'</small></button>'+
 continentList.map(c=>'<button type="button" class="edx-region" data-edx-region="'+safe(c)+'" aria-pressed="false"><span>'+safe(c)+'</span><small>'+R.filter(r=>r.continent===c).length+'</small></button>').join('');
 const periods=[...new Set(R.map(r=>r.period).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const periodHtml='<option value="all">All periods and approaches</option>'+periods.map(p=>'<option value="'+safe(p)+'">'+safe(p)+'</option>').join('');
 const browse=catalogLoadError?
 '<section class="panel" role="status"><h2>Music catalog temporarily unavailable</h2><p>Browse, journeys and our background pages remain open, but we cannot list the recordings just now.</p><button type="button" class="cta" data-catalog-retry="1">Retry loading recordings</button></section>':
 '<div class="edx-layout"><aside class="edx-place" aria-label="Browse by continent"><h3>Choose a place</h3><div class="edx-regions" id="edx-regions">'+regionHtml+'</div><p class="edx-side-note">No continent is a single musical story. These are entry points, not complete surveys.</p></aside>'+
 '<div class="edx-results"><div class="edx-controls"><label class="edx-search-label" for="edx-query">Search a sound, artist, country or tradition</label><input id="edx-query" class="edx-search" type="search" autocomplete="off" placeholder="Try a singer, instrument, country or musical tradition…">'+
 '<div class="edx-facets"><div class="edx-facet"><label for="edx-period">Period / approach</label><select id="edx-period">'+periodHtml+'</select></div><div class="edx-facet"><label for="edx-country">Country</label><select id="edx-country"><option value="all">All countries</option></select></div><button type="button" class="edx-clear" id="edx-clear">Clear filters</button></div></div>'+
 '<div class="edx-result-top" id="edx-result-top" style="scroll-margin-top:110px"><div id="edx-count" class="edx-count" role="status" aria-live="polite" tabindex="-1"></div><span class="edx-link-note">Open a recording to read, then listen at its source.</span></div><div class="edx-list" id="edx-list"></div>'+
 '<nav class="edx-pages" aria-label="Recording pages"><button id="edx-prev" type="button">← Previous</button><span id="edx-page-label"></span><button id="edx-next" type="button">Next →</button></nav>'+
 '<div class="edx-after"><div><span class="caps">Want to follow a story?</span><h3>Hear music change over time.</h3><p>Follow jazz, reggae and Ghanaian highlife through linked recordings and short histories.</p></div><a href="/journeys/">Explore musical journeys →</a></div></div></div>';
 return '<section class="edx-hero"><div class="wrap">'+breadcrumbs([{text:'Explore Music'}])+'<span class="caps">Global listening · Open to everyone</span><h1>A world of music.<br><em>Find your way in.</em></h1><p class="lead">You do not need to listen to everything. Choose a place, search for something that interests you, or begin with one recording and follow your curiosity.</p><div class="edx-hero-actions"><a href="#browse">Browse the recordings ↓</a><a href="/journeys/">Follow a musical journey</a></div></div></section>'+
 (spots.length?'<section class="edx-overview"><div class="wrap"><div class="edx-heading"><div><span class="caps">No ranking, no required order</span><h2>Three ways to begin</h2></div><p>Three recordings from different places. Each is one possible starting point.</p></div><div class="edx-spotlights">'+spotHtml+'</div></div></section>':'')+
 '<section class="edx-browser" id="browse"><div class="wrap"><div class="edx-browser-head"><span class="caps">The public listening library</span><h2>Discover the recordings</h2><p>Browse by continent, narrow by country or period, or search across the catalog. Nine selections appear at a time, so the library stays manageable as it grows.</p></div>'+browse+'</div></section>';
}
function exploreEntry(r){
 const desc=String(r.description||'').trim();
 const shortDesc=desc.length>235?desc.slice(0,232).replace(/\s+\S*$/,'')+'…':desc;
 return '<article class="edx-record" data-continent="'+safe(r.continent)+'">'+
 '<div class="edx-symbol" aria-hidden="true">'+safe((r.country||r.continent||'?').charAt(0).toUpperCase())+'</div>'+
 '<div class="edx-record-copy"><span class="edx-eyebrow">'+safe(r.continent)+' · '+safe(r.country)+'</span>'+
 '<h3><a href="'+safe(recordingHref(r))+'">'+safe(r.title)+'</a></h3>'+
 '<div class="edx-byline">'+safe(r.artist)+' · '+safe(r.tradition)+' · '+safe(r.period)+'</div>'+
 (shortDesc?'<p class="edx-description">'+safe(shortDesc)+'</p>':'')+publicAccessNotice(r,false)+'</div>'+
 '<div class="edx-item-actions"><a class="edx-open" href="'+safe(recordingHref(r))+'" aria-label="Open details for '+safe(r.title)+'">Discover →</a>'+reportLinkButton(r)+saveButton(r)+'</div></article>';
}
function bindExplore(){
 const query=document.getElementById('edx-query'),period=document.getElementById('edx-period'),country=document.getElementById('edx-country'),region=document.getElementById('edx-regions'),results=document.getElementById('edx-list');
 if(!query||!period||!country||!region||!results)return;
 const params=new URLSearchParams(location.search);
 const legacy=params.get('recording')||'';
 const state={
  q:(legacy||params.get('q')||'').trim(),
  continent:continentList.includes(params.get('continent'))?params.get('continent'):'all',
  period:params.get('period')||'all',
  country:params.get('country')||'all',
  page:Math.max(1,parseInt(params.get('page')||'1',10)||1)
 };
 if(legacy){state.continent='all';state.period='all';state.country='all';}
 const count=document.getElementById('edx-count');
 const prev=document.getElementById('edx-prev'),next=document.getElementById('edx-next'),pageLabel=document.getElementById('edx-page-label');
 const pageSize=9;
 if(![...period.options].some(o=>o.value===state.period))state.period='all';
 query.value=state.q;period.value=state.period;
 function updateCountries(){
  const names=[...new Set(R.filter(r=>state.continent==='all'||r.continent===state.continent).map(r=>r.country).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  if(state.country!=='all'&&!names.includes(state.country))state.country='all';
  country.innerHTML='<option value="all">All countries</option>'+names.map(n=>'<option value="'+safe(n)+'">'+safe(n)+'</option>').join('');
  country.value=state.country;
 }
 function interleave(list){
  if(state.continent!=='all')return list;
  const buckets=continentList.map(c=>list.filter(r=>r.continent===c));
  const remaining=list.filter(r=>!continentList.includes(r.continent));
  const ordered=[];
  while(buckets.some(b=>b.length)){for(const b of buckets){if(b.length)ordered.push(b.shift());}}
  return ordered.concat(remaining);
 }
 function updateUrl(){
  const u=new URLSearchParams();
  if(state.q)u.set('q',state.q);
  if(state.continent!=='all')u.set('continent',state.continent);
  if(state.period!=='all')u.set('period',state.period);
  if(state.country!=='all')u.set('country',state.country);
  if(state.page>1)u.set('page',String(state.page));
  history.replaceState(null,'','/explore/'+(u.toString()?'?'+u.toString():''));
 }
 function draw(jump){
  const q=state.q.toLocaleLowerCase();
  const matched=R.filter(r=>(state.continent==='all'||r.continent===state.continent)&&
   (state.period==='all'||r.period===state.period)&&
   (state.country==='all'||r.country===state.country)&&
   (!q||[r.title,r.artist,r.tradition,r.country,r.continent,r.region,r.id,r.description].join(' ').toLocaleLowerCase().includes(q)));
  const ordered=interleave(matched);
  const pages=Math.max(1,Math.ceil(ordered.length/pageSize));
  state.page=Math.min(Math.max(state.page,1),pages);
  const start=(state.page-1)*pageSize;
  const current=ordered.slice(start,start+pageSize);
  updateUrl();
  region.querySelectorAll('[data-edx-region]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.edxRegion===state.continent)));
  count.innerHTML=matched.length?String(matched.length)+' recordings <small>Showing '+String(start+1)+'–'+String(start+current.length)+'</small>':'No recordings match those filters';
  results.innerHTML=current.length?current.map(exploreEntry).join(''):'<div class="edx-empty">Nothing matches yet. Try another region, remove a filter, or search for a broader musical tradition.</div>';
  pageLabel.textContent='Page '+state.page+' of '+pages;
  prev.disabled=state.page<=1;next.disabled=state.page>=pages;
  if(jump){document.getElementById('edx-result-top').scrollIntoView({block:'start',behavior:'instant'});count.focus({preventScroll:true});}
 }
 region.addEventListener('click',e=>{
  const b=e.target.closest('[data-edx-region]');if(!b)return;
  state.continent=b.dataset.edxRegion;state.country='all';state.page=1;updateCountries();draw(false);
 });
 query.addEventListener('input',()=>{state.q=query.value.trim();state.page=1;draw(false);});
 period.addEventListener('change',()=>{state.period=period.value;state.page=1;draw(false);});
 country.addEventListener('change',()=>{state.country=country.value;state.page=1;draw(false);});
 document.getElementById('edx-clear').addEventListener('click',()=>{state.q='';state.continent='all';state.period='all';state.country='all';state.page=1;query.value='';period.value='all';updateCountries();draw(false);query.focus();});
 prev.addEventListener('click',()=>{if(state.page>1){state.page--;draw(true);}});
 next.addEventListener('click',()=>{state.page++;draw(true);});
 updateCountries();draw(false);
}
function recordingReturnPath(){
 const candidate=new URLSearchParams(location.search).get('return')||'/explore/';
 try{
  const u=new URL(candidate,location.origin);
  if(u.origin===location.origin&&u.pathname!=='/recording/'&&!u.pathname.startsWith('/founder')&&!u.pathname.startsWith('/contributor')&&!u.pathname.startsWith('/bulletin'))
   return u.pathname+u.search+u.hash;
 }catch(error){}
 return '/explore/';
}
function recordingDetail(){
 const id=new URLSearchParams(location.search).get('id')||'';
 const r=R.find(x=>x.id===id);
 const back=recordingReturnPath();
 if(!r){
  return '<section class="rxd-hero"><div class="wrap"><h1>Recording details are not available</h1><p class="lead">'+(catalogLoadError?'The listening library is temporarily unavailable.':'The selected recording could not be found.')+'</p><p><a class="rxd-back" href="/explore/">← Return to Explore Music</a></p></div></section>';
 }
 const url=/^https?:\/\//i.test(r.listen||'')?r.listen:null;
 const description=String(r.description||'').trim();
 const meta=[r.country,r.tradition,r.period].filter(Boolean).map(x=>'<span>'+safe(x)+'</span>').join('');
 const fromSamePlace=R.find(x=>x.id!==r.id&&x.country===r.country);
 const elsewhere=R.find(x=>x.id!==r.id&&x.continent!==r.continent&&(!fromSamePlace||x.id!==fromSamePlace.id));
 const related=[fromSamePlace,elsewhere].filter(Boolean).map(x=>{
  const label=x.country===r.country?'Another from '+safe(x.country):'Across continents · '+safe(x.continent);
  return '<a href="'+recordingPublicUrl(x.id)+'?return='+encodeURIComponent(back)+'"><small>'+label+'</small><strong>'+safe(x.title)+'</strong></a>';
 }).join('');

 return '<section class="rxd-hero"><div class="wrap">'+breadcrumbs([{text:'Explore Music',href:'/explore/'},{text:r.title}])+
 '<a class="rxd-back" href="'+safe(back)+'">← Return to your listening results</a>'+
 '<div class="rxd-kicker">'+safe(r.continent)+' · Recording '+safe(r.id)+'</div>'+
 '<h1>'+safe(r.title)+'</h1><p class="rxd-subtitle">'+safe(r.artist)+'</p><div class="rxd-metadata">'+meta+'</div></div></section>'+
 '<section class="wrap rxd-layout"><article class="rxd-panel"><span class="caps">Meet the recording</span><h2>Context before you listen</h2>'+
 '<p>'+(description?safe(description):'This recording is part of the Earth to Ear open listening library. Explore its musical context and listen at the original source.')+'</p>'+
 '<h3 class="rxd-subheading">What might you notice?</h3><p>Listen for a musical moment that catches your attention—a rhythm, a voice, the space between instruments, or something unexpected. You do not need technical terms or a correct answer.</p>'+
 '<h3 class="rxd-subheading">Listen at its original source</h3><p>The audio or video remains with its original provider. Earth to Ear links to original sources rather than hosting audio. We prioritize complete performances; check the source access details below.</p>'+
 publicAccessNotice(r,true)+
 '<div class="rxd-actions">'+(url?'<a href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">'+safe(listenLabel(r))+' ↗</a>':'<span>Original source link unavailable.</span>')+
 '<a class="rxd-outline" href="/contributor.html?recording='+encodeURIComponent(r.id)+'">My Journal (invited contributors)</a>'+saveButton(r)+reportLinkButton(r)+'</div>'+
 (r.source_credit?'<p class="source-credit">Source credit: '+safe(r.source_credit)+'</p>':'')+
 '</article><aside class="rxd-side"><span class="caps">Stay oriented</span><h2>Your place is saved in the link.</h2><p>The original recording opens in a separate tab. Your Earth to Ear page stays here so you can return to the context and your previous filtered results.</p>'+
 '<div class="rxd-actions"><a class="rxd-outline" href="'+safe(back)+'">← Back to browsing</a><button type="button" id="rxd-copy" class="rxd-outline">Copy recording link</button></div>'+
 '<p id="rxd-copy-status" class="rxd-feedback" role="status" aria-live="polite"></p>'+
 '<div class="rxd-related"><h3>Keep exploring</h3><p>Different places and performances offer other listening possibilities—not necessarily historical influences.</p>'+related+'</div>'+ '<small>'+safe(playbackLabel(r))+' · Saved Listening stays on this browser; private journal reflections remain invitation-only.</small></aside></section>';
}
function bindRecordingDetail(){
 const id=new URLSearchParams(location.search).get('id')||'';
 const r=R.find(x=>x.id===id);
 if(r){
  document.title=r.title+' — '+r.artist+' | Earth to Ear';
  const desc=document.querySelector('meta[name="description"]');
  if(desc)desc.content='Explore '+r.title+' by '+r.artist+' and hear the recording at its original source.';
 }
 const button=document.getElementById('rxd-copy'),status=document.getElementById('rxd-copy-status');
 if(button&&status)button.addEventListener('click',async()=>{
  const link=location.origin+recordingPublicUrl(id);
  try{await navigator.clipboard.writeText(link);status.textContent='Recording link copied.';}
  catch(error){status.textContent='Copy this link: '+link;}
 });
}

const continentIntros={
 Asia:'Hear shifting percussion, distinctive vocal techniques, gamelan ensembles and contemporary music across the many communities of Asia. These are openings, not a survey.',
 Europe:'Explore vocal polyphony, distinctive instruments and both inherited and contemporary European musical approaches. Each recording is one listening invitation.',
 'South America':'Discover contemporary rap and pop alongside Afro-Brazilian musical practices and other creative traditions. More places and musical approaches will follow.',
 Oceania:'Hear music and public performances from Aotearoa New Zealand, Samoa and other Pacific communities as the collection grows. No recording stands for a whole culture.'
};
function continentPage(continent){
 const list=R.filter(r=>r.continent===continent);
 const prefix='continent';
 return `<section class="countryhero"><div class="wrap">
 ${breadcrumbs([{text:'Explore Music',href:'/explore/'},{text:continent}])}
 <div class="eyebrow">${safe(continent)} · ${list.length<=3?'Starter collection':'Growing collection'}</div>
 <h1>${safe(continent)}: <span style="font-weight:350;color:#bbd7d3">listen and discover</span></h1>
 <p class="lead">${safe(continentIntros[continent]||'Explore new musical experiences across this growing collection.')}</p>
 <div class="pills"><span class="pill">${catalogLoadError?'Recordings temporarily unavailable':recordingCount(list.length)}</span><span class="pill">${list.length<=3?'Starter collection · more music to come':'Growing through discovery'}</span></div>
 </div></section>
 <section class="section soft"><div class="wrap"><div class="sectionhead"><div>
 <div class="caps">${safe(continent)} · Listening library</div>
 <h2>Choose a recording. Listen at its source.</h2>
 <p class="intro">Every selection has its own listening link. Registered contributors can also share a private reflection. This collection will expand; it is not a complete representation of a continent.</p>
 </div></div>${filterPanel(list,prefix)}</div></section>`;
}
function northAmerica(){
 const recordings=R.filter(r=>r.continent==='North America');
 return `
<section class="countryhero">
 <div class="wrap">
  ${breadcrumbs([{text:'Explore Music',href:'/explore/'},{text:'North America'}])}
  <div class="eyebrow">North America · Open collection</div>
  <h1>North America: <span style="font-weight:350;color:#bbd7d3">histories in sound</span></h1>
  <p class="lead">From Yup’ik drumsongs and Wolastoqey voices to Mexican songs, Afro-Cuban funk, Haitian ensemble music and early American recordings, explore contrasting North American musical experiences. These are invitations to listen, not a comprehensive survey.</p>
  <div class="pills"><span class="pill">${catalogLoadError?'Recordings temporarily unavailable':recordings.length+' recordings to explore'}</span><span class="pill">Indigenous · Caribbean · Mexico · historical music</span><span class="pill">More music to discover</span></div>
 </div>
</section>
<section class="section soft" id="north-america-recordings">
 <div class="wrap">
  <div class="sectionhead"><div>
   <div class="caps">North America · Listening library</div>
   <h2>Listen to a recording. Share a reflection.</h2>
   <p class="intro">Choose an individual performance, then listen at its original source. Each selection has its own <strong>My Journal</strong> link for invited contributors. The public may listen without signing in.</p>
  </div></div>
  ${filterPanel(recordings,'northamerica')}
 </div>
</section>
<section class="section">
 <div class="wrap">
  <div class="sectionhead"><div>
   <div class="caps">Library of Congress · Original sources</div>
   <h2>Discover more in the archive</h2>
   <p class="intro">The Library of Congress offers many historical recordings beyond those featured here. Its collections are listening resources, not individual journal subjects; select a specific performance above to submit a reflection, or suggest another recording for review.</p>
  </div></div>
  <div class="cardgrid">
   <article class="card"><div class="cardmain">
    <div class="caps">United States · Historical jazz and ragtime</div>
    <h3>Library of Congress — Jazz recordings</h3>
    <p>Explore the Library's Citizen DJ National Jukebox jazz source collection. This browsing destination is not a single musical performance, so it does not carry a journal button.</p>
    <div class="actions"><a class="action" href="https://citizen-dj.labs.loc.gov/loc-jukebox-jazz/use/" target="_blank" rel="noopener noreferrer">Browse the Library of Congress collection ↗</a></div>
   </div></article>
   <article class="card"><div class="cardmain">
    <div class="caps">United States · 1925 · Further archival research</div>
    <h3>Bessie Smith and Louis Armstrong — St. Louis Blues</h3>
    <p>The UCSB article discusses historical recordings entering the public domain. We have not yet confirmed a direct playback page for this exact 1925 performance, so it remains research context rather than a journal-enabled recording.</p>
    <div class="actions"><a class="action secondary" href="https://www.library.ucsb.edu/1925-recordings-digitized-ucsb-entering-public-domain-january-1-2026" target="_blank" rel="noopener noreferrer">Research the historical recording ↗</a></div>
   </div></article>
  </div>
 </div>
</section>
<section class="section soft">
 <div class="wrap two">
  <div><div class="caps">A beginning, not a survey</div><h2>A much larger musical landscape</h2><p class="intro">These selections are only a beginning. Across North America, many living traditions, languages, musical communities and contemporary artists remain to be discovered. We will keep widening the listening range without treating any recording as representative of an entire culture.</p></div>
  <div class="panel"><div class="caps">Future listening · Indigenous North America</div><h3>Ohkay Owingeh and other Indigenous musical traditions</h3><p>Ohkay Owingeh is a Tewa-speaking Pueblo community in present-day New Mexico. We will look for publicly shared performances by Ohkay Owingeh artists and other Indigenous communities, respecting how they choose to present their music.</p><p>Some music is private or ceremonial and is not meant for general circulation. We will feature performances intended for public listening.</p><p><a class="smalllink" href="https://ohkay.org/" target="_blank" rel="noopener noreferrer">Ohkay Owingeh official website ↗</a> · <a class="smalllink" href="https://indianpueblo.org/visiting-a-pueblo/" target="_blank" rel="noopener noreferrer">Pueblo cultural guidelines ↗</a></p><p><a class="smalllink" href="/contributor.html">Suggest a publicly shareable recording through the contributor portal</a></p><p class="note">Future listening focus · No restricted ceremonial audio included</p></div>
 </div>
</section>`;
}
function crossroads(){return `<section class="countryhero"><div class="wrap"><div class="eyebrow">Musical connections</div><h1>Musical Crossroads</h1><p class="lead">Music moves with people. This future research space will trace documented musical exchanges, diasporas, independent innovation and cultural transformation across geography.</p></div></section><section class="section"><div class="wrap features"><div class="feature"><span class="symbol">⤳</span><h3>African Diaspora</h3><p>Explore musical forms developed by African-descended communities beyond Africa, with connections documented rather than assumed.</p></div><div class="feature"><span class="symbol">◌</span><h3>Indian Ocean</h3><p>Investigate connected and distinct histories of East Africa, South Asia, Southeast Asia and island communities.</p></div><div class="feature"><span class="symbol">≋</span><h3>Shared techniques</h3><p>Compare apparent similarities and distinguish historical exchange from independent development.</p></div></div></section>`;}
function discoveries(){return `<section class="countryhero"><div class="wrap"><div class="eyebrow">Collective listening</div><h1>Group Discoveries</h1><p class="lead">This will share curated group-level findings once the invited research collective has built a meaningful body of observations.</p></div></section><section class="section"><div class="wrap two"><div class="panel"><h2>Listening progress</h2><p>${R.length} music selections cataloged · all six continents are open for listening. Listen at each recording’s original source.</p><p class="note">No individual contributor information or private response text is displayed here.</p></div><div class="panel"><h2>What we will explore</h2><p>What listeners hear, what surprises them, what associations they make, and which unfamiliar musical ideas invite deeper exploration. Personal reactions remain distinct from researched claims about a tradition.</p></div></div></section>`;}

function about(){return `
<div class="aboutx">
<section class="aboutx-hero" aria-labelledby="aboutx-title">
 <img class="aboutx-hero-art" src="/assets/about-experiment-hero.png" alt="" aria-hidden="true">
 <div class="aboutx-hero-copy">
  <div class="aboutx-kicker">About the Experiment</div>
  <h1 id="aboutx-title">About the Experiment</h1>
  <p>A global listening experiment that explores music across cultures, invites personal response, and reveals what music means to us as humans.</p>
 </div>
</section>
<section class="aboutx-process" aria-labelledby="aboutx-works">
 <div class="aboutx-process-grid">
  <div class="aboutx-intro"><h2 id="aboutx-works">How the<br>Experiment Works</h2><span class="aboutx-rule"></span><p>A simple, three-step listening cycle that connects you with music, with your own response, and with a broader community of curious listeners.</p></div>
  <div class="aboutx-diagram" role="group" aria-label="Interactive three-step listening cycle">
   <img src="/assets/about-experiment-steps.png" alt="Three connected circles: Choose a recording, Listen at its source, and Share a reflection if you wish">
   <button class="aboutx-step" type="button" data-step="0" aria-label="Step 1: Choose a recording" aria-controls="aboutx-step-title" aria-pressed="true"></button>
   <button class="aboutx-step" type="button" data-step="1" aria-label="Step 2: Listen at its source" aria-controls="aboutx-step-title" aria-pressed="false"></button>
   <button class="aboutx-step" type="button" data-step="2" aria-label="Step 3: Share a reflection, if you wish" aria-controls="aboutx-step-title" aria-pressed="false"></button>
  </div>
  <article class="aboutx-card" aria-label="Selected step details">
   <div class="aboutx-card-picture"><img src="/assets/about-experiment-thumbnail.png" alt="Warm landscape at sunset"></div>
   <div class="aboutx-card-content">
    <div class="aboutx-step-number" id="aboutx-step-number">STEP 1 OF 3</div>
    <h3 id="aboutx-step-title">Choose a recording</h3>
    <p id="aboutx-step-text" aria-live="polite">Browse the listening library and select a recording from anywhere in the world. Each piece offers a window into a musical tradition, a community, and a different way of hearing and feeling the world.</p>
    <div class="aboutx-dots" role="group" aria-label="Select a step">
     <button type="button" data-step-dot="0" aria-label="Choose a recording" aria-current="step"></button>
     <button type="button" data-step-dot="1" aria-label="Listen at its source"></button>
     <button type="button" data-step-dot="2" aria-label="Share a reflection, if you wish"></button>
    </div>
   </div>
  </article>
 </div>
</section>
<section class="aboutx-purpose" aria-labelledby="aboutx-purpose-title">
 <div class="aboutx-purpose-visual"><img src="/assets/about-experiment-people.png" alt="Musicians gathered outdoors, celebrating the experience of music"></div>
 <div class="aboutx-purpose-content">
  <h2 id="aboutx-purpose-title">Why This Experiment Exists</h2>
  <span class="aboutx-rule"></span>
  <p>Earth to Ear is an invitation to listen before judgment, to approach music with curiosity over expertise, and to discover the richness of musical traditions across cultures. By listening together, we can begin to hear patterns of response and meaning—what moves us, what feels familiar or new, and how music speaks across different lives and places.</p>
  <p>The public listening library is open to all, offering recordings from around the world for anyone to explore. Invited contributors can also share personal reflections, which add depth and diverse perspectives to the experiment, helping us understand not just the music, but how and why it resonates.</p>
  <div class="aboutx-actions"><a href="/explore/">▶ &nbsp; Explore Music</a><a href="/participate/" class="aboutx-outline">Request an Invitation</a></div>
 </div>
</section>
<section class="aboutx-principles" aria-labelledby="aboutx-principles-title">
 <div class="aboutx-principles-inner">
  <h2 id="aboutx-principles-title">The philosophy behind our listening</h2>
  <div class="aboutx-principles-grid">
   <article><h3>Listen before judgment</h3><p>You do not need musical training, and no one is expected to hear every selection. A tradition's worth is not established by our attention to it. The music already belongs to histories, communities and creative lives of its own.</p></article>
   <article><h3>Experience is not expertise</h3><p>We want to know what listeners notice, what surprises them, and what associations they make. Personal reactions matter as observations; historical and cultural claims require careful research and informed sources.</p></article>
   <article><h3>Make room for difference</h3><p>We begin in Africa and will listen more broadly across the world. Our future work will trace documented connections and independent innovation without treating any single musical tradition as the default measure of others.</p></article>
  </div>
 </div>
</section>
</div>`;}
function bindAboutExperiment(){
 const steps=[
  {title:'Choose a recording',text:'Browse the listening library and select a recording from anywhere in the world. Each piece offers a window into a musical tradition, a community, and a different way of hearing and feeling the world.'},
  {title:'Listen at its source',text:'Open the recording at its original source. Listen for rhythms, voices, instruments, tuning, and surprises at your own pace. Some sources offer complete performances; others provide a shorter preview.'},
  {title:'Share a reflection, if you wish',text:'Invited contributors can record impressions, associations and surprises in a private listening journal. Everyone can listen without registering, and no one needs to offer a single correct interpretation.'}
 ];
 const title=document.getElementById('aboutx-step-title'),number=document.getElementById('aboutx-step-number'),body=document.getElementById('aboutx-step-text');
 if(!title||!number||!body)return;
 const circles=[...document.querySelectorAll('.aboutx-step')],dots=[...document.querySelectorAll('.aboutx-dots button')];
 const activate=n=>{
  if(!Number.isInteger(n)||n<0||n>=steps.length)return;
  number.textContent='STEP '+(n+1)+' OF 3';
  title.textContent=steps[n].title;
  body.textContent=steps[n].text;
  circles.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===n)));
  dots.forEach((button,i)=>{if(i===n)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
 };
 circles.forEach(button=>button.addEventListener('click',()=>activate(Number(button.dataset.step))));
 dots.forEach(button=>button.addEventListener('click',()=>activate(Number(button.dataset.stepDot))));
}

function guideRecording(id,prompt){
 const r=R.find(x=>x.id===id);
 if(!r)return '';
 return `<a class="ht-recording" href="/explore/?recording=${encodeURIComponent(r.id)}" aria-label="Open ${safe(r.title)} in the listening library">
  <span class="ht-recording-type">${safe(r.country)} · ${safe(r.period)}</span>
  <strong>${safe(r.title)}</strong>
  <span>${safe(r.artist)}</span>
  <small>${safe(prompt)}</small>
  <span class="ht-recording-action">Find this recording →</span>
 </a>`;
}
function howTo(){
 return `
 <section class="countryhero ht-hero"><div class="wrap">
  ${breadcrumbs([{text:'How to Listen'}])}
  <div class="eyebrow">Your invitation to explore</div>
  <h1>How to Listen at Earth to Ear</h1>
  <p class="lead">You don't need to know what you're looking for. Sometimes music surprises us, sometimes it feels familiar, and sometimes it makes us curious about how a sound came to be. Start anywhere.</p>
  <a class="ht-primary" href="/explore/">Or just explore the music →</a>
 </div></section>
 <section class="section ht-intro"><div class="wrap">
  <div class="ht-three-way" aria-label="Three ways to begin">
   <a href="#encounter"><span class="ht-ordinal">01</span><strong>Encounter</strong><span>Meet a sound that catches your attention.</span></a>
   <a href="#connection"><span class="ht-ordinal">02</span><strong>Connection</strong><span>Notice what a recording brings to mind.</span></a>
   <a href="#journey"><span class="ht-ordinal">03</span><strong>Journey</strong><span>Follow a question through time.</span></a>
  </div>
 </div></section>
 <section id="encounter" class="section ht-path"><div class="wrap">
  <div class="ht-path-head"><span class="caps">01 · Encounter</span><h2>Hear something you didn't expect.</h2>
   <p>Perhaps it's a vocal technique, the way instruments enter, or a rhythm you can't quite anticipate. You don't need to identify it. Just notice what caught your ear.</p></div>
  <div class="ht-recording-grid">
   ${guideRecording('ASI-0004','Listen for more than one pitch in a single voice.')}
   ${guideRecording('AFR-0039','What happens when voices and instruments overlap?')}
   ${guideRecording('ASI-0003','How do the instruments move together?')}
  </div>
  <p class="ht-freeform">A thought to carry with you: <em>What did I notice first?</em></p>
 </div></section>
 <section id="connection" class="section soft ht-path"><div class="wrap">
  <div class="ht-path-head"><span class="caps">02 · Connection</span><h2>Notice what feels familiar.</h2>
   <p>A recording might recall a person, a place, a family story or a feeling. It might also remind you of something seemingly unrelated. Your association belongs to you; it needn't be a claim about the musician's history or your own ancestry.</p></div>
  <div class="ht-recording-grid">
   ${guideRecording('NAM-0001','Does an old recorded voice evoke another time or place?')}
   ${guideRecording('OCE-0003','What does this shared vocal performance bring to mind?')}
   ${guideRecording('NAM-0007','Can an unfamiliar performance still feel familiar?')}
  </div>
  <p class="ht-freeform">A thought to carry with you: <em>Did this bring anything or anyone to mind?</em></p>
 </div></section>
 <section id="journey" class="section ht-path"><div class="wrap">
  <div class="ht-path-head"><span class="caps">03 · Journey</span><h2>Follow music across time.</h2>
   <p>A musical history has more than a beginning and an end. Along the way are overlooked musicians, new technologies, and unexpected turns. As our focused historical journeys develop, you can begin by comparing recordings from different moments.</p></div>
  <div class="ht-recording-grid">
   ${guideRecording('NAM-0001','1909 · An early recorded spiritual performance.')}
   ${guideRecording('NAM-0003','1920 · Hear a different, instrumental American tradition.')}
   ${guideRecording('NAM-0011','Contemporary · Hear a musician engaging American roots traditions today.')}
  </div>
  <p class="ht-caveat">These are three distinct American musical threads—not a claimed straight line of influence. Ready for a deeper experience? <a href="/journeys/">Hear the jazz-vocal, Jamaican reggae and Ghanaian highlife journeys →</a></p>
  <p class="ht-freeform">A thought to carry with you: <em>What changed? What still sounds recognizable?</em></p>
 </div></section>
 <section class="section soft ht-closing"><div class="wrap">
  <span class="caps">And what happens next?</span><h2>Listen at your own pace.</h2>
  <div class="ht-closing-grid"><div><strong>Choose any recording</strong><p>All six continent collections are open, and the library keeps growing.</p></div>
  <div><strong>Hear it at its source</strong><p>Explore full recordings and substantial performances at their original sources. Let your curiosity decide how long you listen.</p></div>
  <div><strong>Reflect, if you wish</strong><p>Everyone can listen. Invited contributors can also keep a private listening journal, but sharing is never required.</p></div></div>
  <div class="ht-final-cta"><a class="ht-primary" href="/explore/">Explore the listening library →</a><a href="/about/" class="ht-secondary">About the Experiment</a></div>
 </div></section>`;
}
function participate(){return `<section class="countryhero"><div class="wrap"><div class="eyebrow">Earth to Ear / Participate</div><h1>Listen. Discover. <span style="color:#b9d9d3;font-weight:350">Contribute.</span></h1><p class="lead">The world's music is open to everyone. Our collaborative listening research is conducted by a small community of invited contributors.</p></div></section><section class="section"><div class="wrap two"><div><div class="caps">Explore freely</div><h2>Everyone is welcome to listen.</h2><p class="intro">Browse music from different countries, learn about traditions and forms, and follow authorized recording links. You do not need an account or musical training to enjoy the library.</p><a href="/explore/" class="inline-link">Explore the listening library →</a></div><div class="panel"><div class="caps">Invitation-only research</div><h2>What do contributors do?</h2><p>Participants listen to curated recordings, describe their impressions in a structured journal, and may suggest traditions, artists, or performances for future consideration.</p><p class="note">Journal responses are accepted only from invited, verified contributors signed in to the private research portal.</p></div></div></section><section class="section soft"><div class="wrap two"><div><div class="caps">Future participation</div><h2>Interested in contributing?</h2><p class="intro"><strong>Research registration is currently by invitation.</strong> If you have received an invitation, sign in to your private journal using the invited email address. Other visitors may join an interest list for future consideration.</p><p>Joining an interest list does not guarantee an invitation or give access to the private journal.</p></div><div class="panel"><h2>Interest list</h2><p>The short interest form asks for your name, email address and an optional note about what interests you. Contact information will be used only for possible research invitations, not marketing.</p><p><a class="cta" href="https://docs.google.com/forms/d/e/1FAIpQLSf01F_m4VDF4p5CzAMCp2sPrI6_FdEgDMnvk-dkl4h3s2MI9Q/viewform" target="_blank" rel="noopener noreferrer">Join the Interest List ↗</a></p><p class="note">The registration form opens in Google Forms. Submitting your interest does not create a research account or grant journal access.</p><p class="note" style="border-top:1px solid #54737c;margin-top:22px;padding-top:15px">Already on the interest list? <a class="inline-link" href="https://docs.google.com/forms/d/e/1FAIpQLSeOJf-YaqGxltFPWjmPW_mCGONi73-cihb3BIeyiZWY2g0Asg/viewform" target="_blank" rel="noopener noreferrer">Withdraw your interest ↗</a>. Use the same verified Google account you registered with. Submitting the form confirms receipt; removal takes effect when processed.</p></div></div></section><section class="section"><div class="wrap"><h2>From interest to invitation</h2><div class="features"><div class="feature"><span class="symbol">1</span><h3>Express interest</h3><p>Complete the public interest-list form to express interest in future invitations.</p></div><div class="feature"><span class="symbol">2</span><h3>Private review</h3><p>Submissions remain private, with no obligation or automatic admission.</p></div><div class="feature"><span class="symbol">3</span><h3>Invitation if space opens</h3><p>Only an approved invitation can lead to access to the private listening journal.</p></div></div></div></section>`;}
function suggestion(){return `<section class="countryhero"><div class="wrap"><div class="eyebrow">Help discover the world’s music</div><h1>Suggest Music</h1><p class="lead">A music tradition, a contemporary artist, a remarkable performance, or a new way of listening—we want to hear what you think should be considered.</p></div></section><section class="section"><div class="wrap two"><div class="panel"><div class="caps">For approved participants</div><h2>Recommend a musical discovery</h2><p>Registered contributors can recommend a performance, musical tradition or artist using the private Earth to Ear participant portal. Suggestions are stored in Supabase for founder review, not automatically published.</p><p><a class="cta" href="/contributor.html#suggestionCard">Open participant suggestions →</a></p><p class="note">Use the email address associated with your contributor registration. The founder reviews submissions before any catalog changes.</p></div><div><h2>From suggestion to discovery</h2><p class="intro">Each recommendation is reviewed for musical context, recording accuracy and freely accessible listening before any approved entry becomes available.</p><div class="feature"><div class="symbol">1 → 2 → 3</div><h3>Submit · Review · Approve</h3><p>We confirm the source and sufficient free playback, assign a catalog identifier and publish only approved recordings.</p></div></div></div></section>`;}

const FIRST_VISIT_GUIDE_KEY='e2e-first-visit-how-to-v1';
function guideAlreadySeen(){
 try{return localStorage.getItem(FIRST_VISIT_GUIDE_KEY)==='seen';}
 catch(e){try{return sessionStorage.getItem(FIRST_VISIT_GUIDE_KEY)==='seen';}catch(error){return false;}}
}
function rememberGuideVisit(){
 try{localStorage.setItem(FIRST_VISIT_GUIDE_KEY,'seen');}
 catch(e){try{sessionStorage.setItem(FIRST_VISIT_GUIDE_KEY,'seen');}catch(error){}}
}
function bindFirstVisitGuide(){
 // Home only: visitors who intentionally opened a specific recording are never interrupted.
 if(guideAlreadySeen()||document.getElementById('firstVisitGuide'))return;
 const priorFocus=document.activeElement;
 const dialog=document.createElement('dialog');
 dialog.id='firstVisitGuide';dialog.className='ht-dialog';
 dialog.setAttribute('aria-labelledby','ht-welcome-title');
 dialog.setAttribute('aria-describedby','ht-welcome-copy');
 dialog.innerHTML=`<div class="ht-dialog-inner">
  <div class="ht-dialog-top"><span class="ht-dialog-eyebrow">A little orientation · Only on your first visit</span>
   <button type="button" class="ht-dialog-close" id="htDismissTop" aria-label="Close welcome guide">×</button></div>
  <h2 id="ht-welcome-title">Where would you like to begin?</h2>
  <p id="ht-welcome-copy">Some music surprises us. Some brings a memory to mind. Some makes us wonder what came before. There isn't a right way to begin.</p>
  <div class="ht-dialog-options">
   <a href="/how-to/#encounter"><span>01 · Encounter</span><strong>Hear something unexpected</strong><small>Begin with a new sound.</small></a>
   <a href="/how-to/#connection"><span>02 · Connection</span><strong>Notice what feels familiar</strong><small>See what the music brings to mind.</small></a>
   <a href="/how-to/#journey"><span>03 · Journey</span><strong>Follow a musical question</strong><small>Explore a sound across time.</small></a>
  </div>
  <div class="ht-dialog-bottom"><a href="/explore/" class="ht-skip-listen">I'd rather start listening →</a>
   <button type="button" id="htNotNow">Not now</button></div>
  <p class="ht-dialog-small">The library is free to browse. No account or reflection is required. Reopen this guide anytime from <strong>How to Listen</strong>.</p>
 </div>`;
 document.body.append(dialog);
 const dismiss=()=>dialog.close();
 dialog.querySelector('#htDismissTop').addEventListener('click',dismiss);
 dialog.querySelector('#htNotNow').addEventListener('click',dismiss);
 dialog.addEventListener('click',event=>{
  if(event.target===dialog)dismiss();
  if(event.target.closest('a'))rememberGuideVisit();
 });
 dialog.addEventListener('close',()=>{
  rememberGuideVisit();dialog.remove();
  if(priorFocus&&typeof priorFocus.focus==='function'&&priorFocus.isConnected)priorFocus.focus({preventScroll:true});
 });
 try{dialog.showModal();}catch(error){dialog.remove();}
}
function render(){const route=decodeURI((location.hash.startsWith('#/') ? location.hash.slice(1) : location.pathname.replace(/\/index\.html$/,'').replace(/\/$/,'') || '/').split('?')[0]);let page=route==='/'?home():route==='/how-to'?howTo():route==='/africa'?africa():route==='/north-america'?northAmerica():['Asia','Europe','South America','Oceania'].some(c=>route===continentHref(c).slice(0,-1))?continentPage(continentList.find(c=>route===continentHref(c).slice(0,-1))):route.startsWith('/country/')?country(route.slice('/country/'.length)):route==='/crossroads'?crossroads():route==='/discoveries'?discoveries():route==='/about'?about():route==='/participate'?participate():route==='/recording'?recordingDetail():route==='/saved'?savedListening():route==='/suggest'?suggestion():explore();document.getElementById('app').innerHTML=nav(route)+`<main class="page" id="main-content" tabindex="-1">${page}</main>`+footer();window.E2ESiteShell.bind();bindSaveButtons();document.querySelectorAll('[data-catalog-retry]').forEach(button=>button.addEventListener('click',()=>location.reload()));if(route==='/'){bindNewsCarousel();bindIntroListeningStrip();if(!catalogLoadError)bindFirstVisitGuide();}if(route==='/about')bindAboutExperiment();if(route==='/africa')bindFilters('africa',R.filter(r=>r.continent==='Africa'));if(route==='/north-america')bindFilters('northamerica',R.filter(r=>r.continent==='North America'));if(['Asia','Europe','South America','Oceania'].some(c=>route===continentHref(c).slice(0,-1)))bindFilters('continent',R.filter(r=>route===continentHref(r.continent).slice(0,-1)));if(route.startsWith('/country/'))bindFilters('country',R.filter(r=>r.continent==='Africa'&&countryMatches(r,route.slice('/country/'.length))));if(route==='/recording')bindRecordingDetail();if(route==='/explore')bindExplore();else if(!['/','/how-to','/africa','/north-america','/asia','/europe','/south-america','/oceania','/crossroads','/discoveries','/about','/participate','/suggest','/recording','/saved'].includes(route)&&!route.startsWith('/country/'))bindFilters('explore',R);let form=document.getElementById('suggestForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();const s=`Earth to Ear suggestion\nType: ${document.getElementById('type').value}\nName: ${document.getElementById('name').value}\nRegion: ${document.getElementById('region').value}\nFree listening link: ${document.getElementById('musicUrl').value}\nWhy: ${document.getElementById('reason').value}`;const el=document.getElementById('suggestStatus');if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(s).then(()=>el.textContent='Copied to clipboard. No submission was made.').catch(()=>el.textContent='Copy unavailable here. No submission was made.');else el.textContent='Clipboard access is unavailable. No submission was made.'});if(route==='/how-to'&&['#encounter','#connection','#journey'].includes(location.hash)){
 const section=document.getElementById(location.hash.slice(1));
 if(section)requestAnimationFrame(()=>section.scrollIntoView({block:'start'}));
}else if(location.hash==='#archival-listening'){
 const section=document.getElementById('archival-listening');
 if(section)section.scrollIntoView({block:'start'});
}else window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{if(R.length)render();});
const approvedArtwork=new Image();approvedArtwork.onload=()=>document.documentElement.classList.add('ed-exact-art-ready');approvedArtwork.src='/assets/approved-homepage-reference.webp';
// The public information architecture must remain available when Supabase is unavailable.
// The catalog is optional for navigation, About, and participation; only recording lists depend on it.
Promise.allSettled([loadCatalog(),loadHomepageFeatures()]).then(results=>{
 if(results[0].status==='rejected'){
  catalogLoadError=results[0].reason||new Error('Catalog unavailable');
  console.warn('The music catalog could not be loaded',catalogLoadError);
 }
 if(results[1].status==='rejected')console.warn('Editorial selections unavailable',results[1].reason);
 render();
}).catch(error=>{
 // Last-resort fallback: even an unexpected rendering failure must not hide navigation.
 console.error('Earth to Ear rendering encountered an error',error);
 const root=document.getElementById('app');
 root.innerHTML=nav('/')+'<main class="page" id="main-content" tabindex="-1"><div class="wrap" style="padding:65px 0"><h1>Earth to Ear</h1><p>We could not load this page just now. The public listening guide and project information are still available.</p><p><a href="/how-to/">How to Listen</a> · <a href="/about/">About the Experiment</a> · <a href="/participate/">For Contributors</a></p><button type="button" class="cta" id="retryPage">Try again</button></div></main>'+footer();
 window.E2ESiteShell.bind();
 document.getElementById('retryPage').addEventListener('click',()=>location.reload());
});
