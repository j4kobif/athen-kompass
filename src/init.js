/* ===================== START ===================== */
if(S.sample&&!Object.keys(S.plan).length){
  [["akropolis","2026-11-06"],["akromuseum","2026-11-06"],["filopappou","2026-11-06"],["veganaki","2026-11-06"],
   ["nam","2026-11-07"],["taf","2026-11-07"],["veganbeat","2026-11-07"],["lykabettus","2026-11-07"]]
  .forEach(([id,day])=>S.plan[id]={day,done:false});}
renderAll();setTab(TABS.includes(location.hash.slice(1))?location.hash.slice(1):(S.tab||"entdecken"));

// Offline-Hinweis
function updOnline(){const b=$("#offBar");if(b)b.hidden=navigator.onLine!==false;}
window.addEventListener("online",()=>{updOnline();toast("Wieder online");});
window.addEventListener("offline",updOnline);updOnline();
