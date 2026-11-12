/* Earth to Ear — public recording-page generator. Node 22+, no external dependencies.
   Exposes only public Supabase music_catalog entries that have active=true.
   For tests pass E2E_CATALOG_FILE to read a local snapshot instead of making HTTP requests.
*/
const BASE = 'https://earthtoear.com';
const ID_RE = /^[A-Z]{3}-[0-9]{4,6}$/;
const STATIC_ROUTES = ['/', '/about/', '/participate/', '/explore/', '/how-to/', '/journeys/', '/africa/', '/asia/', '/europe/', '/north-america/', '/south-america/', '/oceania/'];
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function tidy(value){return String(value??'').replace(/\s+/g,' ').trim();}
function brief(value,max=155){
 const text=tidy(value);
 if(text.length<=max)return text;
 const segment=text.slice(0,max-1);
 const stop=segment.lastIndexOf(' ');
 return (stop>80?segment.slice(0,stop):segment).replace(/[,;:–-]+$/,'')+'…';
}
function sourceURL(r){
 const value=tidy(r.listen);
 try{const parsed=new URL(value);return ['https:','http:'].includes(parsed.protocol)?parsed.toString():'';}catch(_){return '';}
}
function pathFor(r){return '/recording/'+String(r.id).toLowerCase()+'/';}
function validate(rows){
 if(!Array.isArray(rows)||rows.length===0)throw Error('No active public recordings: refusing to publish an empty catalog.');
 const seen=new Set();
 for(const r of rows){
  if(!r||!ID_RE.test(r.id||''))throw Error('Invalid recording ID in active public catalog.');
  if(seen.has(r.id))throw Error('Duplicate recording ID '+r.id);
  seen.add(r.id);
  if(!tidy(r.title)||!tidy(r.artist)||!tidy(r.country)||!tidy(r.description)||!sourceURL(r))throw Error('Incomplete public recording '+r.id);
  if(r.active===false)throw Error('Inactive recording accidentally supplied: '+r.id);
 }
 return rows.slice().sort((a,b)=>a.id.localeCompare(b.id));
}
function accessLabel(r){
 const url=sourceURL(r).toLowerCase(),n=tidy(r.access).toLowerCase();
 const m=String(r.access||'').match(/\b\d{1,2}:\d{2}\b/);
 const duration=m?' · '+m[0]:'';
 if(n.includes('30-second')||n.includes('30 second'))return 'Short preview · Provider restrictions may apply';
 if(url.includes('commons.wikimedia.org'))return 'Audio'+duration+' · Wikimedia Commons';
 if(url.includes('digitalarchives.ru.ac.za'))return 'Archive audio'+duration+' · International Library of African Music';
 if(url.includes('archives.crem-cnrs.fr'))return 'Archive recording'+duration+' · CREM-CNRS';
 if(url.includes('loc.gov'))return 'Historical recording'+duration+' · Library of Congress';
 if(url.includes('youtube.com')||url.includes('youtu.be'))return 'Performance video · YouTube';
 if(url.includes('bandcamp.com'))return 'Artist or label recording · Bandcamp';
 if(url.includes('folkways.si.edu'))return 'Smithsonian Folkways recording';
 return 'Hear this recording at its source';
}
function relatedLinks(r,all){
 const candidates=all.filter(x=>x.id!==r.id);
 const sameCountry=candidates.find(x=>x.country===r.country);
 const sameTradition=candidates.find(x=>x.tradition===r.tradition && x.id!==sameCountry?.id);
 const otherPlace=candidates.find(x=>x.continent!==r.continent && x.id!==sameCountry?.id&&x.id!==sameTradition?.id);
 return [sameCountry,sameTradition,otherPlace].filter(Boolean).slice(0,3).map(x=>
 '<li><a href="'+esc(pathFor(x))+'"><span>'+esc(x.country)+' · '+esc(x.tradition)+'</span><strong>'+esc(x.title)+'</strong></a></li>').join('');
}
function renderRecording(r,all){
 const url=BASE+pathFor(r);
 const title=tidy(r.title)+' — '+tidy(r.country)+' | Earth to Ear';
 const metaDescription=brief(tidy(r.description),158);
 const external=sourceURL(r);
 const artist=tidy(r.artist),unknown=/^performers? not identified$/i.test(artist);
 const jsonld={
  '@context':'https://schema.org','@type':'MusicRecording',
  name:tidy(r.title),description:tidy(r.description),url,
  mainEntityOfPage:url,
  ...(unknown?{}:{byArtist:{'@type':'MusicGroup',name:artist}}),
  ...(r.tradition?{genre:tidy(r.tradition)}:{})
 };
 const structured=JSON.stringify(jsonld).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
 const details=tidy(r.access),credit=tidy(r.source_credit);
 const linkText=external.includes('youtube.com')?'Watch original performance':external.includes('loc.gov')?'Listen at Library of Congress':'Listen at original source';
 return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(metaDescription)}">
