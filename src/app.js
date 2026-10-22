/* ===================== STATE ===================== */
const K="athen-kompass-v1";
const DEF={start:"2026-11-05",end:"2026-11-09",rain:false,veg:true,vegan:false,lf:true,plan:{},cats:[],q:"",mode:"walk",routeDay:"all",tab:"entdecken",sample:true,view:"list",sort:"top",kueche:""};
let S=Object.assign({},DEF);
try{const raw=localStorage.getItem(K);if(raw)S=Object.assign({},DEF,JSON.parse(raw));}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
// Standort bleibt nur im Arbeitsspeicher, wird nicht gespeichert
let ME=null;
const ATHENS={lat:37.9755,lon:23.7348};
function locate(){
  if(!("geolocation" in navigator)){toast("Dein Browser unterstützt keine Standortabfrage");return;}
  const b=$("#locBtn");b.classList.add("busy");
  navigator.geolocation.getCurrentPosition(p=>{b.classList.remove("busy");
    ME={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy};
    const far=hav(ME,ATHENS);
    toast(far>50?`Standort gefunden, ${Math.round(far)} km von Athen`:`Standort gefunden (±${Math.round(ME.acc)} m)`);
    if(far<=50)S.sort="near";
    if(typeof WANT_HOME!=="undefined"&&WANT_HOME){WANT_HOME=false;S.home={lat:ME.lat,lon:ME.lon};S.dt.from="home";toast("Standort als Unterkunft gespeichert");}
    save();renderAll();},
   err=>{b.classList.remove("busy");toast(err.code===1?"Standort abgelehnt. In den Browser-Einstellungen erlauben.":"Standort konnte nicht ermittelt werden");},
   {enableHighAccuracy:true,timeout:12000,maximumAge:60000});}
function fmtMin(m){m=Math.max(1,Math.round(m));return m<60?`${m} Min.`:`${Math.floor(m/60)} h ${String(m%60).padStart(2,"0")}`;}
function distRow(it){if(!ME||!hasGeo(it))return"";const km=hav(ME,it);
  const car=legCost(ME,it,"car");
  if(km>25)return `<div class="dist"><span title="Auto">${ic("car")}<b>${fmtMin(car.min)}</b></span><span>Öffis: Fernbus, Zug oder Fähre</span><span class="km">${kmf(km)} km</span></div>`;
  const w=legCost(ME,it,"walk"),t=legCost(ME,it,"transit");
  const tTxt=t.how==="zu Fuß"?"zu Fuß schneller":fmtMin(t.min);
  return `<div class="dist" title="Geschätzte Wegzeit von deinem Standort"><span title="Zu Fuß">${ic("walk")}<b>${fmtMin(w.min)}</b></span><span title="${esc(t.how)}">${ic("train")}<b>${tTxt}</b></span><span title="Auto/Taxi">${ic("car")}<b>${fmtMin(car.min)}</b></span><span class="km">${kmf(w.km)} km</span></div>`;}

