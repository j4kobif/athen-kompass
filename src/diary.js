/* ===================== TAGEBUCH: ERLEBT, BEWERTUNG, NOTIZEN ===================== */
// S.log[id] = {done:true, at:"2026-11-06", r:1..5, note:"…"}  ·  S.custom = [{id:"c-…", n, at, r, note}]
if(!S.log||typeof S.log!=="object")S.log={};
if(!Array.isArray(S.custom))S.custom=[];
// Übernahme: bereits abgehakte Plan-Einträge gelten als erlebt
Object.entries(S.plan||{}).forEach(([id,p])=>{if(p&&p.done&&!S.log[id])S.log[id]={done:true,at:p.day||""};});
if(!S.diarySort)S.diarySort="tag";

function isDone(id){return !!(S.log[id]&&S.log[id].done);}
function logDay(id){const ds=days();const now=athensNow().iso;if(ds.includes(now))return now;const p=S.plan[id];return p&&p.day?p.day:"";}
function setDone(id,on){
  if(on){S.log[id]=Object.assign({at:logDay(id)},S.log[id]||{},{done:true});}
  else if(S.log[id]){S.log[id].done=false;if(!S.log[id].r&&!S.log[id].note)delete S.log[id];}
  if(S.plan[id])S.plan[id].done=!!on;S.sample=false;save();}
function stars(id,r,small){let h=`<div class="stars${small?" sm":""}" role="radiogroup" aria-label="Deine Bewertung">`;
  for(let v=1;v<=5;v++)h+=`<button class="star${v<=(r||0)?" on":""}" data-act="rate" data-id="${id}" data-v="${v}" role="radio" aria-checked="${v===r}" aria-label="${v} von 5 Sternen">${ic("star")}</button>`;
  return h+"</div>";}
function starTxt(r){return r?"★".repeat(r)+"☆".repeat(5-r):"";}
function dayOptsFor(sel){const ds=days();let o=`<option value="">ohne Datum</option>`+ds.map(x=>`<option value="${x}"${sel===x?" selected":""}>${fmt(x)}</option>`).join("");
  if(sel&&!ds.includes(sel))o+=`<option value="${sel}" selected>${fmt(sel)}</option>`;return o;}
function logEditor(id,L){return `<div class="diary">
   <div class="row" style="justify-content:space-between">${stars(id,L.r)}<select class="sel small" id="at-${id}" data-act="logday" data-id="${id}" aria-label="Wann erlebt">${dayOptsFor(L.at)}</select></div>
   <textarea class="note" id="note-${id}" data-act="note" data-id="${id}" rows="2" placeholder="Notiz: Wie war's? Was hast du gegessen? Tipp für später …">${esc(L.note||"")}</textarea></div>`;}
function doneBadge(id){const L=S.log[id];if(!L||!L.done)return "";return `<span class="b donebadge">${ic("check")}erlebt${L.r?` · ${L.r}★`:""}</span>`;}
// Block für Karten in Entdecken/Essen/Events
function diaryBlock(it){if(it.hol)return "";const L=S.log[it.id];const done=L&&L.done;
  return `<div class="dwrap"><button class="btn erlebt${done?" on":""}" data-act="erlebt" data-id="${it.id}" aria-pressed="${!!done}">${ic("check")}${done?"Erlebt":"Als erlebt markieren"}</button>${done?logEditor(it.id,L):""}</div>`;}

/* ---------- Tagebuch-Ansicht im Plan-Tab ---------- */
function diaryEntries(){const out=[];
  Object.entries(S.log).forEach(([id,L])=>{if(!L.done)return;const it=byId(id);if(it)out.push({id,it,L,custom:false});});
  S.custom.forEach(c=>out.push({id:c.id,it:{id:c.id,n:c.n,c:"custom",a:""},L:c,custom:true}));return out;}