<meta name="robots" content="index,follow"><meta name="theme-color" content="#102e37">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Earth to Ear">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(metaDescription)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${BASE}/assets/earth-to-ear-hero.svg">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">${structured}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=review-v1">
<link rel="stylesheet" href="/assets/site-shell.css?v=stage1-v4">
<link rel="stylesheet" href="/assets/recording-seo.css?v=seo-v1">
</head><body>
<div id="e2e-site-header"></div>
<main id="main-content" tabindex="-1" class="e2e-seo-main">
<section class="e2e-seo-hero"><div class="e2e-seo-container">
<nav class="e2e-seo-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/explore/">Explore Music</a> / <span aria-current="page">${esc(r.title)}</span></nav>
<p><a id="e2e-seo-back" href="/explore/">← Back to browsing</a></p>
<p class="e2e-seo-kicker">${esc(r.continent)} · ${esc(r.country)} · ${esc(r.id)}</p>
<h1>${esc(r.title)}</h1>
<p class="e2e-seo-artist">${esc(r.artist)}</p>
<div class="e2e-seo-metadata">${[r.tradition,r.period,r.era].filter(Boolean).map(x=>'<span>'+esc(x)+'</span>').join('')}</div>
</div></section>
<div class="e2e-seo-container e2e-seo-columns">
<article class="e2e-seo-article">
<h2>Meet the recording</h2><p>${esc(r.description)}</p>
<h2>What might you notice?</h2>
<p>Listen for a sound or moment that catches your attention—a rhythm, a voice, an instrument, a change in texture, or something unexpected. You do not need technical terms or a correct answer.</p>
<h2>Hear it at the original source</h2>
<p>Earth to Ear provides independent listening context; the music remains with its source. Visiting a provider does not transfer any recording rights to Earth to Ear.</p>
<p class="e2e-seo-access"><strong>Listening access:</strong> ${esc(accessLabel(r))}</p>
${details?'<details class="e2e-seo-details"><summary>Source access, licensing and verification details</summary><p>'+esc(details)+'</p></details>':''}
${credit?'<p class="e2e-seo-credit"><strong>Source credit:</strong> '+esc(credit)+'</p>':''}
<div class="e2e-seo-actions">
<a class="e2e-seo-primary" href="${esc(external)}" target="_blank" rel="noopener noreferrer">${esc(linkText)} ↗</a>
<button type="button" id="e2e-seo-save" class="e2e-save-button" data-recording-id="${esc(r.id)}" aria-pressed="false">☆ Save for later</button>
<button type="button" id="e2e-seo-copy">Copy page link</button>
<button type="button" class="e2e-report-link" data-e2e-report="${esc(r.id)}" data-e2e-title="${esc(r.title)}">Report link issue</button>
</div><p id="e2e-seo-feedback" role="status" aria-live="polite"></p>
</article>
<aside class="e2e-seo-side">
<h2>Your listening continues here</h2>
<p>The original recording opens in a new tab. Return here for context, more discoveries, or a private reflection if you are an invited contributor.</p>
<p><a href="/contributor.html?recording=${encodeURIComponent(r.id)}">My Journal (invited contributors)</a></p>
<p><a href="/saved/">Your Saved Listening shelf</a></p>
<h3>Discover another recording</h3>
<ul class="e2e-seo-related">${relatedLinks(r,all)}</ul>
<p><a href="/explore/">Browse the full listening library →</a></p>
</aside>
</div></main>
<div id="e2e-site-footer"></div>
<script src="/assets/site-shell.js?v=review-v1" defer></script>
<script src="/assets/listening-memory.js?v=listener-ux-v1" defer></script>
<script src="/assets/recording-seo.js?v=seo-v1" defer></script>
<script src="/assets/listening-report.js?v=20261111-v2" defer></script>
</body></html>\n`;
}
function generateSitemap(records){
 const urls=[...STATIC_ROUTES,...records.map(pathFor)];
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
  urls.map(p=>'<url><loc>'+BASE+p+'</loc></url>').join('\n')+'\n</urlset>\n';
}
function generatePages(rows){
 const records=validate(rows);
 const pages=new Map();
 for(const r of records)pages.set('recording/'+r.id.toLowerCase()+'/index.html',renderRecording(r,records));
 pages.set('sitemap.xml',generateSitemap(records));
 return pages;
}

/* NODE RUNTIME - pure generator functions above can also be tested without Node. */
async function main(){
 const fs=await import('node:fs'),path=await import('node:path');
 const root=process.cwd(),destination=path.resolve(root,process.env.E2E_OUTPUT_DIR||'_site');
 if(destination===root||!destination.startsWith(root+path.sep))throw Error('Invalid build output path.');
 let records;
 if(process.env.E2E_CATALOG_FILE){
  records=JSON.parse(fs.readFileSync(path.resolve(process.env.E2E_CATALOG_FILE),'utf8'));
 }else{
  const project=process.env.SUPABASE_URL||'https://jhgyjqafpnzwfpzwtpki.supabase.co';
  const key=process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!key)throw Error('Public catalog publishable key missing.');
  records=[];
  for(let offset=0;;offset+=500){
   const u=new URL(project+'/rest/v1/music_catalog');
   u.searchParams.set('select','id,title,artist,continent,country,tradition,period,era,description,listen,access,source_credit,updated_at,active');
   u.searchParams.set('active','eq.true');u.searchParams.set('order','id.asc');
   u.searchParams.set('limit','500');u.searchParams.set('offset',String(offset));
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
   let response;
   try{response=await fetch(u,{headers:{apikey:key,Accept:'application/json'},signal:controller.signal});}
   finally{clearTimeout(timer);}
   if(!response.ok)throw Error('Public catalog request failed: HTTP '+response.status);
   const batch=await response.json();
   if(!Array.isArray(batch))throw Error('Unexpected public catalog payload.');
   records.push(...batch);
   if(batch.length<500)break;
  }
 }
 const pages=generatePages(records);
 fs.rmSync(destination,{recursive:true,force:true});
 fs.mkdirSync(destination,{recursive:true});
 const include=['assets','about','africa','asia','europe','explore','how-to','journeys','north-america','oceania','participate','saved','south-america',
  'index.html','founder.html','founder-contributors.html','contributor.html','bulletin.html','CNAME','robots.txt'];
 for(const name of include){
  const from=path.join(root,name),to=path.join(destination,name);
  if(fs.existsSync(from))fs.cpSync(from,to,{recursive:true});
 }
 fs.mkdirSync(path.join(destination,'recording'),{recursive:true});
 fs.copyFileSync(path.join(root,'recording','index.html'),path.join(destination,'recording','index.html'));
 fs.writeFileSync(path.join(destination,'.nojekyll'),'');
 for(const [name,content] of pages){
  const target=path.join(destination,name);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,content,'utf8');
 }
 console.log('Prepared '+(pages.size-1)+' indexable recording pages and a '+(STATIC_ROUTES.length+pages.size-1)+' URL sitemap.');
}
if(typeof process!=='undefined'&&process.argv[1]?.endsWith('generate-recording-pages.mjs')){
 main().catch(error=>{console.error(error);process.exitCode=1;});
}

export { generatePages, validate, renderRecording, pathFor, generateSitemap };
