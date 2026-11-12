/* Earth to Ear shared navigation shell · one source of truth for public and member pages. */
(function(){
  'use strict';
  const items=[
    {href:'/explore/',label:'Explore Music',match:p=>p==='/explore'||p==='/recording'||p==='/saved'||/^(\/africa|\/asia|\/europe|\/north-america|\/south-america|\/oceania|\/country)(\/|$)/.test(p)},
    {href:'/journeys/',label:'Musical Journeys',match:p=>p==='/journeys'},
    {href:'/how-to/',label:'How to Listen',match:p=>p==='/how-to'},
    {href:'/about/',label:'About the Experiment',match:p=>p==='/about'||p==='/participate'},
    {href:'/contributor.html',label:'My Account',match:p=>['/contributor.html','/bulletin.html','/founder.html'].includes(p)}
  ];
  function normalize(v){
    const path=String(v||location.pathname).split('?')[0].replace(/\/index\.html$/,'').replace(/\/$/,'');
    return path||'/';
  }
  function activeLabel(path,label){
    const found=items.find(x=>x.label===label);
    return Boolean(found&&found.match(path));
  }
  function header(route){
    const path=normalize(route);
    const links=items.map(x=>'<a href="'+x.href+'"'+(x.match(path)?' class="is-current" aria-current="page"':'')+(x.label==='My Account'?' id="accountPortalLink"':'')+'>'+x.label+'</a>').join('');
    const founder=path==='/contributor.html'?'<a id="founderShortcut" class="e2e-founder-shortcut hidden" href="/founder.html" aria-label="Open the Founder Dashboard">Founder Dashboard</a>':'';
    return '<a class="e2e-skip" href="#main-content">Skip to main content</a>'+
      '<header class="e2e-global-header" data-e2e-shared-nav="1">'+
      '<div class="e2e-global-inner">'+
      '<a class="e2e-global-brand" href="/" aria-label="Earth to Ear homepage"><img src="/assets/earth-to-ear-masthead-global.svg" width="595" height="115" alt="Earth to Ear — A Global Listening Experiment"></a>'+
      '<button type="button" class="e2e-menu-toggle" id="e2e-menu-toggle" aria-controls="e2e-primary-nav" aria-expanded="false" aria-label="Open navigation"><span aria-hidden="true">☰</span> Menu</button>'+
      '<nav class="e2e-primary-nav" id="e2e-primary-nav" aria-label="Primary navigation">'+links+founder+'</nav>'+
      '</div></header>';
  }
  function footer(){
    return '<footer class="e2e-global-footer" data-e2e-shared-footer="1"><div class="e2e-global-footer-inner">'+
      '<div><strong>EARTH TO EAR</strong><p>A Global Listening Experiment</p><p>Listen first. Discover without ranking.</p></div>'+
      '<div><a href="/explore/">Explore Music</a> · <a href="/journeys/">Musical Journeys</a> · <a href="/saved/">Saved Listening</a> · <a href="/how-to/">How to Listen</a> · <a href="/participate/">For Contributors</a><p>Public listening · Private reflections by invitation only</p></div>'+
      '</div></footer>';
  }
  // One shared account label for all pages, including static Journeys and founder tools.
  // This changes only the navigation label. Protected data remains gated server-side.
  const AUTH_KEY='sb-jhgyjqafpnzwfpzwtpki-auth-token';
  const E2E_BASE='https://jhgyjqafpnzwfpzwtpki.supabase.co';
  const E2E_PUBLIC_KEY='sb_publishable_fO6g2GnCm-jCXOxdcwE4kA_Hzr6AR-r';
  async function currentAccessToken(){
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');}catch(e){}
    if(!saved||typeof saved!=='object')return null;
    if(typeof saved.access_token==='string'&&Number(saved.expires_at)>Date.now()/1000+40)return saved.access_token;
    if(typeof saved.refresh_token!=='string')return null;
    // Only import the client for a previously signed-in session requiring refresh.
    const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.81.1');
    const sb=createClient(E2E_BASE,E2E_PUBLIC_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const result=await sb.auth.getSession();
    return result.data?.session?.access_token||null;
  }
  async function hydrateAccountNav(){
    const link=document.getElementById('accountPortalLink');
    if(!link||link.dataset.authCheck==='1')return;
    link.dataset.authCheck='1';
    try{
      const token=await currentAccessToken();
      if(!token)return;
      const check=async action=>{
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
        try{
          const response=await fetch(E2E_BASE+'/functions/v1/e2e-contributor',{
            method:'POST',signal:controller.signal,
            headers:{apikey:E2E_PUBLIC_KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},
            body:JSON.stringify({action})
          });
          return response.ok?response.json():null;
        }finally{clearTimeout(timer);}
      };
      const admin=await check('admin-status').catch(()=>null);
      const current=document.getElementById('accountPortalLink');
      if(!current||current!==link)return;
      if(admin?.administrator===true){
        current.href='/founder.html';current.textContent='Founder Dashboard';
        current.setAttribute('aria-label','Open Founder Dashboard');
        return;
      }
      const status=await check('status').catch(()=>null);
      if(!current.isConnected)return;
      if(status?.status==='active'){
        current.href='/contributor.html';current.textContent='My Journal';
        current.setAttribute('aria-label','Open My Listening Journal');
      }else if(status?.status==='unregistered'){
        current.href='/contributor.html';current.textContent='My Registration';
      }
    }catch(error){
      // Public browsing must not depend on account, network, or session restoration.
    }
  }
  function bind(){
    const button=document.getElementById('e2e-menu-toggle');
    const nav=document.getElementById('e2e-primary-nav');
    if(!button||!nav)return;
    void hydrateAccountNav();
    if(button.dataset.bound==='1')return;
    button.dataset.bound='1';
    function setOpen(open){
      button.setAttribute('aria-expanded',String(Boolean(open)));
      button.setAttribute('aria-label',open?'Close navigation':'Open navigation');
      nav.classList.toggle('is-open',Boolean(open));
    }
    button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){
        setOpen(false);
        button.focus();
      }
    });
    nav.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false);});
    document.addEventListener('click',e=>{
      if(button.getAttribute('aria-expanded')==='true'&&!button.contains(e.target)&&!nav.contains(e.target))setOpen(false);
    });
    if(typeof matchMedia==='function'){
      const m=matchMedia('(min-width: 1061px)');
      const sync=()=>{if(m.matches)setOpen(false);};
      if(m.addEventListener)m.addEventListener('change',sync);
      else if(m.addListener)m.addListener(sync);
    }
  }
  function mount(){
    const h=document.getElementById('e2e-site-header');
    if(h){h.outerHTML=header(location.pathname);bind();}
    const f=document.getElementById('e2e-site-footer');
    if(f)f.outerHTML=footer();
    const main=document.querySelector('main:not([id])');
    if(main){main.id='main-content';main.setAttribute('tabindex','-1');}
  }
  window.E2ESiteShell={header,footer,bind,mount,normalize,activeLabel};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();