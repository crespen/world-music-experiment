import test from 'node:test';
import assert from 'node:assert/strict';
import {generatePages,validate,renderRecording,pathFor} from './generate-recording-pages.mjs';
const sample={
 id:'AFR-0028',title:'Okonko drum beat',artist:'Performers not identified',
 continent:'Africa',country:'Nigeria',tradition:'Okonko drumming',
 period:'Living traditions',description:'An Okonko drum recording from the Opobo Kingdom. Listen for a recurring rhythmic idea and how it changes.',
 access:'Wikimedia Commons: free 1:20 original audio, CC BY-SA 4.0; performer attribution not independently confirmed',
 source_credit:'Uploader credited separately · Wikimedia Commons',
 listen:'https://commons.wikimedia.org/wiki/File:Okonko_drum_beat.ogg',active:true
};
test('one source yields one canonical indexable page and one sitemap entry',()=>{
 const pages=generatePages([sample]);
 assert.equal(pages.size,2);
 const html=pages.get('recording/afr-0028/index.html');
 assert.match(html,/<meta name="robots" content="index,follow">/);
 assert.match(html,/rel="canonical" href="https:\/\/earthtoear.com\/recording\/afr-0028\/"/);
 assert.match(html,/<script type="application\/ld\+json">/);
 assert.match(html,/Listen at original source/);
 assert.match(html,/CC BY-SA 4.0/);
 assert.match(html,/performer attribution not independently confirmed/);
 assert.match(pages.get('sitemap.xml'),/recording\/afr-0028\//);
 assert.doesNotMatch(pages.get('sitemap.xml'),/\?id=/);
});
test('reject inactive, missing, duplicate and invalid records',()=>{
 assert.throws(()=>validate([]));
 assert.throws(()=>validate([{...sample,active:false}]));
 assert.throws(()=>validate([sample,sample]));
 assert.throws(()=>validate([{...sample,id:'../../escape'}]));
 assert.throws(()=>validate([{...sample,listen:'javascript:alert(1)'}]));
 assert.throws(()=>validate([{...sample,description:''}]));
});
test('HTML escaping prevents provider or editorial fields from injecting markup',()=>{
 const malicious={...sample,title:'A <script>alert("x")</script>',description:'Sound </script><img src=x onerror=alert(1)>'};
 const html=renderRecording(malicious,[malicious]);
 assert.doesNotMatch(html,/<img src=x onerror/);
 assert.doesNotMatch(html,/<title>.*<script>/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/\\u003c\/script\\u003e/);
});
test('private contributor fields never appear in the public output',()=>{
 const row={...sample,email:'confidential@example.invalid',participant_id:'SAMPLE-SECRET',journal_entry:'Private listening impression'};
 const page=renderRecording(row,[row]);
 assert.doesNotMatch(page,/confidential@example\.invalid|SAMPLE-SECRET|Private listening impression/);
 assert.equal(pathFor(row),'/recording/afr-0028/');
});


test('recording pages give public visitors an immediate listening path and optional contextual depth',()=>{
 const html=renderRecording({...sample,id:'ASI-0005',title:'Allah Hoo',artist:'Nusrat Fateh Ali Khan',continent:'Asia',country:'Pakistan',tradition:'Qawwali'},[]);
 assert.match(html,/Hear the music at its original source/);
 assert.match(html,/No account, invitation, or musical expertise required/);
 assert.match(html,/Explore the artist, instruments and origins/);
 assert.match(html,/Artist or ensemble/);
 assert.match(html,/Origins and evolution/);
 assert.match(html,/Qawwali is South Asian Sufi devotional ensemble singing/);
 const generic=renderRecording({...sample,id:'AFR-9999'},[]);
 assert.match(generic,/The detailed history of this specific musical performance and its influences has not yet been established/);
 assert.doesNotMatch(generic,/participant_id|journal_entry/);
});
