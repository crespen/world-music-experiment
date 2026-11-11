/* Earth to Ear — voluntary, browser-only listening continuity. No account, identity or journal data stored. */
(function(){
 'use strict';
 const KEY='e2e-listening-memory-v1';
 const VALID=/^[A-Z]{3}-[0-9]{4,6}$/;
 const ARCS=['jazz-voice','reggae','ghana-highlife'];
 function read(){
  try{
   const raw=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!raw||typeof raw!=='object')return {saved:[],journeys:{}};
   const saved=Array.isArray(raw.saved)?[...new Set(raw.saved.filter(x=>typeof x==='string'&&VALID.test(x)))].slice(0,100):[];
   const journeys={};
   for(const a of ARCS){
    const item=raw.journeys&&raw.journeys[a];
    if(item&&Number.isInteger(item.stop)&&item.stop>0&&item.stop<=30)
     journeys[a]={stop:item.stop,total:Number.isInteger(item.total)?item.total:0,at:Number.isFinite(item.at)?item.at:0};
   }
   return {saved,journeys};
  }catch(e){return {saved:[],journeys:{}};}
 }
 function write(state){
  try{localStorage.setItem(KEY,JSON.stringify(state));return true;}
  catch(e){return false;}
 }
 function saved(){return read().saved;}
 function hasRecording(id){return VALID.test(String(id||''))&&saved().includes(id);}
 function toggleRecording(id){
  if(typeof id!=='string'||!VALID.test(id))return {ok:false,saved:false};
  const state=read(),already=state.saved.includes(id);
  state.saved=already?state.saved.filter(x=>x!==id):[id,...state.saved].slice(0,100);
  const ok=write(state);
  return {ok,saved:ok?!already:already};
 }
 function getJourney(arc){return ARCS.includes(arc)?read().journeys[arc]||null:null;}
 function allJourneys(){return read().journeys;}
 function saveJourney(arc,stop,total){
  if(!ARCS.includes(arc)||!Number.isInteger(stop)||stop<1||!Number.isInteger(total)||total<1||stop>total)return false;
  const state=read();state.journeys[arc]={stop,total,at:Date.now()};return write(state);
 }
 function clearJourney(arc){
  if(!ARCS.includes(arc))return false;
  const state=read();delete state.journeys[arc];return write(state);
 }
 window.E2EListening={saved,hasRecording,toggleRecording,getJourney,allJourneys,saveJourney,clearJourney};
})();