function diaryText(){const E=diaryEntries();const L=["📔 Mein Athen-Tagebuch",""];
  const by={};E.forEach(e=>{(by[e.L.at||""]=by[e.L.at||""]||[]).push(e);});
  Object.keys(by).sort((a,b)=>(a||"9")<(b||"9")?-1:1).forEach(day=>{L.push(day?`📅 ${fmt(day,true)}`:"📅 Ohne Datum");
    by[day].forEach(e=>{L.push(`• ${e.it.n}${e.L.r?"  "+starTxt(e.L.r):""}`);if(e.L.note)L.push(`   „${e.L.note.trim()}“`);});L.push("");});
  const rated=E.filter(e=>e.L.r);if(rated.length)L.push(`Ø ${(rated.reduce((s,e)=>s+e.L.r,0)/rated.length).toFixed(1).replace(".",",")} Sterne · ${E.length} Erlebnisse`);
  return L.join("\n");}
function renderDiary(el){const E=diaryEntries();const rated=E.filter(e=>e.L.r);const avg=rated.length?rated.reduce((s,e)=>s+e.L.r,0)/rated.length:0;
  const notes=E.filter(e=>(e.L.note||"").trim()).length;const favs=E.filter(e=>e.L.r>=4).length;
  const open=Object.keys(S.plan).filter(id=>byId(id)&&!isDone(id));
  let html=`<p class="lede">Hake ab, was du erlebt hast, gib eigene Sterne und schreib dir Notizen. Alles bleibt nur auf deinem Gerät gespeichert.</p>
   <div class="sumgrid"><div><b>${E.length}</b><span>erlebt</span></div><div><b>${avg?avg.toFixed(1).replace(".",","):"–"}</b><span>Ø Sterne</span></div><div><b>${favs}</b><span>Lieblinge (4★+)</span></div><div><b>${notes}</b><span>Notizen</span></div></div>`;
  if(open.length)html+=`<details class="planday" data-dkey="__open"${S.collapsed&&S.collapsed.__open?"":" open"}><summary><span class="pd-t">Aus deinem Plan noch offen</span><span class="pd-n">${open.length}</span></summary><div class="pd-body">${open.map(id=>{const it=byId(id);
     return `<div class="srow">${tile(it,true)}<div class="nm"><b>${esc(it.n)}</b><small>${catOf(it).n}${S.plan[id].day?" · "+fmt(S.plan[id].day):""}</small></div><button class="btn small-btn" data-act="erlebt" data-id="${id}">${ic("check")}Erlebt</button></div>`;}).join("")}</div></details>`;
  html+=`<details class="routebox fold" id="customFold"${S.collapsed&&S.collapsed.__custom?" open":""}><summary><h2>${ic("plus")}Eigenes Erlebnis eintragen</h2></summary><div class="foldbody">
     <label class="f" for="cu-n">Was war's?<input class="txt" id="cu-n" placeholder="z. B. Straßenmusik am Monastiraki-Platz" maxlength="80"></label>
     <div class="row"><select class="sel" id="cu-at" aria-label="Datum">${dayOptsFor(logDay(""))}</select></div>
     <button class="btn primary" data-act="cu-add">${ic("plus")}Hinzufügen</button></div></details>`;
  if(!E.length){html+=`<div class="empty">${ic("check")}<span>Noch nichts erlebt. Tippe auf einer Karte auf <b>„Als erlebt markieren“</b> oder hake oben Ziele aus deinem Plan ab.</span></div>`;el.innerHTML=html;return;}
  html+=`<div class="row" style="justify-content:space-between"><div class="seg" role="group" aria-label="Sortierung">${[["tag","Nach Tag"],["sterne","Nach Sternen"]].map(([k,l])=>`<button data-act="dsort" data-k="${k}" aria-pressed="${S.diarySort===k}">${l}</button>`).join("")}</div>
    <div class="row"><button class="btn" data-act="dcopy">${ic("copy")}Kopieren</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(diaryText())}" target="_blank" rel="noopener">${ic("share")}WhatsApp</a></div></div>`;
  const card=e=>{const it=e.it;return `<article class="card dcard" id="dcard-${e.id}"><div class="card-h">${e.custom?`<div class="tile s" style="--cc:var(--accent)">${ic("edit")}</div>`:tile(it,true)}<div class="t"><div class="cat" style="color:var(${e.custom?"--accent":catOf(it).c})">${e.custom?"Eigenes Erlebnis":catOf(it).n}</div><h3>${esc(it.n)}</h3>${it.a?`<div class="meta"><span>${esc(it.a)}</span></div>`:""}</div>
     <button class="iconbtn" data-act="${e.custom?"cu-del":"undone"}" data-id="${e.id}" aria-label="Aus dem Tagebuch entfernen" title="Entfernen">${ic("x")}</button></div>${logEditor(e.id,e.L)}</article>`;};
  if(S.diarySort==="sterne"){html+=`<div class="list">${[...E].sort((a,b)=>(b.L.r||0)-(a.L.r||0)).map(card).join("")}</div>`;}
  else{const by={};E.forEach(e=>{(by[e.L.at||""]=by[e.L.at||""]||[]).push(e);});
    Object.keys(by).sort((a,b)=>(a||"9")<(b||"9")?-1:1).forEach(day=>{html+=`<div class="planday-h">${day?fmt(day,true):"Ohne Datum"}<span>${by[day].length}</span></div><div class="list">${by[day].map(card).join("")}</div>`;});}
  el.innerHTML=html;}