/* ===================== HELPERS ===================== */
const $=s=>document.querySelector(s);
const WD=["So","Mo","Di","Mi","Do","Fr","Sa"];
const WDL=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
const MON=["Jan","Feb","März","Apr","Mai","Juni","Juli","Aug","Sep","Okt","Nov","Dez"];
function d(s){const [y,m,dd]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,dd,12));}
function iso(dt){return dt.toISOString().slice(0,10);}
function days(){let a=d(S.start),b=d(S.end);if(b<a)[a,b]=[b,a];const out=[];for(let x=new Date(a);x<=b&&out.length<62;x.setUTCDate(x.getUTCDate()+1))out.push(iso(x));return out;}
function fmt(s,long){const x=d(s);return (long?WDL:WD)[x.getUTCDay()]+" "+x.getUTCDate()+". "+MON[x.getUTCMonth()];}
function months(){return [...new Set(days().map(s=>d(s).getUTCMonth()+1))];}
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function ic(n,cls){return `<svg class="i${cls?" "+cls:""}" aria-hidden="true"><use href="#i-${n}"/></svg>`;}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),1800);}
function byId(id){return ITEMS.find(i=>i.id===id)||EVENTS.find(e=>e.id===id);}
function hasGeo(x){return x&&typeof x.lat==="number"&&typeof x.lon==="number";}
function hav(a,b){const R=6371,toR=Math.PI/180,dLa=(b.lat-a.lat)*toR,dLo=(b.lon-a.lon)*toR;const h=Math.sin(dLa/2)**2+Math.cos(a.lat*toR)*Math.cos(b.lat*toR)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function mapsLink(x){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(hasGeo(x)?x.lat+","+x.lon:(x.n+" Athens"));}
function inRange(s,e){const ds=days();return !(e<ds[0]||s>ds[ds.length-1]);}
function catOf(it){return CATS[it.c]||CATS.event;}
function tile(it,small){const c=catOf(it);return `<div class="tile${small?" s":""}" style="--cc:var(${it.hol?"--warn":c.c})">${ic(it.hol?"flag":c.i)}</div>`;}
function todayIso(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}

function freeDays(){const out={};days().forEach(s=>{const x=d(s),m=x.getUTCMonth()+1,dom=x.getUTCDate();
  if(x.getUTCDay()===0&&(m>=11||m<=3)){const nth=Math.ceil(dom/7);if(nth===1||nth===3)out[s]="Freier Eintritt in allen staatlichen Stätten (u. a. Akropolis, Agora)";}
  const md=s.slice(5);if(md==="10-28")out[s]="Freier Eintritt: staatliche Stätten & Akropolismuseum";if(md==="03-06")out[s]="Freier Eintritt (Melina-Merkouri-Tag)";});return out;}
function fastingActive(){return days().some(s=>{const md=s.slice(5);return md>="11-15"&&md<="12-24";});}

/* ===================== BADGES ===================== */
function priceBadge(p){if(!p||(!p.t&&p.k!=="link"))return"";
  if(p.k==="fix")return `<span class="b price" title="${esc(p.n)}">${esc(p.t)}</span>`;
  if(p.k==="free")return p.t?`<span class="b free">${esc(p.t)}</span>`:"";
  if(p.k==="est")return `<span class="b price est" title="Schätzung${p.n?": "+esc(p.n):""}">${esc(p.t)} · Schätzung</span>`;
  return `<a class="b price est" href="${esc(p.u||"#")}" target="_blank" rel="noopener">Preis prüfen ↗</a>`;}
function dietBadges(it){if(!it.diet)return"";const o=[];
  if(it.diet.vegan==="all")o.push('<span class="b veg">100 % vegan</span>');else if(it.diet.veg==="all")o.push('<span class="b veg">vegetarisch</span>');else o.push('<span class="b veg">veg. Optionen</span>');
  if(it.diet.vegan==="opts")o.push('<span class="b veg">vegane Optionen</span>');
  if(it.diet.lf==="easy")o.push('<span class="b veg">laktosefrei leicht</span>');else o.push('<span class="b milk">Laktose: nachfragen</span>');return o.join("");}
function inBadge(it){if(it.in===true)return '<span class="b in">drinnen</span>';if(it.in==="mix")return '<span class="b in">teils drinnen</span>';return '<span class="b">draußen</span>';}

/* ===================== MAP ===================== */
const B={la0:37.954,la1:37.996,lo0:23.700,lo1:23.762},MW=600,MH=Math.round(MW*(B.la1-B.la0)/((B.lo1-B.lo0)*Math.cos(37.975*Math.PI/180)));
function prj(lat,lon){return [(lon-B.lo0)/(B.lo1-B.lo0)*MW,(B.la1-lat)/(B.la1-B.la0)*MH];}
function onMap(x){return hasGeo(x)&&x.lat>=B.la0&&x.lat<=B.la1&&x.lon>=B.lo0&&x.lon<=B.lo1;}
function baseMap(){
  const blob=(lat,lon,rx,ry,cls,rot)=>{const [x,y]=prj(lat,lon);return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${rot||0} ${x.toFixed(1)} ${y.toFixed(1)})" fill="var(${cls})"/>`;};
  let g=`<rect width="${MW}" height="${MH}" fill="var(--mapbg)"/>`;
  for(let x=0;x<=MW;x+=50)g+=`<line x1="${x}" y1="0" x2="${x}" y2="${MH}" stroke="var(--mapline)" stroke-width="1"/>`;
  for(let y=0;y<=MH;y+=50)g+=`<line x1="0" y1="${y}" x2="${MW}" y2="${y}" stroke="var(--mapline)" stroke-width="1"/>`;
  g+=blob(37.9727,23.7380,34,46,"--park",-10)+blob(37.9690,23.7195,42,30,"--park",20)+blob(37.9818,23.7432,22,18,"--park",0)+blob(37.9875,23.7393,14,11,"--park",0);
  g+=blob(37.9715,23.7257,26,12,"--hill",-8)+blob(37.9818,23.7432,9,7,"--hill",0);
  const [ax,ay]=prj(37.9715,23.7257);g+=`<text x="${ax}" y="${ay+4}" text-anchor="middle" font-family="GFS Didot,Georgia,serif" font-size="13" fill="var(--muted)">Akropolis</text>`;
  const [lx,ly]=prj(37.9818,23.7432);g+=`<text x="${lx}" y="${ly-12}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="Commissioner,sans-serif">Lykabettus</text>`;
  const tr=[[37.9740,23.7352],[37.9705,23.7345],[37.9668,23.7318],[37.9600,23.7260],[37.9540,23.7210]].map(p=>prj(...p).map(v=>v.toFixed(1)).join(",")).join(" ");
  g+=`<polyline points="${tr}" fill="none" stroke="var(--tram)" stroke-width="2.5" stroke-dasharray="5 4" opacity=".8"/>`;
  for(const [k,col] of [["m1","--m1"],["m2","--m2"],["m3","--m3"]]){const pts=STATIONS[k].map(s=>prj(s[1],s[2]).map(v=>v.toFixed(1)).join(",")).join(" ");g+=`<polyline points="${pts}" fill="none" stroke="var(${col})" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>`;}
  const lab=new Set(["Syntagma","Monastiraki","Omonia","Akropoli","Thiseio","Evangelismos","Kerameikos","Panepistimio","Larissa","Victoria","Syngrou-Fix","Megaro Mousikis","Petralona"]),seen=new Set();
  for(const k of ["m1","m2","m3"])for(const s of STATIONS[k]){if(seen.has(s[0]))continue;seen.add(s[0]);const [x,y]=prj(s[1],s[2]);
    g+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.2"/>`;
    if(lab.has(s[0]))g+=`<text x="${(x+6).toFixed(1)}" y="${(y-5).toFixed(1)}" font-size="9" fill="var(--muted)" font-family="Commissioner,sans-serif">${s[0]}</text>`;}
  return g;}
function mapSVG(points,{route=null,hl=null,dimIds=new Set()}={}){
  let g=baseMap();
  if(route&&route.length>1){const pts=route.filter(onMap).map(r=>prj(r.lat,r.lon).map(v=>v.toFixed(1)).join(",")).join(" ");
    g+=`<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-dasharray="1 7" stroke-linecap="round"/>`;}
  points.filter(onMap).filter(it=>it.id!=="me").forEach(it=>{const [x,y]=prj(it.lat,it.lon);const col=`var(${catOf(it).c})`;
    const cls=["marker",dimIds.has(it.id)?"dim":"",hl===it.id?"hl":""].join(" ");
    const num=it._no?`<text x="${x.toFixed(1)}" y="${(y+3.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--bg)" font-family="Commissioner,sans-serif">${it._no}</text>`:"";
    g+=`<g class="${cls}" data-id="${it.id}" tabindex="0" role="button" aria-label="${esc(it.n)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${it._no?10:hl===it.id?9:7}" fill="${col}"/>${num}<title>${esc(it.n)}</title></g>`;});
  if(ME&&onMap(ME)){const [x,y]=prj(ME.lat,ME.lon);g+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="var(--rain)" opacity=".22"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="var(--rain)" stroke="var(--mapbg)" stroke-width="3"/><text x="${(x+12).toFixed(1)}" y="${(y+4).toFixed(1)}" font-size="11" font-weight="800" fill="var(--rain)" font-family="Commissioner,sans-serif">Du</text>`;}
  return `<svg viewBox="0 0 ${MW} ${MH}" role="img" aria-label="Schematische Karte des Athener Zentrums"><defs><clipPath id="clipm"><rect width="${MW}" height="${MH}"/></clipPath></defs><g clip-path="url(#clipm)">${g}</g></svg>`;}
function mapCaption(){return `<div class="mapcap"><span><i style="background:var(--m1)"></i>M1</span><span><i style="background:var(--m2)"></i>M2</span><span><i style="background:var(--m3)"></i>M3</span><span><i style="background:var(--tram)"></i>Tram</span><span>Schematisch. Ziele außerhalb des Zentrums nur in der Liste.${ME&&!onMap(ME)?" Dein Standort liegt außerhalb der Karte.":ME?" Blauer Punkt = du.":""}</span></div>`;}

/* ===================== PLAN HELPERS ===================== */
function inPlan(id){return !!S.plan[id];}
function togglePlan(id,day){if(S.plan[id]){delete S.plan[id];toast("Aus dem Plan entfernt");}else{S.plan[id]={day:day||"",done:false};toast("Zum Plan hinzugefügt");}S.sample=false;save();renderAll();}
function planBtn(id,day){return inPlan(id)?`<button class="btn added" data-plan="${id}">${ic("check")}Im Plan</button>`:`<button class="btn primary" data-plan="${id}"${day?` data-day="${day}"`:""}>${ic("plus")}Zum Plan</button>`;}

/* ===================== ENTDECKEN ===================== */
let hlId=null;
function filteredItems(){const q=S.q.trim().toLowerCase();return ITEMS.filter(it=>{
  if(S.hideDone&&typeof isDone==="function"&&isDone(it.id))return false;
  const eat=it.c==="food"||it.c==="cafe",eatSel=S.cats.some(c=>c==="food"||c==="cafe");
  if(S.cats.length&&!S.cats.includes(it.c)&&!(S.kueche&&eat&&eatSel))return false;
  if(q&&!(it.n+" "+it.a+" "+it.d+" "+(it.k||[]).map(x=>KLABEL[x]).join(" ")).toLowerCase().includes(q))return false;
  if(S.kueche&&S.cats.some(c=>c==="food"||c==="cafe")&&(it.c==="food"||it.c==="cafe")&&!kOk(it,S.kueche))return false;
  if((it.c==="food"||it.c==="cafe")&&it.diet&&S.vegan&&!it.diet.vegan)return false;
  return true;});}
function kOk(it,k){if(k==="vegan")return it.diet&&it.diet.vegan==="all";return (it.k||[]).includes(k);}
function kChips(scope){const list=ITEMS.filter(i=>i.c==="food"||i.c==="cafe");
  const opts=[["","Alle"],...KUECHE.map(k=>[k[0],k[1],k[2]]),["vegan","100 % vegan","leaf"]].filter(o=>!o[0]||list.some(i=>kOk(i,o[0])));
  return `<div class="chips" role="group" aria-label="Küche">${opts.map(([k,l,icn])=>`<button class="chip" data-kueche="${k}" aria-pressed="${(S.kueche||"")===k}">${icn?ic(icn):""}${l}${k?` <small class="cnt">${list.filter(i=>kOk(i,k)&&(!S.vegan||i.diet?.vegan)).length}</small>`:""}</button>`).join("")}</div>`;}
function kBadges(it){return (it.k||[]).map(k=>`<span class="b kb">${KLABEL[k]}</span>`).join("");}
function isDim(it){if(S.rain&&it.in===false)return true;if(it.season&&!months().some(m=>it.season.includes(m)))return true;return false;}
function itemCard(it){const cat=catOf(it);const dim=isDim(it);
  const seasonOff=it.season&&!months().some(m=>it.season.includes(m));
  const closedDays=(it.closed||[]).map(x=>WDL[x]).join(", ");
  const alt=S.rain&&it.in===false&&it.alt?byId(it.alt):null;
  const fd=freeDays();const freeHit=it.eu25?Object.keys(fd).filter(k=>fd[k].includes("staatliche")).map(k=>fmt(k)).join(", "):"";
  const dur=it.dur?(it.dur>=60?(Math.round(it.dur/30)/2).toString().replace(".",",")+" h":it.dur+" Min."):"";
  return `<article class="card${dim?" dim":""}${hlId===it.id?" hl":""}" id="card-${it.id}" style="--cc:var(${cat.c})">
   <div class="card-h">${tile(it)}<div class="t"><div class="cat">${cat.n}</div><h3>${esc(it.n)}</h3>
   <div class="meta"><span>${esc(it.a)}</span>${dur?`<span class="dur" title="Geschätzte Aufenthaltsdauer vor Ort">${ic("clock")}ca. ${dur} vor Ort</span>`:""}</div></div></div>
   <div class="badges">${doneBadge(it.id)}${kBadges(it)}${priceBadge(it.p)}${inBadge(it)}${it.eu25?'<span class="b free">EU unter 25: frei</span>':""}${dietBadges(it)}${seasonOff?'<span class="b warn">im Zeitraum geschlossen</span>':""}${closedDays?`<span class="b warn">${closedDays} geschlossen</span>`:""}</div>
   ${distRow(it)}
   <p>${esc(it.d)}</p>
   ${hoursCrowd(it)}
   ${it.p&&it.p.n?`<div class="tip">${esc(it.p.n)}</div>`:""}
   ${it.tip?`<div class="tip"><b>Tipp:</b> ${esc(it.tip)}</div>`:""}
   ${freeHit?`<div class="tip"><b>Gratis in deinem Zeitraum:</b> ${freeHit}</div>`:""}
   ${alt?`<div class="altline">${ic("umbrella")}<span>Bei Regen besser: <button data-goto="${alt.id}">${esc(alt.n)}</button>${alt.p&&alt.p.t?" · "+esc(alt.p.t):""}</span></div>`:""}
   <div class="actions">${planBtn(it.id)}<a class="btn" href="${mapsLink(it)}" target="_blank" rel="noopener">${ic("pin")}Karte</a>${it.url?`<a class="btn ghost" href="${esc(it.url)}" target="_blank" rel="noopener">${ic("ext")}Website</a>`:""}</div>
   ${diaryBlock(it)}
  </article>`;}
function heroHtml(){const ds=days();const t=todayIso();const h=new Date().getHours();
  const greet=h<12?"Καλημέρα":h<18?"Γεια σου":"Καλησπέρα";
  let head,sub;const until=Math.round((d(ds[0])-d(t))/864e5);
  if(t<ds[0]){head=until===1?"Morgen geht’s nach Athen":`Noch ${until} Tage bis Athen`;sub=`${fmt(ds[0],true)} – ${fmt(ds[ds.length-1],true)}`;}
  else if(t<=ds[ds.length-1]){const n=ds.indexOf(t)+1;head=`Tag ${n} von ${ds.length} in Athen`;sub=fmt(t,true);}
  else{head="Deine Athen-Reise";sub=`${fmt(ds[0])} – ${fmt(ds[ds.length-1])} · Zeitraum oben anpassen`;}
  const nFree=Object.keys(freeDays()).length,nEv=EVENTS.filter(e=>!e.hol&&inRange(e.s,e.e)).length,nPlan=Object.keys(S.plan).filter(byId).length;
  return `<div class="hero"><svg class="cols" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/></svg>
   <div><div class="greet">${greet}</div><h2>${head}</h2><div class="sub">${sub}</div></div>
   ${(()=>{if(!ME||hav(ME,ATHENS)>50)return"";const c=ITEMS.filter(i=>hasGeo(i)&&i.c!=="trip"&&!isDim(i)).map(i=>[i,hav(ME,i)]).sort((a,b)=>a[1]-b[1])[0];if(!c)return"";const w=legCost(ME,c[0],"walk");return `<button class="near" data-goto="${c[0].id}">${ic("locate")}<span>Am nächsten: <b>${esc(c[0].n)}</b> · ${fmtMin(w.min)} zu Fuß</span></button>`;})()}
   <div class="stats"><button class="stat" data-tab="events"><b>${nEv}</b><span>Events</span></button><button class="stat" data-tab="events"><b>${nFree}</b><span>Gratis-Tage</span></button><button class="stat" data-tab="plan"><b>${nPlan}</b><span>im Plan</span></button><button class="stat" data-act="gotodiary"><b>${Object.values(S.log||{}).filter(x=>x.done).length+(S.custom||[]).length}</b><span>erlebt</span></button></div></div>`;}
function renderDiscover(){const el=$("#p-entdecken");const list=filteredItems();
  const near=ME&&S.sort==="near";
  const sorted=[...list].sort((a,b)=>near?((hasGeo(a)?hav(ME,a):1e4)-(hasGeo(b)?hav(ME,b):1e4)):(isDim(a)-isDim(b)));
  const chips=Object.entries(CATS).filter(([k])=>k!=="event").map(([k,v])=>`<button class="chip" data-cat="${k}" aria-pressed="${S.cats.includes(k)}" style="--cc:var(${v.c})"><span style="color:var(${v.c})">${ic(v.i)}</span>${v.n}</button>`).join("");
  const dimIds=new Set(list.filter(isDim).map(i=>i.id));
  const sel=hlId&&list.find(i=>i.id===hlId);
  el.innerHTML=`${heroHtml()}
   ${S.rain?`<div class="notice rain">${ic("umbrella")}<span><b>Regentag:</b> Drinnen-Ziele stehen oben. Bei Outdoor-Zielen siehst du eine Alternative. Akropolis und Areopag sind bei Nässe wegen der glatten Marmorflächen unangenehm.</span></div>`:""}
   <div class="searchbox">${ic("search")}<input id="q" type="search" placeholder="Suchen, z. B. Plaka, vegan, Museum" value="${esc(S.q)}" aria-label="Suchen"></div>
   <div class="chips" role="group" aria-label="Kategorien"><button class="chip" data-cat="" aria-pressed="${S.cats.length===0}">Alle</button>${chips}</div>
   ${S.cats.some(c=>c==="food"||c==="cafe")?kChips():""}
   <div class="row" style="justify-content:space-between">${ME&&S.view!=="map"?`<div class="seg" role="group" aria-label="Sortierung"><button data-sort="top" aria-pressed="${!near}">Empfohlen</button><button data-sort="near" aria-pressed="${near}">${ic("locate")}Nähe</button></div>`:`<small style="color:var(--muted)">${list.length} Orte${ME?"":" · Standort oben aktivieren für Wegzeiten"}</small>`}<button class="chip" data-act="hidedone" aria-pressed="${!!S.hideDone}">${ic("check")}Erlebtes ausblenden</button><div class="seg" role="group" aria-label="Ansicht"><button data-view="list" aria-pressed="${S.view!=="map"}">${ic("list")}Liste</button><button data-view="map" aria-pressed="${S.view==="map"}">${ic("map")}Karte</button></div></div>
   ${S.view==="map"?`<div class="mapbox">${mapSVG(list,{hl:hlId,dimIds})}${mapCaption()}</div>${sel?itemCard(sel):`<div class="tip" style="text-align:center">Tippe auf einen Punkt für Details.</div>`}`
   :`<div class="list">${sorted.length?sorted.map(itemCard).join(""):`<div class="empty">${ic("search")}Keine Treffer. Filter zurücksetzen?</div>`}</div>`}`;
  const q=$("#q");q.addEventListener("input",()=>{S.q=q.value;save();const pos=q.selectionStart;renderDiscover();const n=$("#q");n.focus();n.setSelectionRange(pos,pos);});}

/* ===================== EVENTS ===================== */
function renderEvents(){const el=$("#p-events");const ds=days();const fd=freeDays();const byDay={};
  ds.forEach(x=>byDay[x]={ev:[],flags:[]});
  EVENTS.filter(e=>inRange(e.s,e.e)&&e.s>=ds[0]).forEach(e=>byDay[e.s].ev.push(e));
  ds.forEach(x=>{const wd=d(x).getUTCDay();
    if(fd[x])byDay[x].flags.push(["free",fd[x]]);
    if(wd===0)byDay[x].flags.push(["info","Viele Läden zu · Flohmarkt Monastiraki · Wachablösung 11:00 mit Kapelle"]);
    if(wd===6)byDay[x].flags.push(["info","Metro M2 & M3 und Tram fahren die ganze Nacht"]);
    if(x.slice(5)==="10-25")byDay[x].flags.push(["info","Zeitumstellung: Uhr eine Stunde zurück"]);
    if(x.slice(5)==="11-01")byDay[x].flags.push(["info","Ab heute Winteröffnungszeiten (Akropolis 8–17 Uhr)"]);
    if(x.slice(5)==="11-15")byDay[x].flags.push(["info","Beginn der Weihnachtsfastenzeit: mehr νηστίσιμα (vegane) Gerichte"]);});
  let html=`<div class="ptitle"><h2>Events &amp; Termine</h2><small>${fmt(ds[0])} – ${fmt(ds[ds.length-1])}</small></div>
   <p class="lede">Feiertage, Gratis-Tage und Veranstaltungen in deinem Zeitraum. Konzertdaten stammen von Songkick; Preise sind dort verlinkt.</p>`;
  if(S.rain)html+=`<div class="notice rain">${ic("umbrella")}<span>Events unter freiem Himmel sind abgeschwächt dargestellt.</span></div>`;
  const ongoing=EVENTS.filter(e=>inRange(e.s,e.e)&&e.s<ds[0]);
  if(ongoing.length)html+=`<section class="daygroup"><div class="dayhead"><span class="w">Läuft bereits</span></div>${ongoing.map(e=>eventCard(e,ds[0])).join("")}</section>`;
  let any=ongoing.length>0;
  ds.forEach(x=>{const g=byDay[x];if(!g.ev.length&&!g.flags.length)return;any=true;const dt=d(x);
    html+=`<section class="daygroup"><div class="dayhead"><div class="datebadge"><b>${dt.getUTCDate()}</b><span>${MON[dt.getUTCMonth()]}</span></div><span class="w">${WDL[dt.getUTCDay()]}</span></div>
     ${g.flags.length?`<div class="flags">${g.flags.map(f=>`<div class="flagrow"><span class="flag ${f[0]}">${f[0]==="free"?"Gratis":"Info"}</span><span>${esc(f[1])}</span></div>`).join("")}</div>`:""}
     ${g.ev.map(e=>eventCard(e,x)).join("")}</section>`;});
  if(!any)html+=`<div class="empty">${ic("calendar")}In diesem Zeitraum habe ich keine besonderen Termine gefunden.</div>`;
  html+=`<div class="notice">${ic("search")}<span><b>Mehr finden:</b> <a href="https://www.thisisathens.org/events" target="_blank" rel="noopener">This is Athens</a> · <a href="https://www.songkick.com/metro-areas/28976-greece-athens" target="_blank" rel="noopener">Songkick</a> · <a href="https://www.more.com/gr-en/" target="_blank" rel="noopener">more.com</a> · <a href="https://www.snfcc.org/en/events" target="_blank" rel="noopener">SNFCC</a> · <a href="https://www.onassis.org/whats-on" target="_blank" rel="noopener">Onassis</a></span></div>`;
  el.innerHTML=html;}
function eventCard(e,dayIso){const dim=S.rain&&e.in===false;const multi=e.s!==e.e?`${fmt(e.s)} – ${fmt(e.e)}`:fmt(e.s);const cc=e.hol?"--warn":"--c-event";
  return `<article class="card${dim?" dim":""}" id="card-${e.id}" style="--cc:var(${cc})"><div class="card-h">${tile(e)}<div class="t"><div class="cat">${e.hol?"Feiertag / Gedenktag":"Event"}</div><h3>${esc(e.n)}</h3><div class="meta"><span>${multi}</span><span>${esc(e.venue)}</span></div></div></div>
   <div class="badges">${doneBadge(e.id)}${priceBadge(e.p)}${inBadge(e)}</div>${distRow(e)}<p>${esc(e.d)}</p>
   <div class="actions">${e.hol&&!hasGeo(e)?"":planBtn(e.id,dayIso>=e.s&&dayIso<=e.e?dayIso:e.s)}<a class="btn" href="${mapsLink({n:e.venue,lat:e.lat,lon:e.lon})}" target="_blank" rel="noopener">${ic("pin")}Ort</a>${e.p&&e.p.u?`<a class="btn ghost" href="${esc(e.p.u)}" target="_blank" rel="noopener">${ic("ext")}Infos</a>`:""}</div></article>`;}

/* ===================== ESSEN ===================== */
function renderFood(){const el=$("#p-essen");
  let dishes=DISHES.filter(x=>(!S.veg||x.veg)&&(!S.vegan||x.vegan));
  dishes=[...dishes].sort((a,b)=>(S.lf?a.milk-b.milk:0));
  const milkBadge=x=>x.milk===0?'<span class="b veg">ohne Milch</span>':x.milk===1?'<span class="b milk">Milch je nach Variante</span>':'<span class="b milk">enthält Milchprodukte</span>';
  const places=ITEMS.filter(i=>(i.c==="food"||i.c==="cafe")&&(!S.vegan||i.diet?.vegan)&&(!S.kueche||kOk(i,S.kueche)))
    .sort((a,b)=>ME?((hasGeo(a)?hav(ME,a):1e4)-(hasGeo(b)?hav(ME,b):1e4)):0);
  el.innerHTML=`<div class="ptitle"><h2>Essen</h2><small>${[S.vegan?"vegan":S.veg?"vegetarisch":"",S.lf?"laktosefrei":""].filter(Boolean).join(" · ")}</small></div>
   <p class="lede">Die griechische Küche hat viele Gemüse- und Hülsenfruchtgerichte, die von Haus aus vegan sind. Das Wort dafür: <b style="font-family:var(--f-display);font-size:1.12em;color:var(--ink)">νηστίσιμο</b> (nistísimo), Fastenessen ohne Fleisch, Milch und Ei.${fastingActive()?" In deinem Zeitraum beginnt am 15. November die Weihnachtsfastenzeit, dann gibt es besonders viel davon.":""}</p>
   ${S.lf?`<div class="notice warn">${ic("alert")}<span><b>Laktose:</b> Feta, Joghurt und Béchamel stecken in vielen Klassikern. Gerichte ohne Milch stehen oben. Satz zum Zeigen: <b>Έχω δυσανεξία στη λακτόζη</b>.</span></div>`:""}
   <section class="block"><h2>Gerichte, die du probieren solltest</h2><div class="grid">${dishes.map(x=>`<article class="card" style="--cc:var(--c-food)"><div class="card-h"><div class="tile s" style="--cc:var(${x.vegan?"--c-food":"--c-view"})">${ic("leaf")}</div><div class="t"><h3>${esc(x.n)}</h3><div class="meta" style="font-family:var(--f-display);font-size:.98rem">${x.g}</div></div></div><div class="badges">${x.vegan?'<span class="b veg">vegan</span>':'<span class="b veg">vegetarisch</span>'}${milkBadge(x)}</div><p>${esc(x.d)}</p>${x.note?`<div class="tip"><b>Tipp:</b> ${esc(x.note)}</div>`:""}</article>`).join("")}</div></section>
   <section class="block" id="woessen"><div class="ptitle"><h2 style="font-size:1.15rem">Wo essen</h2><small>${places.length} Lokale${ME?" · nach Nähe":""}</small></div>${kChips()}<div class="list">${places.length?places.map(itemCard).join(""):`<div class="empty">${ic("utensils")}Keine Lokale in dieser Kategorie${S.vegan?" mit veganem Angebot":""}.</div>`}</div></section>
   <section class="block"><h2>Sprachhilfe fürs Bestellen</h2><div class="phr">${PHRASES.map(p=>`<div><span class="g">${p[0]}</span><span class="l">${p[1]}</span><span class="de">${p[2]}</span></div>`).join("")}</div></section>`;}

/* ===================== ROUTING ===================== */
const ALLST=[];for(const k of ["m1","m2","m3"])STATIONS[k].forEach(s=>{let f=ALLST.find(a=>a.n===s[0]);if(!f){f={n:s[0],lat:s[1],lon:s[2],lines:[]};ALLST.push(f);}f.lines.push(k);});
function nearestSt(p){let best=null,bd=1e9;for(const s of ALLST){const dd=hav(p,s);if(dd<bd){bd=dd;best=s;}}return [best,bd];}
function legCost(a,b,mode){const km=hav(a,b);
  if(mode==="walk"){const w=km*1.3;return {km:w,min:w/4.5*60,how:"zu Fuß"};}
  if(mode==="car"){const c=km*1.4;const far=km>25;return {km:c,min:c/(far?70:18)*60+(far?10:8),how:far?"Auto über Autobahn":"Auto/Taxi, inkl. Parkplatzsuche"};}
  const walk={km:km*1.3,min:km*1.3/4.5*60,how:"zu Fuß"};
  if(km<1.0)return walk;
  if(km>25)return {km:km*1.3,min:km/55*60+30,how:"Bus/Zug/Fähre (Fernverbindung)"};
  const [sa,da]=nearestSt(a),[sb,db]=nearestSt(b);
  if(sa.n===sb.n||da>1.6||db>1.6){const bus={km:km*1.3,min:km*1.3/15*60+8,how:"Bus/Tram (Linie in Google Maps prüfen)"};return bus.min<walk.min?bus:walk;}
  const shared=sa.lines.some(l=>sb.lines.includes(l));
  const ride=hav(sa,sb)*1.2/30*60+4+(shared?0:5);
  const t={km:km*1.3,min:(da+db)*1.3/4.5*60+ride,how:`Metro ${sa.n} → ${sb.n}${shared?"":" (1× umsteigen)"}`};
  return t.min<walk.min?t:walk;}
function optimize(pts,startId){if(pts.length<3)return pts;
  const start=pts.find(p=>p.id===startId)||pts[0];const rest=pts.filter(p=>p!==start);const order=[start];
  while(rest.length){const last=order[order.length-1];let bi=0,bd=1e9;rest.forEach((p,i)=>{const dd=hav(last,p);if(dd<bd){bd=dd;bi=i;}});order.push(rest.splice(bi,1)[0]);}
  const len=o=>o.reduce((s,p,i)=>i?s+hav(o[i-1],p):0,0);let improved=true,guard=0;
  while(improved&&guard++<60){improved=false;for(let i=1;i<order.length-1;i++)for(let k=i+1;k<order.length;k++){const n=[...order.slice(0,i),...order.slice(i,k+1).reverse(),...order.slice(k+1)];if(len(n)+1e-9<len(order)){order.splice(0,order.length,...n);improved=true;}}}
  return order;}
function segDist(p,a,b){const kx=111.32*Math.cos(p.lat*Math.PI/180),ky=110.57;const ax=a.lon*kx,ay=a.lat*ky,bx=b.lon*kx,by=b.lat*ky,px=p.lon*kx,py=p.lat*ky;const dx=bx-ax,dy=by-ay;const L=dx*dx+dy*dy;let t=L?((px-ax)*dx+(py-ay)*dy)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));}
function onTheWay(order,mode){const lim=mode==="walk"?0.25:mode==="car"?0.8:0.4;const ids=new Set(order.map(o=>o.id));const out=[];
  ITEMS.filter(i=>hasGeo(i)&&!ids.has(i.id)&&i.c!=="trip").forEach(i=>{let best=1e9;for(let k=1;k<order.length;k++)best=Math.min(best,segDist(i,order[k-1],order[k]));if(order.length===1)best=hav(i,order[0]);if(best<=lim&&!(S.rain&&i.in===false))out.push([i,best]);});
  return out.sort((a,b)=>a[1]-b[1]).slice(0,8);}
function gmapsRoute(order,mode){if(order.length<2)return null;const tm={walk:"walking",car:"driving",transit:"transit"}[mode];const ll=p=>p.lat+","+p.lon;
  let u=`https://www.google.com/maps/dir/?api=1&origin=${ll(order[0])}&destination=${ll(order[order.length-1])}&travelmode=${tm}`;
  if(mode!=="transit"&&order.length>2)u+="&waypoints="+order.slice(1,-1).slice(0,9).map(ll).join("%7C");return u;}
function legLink(a,b,mode){const tm={walk:"walking",car:"driving",transit:"transit"}[mode];return `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lon}&destination=${b.lat},${b.lon}&travelmode=${tm}`;}
const kmf=v=>v.toFixed(1).replace(".",",");

/* ===================== PLAN (Tripliste) ===================== */
let LAST_ORDER=null;
function renderPlanList(el){const ds=days();const ids=Object.keys(S.plan).filter(byId);
  if(!ids.length){el.innerHTML=`<div class="empty">${ic("route")}<span>Dein Plan ist leer. Füge unter <b>Entdecken</b> oder <b>Events</b> Ziele hinzu oder lass dir einen <b>Tagesvorschlag</b> machen.</span><button class="btn primary" data-tab="entdecken">${ic("compass")}Ziele entdecken</button></div>`;LAST_ORDER=null;return;}
  const dayOpts=sel=>`<option value="">Ohne Tag</option>`+ds.map(x=>`<option value="${x}"${sel===x?" selected":""}>${fmt(x)}</option>`).join("");
  const groups={};ids.forEach(id=>{const dd=S.plan[id].day&&ds.includes(S.plan[id].day)?S.plan[id].day:"";(groups[dd]=groups[dd]||[]).push(id);});
  const order=[...ds.filter(x=>groups[x]),...(groups[""]?[""]:[])];
  const fd=freeDays();
  const warnFor=(it,day)=>{if(!day)return"";const wd=d(day).getUTCDay();const w=[];
    if(ITEMS.includes(it)){const hf=hoursFor(it,day);if(hf&&hf.v>=0&&!hf.spans.length)w.push(`${WD[wd]} geschlossen`);else if(hf&&hf.v>=0&&!(hf.spans[0][0]===0&&hf.spans[0][1]>=1440))w.push(`${spanTxt(hf.spans)}`);}
    if(it.eu25&&fd[day])w.push("Gratis-Tag, sehr voll");
    if(it.c==="view"&&it.in===false)w.push(`Sonnenuntergang ${hhmm(sunsetMin(day))}`);
    if(day.slice(5)==="11-08"&&(it.id==="stadion"||it.c==="trip"))w.push("Marathon: Sperrungen");
    if(day.slice(5)==="10-28"&&["wache","garten","olympieion"].includes(it.id))w.push("Parade: Sperrungen ab 9 Uhr");
    if(it.e&&it.s&&(day<it.s||day>it.e))w.push("Event nicht an diesem Tag");
    return w.map(x=>`<span class="b ${/geschlossen|Sperrung|nicht an|voll/.test(x)?"warn":""}">${x}</span>`).join("");};
  if(!S.collapsed)S.collapsed={};
  // --- Route oben
  const routeDays=["all",...order.filter(x=>x)];if(!routeDays.includes(S.routeDay))S.routeDay="all";
  let pts=ids.map(byId).filter(hasGeo).filter(it=>S.routeDay==="all"||S.plan[it.id].day===S.routeDay);
  if(S.mode==="walk")pts=pts.filter(p=>p.c!=="trip");
  const cand=pts;const meObj=ME?{id:"me",n:"Mein Standort",lat:ME.lat,lon:ME.lon,dur:0,a:""}:null;
  if(meObj&&S.routeStart==="me")pts=[meObj,...pts];
  const startSel=S.routeStart&&pts.find(p=>p.id===S.routeStart)?S.routeStart:(pts[0]&&pts[0].id);
  const ordered=optimize(pts,startSel);ordered.forEach((p,i)=>p._no=i+1);
  let tot={km:0,min:0},legs="";
  for(let i=1;i<ordered.length;i++){const c=legCost(ordered[i-1],ordered[i],S.mode);tot.km+=c.km;tot.min+=c.min;
    legs+=`<div class="leg"><div class="no">${i+1}</div><div><b>${esc(ordered[i].n)}</b><div class="how">${esc(c.how)} · <a href="${legLink(ordered[i-1],ordered[i],S.mode)}" target="_blank" rel="noopener">Weg ↗</a></div></div><div class="tm">${kmf(c.km)} km<br>${Math.round(c.min)} Min.</div></div>`;}
  const stay=ordered.reduce((s,p)=>s+(p.dur||45),0);
  const ow=ordered.length?onTheWay(ordered,S.mode):[];const gl=gmapsRoute(ordered,S.mode);
  LAST_ORDER=ordered.length>1?{name:S.routeDay==="all"?"Meine Athen-Route":`Route ${fmt(S.routeDay)}`,day:S.routeDay==="all"?"":S.routeDay,mode:S.mode,
    start:ordered[0].id==="me"?{n:"Mein Standort",lat:ordered[0].lat,lon:ordered[0].lon}:null,stops:ordered.filter(p=>p.id!=="me").map(p=>({id:p.id}))}:null;
  let html=`${S.sample?`<div class="notice">${ic("alert")}<span><b>Beispielplan</b> zum Ausprobieren. Entferne Einträge oder füge eigene hinzu, dann gehört er dir.</span></div>`:""}
  <details class="routebox fold" id="routeFold"${S.collapsed.__route?"":" open"}><summary><h2>${ic("route")}Route berechnen</h2>${ordered.length>1?`<small>${kmf(tot.km)} km · ${fmtMin(tot.min)}</small>`:""}</summary><div class="foldbody">
   <div class="row"><select id="routeDay" class="sel" aria-label="Tag für die Route">${routeDays.map(x=>`<option value="${x}"${S.routeDay===x?" selected":""}>${x==="all"?"Alle Ziele im Plan":fmt(x,true)}</option>`).join("")}</select>
   <div class="seg" role="group" aria-label="Verkehrsmittel">${[["walk","Zu Fuß"],["transit","Öffis"],["car","Auto"]].map(m=>`<button data-mode="${m[0]}" aria-pressed="${S.mode===m[0]}">${m[1]}</button>`).join("")}</div></div>
   ${cand.length>1||(meObj&&cand.length)?`<div class="row"><label for="routeStart" style="font-size:.82rem;color:var(--muted);font-weight:700">Start</label><select id="routeStart" class="sel">${meObj?`<option value="me"${startSel==="me"?" selected":""}>📍 Mein Standort</option>`:""}${cand.map(p=>`<option value="${p.id}"${p.id===startSel?" selected":""}>${esc(p.n)}</option>`).join("")}</select>${meObj?"":`<button class="btn ghost" id="locBtn2">${ic("locate")}Ab meinem Standort</button>`}</div>`:""}
   ${S.mode==="walk"&&ids.map(byId).some(p=>p.c==="trip")?`<div class="tip">Tagesausflüge sind zu Fuß ausgeblendet, wähle Öffis oder Auto.</div>`:""}
   ${ordered.length<2?`<div class="empty">${ic("pin")}Für eine Route brauchst du mindestens zwei Ziele mit Standort${S.routeDay!=="all"?" an diesem Tag":""}.</div>`:`
   <div class="sumgrid"><div><b>${kmf(tot.km)} km</b><span>Wege ≈</span></div><div><b>${Math.round(tot.min)} Min.</b><span>unterwegs ≈</span></div><div><b>${kmf(stay/60)} h</b><span>vor Ort ≈</span></div><div><b>${kmf((tot.min+stay)/60)} h</b><span>gesamt ≈</span></div></div>
   ${(tot.min+stay)>600?`<div class="notice warn">${ic("alert")}<span><b>Viel für einen Tag:</b> über 10 Stunden. Verteile die Ziele auf mehrere Tage oder nutze den Tagesvorschlag.</span></div>`:""}
   <div class="mapbox">${mapSVG(ordered,{route:ordered})}${mapCaption()}</div>
   <div class="legs"><div class="leg"><div class="no"${ordered[0].id==="me"?' style="background:var(--rain)"':""}>1</div><div><b>${esc(ordered[0].n)}</b><div class="how">Start</div></div><div class="tm"></div></div>${legs}</div>
   <div class="actions"><button class="btn primary" data-act="saveplan">${ic("bookmark")}Route speichern</button>${LAST_ORDER?shareBtns(LAST_ORDER,"plan"):""}${gl?`<a class="btn ghost" href="${gl}" target="_blank" rel="noopener">${ic("map")}Google Maps</a>`:""}</div>
   <div class="tip">Reihenfolge per Nächster-Nachbar plus 2-opt optimiert. Zeiten sind Schätzungen.${S.mode==="transit"?" Google Maps unterstützt bei Öffis keine Zwischenstopps, nutze dafür die Links pro Abschnitt.":""}</div>`}
   ${ow.length?`<div><h3 style="font-size:1rem;margin-bottom:4px">Liegt auf dem Weg</h3><div class="legs">${ow.map(([i,dist])=>`<div class="leg" style="grid-template-columns:38px minmax(0,1fr) auto;align-items:center">${tile(i,true)}<div><b>${esc(i.n)}</b><div class="how">${catOf(i).n} · ${Math.round(dist*1000)} m Umweg${i.p&&i.p.t?" · "+esc(i.p.t):""}</div></div><div>${planBtn(i.id,S.routeDay!=="all"?S.routeDay:"")}</div></div>`).join("")}</div></div>`:""}
  </div></details>
  <div class="row" style="justify-content:space-between"><small style="color:var(--muted)">${ids.length} Ziele · ${ids.filter(isDone).length} erlebt</small><button class="btn ghost" data-act="foldall">${ic(order.some(x=>S.collapsed[x||"none"])?"down":"up")}${order.some(x=>S.collapsed[x||"none"])?"Alle aufklappen":"Alle einklappen"}</button></div>`;
  order.forEach(dd=>{const key=dd||"none";const list=groups[dd];const done=list.filter(isDone).length;
    html+=`<details class="planday" data-dkey="${key}"${S.collapsed[key]?"":" open"}><summary><span class="pd-t">${dd?fmt(dd,true):"Noch ohne Tag"}</span><span class="pd-n">${list.length} Ziele${done?` · ${done} erlebt`:""}</span></summary><div class="pd-body">${list.map(id=>{const it=byId(id);const st=S.plan[id];const cat=catOf(it);
    return `<div class="pitem${isDone(id)?" done":""}"><input class="check" type="checkbox" id="done-${id}" data-done="${id}"${isDone(id)?" checked":""} aria-label="Erledigt: ${esc(it.n)}">${tile(it,true)}<div class="nm">${esc(it.n)}<small>${cat.n}${it.a?" · "+esc(it.a):it.venue?" · "+esc(it.venue):""}${!hasGeo(it)?" · ohne Standort":""}</small></div><button class="iconbtn" data-plan="${id}" aria-label="Entfernen" title="Entfernen">${ic("trash")}</button>
     <div class="pmeta"><select class="sel small" id="day-${id}" data-day="${id}" aria-label="Tag wählen">${dayOpts(dd)}</select>${priceBadge(it.p)}${warnFor(it,dd)}</div></div>`;}).join("")}</div></details>`;});
  html+=`<button class="btn ghost" id="clearPlan" style="align-self:center">${ic("trash")}Plan leeren</button>`;
  el.innerHTML=html;ordered.forEach(p=>delete p._no);}

/* ===================== PRAKTISCH ===================== */
function acc(icon,title,body,open){return `<details class="acc"${open?" open":""}><summary><div class="tile s" style="--cc:var(--accent)">${ic(icon)}</div>${title}</summary><div class="body">${body}</div></details>`;}
function renderInfo(){const el=$("#p-praktisch");const fd=freeDays();
  const hol=EVENTS.filter(e=>e.hol&&inRange(e.s,e.e));const winter=months().some(m=>m===11||m===12||m<=3);
  el.innerHTML=`<div class="ptitle"><h2>Praktisch</h2></div>
  <section class="block"><h2>In deinem Zeitraum</h2><div class="list">
   <article class="card"><div class="card-h"><div class="tile s" style="--cc:var(--rain)">${ic("cloud")}</div><div class="t"><h3>Wetter & Kleidung</h3></div></div><p>${winter?"November: meist 11–18 °C, öfter Regenschauer, Sonnenuntergang gegen 17:15. Wasserdichte Jacke, Schichten, rutschfeste Schuhe.":"Ende Oktober: meist 15–23 °C, abends kühler, erste Regentage möglich. Leichte Jacke und feste Schuhe."}</p><div class="tip">Kurzfristige Prognose: <a href="https://www.meteo.gr/" target="_blank" rel="noopener">meteo.gr</a> (Nationales Observatorium).</div></article>
   <article class="card"><div class="card-h"><div class="tile s" style="--cc:var(--warn)">${ic("flag")}</div><div class="t"><h3>Feiertage & Gedenktage</h3></div></div>${hol.length?`<ul style="margin:0;padding-left:18px">${hol.map(h=>`<li><b>${fmt(h.s)}</b>: ${esc(h.n)}</li>`).join("")}</ul>`:"<p>Keine gesetzlichen Feiertage im Zeitraum.</p>"}<div class="tip">An Feiertagen sind Geschäfte, Banken und Supermärkte zu. Sonntags haben viele Läden außerhalb der Touristenzonen geschlossen.</div></article>
   <article class="card"><div class="card-h"><div class="tile s" style="--cc:var(--accent)">${ic("gift")}</div><div class="t"><h3>Gratis-Eintritt</h3></div></div>${Object.keys(fd).length?`<ul style="margin:0;padding-left:18px">${Object.entries(fd).map(([k,v])=>`<li><b>${fmt(k)}</b>: ${esc(v)}</li>`).join("")}</ul>`:"<p>Kein allgemeiner Gratis-Tag in deinem Zeitraum.</p>"}<div class="tip"><b>Für dich wichtig:</b> Unter 25 mit EU-Ausweis ist der Eintritt in staatliche Stätten (Akropolis, Agora usw.) ganzjährig frei. Ausweis an der Kasse zeigen, das Gratis-Ticket trotzdem mit Zeitslot holen.</div></article>
  </div></section>
  <section class="block"><h2>Gut zu wissen</h2>
  ${acc("train","Öffentlicher Verkehr & Tickets",`<div class="tbl"><table><thead><tr><th>Ticket</th><th>Preis</th><th>Gilt für</th></tr></thead><tbody>
    <tr><td>Einzelticket</td><td class="num">€1,20</td><td>90 Min. Metro, Bus, Tram, beliebig umsteigen</td></tr>
    <tr><td>24 Stunden</td><td class="num">€4,10</td><td>alle Stadtlinien, ohne Flughafen</td></tr>
    <tr><td>5 Tage</td><td class="num">€8,20</td><td>alle Stadtlinien, ohne Flughafen</td></tr>
    <tr><td>3-Tage-Touristenticket</td><td class="num">€20</td><td>Stadtlinien + einmal Flughafen hin und zurück</td></tr>
    <tr><td>Flughafen Metro M3</td><td class="num">€9 / €16</td><td>einfach / hin und zurück</td></tr>
    <tr><td>Flughafenbus X95</td><td class="num">€5,50</td><td>bis Syntagma, fährt rund um die Uhr, ca. 60 Min.</td></tr>
    <tr><td>Taxi Flughafen–Zentrum</td><td class="num">€40 / €55</td><td>Festpreis tagsüber / 0–5 Uhr, inkl. Gepäck und Maut</td></tr>
   </tbody></table></div>
   <ul><li>Kontaktlos zahlen: An den Metro-Schranken Karte oder Handy dranhalten (Tap2Ride).</li><li>Ticket immer entwerten. Schwarzfahren kostet das 60-Fache des Einzeltickets.</li><li>Samstags fahren M2, M3 und Tram die ganze Nacht, die grüne M1 noch nicht.</li><li>Das normale €1,20-Ticket gilt <b>nicht</b> auf dem Flughafenabschnitt der M3.</li><li>Bus und Tram in Echtzeit: App OASA Telematics.</li></ul>`,true)}
  ${acc("coins","Preise einschätzen & Abzocke vermeiden",`<p style="margin:0">Richtwerte 2026 im Zentrum, alle mit ≈ sind Schätzungen aus Erfahrungswerten.</p>
   <div class="tbl"><table><thead><tr><th>Was</th><th>Normal</th><th>Zu teuer ab</th></tr></thead><tbody>
    <tr><td>Koulouri (Sesamring)</td><td class="num">≈ €0,80–1,20</td><td class="num">€2</td></tr>
    <tr><td>Freddo Espresso</td><td class="num">≈ €2,50–4,50</td><td class="num">€6</td></tr>
    <tr><td>Souvlaki/Falafel-Pita</td><td class="num">≈ €3,50–6</td><td class="num">€8</td></tr>
    <tr><td>Taverne Hauptgericht</td><td class="num">≈ €9–16</td><td class="num">€20</td></tr>
    <tr><td>Hauswein ½ l</td><td class="num">≈ €6–10</td><td class="num">€15</td></tr>
    <tr><td>Bier 0,5 l in der Bar</td><td class="num">≈ €5–7</td><td class="num">€9</td></tr>
    <tr><td>Cocktail</td><td class="num">≈ €10–14</td><td class="num">€18</td></tr>
    <tr><td>Brot & Gedeck p. P.</td><td class="num">≈ €1–2,50</td><td>muss auf der Karte stehen</td></tr>
   </tbody></table></div>
   <ul><li>Schlepper vor Restaurants in Plaka und Monastiraki: weitergehen. Gute Tavernen locken nicht.</li><li>Karte ohne Preise oder Fisch „pro Kilo“: Preis vorher fragen.</li><li>Unbestellte Vorspeisen werden berechnet. Zurückgeben, wenn du sie nicht willst.</li><li>„Freundschaftsbändchen“, Rosen oder ein „Geschenk“ in die Hand gedrückt: nicht annehmen.</li><li>Fremde, die dich in eine bestimmte Bar mitnehmen wollen: ablehnen. Am Ende steht eine absurde Rechnung.</li><li>Taxi: Das Taxameter muss laufen, Tarif 1 von 5 bis 24 Uhr, Tarif 2 nachts. Am einfachsten per App bestellen.</li><li>Trinkgeld: aufrunden oder 5–10 %, keine Pflicht.</li></ul>`)}
  ${acc("shield","Sicherheit",`<ul>
   <li>Athen ist sicher, aber Taschendiebe sind aktiv: Metro M1 zwischen Monastiraki und Piräus, Flughafen-Metro, Bus X95, Monastiraki-Platz.</li>
   <li>Streiks (απεργία) und Demos am Syntagma sind häufig und meist angekündigt. Vor Fahrten zum Flughafen kurz prüfen.</li>
   <li>Um den 17. November Exarchia und das Polytechnikum abends meiden.</li>
   <li>Omonia und die Seitenstraßen nachts eher meiden.</li>
   <li>Straßenhunde sind meist geimpft und friedlich (Halsband = registriert).</li>
   <li>Autofahrer halten nicht immer an Zebrastreifen. Beim Überqueren aufpassen, auch bei Grün.</li>
   <li>Notruf <b class="mono">112</b> (auch Englisch) · Touristenpolizei <b class="mono">1571</b></li></ul>`)}
  ${acc("hand","Bräuche & ungeschriebene Regeln",`<ul>
   <li><b>Ne</b> (ναι) heißt ja, <b>óchi</b> heißt nein. Ein Kopfnicken nach oben mit Zungenschnalzen bedeutet ebenfalls nein.</li>
   <li>Die offene Handfläche Richtung Gesicht (Moutza) ist eine grobe Beleidigung. Beim Winken und Taxi-Rufen Finger lieber zusammen.</li>
   <li>In Kirchen Schultern und Knie bedecken, leise sein.</li>
   <li>Toilettenpapier in älteren Gebäuden in den Eimer werfen, nicht ins WC.</li>
   <li>Gegessen wird spät: Mittag ab 14 Uhr, Abendessen ab 21 Uhr. Um 19 Uhr ist die Taverne noch leer.</li>
   <li>Essen wird geteilt. Mehrere Gerichte in die Mitte zu bestellen ist normal.</li>
   <li>Leitungswasser ist im Zentrum trinkbar und wird in Tavernen oft gratis hingestellt.</li>
   <li>Ein paar Worte Griechisch öffnen Türen: Kaliméra, Efcharistó.</li>
   <li>Von ca. 15 bis 17:30 Uhr ist in Wohnvierteln Mittagsruhe.</li></ul>`)}
  ${acc("phone","Sinnvolle Apps",`<div class="tbl"><table><tbody>
   <tr><td><b>Google Maps</b></td><td>Fußwege, Metro- und Busrouten in Echtzeit</td></tr>
   <tr><td><b>OASA Telematics</b></td><td>Offizielle Echtzeit-Ankunft von Bus und Trolley</td></tr>
   <tr><td><b>FreeNow / Uber / Bolt</b></td><td>Taxi bestellen; in Athen fahren darüber lizenzierte Taxis</td></tr>
   <tr><td><b>Hellenic Heritage</b> (hhticket.gr)</td><td>Offizielle Tickets für Akropolis und staatliche Stätten</td></tr>
   <tr><td><b>Ferryhopper</b></td><td>Fähren nach Ägina, Hydra und auf die Kykladen</td></tr>
   <tr><td><b>HappyCow</b></td><td>Vegetarische und vegane Lokale in der Nähe</td></tr>
   <tr><td><b>efood / Wolt</b></td><td>Essenslieferung, viele vegane Optionen</td></tr>
   <tr><td><b>meteo.gr</b></td><td>Genaueste Wetterprognose für Griechenland</td></tr>
   <tr><td><b>Google Übersetzer</b></td><td>Griechisch offline laden, Kamera-Übersetzung für Speisekarten</td></tr>
  </tbody></table></div>`)}
  </section>`;}

/* ===================== WIRING ===================== */
const TABS=["entdecken","events","essen","plan","praktisch"];
function setTab(t){if(!TABS.includes(t))t="entdecken";S.tab=t;save();document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===t));TABS.forEach(x=>$("#p-"+x).hidden=x!==t);window.scrollTo({top:0});}
function syncControls(){$("#dStart").value=S.start;$("#dEnd").value=S.end;
  $("#locBtn").classList.toggle("on",!!ME);$("#tRain").checked=!!S.rain;$("#tRain2").checked=!!S.rain;$("#tRainL").classList.toggle("on",!!S.rain);
  $("#tVeg").checked=!!S.veg;$("#tVegan").checked=!!S.vegan;$("#tLf").checked=!!S.lf;
  const ds=days();const a=d(ds[0]),b=d(ds[ds.length-1]);
  $("#rangeLabel").textContent=a.getUTCMonth()===b.getUTCMonth()?`${a.getUTCDate()}.–${b.getUTCDate()}. ${MON[b.getUTCMonth()]}`:`${a.getUTCDate()}. ${MON[a.getUTCMonth()]} – ${b.getUTCDate()}. ${MON[b.getUTCMonth()]}`;}
