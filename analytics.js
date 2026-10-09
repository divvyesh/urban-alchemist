/* Basic consent mode: Google is loaded only after explicit analytics consent. */
(function(){
  'use strict';
  const ID='G-E1J2EMLYTV', KEY='ua-analytics-consent-v1';
  const pages=['/','/visit','/blog','/wellness-apothecary-lincoln-park','/exotic-snacks-lincoln-park','/blog/thca-vs-thc','/blog/gummies-types-evidence','/blog/adaptogens-functional-mushrooms','/blog/kratom-evidence-risks'];
  const path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  if(!pages.includes(path))return;
  const blocked=()=>navigator.globalPrivacyControl||navigator.doNotTrack==='1';
  const read=()=>{try{return localStorage.getItem(KEY)}catch{return null}};
  let consent=read(),loaded=false;
  const permitted=()=>consent==='granted'&&!blocked();
  const safe=v=>String(v||'unknown').toLowerCase().replace(/[^a-z0-9_-]/g,'_').slice(0,64);
  const destination=href=>{try{const u=new URL(href,location.origin);if(u.protocol==='tel:')return 'phone';if(u.protocol==='mailto:')return 'email';if(!/^https?:$/.test(u.protocol))return 'other';if(u.origin===location.origin){const p=u.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';return pages.includes(p)?p:'internal_other'}if(/(^|\.)google\.[a-z.]+$/.test(u.hostname)&&(/maps/.test(u.pathname)||u.hostname.startsWith('maps.')))return 'directions';if(/(^|\.)(instagram.com|tiktok.com|facebook.com)$/.test(u.hostname))return 'social';return 'outbound'}catch{return 'other'}};
  const debug=location.search==='?ua_debug=1';
  function send(name,fields){if(permitted()&&loaded)window.gtag('event',name,Object.assign({page_location:location.origin+path,page_title:'Urban Alchemist '+(path==='/'?'home':path.slice(1)),page_referrer:'',send_to:ID},debug?{debug_mode:true}:{},fields));}
  function start(){
    if(!permitted()||loaded)return;
    loaded=true;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',ID,Object.assign({send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+path,page_referrer:'',cookie_expires:60*60*24*90},debug?{debug_mode:true}:{}));
    const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(script);
    send('page_view',{page:path});
  }
  function choose(value){consent=value;try{localStorage.setItem(KEY,value)}catch{}if(value==='granted')start();else{window['ga-disable-'+ID]=true;document.cookie.split(';').forEach(c=>{const n=c.trim().split('=')[0];if(n.startsWith('_ga'))['',location.hostname,'.ualincolnpark.com'].forEach(d=>{document.cookie=n+'=; Max-Age=0; path=/'+(d?'; domain='+d:'')})});}panel.hidden=true;}
  const style=document.createElement('style');style.textContent='.ua-consent{position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;z-index:9000;background:#fff9ed;color:#211b14;border:1px solid #8a6220;padding:20px;border-radius:8px;box-shadow:0 8px 30px #0003;font:15px/1.5 system-ui}.ua-consent[hidden]{display:none}.ua-consent p{margin:0 0 12px}.ua-consent button{background:#211b14;color:#fff9ed;padding:10px 16px;border:1px solid #211b14;border-radius:4px;margin:0 8px 0 0;cursor:pointer}.ua-privacy-choice{display:block;margin:16px auto;background:transparent;color:inherit;border:1px solid currentColor;padding:8px 12px;cursor:pointer}';document.head.append(style);
  const panel=document.createElement('aside');panel.className='ua-consent';panel.dataset.analyticsPrivate='';panel.setAttribute('aria-label','Analytics choice');panel.innerHTML='<p><strong>Your analytics choice</strong></p><p>Optional Google Analytics helps us understand page visits and site clicks. If you allow it, Google receives page and interaction data and uses analytics cookies. We exclude personal details, form entries and quiz answers. You can change your choice below at any time. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google privacy policy</a></p><button type="button" data-choice="denied">Decline analytics</button><button type="button" data-choice="granted">Allow analytics</button>';
  panel.hidden=!!consent||blocked();document.body.append(panel);
  panel.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{window['ga-disable-'+ID]=false;choose(b.dataset.choice)}));
  const settings=document.createElement('button');settings.type='button';settings.className='ua-privacy-choice';settings.dataset.analyticsPrivate='';settings.textContent='Analytics privacy choices';settings.addEventListener('click',()=>{panel.hidden=false;if(blocked())panel.querySelector('p:nth-child(2)').textContent='Your browser privacy preference blocks analytics. No analytics data is sent.';});(document.querySelector('footer')||document.body).append(settings);
  document.addEventListener('click',e=>{
    if(!permitted())return;const target=e.target.closest?.('a,button,summary');
    if(!target||target.closest('form,[data-analytics-private],.gate,[id*="quiz"],[id*="onboarding"]'))return;
    const area=target.closest('section,article,header,footer,nav');const href=target.getAttribute('href');
    send('site_interaction',{page:path,section:safe(area?.id||area?.getAttribute('aria-labelledby')||area?.tagName),element:safe(target.getAttribute('data-track-id')),type:target.tagName==='A'?'link':target.tagName==='SUMMARY'?'disclosure':'control',destination:href?destination(href):'none'});
  },{capture:true});
  start();
})();