/* ---------- Aktionen ---------- */
function customById(id){return S.custom.find(c=>c.id===id);}
function logTarget(id){return customById(id)||S.log[id];}
function rerenderDiaryViews(){renderDiscover();renderEvents();renderFood();renderPlan();}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t)return;const a=t.dataset.act,id=t.dataset.id;
  if(a==="erlebt"){const on=!isDone(id);setDone(id,on);toast(on?"Als erlebt markiert – gib gern Sterne":"Nicht mehr als erlebt markiert");rerenderDiaryViews();
    if(on){const n=document.getElementById("note-"+id);if(n&&n.closest&&n.closest(".card"))n.closest(".card").scrollIntoView({block:"nearest",behavior:"smooth"});}return;}
  if(a==="undone"){setDone(id,false);rerenderDiaryViews();toast("Aus dem Tagebuch entfernt");return;}
  if(a==="rate"){const L=logTarget(id);if(!L)return;const v=+t.dataset.v;L.r=L.r===v?0:v;save();
    document.querySelectorAll(`.star[data-id="${id}"]`).forEach(b=>{const on=+b.dataset.v<=(L.r||0);b.classList.toggle("on",on);b.setAttribute("aria-checked",String(+b.dataset.v===L.r));});
    document.querySelectorAll(`#card-${CSS&&CSS.escape?CSS.escape(id):id} .donebadge`).forEach(b=>b.innerHTML=`${ic("check")}erlebt${L.r?` · ${L.r}★`:""}`);return;}
  if(a==="dsort"){S.diarySort=t.dataset.k;save();renderPlan();return;}
  if(a==="dcopy"){copyText(diaryText());return;}
  if(a==="cu-add"){const n=$("#cu-n");const name=(n&&n.value||"").trim();if(!name){toast("Bitte kurz eintragen, was du erlebt hast");if(n)n.focus();return;}
    S.custom.unshift({id:"c-"+uid(),n:name,at:$("#cu-at").value,r:0,note:""});save();renderPlan();toast("Eingetragen");return;}
  if(a==="cu-del"){S.custom=S.custom.filter(c=>c.id!==id);save();renderPlan();toast("Eintrag gelöscht");return;}
});
let _noteT=null;
document.addEventListener("input",e=>{const t=e.target;if(!t.dataset||t.dataset.act!=="note")return;const L=logTarget(t.dataset.id);if(!L)return;L.note=t.value;clearTimeout(_noteT);_noteT=setTimeout(save,400);});
document.addEventListener("change",e=>{const t=e.target;if(!t.dataset)return;
  if(t.dataset.act==="note"){const L=logTarget(t.dataset.id);if(L){L.note=t.value;save();}return;}
  if(t.dataset.act==="logday"){const L=logTarget(t.dataset.id);if(L){L.at=t.value;save();if(S.tab==="plan"&&S.planView==="tagebuch")renderPlan();}return;}});
document.addEventListener("click",e=>{const t=e.target.closest("[data-act]");if(!t)return;
  if(t.dataset.act==="gotodiary"){S.planView="tagebuch";save();renderPlan();setTab("plan");return;}
  if(t.dataset.act==="hidedone"){S.hideDone=!S.hideDone;save();renderDiscover();return;}});
document.addEventListener("toggle",e=>{const t=e.target;if(t&&t.id==="customFold"){if(!S.collapsed)S.collapsed={};S.collapsed.__custom=t.open;save();}},true);