function renderAll(){syncControls();renderDiscover();renderEvents();renderFood();renderPlan();renderInfo();}
function openSheet(o){$("#sheet").hidden=!o;$("#scrim").hidden=!o;if(o)$("#dStart").focus();else $("#openSettings").focus();}

document.addEventListener("click",e=>{
  const t=e.target.closest("#locBtn,#locBtn2,[data-sort],[data-kueche],[data-tab],[data-cat],[data-plan],[data-goto],[data-mode],[data-view],.marker,#clearPlan,#openSettings,#closeSettings,#doneSettings,#scrim");if(!t)return;
  if(t.id==="locBtn"){locate();return;}
  if(t.id==="locBtn2"){S.routeStart="me";save();locate();return;}
  if(t.dataset.sort){S.sort=t.dataset.sort;save();renderDiscover();return;}
  if(t.id==="openSettings"){openSheet(true);return;}
  if(t.id==="closeSettings"||t.id==="doneSettings"||t.id==="scrim"){openSheet(false);return;}
  if(t.dataset.tab){setTab(t.dataset.tab);return;}
  if(t.dataset.view){S.view=t.dataset.view;save();renderDiscover();return;}
  if(t.dataset.kueche!==undefined){S.kueche=t.dataset.kueche;save();renderDiscover();renderFood();return;}
  if(t.dataset.cat!==undefined){const c=t.dataset.cat;if(!c)S.cats=[];else S.cats=S.cats.includes(c)?S.cats.filter(x=>x!==c):[...S.cats,c];save();renderDiscover();return;}
  if(t.dataset.plan){togglePlan(t.dataset.plan,t.dataset.day);return;}
  if(t.dataset.mode){S.mode=t.dataset.mode;save();renderPlan();return;}
  if(t.id==="clearPlan"){S.plan={};S.sample=false;save();renderAll();toast("Plan geleert");return;}
  if(t.classList.contains("marker")&&S.tab==="entdecken"){hlId=t.dataset.id;renderDiscover();return;}
  const id=t.dataset.goto||t.dataset.id;if(id)goTo(id);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!$("#sheet").hidden){openSheet(false);return;}
  if((e.key==="Enter"||e.key===" ")&&e.target.classList?.contains("marker")){e.preventDefault();e.target.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
function goTo(id){const it=byId(id);if(!it||!ITEMS.includes(it))return;if(S.tab!=="entdecken")setTab("entdecken");
  if(S.cats.length&&!S.cats.includes(it.c))S.cats=[];if(S.q&&!filteredItems().includes(it))S.q="";
  S.view="list";hlId=id;save();renderDiscover();const c=document.getElementById("card-"+id);if(c)c.scrollIntoView({behavior:"smooth",block:"center"});}
function setDate(t){if(!t.value)return;const k=t.id==="dStart"?"start":"end";if(S[k]===t.value)return;S[k]=t.value;if(S.end<S.start){if(k==="start")S.end=S.start;else S.start=S.end;}save();renderAll();}
document.addEventListener("input",e=>{if(e.target.id==="dStart"||e.target.id==="dEnd")setDate(e.target);});
window.addEventListener("pagehide",save);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")save();});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="dStart"||t.id==="dEnd"){setDate(t);return;}
  const map={tRain:"rain",tRain2:"rain",tVeg:"veg",tVegan:"vegan",tLf:"lf"};
  if(map[t.id]){S[map[t.id]]=t.checked;if(t.id==="tVegan"&&t.checked)S.veg=true;if(t.id==="tVeg"&&!t.checked)S.vegan=false;save();renderAll();if(t.id==="tRain")toast(t.checked?"Regentag-Modus an":"Regentag-Modus aus");return;}
  if(t.dataset.done){setDone(t.dataset.done,t.checked);toast(t.checked?"Erlebt – Sterne und Notiz unter Plan › Erlebt":"Nicht mehr als erlebt markiert");renderAll();return;}
  if(t.dataset.day&&t.tagName==="SELECT"){S.plan[t.dataset.day].day=t.value;S.sample=false;save();renderPlan();return;}
  if(t.id==="routeDay"){S.routeDay=t.value;S.routeStart=null;save();renderPlan();return;}
  if(t.id==="routeStart"){S.routeStart=t.value;save();renderPlan();return;}
});

