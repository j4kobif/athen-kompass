/* ===================== ZEIT ===================== */
const toMin=s=>{const [h,m]=String(s).split(":").map(Number);return h*60+(m||0);};
const hhmm=m=>{m=Math.round(m);const h=Math.floor(m/60)%24,mm=((m%60)+60)%60;return `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;};
function athensNow(){try{const f=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Athens",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
  const p=Object.fromEntries(f.formatToParts(new Date()).map(x=>[x.type,x.value]));return {iso:`${p.year}-${p.month}-${p.day}`,min:(+p.hour%24)*60+ +p.minute};}catch(e){return {iso:todayIso(),min:new Date().getHours()*60};}}
function lastSun(y,m){const x=new Date(Date.UTC(y,m+1,0,12));x.setUTCDate(x.getUTCDate()-x.getUTCDay());return iso(x);}
function tzOff(s){const y=+s.slice(0,4);return (s>=lastSun(y,2)&&s<lastSun(y,9))?180:120;}
function sunsetMin(day){const dt=d(day);const N=Math.round((dt-Date.UTC(dt.getUTCFullYear(),0,0,12))/864e5);const lat=37.975*Math.PI/180,lon=23.735;const g=2*Math.PI/365*(N-1);
  const eqt=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const ha=Math.acos(Math.cos(90.833*Math.PI/180)/(Math.cos(lat)*Math.cos(dec))-Math.tan(lat)*Math.tan(dec))*180/Math.PI;
  return 720-4*(lon-ha)-eqt+tzOff(day);}

/* ===================== ÖFFNUNGSZEITEN ===================== */
// v:1 = aus offizieller/aktueller Quelle, v:0 = ungefähr
const ALLY="24h";
const STATE_W="Mo-So 08:00-17:00",STATE_S="Mo-So 08:00-19:30";
const HOURS={
 akropolis:{w:STATE_W,s:"Mo-So 08:00-20:00",v:1,last:30},
 akromuseum:{w:"Mo-Do 09:00-17:00, Fr 09:00-22:00, Sa-So 09:00-20:00",s:"Mo 09:00-17:00, Di-Do 09:00-20:00, Fr 09:00-22:00, Sa-So 09:00-20:00",v:1,last:30},
 nam:{w:"Mo 08:30-15:30, Di 13:00-20:00, Mi-So 08:30-15:30",s:"Mo 08:00-20:00, Di 13:00-20:00, Mi-So 08:00-20:00",wf:"11-16",wt:"05-03",v:1,last:30},
 kykladen:{a:"Mo 10:00-17:00, Di zu, Mi 10:00-17:00, Do 10:00-20:00, Fr-Sa 10:00-17:00, So 11:00-17:00",v:1,last:15},
 benaki:{a:"Mo zu, Di-Mi 10:00-18:00, Do 10:00-24:00, Fr 10:00-18:00, Sa 10:00-24:00, So 10:00-18:00",v:1,note:"Donnerstag ab 18 Uhr Eintritt frei"},
 agora:{w:STATE_W,s:STATE_S,v:0,last:30},romagora:{w:STATE_W,s:STATE_S,v:0,last:30},hadrian:{w:STATE_W,s:STATE_S,v:0,last:30},
 kerameikos:{w:STATE_W,s:STATE_S,v:0,last:30},olympieion:{w:STATE_W,s:STATE_S,v:0,last:30},byzmuseum:{w:STATE_W,s:STATE_S,v:0,last:30},
 stadion:{w:"Mo-So 08:00-17:00",s:"Mo-So 08:00-19:00",v:0},
 varvakios:{a:"Mo-Fr 07:00-18:00, Sa 07:00-16:00, So zu",v:0},
 laiki:{a:"Mo-Fr zu, Sa 07:00-14:00, So zu",v:0},
 diporto:{a:"Mo-Sa 08:00-18:00, So zu",v:0,note:"Nur Barzahlung"},
 yiantes:{a:"Mo-So 13:00-01:30",v:1},
 garten:{w:"Mo-So 07:00-17:30",s:"Mo-So 07:00-20:00",v:0,note:"etwa von Sonnenaufgang bis Sonnenuntergang"},
 wache:{a:ALLY,v:1,note:"Wachwechsel zu jeder vollen Stunde, sonntags 11 Uhr mit Kapelle"},
 plaka:{a:ALLY,v:1},monastiraki:{a:ALLY,v:1,note:"Flohmarkt vor allem sonntags vormittags"},streetart:{a:ALLY,v:1},areopag:{a:ALLY,v:1},
 filopappou:{a:ALLY,v:0},pnyx:{a:ALLY,v:0},strefi:{a:ALLY,v:1},herodes:{a:ALLY,v:1},anafiotika_cats:{a:ALLY,v:1},mikrolimano:{a:ALLY,v:1},hymettos:{a:ALLY,v:0},
 lykabettus:{a:ALLY,v:0,note:"Fußweg jederzeit; Standseilbahn tagsüber bis spät abends"},
 ermou:{a:"Mo-Fr 09:00-21:00, Sa 09:00-18:00, So zu",v:0},
 snfcc:{a:"Mo-So 06:00-24:00",v:0,note:"Park; Bibliothek und Gebäude kürzer"},
 tram:{a:"Mo-So 05:30-24:00",v:0},
 zampano:{a:"Mo-Di 08:30-16:00, Mi-So 08:30-24:00",v:0},
 ergon:{a:"Mo-So 07:30-24:00",v:0},
 brunchers:{a:"Mo-Fr 08:00-16:00, Sa-So 08:00-18:00",v:0},
 koulouripsyrri:{a:ALLY,v:0,note:"laut Guide rund um die Uhr geöffnet"},
 serbetia:{a:"Mo-So 10:00-00:30",v:0},
 krinos:{a:"Mo 08:30-18:30, Di 08:30-20:30, Mi 08:30-18:30, Do-Fr 08:30-20:30, Sa 08:30-18:30, So zu",v:0},
 akra:{a:"Mo zu, Di-So 08:00-16:00",v:0},
 beyhammam:{a:"Mo-So 08:30-15:30",v:0},
 instrumente:{a:"Mo zu, Di-So 10:00-18:00",v:0},
 daphni:{a:"Mo zu, Di-Mi 09:00-16:00, Do zu, Fr-So 09:00-16:00",v:0},
 theatertour:{a:"Mo-Di zu, Mi 11:00-12:00, Do-So zu",v:0,note:"Nur mit Reservierung, maximal 15 Personen"},
 mitropoli:{a:ALLY,v:1},friedhof:{w:"Mo-So 07:30-17:00",s:"Mo-So 07:30-20:00",v:0},akademie:{a:ALLY,v:1},
 mets:{a:ALLY,v:1},pangrativiertel:{a:ALLY,v:1},koukakiviertel:{a:ALLY,v:1},romantso:{a:"Mo-So 10:00-02:00",v:0}
};
const TYPICAL={food:"Mo-So 12:00-24:00",cafe:"Mo-So 08:00-20:00",bar:"Mo-So 19:00-02:00",museum:"Mo-So 10:00-17:00",act:"Mo-So 10:00-20:00",sight:ALLY,view:ALLY,trip:ALLY};
const DIDX={So:0,Mo:1,Di:2,Mi:3,Do:4,Fr:5,Sa:6};
function parseH(str){const wk=[[],[],[],[],[],[],[]];if(str===ALLY){return wk.map(()=>[[0,1440]]);}
  str.split(",").map(x=>x.trim()).forEach(part=>{const m=part.match(/^([A-Za-z]{2})(?:-([A-Za-z]{2}))?\s+(.+)$/);if(!m)return;
    const a=DIDX[m[1]],b=m[2]!==undefined?DIDX[m[2]]:a;const list=[];let i=a;for(let g=0;g<7;g++){list.push(i);if(i===b)break;i=(i+1)%7;}
    if(/zu/.test(m[3]))list.forEach(x=>wk[x]=[]);else{const [o,c]=m[3].split("-");let oo=toMin(o),cc=toMin(c);if(cc<=oo)cc+=1440;list.forEach(x=>wk[x]=[[oo,cc]]);}});return wk;}
const _hc={};
function hoursFor(it,day){const h=HOURS[it.id];
  if(!h){const t=TYPICAL[it.c];return t?{spans:parseH(t)[d(day).getUTCDay()],v:-1}:null;}
  let str=h.a;if(!str){const md=day.slice(5),wf=h.wf||"11-01",wt=h.wt||"03-31";const winter=wf>wt?(md>=wf||md<=wt):(md>=wf&&md<=wt);str=winter?h.w:h.s;}
  const key=str;if(!_hc[key])_hc[key]=parseH(str);
  const md=day.slice(5);const holClosed=it.eu25||["akromuseum","nam","benaki","kykladen","stadion"].includes(it.id);
  if(holClosed&&["12-25","12-26","01-01","03-25","05-01"].includes(md))return {spans:[],v:1,h,str,hol:true};
  return {spans:_hc[key][d(day).getUTCDay()],v:h.v,h,str};}
function spanTxt(sp){if(!sp.length)return "geschlossen";if(sp[0][0]===0&&sp[0][1]>=1440)return "rund um die Uhr";return sp.map(([o,c])=>`${hhmm(o)}–${hhmm(c)}`).join(", ");}
function openAt(it,day,min){const hf=hoursFor(it,day);if(!hf)return true;return hf.spans.some(([o,c])=>min>=o&&min<c);}

/* ===================== AUSLASTUNG ===================== */
const KIND_OVR={plaka:"street",monastiraki:"street",streetart:"street",ermou:"street",anafiotika_cats:"street",herodes:"street",varvakios:"market",kypseli:"market",laiki:"market",
 snfcc:"local",mikrolimano:"local",tram:"local",hymettos:"local",vouliagmeni:"local",lykabettus:"sunset",filopappou:"sunset",areopag:"sunset",a4athens:"bar",couleur:"bar",galaxy:"bar",wache:"guard",akromuseum:"amuseum",
 mitropoli:"street",mets:"street",pangrativiertel:"street",koukakiviertel:"street",friedhof:"local",akademie:"local",romantso:"bar"};
function kindOf(it){return KIND_OVR[it.id]||({sight:"site",museum:"museum",view:"view",cafe:"cafe",food:"food",bar:"bar",act:"act",trip:"trip"})[it.c]||"act";}
const CURVE={
 site:[0,0,0,0,0,0,0,0,1,2,3,3,3,2,2,1,1,1,0,0,0,0,0,0],museum:[0,0,0,0,0,0,0,0,0,1,2,3,2,2,1,1,1,1,1,1,0,0,0,0],
 amuseum:[0,0,0,0,0,0,0,0,0,1,2,3,3,2,2,1,1,1,1,1,0,0,0,0],street:[0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,3,3,2,1,1],
 market:[0,0,0,0,0,0,0,1,2,3,3,3,2,2,1,1,1,0,0,0,0,0,0,0],local:[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,1,1,1,0,0,0],
 view:[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2,2,1,1,0,0,0,0],cafe:[0,0,0,0,0,0,0,0,1,2,2,2,1,1,1,1,1,2,2,1,1,0,0,0],
 food:[1,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,1,0,0,1,1,2,3,2],bar:[2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,3],
 guard:[0,0,0,0,0,0,0,0,1,1,2,3,2,2,1,1,1,1,1,1,0,0,0,0],act:[0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,1,1,1,0,0,0],
 trip:[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0]};
const BEST={site:"Direkt zur Öffnung oder in den letzten zwei Stunden. Zwischen 10 und 13 Uhr kommen Kreuzfahrt- und Busgruppen.",
 museum:"Unter der Woche vormittags oft Schulklassen, ab etwa 14 Uhr ruhiger.",amuseum:"Freitagabend (bis 22 Uhr) ist am entspanntesten, mittags am vollsten.",
 street:"Vor 10 Uhr fast leer, abends am lebendigsten.",market:"Vormittags am lebendigsten, samstags am vollsten.",
 local:"Am Wochenende kommen viele Athener Familien, werktags ruhig.",sunset:"Zum Sonnenuntergang voll, dann 45 Minuten vorher oben sein. Vormittags fast leer.",
 view:"Meist entspannt; am Wochenende nachmittags mehr los.",cafe:"Wochenendvormittags voll, werktags nachmittags entspannt.",
 food:"Griechen essen spät: mittags 14–16 Uhr, abends ab 21 Uhr. Um 19 Uhr bekommst du fast immer einen Tisch.",
 bar:"Vor 22 Uhr ruhig, freitags und samstags ab 23 Uhr voll.",guard:"Sonntags um 11 Uhr die große Zeremonie, 20 Minuten vorher da sein.",
 act:"Unter der Woche entspannter als am Wochenende.",trip:"Unter der Woche fahren, am Wochenende fahren auch viele Athener raus."};
const CROWD_L=["ruhig","mäßig","voll","sehr voll"];
function crowd(it,day,min){const k=kindOf(it);const h=Math.floor(min/60)%24;let c;
  if(k==="sunset"){const ss=sunsetMin(day);c=(min>=ss-75&&min<=ss+15)?3:(min<11*60?0:1);}else c=(CURVE[k]||CURVE.act)[h];
  const wd=d(day).getUTCDay(),md=day.slice(5),fd=freeDays(),we=wd===0||wd===6;
  if(we&&["local","market","sunset","view","cafe","street","act"].includes(k))c+=1;
  if(we&&(k==="food"||k==="bar")&&h>=20)c+=1;
  if(wd===5&&k==="bar"&&h>=22)c+=1;
  if(it.eu25&&fd[day])c+=1;
  if(md==="10-28"&&["site","guard","street"].includes(k)&&h>=9&&h<14)c+=1;
  if(md==="11-08"&&it.id==="stadion")c=3;
  if(it.id==="monastiraki"&&wd===0&&h>=9&&h<14)c=3;
  if(it.id==="wache"&&wd===0&&h===11)c=3;
  return Math.max(0,Math.min(3,c));}
function dayReason(it,day){const wd=d(day).getUTCDay(),md=day.slice(5);const k=kindOf(it);
  if(it.eu25&&freeDays()[day])return "Gratis-Tag, sehr voll";
  if(md==="10-28")return "Ochi-Tag, Paraden";if(md==="11-08")return "Marathon";if(md==="11-17")return "Polytechnio-Gedenken";
  if((wd===0||wd===6)&&["local","market","sunset","view","cafe","street","act"].includes(k))return "Wochenende";return "";}
function dayScore(it,day){const hf=hoursFor(it,day);let spans=hf?hf.spans:[[600,1200]];if(!spans.length)return null;
  let sum=0,n=0;spans.forEach(([o,c])=>{for(let m=Math.max(o,480);m<Math.min(c,1380);m+=60){sum+=crowd(it,day,m);n++;}});return n?sum/n:1;}
function bestDays(it){const ds=days();if(ds.length<2)return null;const sc=ds.map(x=>({day:x,s:dayScore(it,x)})).filter(x=>x.s!==null);
  if(!sc.length)return {none:true};const min=Math.min(...sc.map(x=>x.s)),max=Math.max(...sc.map(x=>x.s));const closedAny=ds.some(x=>dayScore(it,x)===null);if(max-min<0.3&&!closedAny)return null;const best=sc.filter(x=>x.s<=min+0.15).slice(0,3);
  const avoid=sc.filter(x=>x.s>=min+0.6).map(x=>({day:x.day,r:dayReason(it,x.day)})).filter(x=>x.r).slice(0,2);
  const closed=ds.filter(x=>dayScore(it,x)===null);return {best,avoid,closed};}
function bestHour(it,day){const hf=hoursFor(it,day);const spans=hf?hf.spans:[[540,1260]];let best=null;const dark=it.in===false&&kindOf(it)!=="bar"?sunsetMin(day):1440;
  spans.forEach(([o,c])=>{const stay=durOf(it);for(let m=Math.max(o,480);m+Math.min(stay,90)<=Math.min(c,1440,dark+(kindOf(it)==="sunset"?20:0));m+=30){const cr=crowd(it,day,m);if(!best||cr<best.c)best={m,c:cr};}});return best;}

/* ===================== KARTEN-INFOS ===================== */
function refDay(){const ds=days();const now=athensNow();return ds.includes(now.iso)?{day:now.iso,today:true,min:now.min}:{day:ds[0],today:false};}
function hoursCrowd(it){if(!ITEMS.includes(it))return "";const r=refDay();const hf=hoursFor(it,r.day);const known=hf&&hf.v>=0;let rows="";
  const lbl=r.today?"Heute":fmt(r.day);
  if(known){let st="";if(r.today){const open=openAt(it,r.day,r.min);const sp=hf.spans.find(([o,c])=>r.min>=o&&r.min<c);
      st=open?` · <b class="ok">geöffnet</b>${sp&&sp[1]<1440?" bis "+hhmm(sp[1]):""}`:` · <b class="no">geschlossen</b>`;}
    rows+=`<div class="irow">${ic("clock")}<span>${lbl}: ${spanTxt(hf.spans)}${hf.v===0?" (ca.)":""}${st}${hf.h.last&&hf.spans.length&&hf.spans[0][1]<1440?` · letzter Einlass ${hf.h.last} Min. vorher`:""}</span></div>`;}
  else rows+=`<div class="irow">${ic("clock")}<span>Öffnungszeiten nicht geprüft · <a href="${mapsLink(it)}" target="_blank" rel="noopener">in Google Maps ansehen ↗</a></span></div>`;
  const k=kindOf(it);const bh=bestHour(it,r.day);
  let crow=r.today&&openAt(it,r.day,r.min)?`Jetzt ${CROWD_L[crowd(it,r.day,r.min)]}. `:"";
  rows+=`<div class="irow">${ic("users")}<span>${crow}${bh&&known?`Beste Zeit am ${lbl==="Heute"?"heutigen Tag":lbl}: <b>ab ${hhmm(bh.m)}</b>. `:""}${BEST[k]||""}</span></div>`;
  const bd=bestDays(it);
  if(bd&&!bd.none){const b=bd.best.map(x=>fmt(x.day)).join(", ");const a=bd.avoid.map(x=>`${fmt(x.day)} (${x.r})`).join(", ");const cl=bd.closed.map(x=>fmt(x)).join(", ");
    rows+=`<div class="irow">${ic("calendar")}<span>Beste Tage: <b>${b}</b>${a?` · Meiden: ${a}`:""}${cl?` · Geschlossen: ${cl}`:""}</span></div>`;}
  let wk="";if(HOURS[it.id]&&HOURS[it.id].a!==ALLY){const h=HOURS[it.id];const show=s=>{const w=parseH(s);return [1,2,3,4,5,6,0].map(i=>`<tr><td>${WD[i]}</td><td class="num">${spanTxt(w[i])}</td></tr>`).join("");};
    wk=`<details class="wk"><summary>Alle Öffnungszeiten${h.v===0?" (ungefähr)":""}</summary>${h.a?`<table>${show(h.a)}</table>`:`<div class="wkg"><div><small>Winter</small><table>${show(h.w)}</table></div><div><small>Sommer</small><table>${show(h.s)}</table></div></div>`}${h.note?`<div class="tip">${esc(h.note)}</div>`:""}</details>`;}
  else if(HOURS[it.id]&&HOURS[it.id].note)wk=`<div class="tip">${esc(HOURS[it.id].note)}</div>`;
  return `<div class="info">${rows}${wk}</div>`;}

/* ===================== TEILEN ===================== */
const MODE_N={walk:"zu Fuß",transit:"mit Öffis",car:"mit dem Auto"},MODE_E={walk:"🚶",transit:"🚇",car:"🚗"};
function stopsPts(r){const pts=[];if(r.start)pts.push({id:"start",n:r.start.n,lat:r.start.lat,lon:r.start.lon,dur:0});r.stops.forEach(s=>{const it=byId(s.id);if(it)pts.push(Object.assign(Object.create(it),{_t:s.t,_d:s.d}));});
  if(r.end){const f=pts.find(hasGeo);const e=r.end.loop?(f?{n:`Zurück zum Start: ${f.n}`,lat:f.lat,lon:f.lon,_loop:true}:null):r.end;if(e&&hasGeo(e))pts.push({id:"end",n:e.n,lat:e.lat,lon:e.lon,dur:0,_end:true,_loop:!!e._loop,_t:r.endT||""});}
  return pts;}
function endSel(r){return !r.end?"open":r.end.loop?"loop":"ziel";}
function routeMetrics(r){const pts=stopsPts(r).filter(hasGeo);let km=0,min=0;const legs=[];for(let i=1;i<pts.length;i++){const c=legCost(pts[i-1],pts[i],r.mode);km+=c.km;min+=c.min;legs.push(c);}
  const stay=stopsPts(r).reduce((s,p)=>s+(p.id==="start"||p._end?0:(p._d||durOf(p))),0);return {pts,legs,km,min,stay};}
function priceShort(p){if(!p)return "";if(p.k==="fix")return p.t;if(p.k==="free")return p.t||"";if(p.k==="est")return p.t;return "";}
function routeText(r){const m=routeMetrics(r);const L=[`🗺️ ${r.name}`];
  L.push([r.day?`📅 ${fmt(r.day,true)}`:"",`${MODE_E[r.mode]} ${MODE_N[r.mode]}`,`≈ ${kmf(m.km)} km`,`≈ ${fmtMin(m.min)} unterwegs`].filter(Boolean).join(" · "));L.push("");
  const all=stopsPts(r);let gi=0;
  all.forEach((p,i)=>{if(i>0&&hasGeo(p)&&hasGeo(all[i-1])){const c=legCost(all[i-1],p,r.mode);L.push(`   ${MODE_E[r.mode]} ${fmtMin(c.min)}${r.mode==="transit"&&c.how!=="zu Fuß"?" ("+c.how+")":""}`);}
    if(p.id==="start"){L.push(`📍 Start: ${p.n}`);return;}if(p.id==="end"){L.push(`🏁 ${p._t?p._t+"  ":""}${p._loop?p.n:"Ziel: "+p.n}`);return;}gi++;const pr=priceShort(p.p);
    L.push(`${p._t?p._t+"  ":""}${gi}. ${p.n}${pr?" · "+pr:""}${p.eu25?" (EU unter 25 frei)":""}`);});
  const g=gmapsRoute(m.pts,r.mode);if(g){L.push("");L.push(`Route in Google Maps: ${g}`);}return L.join("\n");}
function shareBtns(r,prefix){const txt=routeText(r);return `<button class="btn" data-act="copy" data-src="${prefix}">${ic("copy")}Kopieren</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${ic("share")}WhatsApp</a>`;}
function copyText(txt){const done=()=>toast("Kopiert – jetzt in WhatsApp einfügen");
  const fallback=()=>{const ta=$("#copyFallback");ta.value=txt;$("#copyBox").hidden=false;ta.focus();ta.select();toast("Text markiert – kopieren und teilen");};
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,fallback);else fallback();}catch(e){fallback();}}

/* ===================== GESPEICHERTE ROUTEN ===================== */
if(!Array.isArray(S.routes))S.routes=[];
let EDIT=null,CONFIRM_DEL=null;
const uid=()=>Math.random().toString(36).slice(2,9);
function saveRoute(r){r.id=r.id||uid();const i=S.routes.findIndex(x=>x.id===r.id);if(i>=0)S.routes[i]=r;else S.routes.unshift(r);save();}
function allOptions(sel){const groups={};ITEMS.filter(hasGeo).forEach(i=>{(groups[i.c]=groups[i.c]||[]).push(i);});
  return `<option value="">+ Stopp hinzufügen …</option>`+Object.entries(groups).map(([c,l])=>`<optgroup label="${CATS[c].n}">${l.map(i=>`<option value="${i.id}">${esc(i.n)}</option>`).join("")}</optgroup>`).join("");}
function renderRoutes(el){const ds=days();
  let html=`<p class="lede">Deine gespeicherten Routen. Öffne eine Route, um Namen, Tag, Verkehrsmittel und Stopps zu ändern. Alles wird automatisch gespeichert.</p>`;
  if(!S.routes.length)html+=`<div class="empty">${ic("bookmark")}<span>Noch keine Route gespeichert. Speichere eine Route unter <b>Tripliste</b> oder einen <b>Tagesvorschlag</b>.</span></div>`;
  S.routes.forEach(r=>{const m=routeMetrics(r);const open=EDIT===r.id;
    html+=`<article class="card rcard${open?" hl":""}"><div class="card-h"><div class="tile" style="--cc:var(--accent)">${ic("bookmark")}</div><div class="t"><h3>${esc(r.name)}</h3><div class="meta"><span>${r.day?fmt(r.day,true):"ohne Tag"}</span><span>${r.stops.length} Stopps</span><span>${MODE_N[r.mode]}</span><span>≈ ${kmf(m.km)} km · ${fmtMin(m.min)}</span></div></div></div>
     <div class="actions"><button class="btn${open?" added":" primary"}" data-act="r-open" data-id="${r.id}">${ic(open?"check":"edit")}${open?"Fertig":"Bearbeiten"}</button>${shareBtns(r,"r:"+r.id)}
     ${CONFIRM_DEL===r.id?`<button class="btn danger" data-act="r-del" data-id="${r.id}">${ic("trash")}Wirklich löschen?</button>`:`<button class="iconbtn" data-act="r-del" data-id="${r.id}" aria-label="Route löschen">${ic("trash")}</button>`}</div>
     ${open?routeEditor(r,ds,m):""}</article>`;});
  el.innerHTML=html;}
function routeEditor(r,ds,m){const all=stopsPts(r);let gi=0;
  const rows=r.stops.map((s,i)=>{const it=byId(s.id);if(!it)return "";const cat=catOf(it);return `<div class="srow">${tile(it,true)}<div class="nm"><b>${s.t?`<span class="mono">${s.t}</span> `:""}${esc(it.n)}</b><small>${cat.n}${i>0&&hasGeo(byId(r.stops[i-1].id))&&hasGeo(it)?" · "+MODE_E[r.mode]+" "+fmtMin(legCost(byId(r.stops[i-1].id),it,r.mode).min):""}</small></div>
    <select class="sel small" id="rdur-${r.id}-${i}" data-act="r-dur" data-id="${r.id}" data-i="${i}" aria-label="Zeit für ${esc(it.n)}">${[["","⏱ "+fmtDur(s.d||durOf(it))]].concat([15,30,45,60,90,120,150,180,240,300].map(v=>[v,"⏱ "+fmtDur(v)])).map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select><button class="iconbtn" data-act="r-up" data-id="${r.id}" data-i="${i}" aria-label="Nach oben"${i===0?" disabled":""}>${ic("up")}</button><button class="iconbtn" data-act="r-down" data-id="${r.id}" data-i="${i}" aria-label="Nach unten"${i===r.stops.length-1?" disabled":""}>${ic("down")}</button><button class="iconbtn" data-act="r-rm" data-id="${r.id}" data-i="${i}" aria-label="Entfernen">${ic("x")}</button></div>`;}).join("");
  return `<div class="editor">
   <label class="f" for="rn-${r.id}">Name<input class="txt" id="rn-${r.id}" data-act="r-name" data-id="${r.id}" value="${esc(r.name)}"></label>
   <div class="row"><select class="sel" id="rd-${r.id}" data-act="r-day" data-id="${r.id}"><option value="">Ohne Tag</option>${ds.map(x=>`<option value="${x}"${r.day===x?" selected":""}>${fmt(x,true)}</option>`).join("")}${r.day&&!ds.includes(r.day)?`<option value="${r.day}" selected>${fmt(r.day,true)}</option>`:""}</select>
   <div class="seg" role="group" aria-label="Verkehrsmittel">${[["walk","Zu Fuß"],["transit","Öffis"],["car","Auto"]].map(x=>`<button data-act="r-mode" data-id="${r.id}" data-mode2="${x[0]}" aria-pressed="${r.mode===x[0]}">${x[1]}</button>`).join("")}</div></div>
   ${r.start?`<div class="tip">Start: ${esc(r.start.n)} · <button class="linkbtn" data-act="r-nostart" data-id="${r.id}">entfernen</button></div>`:""}
   <div class="endbox"><div class="rlabel">Ende der Route</div><div class="seg wide3" role="group" aria-label="Ende der Route">${[["open","Offen"],["loop","Rundweg"],["ziel","Mit Ziel"]].map(([k,l])=>`<button data-act="r-end" data-id="${r.id}" data-k="${k}" aria-pressed="${endSel(r)===k}"><span>${l}</span></button>`).join("")}</div>
    ${endSel(r)==="ziel"?`<select class="sel" id="re-${r.id}" data-act="r-endid" data-id="${r.id}" aria-label="Zielort">${endOptions(r.end&&r.end.ref||"",r.stops.map(s=>s.id))}</select>`:""}</div>
   <div class="slist">${rows||`<div class="tip">Noch keine Stopps.</div>`}</div>
   <select class="sel" id="ra-${r.id}" data-act="r-add" data-id="${r.id}" aria-label="Stopp hinzufügen">${allOptions()}</select>
   ${m.pts.length>1?`<div class="mapbox">${mapSVG(m.pts.map((p,i)=>Object.assign(Object.create(p),{_no:i+1,id:p.id,_end:p._end,_loop:p._loop})),{route:m.pts})}</div>`:""}
   <div class="actions"><button class="btn" data-act="r-opt" data-id="${r.id}">${ic("sparkles")}Reihenfolge optimieren</button><button class="btn" data-act="r-toplan" data-id="${r.id}">${ic("route")}In meinen Plan</button>${m.pts.length>1?`<a class="btn ghost" href="${gmapsRoute(m.pts,r.mode)}" target="_blank" rel="noopener">${ic("map")}Google Maps</a>`:""}</div>
  </div>`;}

/* ===================== TAGESVORSCHLAG ===================== */
const DT_DEF={day:"",start:"09:00",hours:9,tempo:"normal",breakfast:false,lunch:true,lunchAt:"14:00",coffee:true,dinner:true,interests:["antike","museen","aussicht","viertel"],mode:"walk",from:"center",events:true,seed:1};
S.dt=Object.assign({},DT_DEF,S.dt||{});
const CENTER={id:"start",n:"Syntagma-Platz",lat:37.9755,lon:23.7348};
const PRIO={akropolis:10,akromuseum:9,agora:8,nam:8,plaka:7,lykabettus:7,filopappou:6,monastiraki:6,kykladen:6,benaki:6,anafiotika_cats:6,stadion:5,romagora:5,wache:5,areopag:5,varvakios:5,byzmuseum:5,laiki:6,
  olympieion:4,garten:4,herodes:4,hadrian:3,kerameikos:4,strefi:4,pnyx:4,streetart:5,ermou:4,instrumente:4,nationalgalerie:5,emst:4,hammam:3,snfcc:5,mikrolimano:3,kypseli:3,planetarium:3,technopolis:3,mitropoli:4,numismatik:4,beyhammam:3,friedhof:3,mets:3,koukakiviertel:3,pangrativiertel:3,akademie:2,kriegsmuseum:3,romantso:2};
const INTERESTS=[["antike","Antike","landmark"],["museen","Museen","museum"],["aussicht","Aussicht","mountain"],["viertel","Viertel & Märkte","pin"],["aktiv","Aktivitäten","ticket"],["ausgehen","Ausgehen","wine"]];
function matchInterest(it,ints){const k=kindOf(it);
  return (ints.includes("antike")&&it.c==="sight"&&(it.eu25||["stadion","herodes","anafiotika_cats"].includes(it.id)))||
   (ints.includes("museen")&&it.c==="museum"&&!["onassis","megaron"].includes(it.id))||
   (ints.includes("aussicht")&&it.c==="view"&&k!=="bar")||
   (ints.includes("viertel")&&(["street","market","local","guard"].includes(k)||(it.c==="sight"&&!it.eu25&&!["stadion","herodes","anafiotika_cats"].includes(it.id))))||
   (ints.includes("aktiv")&&it.c==="act");}
function rng(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function dietOk(it){if(!it.diet)return true;if(S.vegan&&!it.diet.vegan)return false;return true;}
function seasonOff(it){return it.season&&!months().some(m=>it.season.includes(m));}
function startPt(o){if(o.from==="me"&&ME)return {id:"start",n:"Mein Standort",lat:ME.lat,lon:ME.lon};if(o.from==="home"&&S.home)return {id:"start",n:"Unterkunft",lat:S.home.lat,lon:S.home.lon};return CENTER;}
function genDay(o){const day=o.day||days()[0];const T={entspannt:{buf:20,f:1.15},normal:{buf:10,f:1},straff:{buf:5,f:.85}}[o.tempo]||{buf:10,f:1};
  const R=rng(o.seed||1);let t=toMin(o.start);const end=t+o.hours*60;let pos=startPt(o);
  const endPt=o.endMode==="loop"?pos:o.endMode==="ziel"?resolvePoint(o.endId):null;const used=new Set();const out=[];const ss=sunsetMin(day);const warns=[];
  const pz=[];if(o.breakfast&&toMin(o.start)<=11*60)pz.push({k:"breakfast",at:toMin(o.start),dur:45,cat:"cafe",tag:"fruehstueck",n:"Frühstück"});
  if(o.lunch)pz.push({k:"lunch",at:toMin(o.lunchAt),dur:60,cat:"food",n:"Mittagessen"});
  if(o.coffee)pz.push({k:"coffee",at:Math.max(toMin(o.lunchAt)+150,16*60),dur:30,cat:"cafe",n:"Kaffeepause"});
  if(o.dinner)pz.push({k:"dinner",at:Math.max(20*60+30,toMin(o.lunchAt)+360),dur:90,cat:"food",n:"Abendessen"});
  const pauses=pz.filter(p=>p.at>=t-30&&p.at+p.dur<=end+30);
  const fixed=o.events?EVENTS.filter(e=>e.t&&hasGeo(e)&&day>=e.s&&day<=e.e&&!(S.rain&&e.in===false)).map(e=>({ev:e,at:toMin(e.t)})).filter(f=>f.at>=t&&f.at<end).sort((a,b)=>a.at-b.at):[];
  const pool=ITEMS.filter(i=>hasGeo(i)&&i.c!=="trip"&&!isDone(i.id)&&!(S.rain&&i.in===false)&&!seasonOff(i)&&matchInterest(i,o.interests)&&hav(i,CENTER)<12);
  const go=(it,extra)=>{const c=legCost(pos,it,o.mode);out.push({type:"travel",min:c.min,how:c.how,km:c.km});return t+c.min+(extra||0);};
  let guard=0;
  while(t<end-15&&guard++<60){
    const ev=fixed.find(f=>!f.done);
    if(ev){const c=legCost(pos,ev.ev,o.mode);if(t+c.min+T.buf>=ev.at-20){go(ev.ev);const arr=t+c.min;if(ev.at>arr+5)out.push({type:"free",start:arr,end:ev.at});const len=Math.min(150,end-ev.at);
        out.push({type:"event",it:ev.ev,start:ev.at,end:ev.at+len});t=ev.at+len;pos=ev.ev;ev.done=true;continue;}}
    const p=pauses.find(x=>!x.done&&t>=x.at-25);
    if(p){p.done=true;const cands=ITEMS.filter(i=>hasGeo(i)&&i.c===p.cat&&(!p.tag||(i.k||[]).includes(p.tag))&&(p.k!=="coffee"||(i.k||[]).some(x=>x==="kaffee"||x==="suess"))&&dietOk(i)&&!used.has(i.id)).map(i=>{const c=legCost(pos,i,o.mode);const arr=t+c.min;return {i,c,arr,s:(openAt(i,day,arr)&&openAt(i,day,arr+p.dur-1)?0:50)+c.min+crowd(i,day,arr)*4+R()*6};}).sort((a,b)=>a.s-b.s);
      const best=cands[0];if(best&&best.s<50){go(best.i);const pd=(S.durs&&S.durs[best.i.id])||p.dur;out.push({type:"pause",k:p.k,n:p.n,it:best.i,start:best.arr,end:best.arr+pd});used.add(best.i.id);t=best.arr+pd;pos=best.i;}
      else{out.push({type:"pause",k:p.k,n:p.n,start:t,end:t+p.dur});t+=p.dur;}continue;}
    const nextP=pauses.find(x=>!x.done),nextE=fixed.find(f=>!f.done);
    const limit=Math.min(end,nextP?nextP.at+40:1e9,nextE?nextE.at-15:1e9);
    let best=null;
    for(const c of pool){if(used.has(c.id))continue;const lc=legCost(pos,c,o.mode);let arr=t+lc.min+T.buf;const stay=S.durs&&S.durs[c.id]?S.durs[c.id]:Math.max(15,Math.min(180,Math.round((c.dur||45)*T.f/5)*5));
      if(!openAt(c,day,arr)){let waited=false;for(let w=10;w<=40;w+=10)if(openAt(c,day,arr+w)){arr+=w;waited=true;break;}if(!waited)continue;}
      let st=stay;if(!openAt(c,day,arr+st-1)){const hf=hoursFor(c,day);const sp=hf&&hf.spans.find(([a,b])=>arr>=a&&arr<b);if(!sp||sp[1]-arr<Math.min(st,45))continue;st=sp[1]-arr-(hf.h&&hf.h.last?0:0);}
      if(arr+st>limit+15)continue;
      if(endPt&&arr+st+legCost(c,endPt,o.mode).min>end+15)continue;
      if(arr>21*60+30&&c.c!=="bar")continue;
      const hr=arr/60;let s=(PRIO[c.id]||4)-lc.min*0.12-crowd(c,day,arr)*1.4+R()*1.6;
      if(kindOf(c)==="site"&&hr<10)s+=2.5;
      if(c.eu25&&freeDays()[day])s-=3;
      if(c.in===false&&kindOf(c)!=="sunset"&&c.c!=="view"&&arr>ss+20&&!["street","guard"].includes(kindOf(c)))s-=4;
      if(kindOf(c)==="sunset"){if(arr>=ss-80&&arr<=ss-10)s+=5;else if(arr>ss+20)s-=6;else if(arr<ss-180)s-=1;}
      if(c.c==="view"&&arr>ss+30)s-=4;
      if(!best||s>best.s)best={c,lc,arr,stay:st,s};}
    if(!best){const nxt=Math.min(nextP?nextP.at:1e9,nextE?nextE.at:1e9);if(nxt<end&&nxt>t){out.push({type:"free",start:t,end:nxt-5});t=nxt-5;continue;}break;}
    out.push({type:"travel",min:best.lc.min,how:best.lc.how,km:best.lc.km});
    out.push({type:"stop",it:best.c,start:best.arr,end:best.arr+best.stay,cr:crowd(best.c,day,best.arr)});
    used.add(best.c.id);t=best.arr+best.stay;pos=best.c;
    if(kindOf(best.c)==="sunset"&&best.arr<=ss&&best.arr+best.stay>=ss-20)out[out.length-1].sunset=true;}
  if(o.interests.includes("ausgehen")&&t<end-45){const bars=ITEMS.filter(i=>i.c==="bar"&&hasGeo(i)&&!used.has(i.id)).map(i=>({i,c:legCost(pos,i,o.mode)})).sort((a,b)=>a.c.min-b.c.min);
    if(bars[0]){out.push({type:"travel",min:bars[0].c.min,how:bars[0].c.how,km:bars[0].c.km});const a=t+bars[0].c.min;out.push({type:"pause",k:"drink",n:"Drink zum Abschluss",it:bars[0].i,start:a,end:Math.min(end,a+75)});t=a+75;}}
  // Reisezeiten ohne Ziel entfernen (am Ende)
  while(out.length&&out[out.length-1].type==="travel")out.pop();
  if(endPt&&hasGeo(endPt)&&out.length){const c=legCost(pos,endPt,o.mode);if(c.km>0.05)out.push({type:"travel",min:c.min,how:c.how,km:c.km});t+=c.km>0.05?c.min:0;
    out.push({type:"finish",n:o.endMode==="loop"?`Zurück zum Start: ${endPt.n}`:endPt.n,pt:endPt,loop:o.endMode==="loop",start:t,end:t});}
  const stops=out.filter(x=>x.it&&x.type!=="finish");const travel=out.filter(x=>x.type==="travel").reduce((s,x)=>s+x.min,0);
  if(day.slice(5)==="11-08")warns.push("Marathon-Tag: Im Zentrum sind viele Straßen gesperrt, zu Fuß oder mit der Metro planen.");
  if(day.slice(5)==="10-28")warns.push("Ochi-Tag: Vormittags Paraden am Syntagma, Sperrungen ab 9 Uhr.");
  if(day.slice(5)==="11-17")warns.push("Polytechnio-Gedenktag: Exarchia und Patission am Nachmittag meiden.");
  if(freeDays()[day])warns.push("Gratis-Sonntag: Staatliche Stätten sind sehr voll. Mit EU-Ausweis unter 25 bist du sowieso frei, also lieber einen anderen Tag wählen.");
  return {day,out,stops,travel,sunset:ss,warns,startPt:startPt(o),end:t};}
function planFromGen(g,o){const fin=g.out.find(x=>x.type==="finish");return {name:`Tagesvorschlag ${fmt(g.day)}`,day:g.day,mode:o.mode,start:g.startPt.id==="start"?{n:g.startPt.n,lat:g.startPt.lat,lon:g.startPt.lon}:null,
  stops:g.stops.map(x=>({id:x.it.id,t:hhmm(x.start),d:Math.round(x.end-x.start)})),
  end:fin?(fin.loop?{loop:true}:{n:fin.pt.n,lat:fin.pt.lat,lon:fin.pt.lon,ref:o.endId}):null,endT:fin?hhmm(fin.start):""};}
let LASTGEN=null;
function renderSuggest(el){const ds=days();const o=S.dt;if(!ds.includes(o.day))o.day=ds[0];
  const g=genDay(o);LASTGEN=g;const r=planFromGen(g,o);
  const timeline=g.out.map(x=>{
    if(x.type==="travel")return `<div class="tl-travel">${ic(o.mode==="walk"?"walk":o.mode==="car"?"car":"train")}<span>${fmtMin(x.min)} · ${esc(x.how)}${x.km>=0.3?` · ${kmf(x.km)} km`:""}</span></div>`;
    if(x.type==="finish")return `<div class="tl-item finish" style="--cc:var(--accent)"><div class="tl-t">${hhmm(x.start)}</div><div class="tl-b"><span class="cat">${ic("flag")}Ziel</span><b>${esc(x.n)}</b></div></div>`;
    if(x.type==="free")return `<div class="tl-item free"><div class="tl-t">${hhmm(x.start)}</div><div class="tl-b"><b>Freie Zeit</b><small>${fmtMin(x.end-x.start)} zum Bummeln oder Ausruhen</small></div></div>`;
    const it=x.it;const isP=x.type==="pause";const ev=x.type==="event";
    const cc=it?`var(${it.hol?"--warn":catOf(it).c})`:"var(--muted)";
    return `<div class="tl-item${isP?" pause":""}" style="--cc:${cc}"><div class="tl-t">${hhmm(x.start)}<small>${hhmm(x.end)}</small></div><div class="tl-b">${isP?`<span class="cat">${esc(x.n)}</span>`:ev?`<span class="cat">Event${it.ta?" · Uhrzeit ca.":""}</span>`:""}
      <b>${it?esc(it.n):esc(x.n)}</b><small>${it?esc(it.a||it.venue||""):""}${x.type==="stop"?` · ${CROWD_L[x.cr]}`:""}${x.sunset?" · zum Sonnenuntergang":""}${it&&priceShort(it.p)?" · "+esc(priceShort(it.p)):""}</small>
      ${it&&!ev?`<div class="tl-dur">${durSelect(it,"tdur-"+it.id)}</div>`:""}</div>
      ${it?`<button class="iconbtn" data-goto="${it.id}" aria-label="Details">${ic("ext")}</button>`:""}</div>`;}).join("");
  const sel=(id,v,opts)=>`<select class="sel" id="${id}" data-act="dt">${opts.map(([k,l])=>`<option value="${k}"${String(v)===String(k)?" selected":""}>${l}</option>`).join("")}</select>`;
  el.innerHTML=`<p class="lede">Sag mir, wann und wie lange du unterwegs sein willst. Ich stelle einen Tag mit Pausen, Öffnungszeiten, Auslastung, Sonnenuntergang und Events zusammen.</p>
   <div class="routebox">
    <div class="formgrid">
     <label class="f" for="dt-day">Tag${sel("dt-day",o.day,ds.map(x=>[x,fmt(x,true)]))}</label>
     <label class="f" for="dt-start">Start<input class="txt" type="time" id="dt-start" data-act="dt" value="${o.start}" step="900"></label>
     <label class="f" for="dt-hours">Unterwegs${sel("dt-hours",o.hours,[4,5,6,7,8,9,10,11,12,13,14].map(h=>[h,h+" Stunden"]))}</label>
     <label class="f" for="dt-tempo">Tempo${sel("dt-tempo",o.tempo,[["entspannt","Entspannt"],["normal","Normal"],["straff","Viel sehen"]])}</label>
     <label class="f" for="dt-from">Start bei${sel("dt-from",o.from,[["center","Syntagma (Zentrum)"],...(S.home?[["home","Unterkunft"]]:[]),...(ME?[["me","Mein Standort"]]:[])])}</label>
     <label class="f" for="dt-endMode">Ende${sel("dt-endMode",o.endMode||"open",[["open","Offen (letztes Ziel)"],["loop","Rundweg zurück zum Start"],["ziel","An einem Ort meiner Wahl"]])}</label>
     <label class="f" for="dt-lunchAt">Mittag um${sel("dt-lunchAt",o.lunchAt,["12:30","13:00","13:30","14:00","14:30","15:00"].map(x=>[x,x+" Uhr"]))}</label>
    </div>
    ${o.endMode==="ziel"?`<label class="f" for="dt-endId">Wo möchtest du am Ende landen?<select class="sel" id="dt-endId" data-act="dt">${endOptions(o.endId||"")}</select></label>`:""}
    <div class="row">${!S.home?`<button class="btn ghost" data-act="sethome">${ic("home")}Aktuellen Standort als Unterkunft</button>`:`<button class="btn ghost" data-act="clearhome">${ic("home")}Unterkunft gespeichert · entfernen</button>`}</div>
    <div class="seg" role="group" aria-label="Verkehrsmittel">${[["walk","Zu Fuß"],["transit","Öffis"],["car","Auto"]].map(x=>`<button data-act="dt-mode" data-mode2="${x[0]}" aria-pressed="${o.mode===x[0]}">${x[1]}</button>`).join("")}</div>
    <div><div class="flabel">Was interessiert dich?</div><div class="chips wrapchips">${INTERESTS.map(([k,l,i])=>`<button class="chip" data-act="dt-int" data-k="${k}" aria-pressed="${o.interests.includes(k)}">${ic(i)}${l}</button>`).join("")}</div></div>
    <div><div class="flabel">Pausen & Events</div><div class="chips wrapchips">${[["breakfast","Frühstück"],["lunch","Mittagessen"],["coffee","Kaffeepause"],["dinner","Abendessen"],["events","Events des Tages"]].map(([k,l])=>`<button class="chip" data-act="dt-flag" data-k="${k}" aria-pressed="${!!o[k]}">${l}</button>`).join("")}</div></div>
   </div>
   ${g.warns.map(w=>`<div class="notice warn">${ic("alert")}<span>${esc(w)}</span></div>`).join("")}
   ${S.rain?`<div class="notice rain">${ic("umbrella")}<span>Regentag aktiv: nur Ziele drinnen oder teilweise überdacht.</span></div>`:""}
   <div class="ptitle"><h2 style="font-size:1.2rem">${fmt(g.day,true)}</h2><small>Sonnenuntergang ${hhmm(g.sunset)} · ${g.stops.length} Stationen · ${fmtMin(g.travel)} unterwegs</small></div>
   ${g.stops.length?`<div class="timeline"><div class="tl-item start"><div class="tl-t">${o.start}</div><div class="tl-b"><b>Start: ${esc(g.startPt.n)}</b></div></div>${timeline}${g.out.some(x=>x.type==="finish")?"":`<div class="tl-item start"><div class="tl-t">${hhmm(g.end)}</div><div class="tl-b"><b>Ende</b></div></div>`}</div>
   <div class="mapbox">${mapSVG([g.startPt,...g.stops.map(x=>x.it)].filter(hasGeo).map((p,i)=>Object.assign(Object.create(p),{_no:i+1,id:p.id})),{route:[g.startPt,...g.stops.map(x=>x.it),...g.out.filter(x=>x.type==="finish").map(x=>x.pt)]})}</div>
   <div class="actions"><button class="btn primary" data-act="dt-save">${ic("bookmark")}Als Route speichern</button><button class="btn" data-act="dt-again">${ic("sparkles")}Anderer Vorschlag</button><button class="btn" data-act="dt-toplan">${ic("route")}In meinen Plan</button>${shareBtns(r,"gen")}</div>
   <div class="tip">Zeiten sind Schätzungen. Öffnungszeiten mit „ca.“ und Event-Uhrzeiten vorher prüfen. Bereits erlebte Sehenswürdigkeiten werden übersprungen.</div>`
   :`<div class="empty">${ic("sparkles")}<span>Mit diesen Einstellungen passt nichts. Wähle mehr Interessen, einen längeren Zeitraum oder schalte den Regentag aus.</span></div>`}`;}

/* ===================== PLAN-TAB ===================== */
if(!S.planView)S.planView="liste";
function renderPlan(){const el=$("#p-plan");const ids=Object.keys(S.plan).filter(byId);const pc=$("#planCount");pc.textContent=ids.length;pc.dataset.n=ids.length;
  const seg=`<div class="ptitle"><h2>Mein Plan</h2></div><div class="seg wide" role="tablist" aria-label="Plan-Ansicht">${[["liste","Liste"],["vorschlag","Vorschlag"],["routen",`Routen${S.routes.length?" "+S.routes.length:""}`],["tagebuch",`Erlebt${diaryEntries().length?" "+diaryEntries().length:""}`]].map(([k,l])=>`<button data-act="pv" data-k="${k}" aria-pressed="${S.planView===k}">${l}</button>`).join("")}</div><div id="planBody" class="panel"></div>
   <div id="copyBox" class="copybox" hidden><label for="copyFallback" class="flabel">Text zum Kopieren</label><textarea id="copyFallback" rows="8" readonly></textarea><button class="btn" data-act="closecopy">Schließen</button></div>`;
  el.innerHTML=seg;const body=$("#planBody");
  if(S.planView==="vorschlag")renderSuggest(body);else if(S.planView==="routen")renderRoutes(body);else if(S.planView==="tagebuch")renderDiary(body);else renderPlanList(body);}

/* ===================== AKTIONEN ===================== */
function rById(id){return S.routes.find(r=>r.id===id);}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t||t.tagName==="SELECT"||t.tagName==="INPUT")return;const a=t.dataset.act;const r=t.dataset.id?rById(t.dataset.id):null;
  if(a==="pv"){S.planView=t.dataset.k;save();renderPlan();return;}
  if(a==="foldall"){const keys=[...document.querySelectorAll("details.planday")].map(x=>x.dataset.dkey);const anyClosed=keys.some(k=>S.collapsed[k]);keys.forEach(k=>S.collapsed[k]=!anyClosed);save();renderPlan();return;}
  if(a==="copy"){const src=t.dataset.src;let txt="";if(src==="gen"&&LASTGEN)txt=routeText(planFromGen(LASTGEN,S.dt));else if(src==="plan"&&LAST_ORDER)txt=routeText(LAST_ORDER);else if(src.startsWith("r:")){const rr=rById(src.slice(2));if(rr)txt=routeText(rr);}if(txt)copyText(txt);return;}
  if(a==="closecopy"){$("#copyBox").hidden=true;return;}
  if(a==="saveplan"&&LAST_ORDER){const rr=JSON.parse(JSON.stringify(LAST_ORDER));rr.id=null;saveRoute(rr);EDIT=rr.id;S.planView="routen";save();renderPlan();toast("Route gespeichert");return;}
  if(a==="dt-save"&&LASTGEN){const rr=planFromGen(LASTGEN,S.dt);saveRoute(rr);EDIT=rr.id;S.planView="routen";save();renderPlan();toast("Route gespeichert");return;}
  if(a==="dt-again"){S.dt.seed=(S.dt.seed||1)+1;save();renderPlan();return;}
  if(a==="dt-toplan"&&LASTGEN){LASTGEN.stops.forEach(x=>{if(!S.plan[x.it.id])S.plan[x.it.id]={day:LASTGEN.day,done:false};else S.plan[x.it.id].day=LASTGEN.day;});S.sample=false;save();renderAll();toast("In den Plan übernommen");return;}
  if(a==="dt-mode"){S.dt.mode=t.dataset.mode2;save();renderPlan();return;}
  if(a==="dt-int"){const k=t.dataset.k;const L=S.dt.interests;S.dt.interests=L.includes(k)?L.filter(x=>x!==k):[...L,k];save();renderPlan();return;}
  if(a==="dt-flag"){const k=t.dataset.k;S.dt[k]=!S.dt[k];save();renderPlan();return;}
  if(a==="sethome"){if(ME){S.home={lat:ME.lat,lon:ME.lon};S.dt.from="home";save();renderPlan();toast("Unterkunft gespeichert");}else{toast("Erst den Standort abfragen …");WANT_HOME=true;locate();}return;}
  if(a==="clearhome"){S.home=null;if(S.dt.from==="home")S.dt.from="center";save();renderPlan();toast("Unterkunft entfernt");return;}
  if(!r)return;
  if(a==="r-open"){EDIT=EDIT===r.id?null:r.id;CONFIRM_DEL=null;renderPlan();return;}
  if(a==="r-del"){if(CONFIRM_DEL===r.id){S.routes=S.routes.filter(x=>x!==r);CONFIRM_DEL=null;if(EDIT===r.id)EDIT=null;save();renderPlan();toast("Route gelöscht");}else{CONFIRM_DEL=r.id;renderPlan();}return;}
  const i=+t.dataset.i;
  if(a==="r-up"&&i>0){[r.stops[i-1],r.stops[i]]=[r.stops[i],r.stops[i-1]];r.stops.forEach(s=>delete s.t);}
  else if(a==="r-down"&&i<r.stops.length-1){[r.stops[i+1],r.stops[i]]=[r.stops[i],r.stops[i+1]];r.stops.forEach(s=>delete s.t);}
  else if(a==="r-rm"){r.stops.splice(i,1);}
  else if(a==="r-mode"){r.mode=t.dataset.mode2;}
  else if(a==="r-nostart"){r.start=null;}
  else if(a==="r-opt"){const pts=r.stops.map(s=>byId(s.id)).filter(hasGeo);const st=r.start?{id:"start",lat:r.start.lat,lon:r.start.lon}:null;const all=st?[st,...pts]:pts;const sid=st?"start":pts[0]&&pts[0].id;
    const tail=!r.end?null:r.end.loop?all.find(p=>p.id===sid):{id:r.end.ref||"end",lat:r.end.lat,lon:r.end.lon};
    const ord=optimizeTo(all,sid,tail).filter(p=>p.id!=="start");r.stops=ord.map(p=>({id:p.id}));toast("Reihenfolge optimiert");}
  else if(a==="r-end"){const k=t.dataset.k;if(k==="open")r.end=null;else if(k==="loop")r.end={loop:true};else r.end=r.end&&!r.end.loop?r.end:{pending:true};r.stops.forEach(s=>delete s.t);}
  else if(a==="r-toplan"){r.stops.forEach(s=>{if(!S.plan[s.id])S.plan[s.id]={day:r.day||"",done:false};else if(r.day)S.plan[s.id].day=r.day;});S.sample=false;save();renderAll();toast("In den Plan übernommen");return;}
  else return;
  save();renderPlan();});
let WANT_HOME=false;
document.addEventListener("change",e=>{const t=e.target;const a=t.dataset&&t.dataset.act;if(!a)return;
  if(a==="dt"){const k=t.id.slice(3);S.dt[k]=k==="hours"?+t.value:t.value;save();renderPlan();return;}
  const r=t.dataset.id?rById(t.dataset.id):null;if(!r)return;
  if(a==="r-name"){r.name=t.value.trim()||"Meine Route";}
  else if(a==="r-day"){r.day=t.value;}
  else if(a==="r-add"&&t.value){r.stops.push({id:t.value});t.value="";}
  else if(a==="r-dur"&&t.value){const st=r.stops[+t.dataset.i];if(st)st.d=+t.value;}
  else if(a==="r-endid"){const p=resolvePoint(t.value);r.end=p?{n:p.n,lat:p.lat,lon:p.lon,ref:t.value}:{pending:true};}
  save();renderPlan();});

document.addEventListener("toggle",e=>{const t=e.target;if(!t||t.tagName!=="DETAILS")return;if(!S.collapsed)S.collapsed={};
  if(t.id==="routeFold"){S.collapsed.__route=!t.open;save();}else if(t.dataset&&t.dataset.dkey){S.collapsed[t.dataset.dkey]=!t.open;save();}},true);
