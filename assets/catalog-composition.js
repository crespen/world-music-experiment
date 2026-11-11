/**
 * Earth to Ear · live catalog composition for the private founder dashboard.
 * Reads public music_catalog only; does not access journal or contributor records.
 * Recording era and musical approach are deliberately independent dimensions.
 */
const CONTINENTS=['Africa','Asia','Europe','North America','South America','Oceania'];
const APPROACHES=['Contemporary','Living traditions','20th-century transformations','Historical recordings'];
const ERA_ORDER=['Contemporary performance','Historical / archival','Date not established'];
const COLORS=['#8bcfc3','#e2c28e','#9eaed9','#db9f9b','#7eb4cd','#aa9d8a'];
const get=document.getElementById.bind(document);

const el=(tag,cls,label)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(label!==undefined)n.textContent=String(label);
 return n;
};
function recordingEra(era){
 const text=String(era||'').trim();
 if(/^contemporary(?:\b|\s*\/)/i.test(text))return ERA_ORDER[0];
 if(/^historical\s*\/\s*(original|archival)\b/i.test(text)||/^living tradition\s*\/\s*archival\b/i.test(text))return ERA_ORDER[1];
 return ERA_ORDER[2];
}
function providerName(link){
 try{
  const hostname=new URL(link).hostname.toLowerCase();
  if(hostname==='youtube.com'||hostname.endsWith('.youtube.com')||hostname==='youtu.be')return 'YouTube';
  if(hostname==='folkways.si.edu')return 'Smithsonian Folkways';
  if(hostname==='asia.si.edu')return 'Smithsonian Asian Art';
  if(hostname==='loc.gov'||hostname.endsWith('.loc.gov'))return 'Library of Congress';
  if(hostname==='commons.wikimedia.org')return 'Wikimedia Commons';
  if(hostname==='bandcamp.com'||hostname.endsWith('.bandcamp.com'))return 'Bandcamp';
  return hostname.replace(/^www\./,'')||'Other';
 }catch{return 'Other / not specified';}
}
function countBy(rows,fn){
 const result=new Map();
 for(const item of rows){const label=fn(item);result.set(label,(result.get(label)||0)+1);}
 return result;
}
function sortedCounts(map,preferred=[]){
 return [...map].sort((a,b)=>{
  const ia=preferred.indexOf(a[0]),ib=preferred.indexOf(b[0]);
  if(ia>=0||ib>=0)return (ia<0?Number.MAX_SAFE_INTEGER:ia)-(ib<0?Number.MAX_SAFE_INTEGER:ib);
  return b[1]-a[1]||a[0].localeCompare(b[0]);
 });
}
export function summarizeCatalog(rows,selected='All continents'){
 const filtered=selected==='All continents'?rows:rows.filter(r=>r.continent===selected);
 const approaches=countBy(filtered,r=>r.period||'Not classified');
 const eras=countBy(filtered,r=>recordingEra(r.era));
 const platforms=countBy(filtered,r=>providerName(r.listen));
 const continents=countBy(filtered,r=>r.continent||'Not specified');
 const places=new Set(filtered.map(r=>String(r.country||'').trim()).filter(Boolean));
 const matrix=Object.fromEntries(ERA_ORDER.map(e=>[e,Object.fromEntries(APPROACHES.map(a=>[a,0]))]));
 for(const r of filtered){
  const era=recordingEra(r.era),approach=r.period||'Not classified';
  if(matrix[era]&&Object.hasOwn(matrix[era],approach))matrix[era][approach]+=1;
 }
 return {rows:filtered,total:filtered.length,approaches,eras,platforms,continents,places:places.size,matrix};
}
function metric(value,label){
 const card=el('div','cc-metric');
 card.append(el('strong','',value),el('span','',label));return card;
}
function chart(title,map,total,preferred=[]){
 const card=el('section','cc-subpanel');card.append(el('h3','',title));
 const items=sortedCounts(map,preferred);
 if(!items.length){card.append(el('p','muted','No recordings in this view.'));return card;}
 const max=Math.max(...items.map(x=>x[1]),1);
 for(const [name,count] of items){
  const i=items.findIndex(x=>x[0]===name);
  const row=el('div','cc-barrow');
  const top=el('div','cc-bartop');
  top.append(el('span','',name),el('strong','',count+' · '+Math.round(total?100*count/total:0)+'%'));
  const track=el('div','cc-track'),fill=el('span','cc-fill');
  fill.style.width=(100*count/max)+'%';fill.style.backgroundColor=COLORS[i%COLORS.length];
  track.append(fill);row.append(top,track);card.append(row);
 }
 return card;
}
function matrixTable(summary){
 const section=el('section','cc-subpanel cc-wide');
 section.append(el('h3','','Recording era × musical category'));
 section.append(el('p','muted cc-explain','Counts reflect two different questions: when the recorded performance is described as occurring, and how the music is categorized. An older recording is not necessarily traditional music.'));
 const wrapper=el('div','cc-tablewrap'),table=el('table','cc-matrix');
 const thead=el('thead'),headrow=el('tr');
 for(const label of ['Recording era',...APPROACHES,'Total'])headrow.append(el('th','',label));
 thead.append(headrow);table.append(thead);
 const tbody=el('tbody');
 for(const era of ERA_ORDER){
  const tr=el('tr');tr.append(el('th','',era));
  let total=0;for(const approach of APPROACHES){
   const count=summary.matrix[era][approach]||0;total+=count;
   const td=el('td',count?'cc-positive':'cc-empty',count||'–');tr.append(td);
  }
  tr.append(el('td','cc-total',total));tbody.append(tr);
 }
 const totals=el('tr','cc-totalrow');totals.append(el('th','','All recordings'));
 for(const approach of APPROACHES)totals.append(el('td','',summary.approaches.get(approach)||0));
 totals.append(el('td','',summary.total));tbody.append(totals);table.append(tbody);wrapper.append(table);section.append(wrapper);
 section.append(el('p','muted cc-caveat','“Date not established” includes cases where the catalog identifies a release, tradition, or style but not the performance’s recording date. This is not a claim that the music is modern or ancient.'));
 return section;
}
async function fetchAll({endpoint,key}){
 const all=[],page=500;
 for(let offset=0;;offset+=page){
  const url=endpoint+'?select=id,continent,country,period,era,listen&active=eq.true&order=id.asc&limit='+page+'&offset='+offset;
  const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),15000);
  try{
   const res=await fetch(url,{method:'GET',headers:{apikey:key},signal:ctrl.signal,cache:'no-store'});
   if(!res.ok)throw Error('Catalog request failed ('+res.status+')');
   const group=await res.json();
   if(!Array.isArray(group))throw Error('Catalog returned an unexpected format');
   all.push(...group);
   if(group.length<page)break;
  }finally{clearTimeout(timeout);}
  if(offset>=20000)throw Error('Catalog exceeds the current dashboard limit');
 }
 return all;
}
export function createCatalogComposition({endpoint,key}){
 const root=get('catalogComposition'),status=get('ccStatus'),selector=get('ccContinent'),refreshBtn=get('ccRefresh');
 let rows=[],busy=false,lastLoaded=null;
 function draw(){
  const view=summarizeCatalog(rows,selector.value);
  root.replaceChildren();
  const summary=el('div','cc-metrics');
  summary.append(metric(view.total,'Recordings in view'),metric(view.continents.size,'Continents represented'),metric(view.places,'Country / place labels'),metric(view.platforms.size,'Listening providers'));
  root.append(summary);
  const charts=el('div','cc-charts');
  charts.append(chart('Musical approaches',view.approaches,view.total,APPROACHES));
  charts.append(chart('Recording / performance era',view.eras,view.total,ERA_ORDER));
  charts.append(chart('Source platforms',view.platforms,view.total));
  charts.append(chart('Continent distribution',view.continents,view.total,CONTINENTS));
  root.append(charts,matrixTable(view));
  const caveat=el('p','muted cc-footer','All figures are counts of catalog selections, not listening plays or contributor preferences. Geographic labels and musical classifications are editorial starting points, not complete cultural representation.');
  root.append(caveat);
 }
 async function refresh(){
  if(busy)return;
  busy=true;refreshBtn.disabled=true;status.textContent='Refreshing the published catalog…';
  try{
   const fresh=await fetchAll({endpoint,key});
   rows=fresh;lastLoaded=new Date();
   const prior=selector.value;
   selector.replaceChildren();
   for(const continent of ['All continents',...CONTINENTS]){
    const o=el('option','',continent);o.value=continent;selector.append(o);
   }
   selector.value=[...selector.options].some(o=>o.value===prior)?prior:'All continents';
   draw();
   status.textContent='Live catalog · '+rows.length+' published selections · updated '+lastLoaded.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  }catch(err){
   status.textContent='Catalog breakdown unavailable: '+(err.name==='AbortError'?'request timed out':err.message)+'.';
   if(!rows.length)root.replaceChildren(el('p','muted','The dashboard report is still available. Refresh this section to try again.'));
  }finally{busy=false;refreshBtn.disabled=false;}
 }
 selector.addEventListener('change',()=>{if(lastLoaded)draw();});
 refreshBtn.addEventListener('click',refresh);
 // Update on return to the tab and periodically while this authorized dashboard is open.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&lastLoaded&&Date.now()-lastLoaded.getTime()>120000)void refresh();});
 setInterval(()=>{if(!document.hidden&&lastLoaded&&Date.now()-lastLoaded.getTime()>180000)void refresh();},60000);
 return {refresh,summarize:summarizeCatalog};
}
