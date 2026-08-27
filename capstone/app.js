const KEY="finsight_portfolio_v1";
const defaultState={
 profile:{userId:"1001",name:"Sravanthi",email:"sravanthi@example.com"},
 investments:[
  {id:101,name:"TCS",type:"Stock",qty:10,purchase:2500,current:2750},
  {id:102,name:"SBI Bluechip",type:"Mutual Fund",qty:20,purchase:150,current:165},
  {id:103,name:"Gold ETF",type:"ETF",qty:15,purchase:100,current:120},
  {id:104,name:"Reliance",type:"Stock",qty:5,purchase:2800,current:3000}
 ]};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||structuredClone(defaultState);
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const money=n=>"₹"+Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=n=>Number(n).toFixed(2)+"%";
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function invested(x){return x.qty*x.purchase}
function current(x){return x.qty*x.current}
function pl(x){return current(x)-invested(x)}
function roi(x){return invested(x)?pl(x)/invested(x)*100:0}
function risk(x){if(x.type==="Cryptocurrency")return"Very High";if(x.type==="Stock")return"High";if(x.type==="Bond"||x.type==="Fixed Deposit")return"Low";return"Medium"}
function rec(x){let r=roi(x);return r>=10?"HOLD":r>=5?"HOLD / REVIEW":r>=0?"REVIEW":"REVIEW / REDUCE"}
function totals(){let inv=state.investments.reduce((a,x)=>a+invested(x),0),cur=state.investments.reduce((a,x)=>a+current(x),0);return{inv,cur,pl:cur-inv,roi:inv?(cur-inv)/inv*100:0}}
function nav(page){$$(".page").forEach(x=>x.classList.remove("active"));$("#"+page).classList.add("active");$$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===page));let titles={dashboard:"Portfolio Dashboard",portfolio:"My Portfolio",analysis:"Financial Analysis",insights:"Risk & Smart Insights",profile:"User Profile"};$("#pageTitle").textContent=titles[page]}
$$(".nav-item").forEach(b=>b.onclick=()=>nav(b.dataset.page));
$$("[data-page-target]").forEach(b=>b.onclick=()=>nav(b.dataset.pageTarget));
function metricsHTML(t){return `
<div class="metric"><div class="label">TOTAL INVESTED</div><div class="value">${money(t.inv)}</div><div class="sub">Capital deployed</div></div>
<div class="metric"><div class="label">CURRENT VALUE</div><div class="value">${money(t.cur)}</div><div class="sub">Estimated market value</div></div>
<div class="metric"><div class="label">TOTAL PROFIT / LOSS</div><div class="value ${t.pl>=0?"positive":"negative"}">${money(t.pl)}</div><div class="sub">${t.pl>=0?"Portfolio is in profit":"Portfolio is in loss"}</div></div>
<div class="metric"><div class="label">OVERALL ROI</div><div class="value ${t.roi>=0?"positive":"negative"}">${pct(t.roi)}</div><div class="sub">Weighted portfolio return</div></div>`}
function renderMetrics(){let t=totals();$("#metrics").innerHTML=metricsHTML(t);$("#analysisMetrics").innerHTML=metricsHTML(t)}
function renderPortfolio(){
 let q=$("#search").value.toLowerCase(),type=$("#typeFilter").value;
 let d=state.investments.filter(x=>(x.name.toLowerCase().includes(q)||x.type.toLowerCase().includes(q))&&(type==="All"||x.type===type));
 if(!d.length){$("#portfolioTable").innerHTML='<tr><td colspan="9"><div class="empty">No investments found.</div></td></tr>';return}
 $("#portfolioTable").innerHTML=d.map(x=>`<tr><td><div class="asset-name">${x.name}</div><div class="asset-sub">ID ${x.id}</div></td><td>${x.type}</td><td>${x.qty}</td><td>${money(invested(x))}</td><td>${money(current(x))}</td><td class="${pl(x)>=0?"positive":"negative"}">${money(pl(x))}</td><td class="${roi(x)>=0?"positive":"negative"}">${pct(roi(x))}</td><td><span class="badge risk-${risk(x).toLowerCase().replace(" ","-")}">${risk(x)}</span></td><td><button class="action-btn" onclick="editInvestment(${x.id})">✎</button><button class="action-btn" onclick="deleteInvestment(${x.id})">×</button></td></tr>`).join("")
}
function renderTop(){let d=[...state.investments].sort((a,b)=>current(b)-current(a));$("#topHoldings").innerHTML=d.slice(0,4).map((x,i)=>`<div class="holding"><div class="hold-icon">${x.name[0]}</div><div><b>${x.name}</b><small>${x.type} · ${pct(current(x)/Math.max(1,totals().cur)*100)} allocation</small></div><strong>${money(current(x))}</strong></div>`).join("")||'<div class="empty">Add your first investment.</div>'}
function renderHealth(){
 let t=totals(),types=new Set(state.investments.map(x=>x.type)).size,high=state.investments.filter(x=>risk(x)==="High"||risk(x)==="Very High").reduce((a,x)=>a+current(x),0);
 $("#health").innerHTML=`<div class="health-row"><div><b>Diversification</b><span>${types} asset categories</span></div><div class="progress"><i style="width:${Math.min(100,types/6*100)}%"></i></div></div><div class="health-row"><div><b>Profitability</b><span>${pct(t.roi)} ROI</span></div><div class="progress"><i style="width:${Math.min(100,Math.max(5,t.roi*5))}%"></i></div></div><div class="health-row"><div><b>High-risk exposure</b><span>${pct(high/Math.max(1,t.cur)*100)}</span></div><div class="progress"><i style="width:${Math.min(100,high/Math.max(1,t.cur)*100)}%"></i></div></div>`
}
const chartColors=["#315efb","#7b4dff","#12a875","#e59a19","#e04f5f","#15a3b7","#8b5cf6"];
function renderPerformance(){
 let d=state.investments;if(!d.length){$("#performanceChart").innerHTML='<div class="empty">No data</div>';return}
 let W=760,H=240,pad=45,max=Math.max(...d.map(x=>Math.max(invested(x),current(x))),1),bw=Math.min(55,650/d.length);
 let bars=d.map((x,i)=>{let gx=pad+i*((W-pad*1.3)/d.length),h1=invested(x)/max*155,h2=current(x)/max*155;return `<rect x="${gx}" y="${H-25-h1}" width="${bw/2-3}" height="${h1}" rx="4" fill="#315efb"/><rect x="${gx+bw/2+3}" y="${H-25-h2}" width="${bw/2-3}" height="${h2}" rx="4" fill="#12a875"/><text x="${gx+bw/2}" y="${H-5}" text-anchor="middle" font-size="10" fill="#718096">${x.name.slice(0,9)}</text>`}).join("");
 $("#performanceChart").innerHTML=`<div class="svg-wrap"><svg viewBox="0 0 ${W} ${H}"><line x1="${pad}" y1="15" x2="${pad}" y2="${H-25}" stroke="#dfe4ec"/><line x1="${pad}" y1="${H-25}" x2="${W-10}" y2="${H-25}" stroke="#dfe4ec"/>${bars}<text x="52" y="15" font-size="10" fill="#718096">${money(max)}</text><text x="650" y="20" font-size="10" fill="#315efb">■ Invested</text><text x="650" y="35" font-size="10" fill="#12a875">■ Current</text></svg></div>`
}
function renderDonut(){
 let d=state.investments,t=totals(),r=72,circ=2*Math.PI*r,offset=0;
 let circles=d.map((x,i)=>{let len=current(x)/Math.max(1,t.cur)*circ,s=`<circle cx="115" cy="115" r="${r}" fill="none" stroke="${chartColors[i%chartColors.length]}" stroke-width="30" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-offset}" transform="rotate(-90 115 115)"/>`;offset+=len;return s}).join("");
 let legend=d.map((x,i)=>`<div class="legend-row"><span><i class="dot" style="background:${chartColors[i%chartColors.length]}"></i>${x.name}</span><b>${pct(current(x)/Math.max(1,t.cur)*100)}</b></div>`).join("");
 $("#donutChart").innerHTML=`<div class="donut-wrap"><svg width="230" height="230" viewBox="0 0 230 230"><circle cx="115" cy="115" r="${r}" fill="none" stroke="#eef1f5" stroke-width="30"/>${circles}<text x="115" y="111" text-anchor="middle" font-size="13" fill="#718096">Portfolio</text><text x="115" y="132" text-anchor="middle" font-size="18" font-weight="800" fill="#172033">${money(t.cur)}</text></svg><div class="legend">${legend}</div></div>`
}
function renderAnalysis(){
 let d=[...state.investments].sort((a,b)=>roi(b)-roi(a));
 $("#ranking").innerHTML=d.map((x,i)=>`<div class="rank-row"><div><div class="rank-name">#${i+1} ${x.name}</div><div class="rank-meta">${x.type} · ${money(pl(x))} P/L</div></div><div class="score ${roi(x)>=0?"positive":"negative"}">${pct(roi(x))}</div></div>`).join("")||'<div class="empty">No data</div>';
 let max=Math.max(10,...d.map(x=>roi(x))),W=700,H=280;
 $("#roiChart").innerHTML=`<div class="svg-wrap"><svg viewBox="0 0 ${W} ${H}">${d.map((x,i)=>{let h=Math.max(2,Math.max(0,roi(x))/max*190),y=215-h,xx=65+i*(600/Math.max(1,d.length));return `<rect x="${xx}" y="${y}" width="55" height="${h}" rx="5" fill="${roi(x)>=0?"#315efb":"#e04f5f"}"/><text x="${xx+27}" y="${y-7}" text-anchor="middle" font-size="10">${pct(roi(x))}</text><text x="${xx+27}" y="238" text-anchor="middle" font-size="10" fill="#718096">${x.name.slice(0,9)}</text>`}).join("")}<line x1="45" y1="215" x2="670" y2="215" stroke="#dfe4ec"/></svg></div>`
}
function renderInsights(){
 let groups={Low:0,Medium:0,High:0,"Very High":0};state.investments.forEach(x=>groups[risk(x)]+=current(x));
 let total=Object.values(groups).reduce((a,b)=>a+b,0)||1;
 $("#riskChart").innerHTML=Object.entries(groups).filter(([k,v])=>v>0).map(([k,v])=>`<div class="health-row"><div><b>${k} Risk</b><span>${money(v)} · ${pct(v/total*100)}</span></div><div class="progress"><i style="width:${v/total*100}%;background:${k==="Low"?"#12a875":k==="Medium"?"#e59a19":k==="High"?"#e04f5f":"#7b4dff"}"></i></div></div>`).join("");
 $("#recommendations").innerHTML=state.investments.map(x=>`<div class="rec-row"><div><b>${x.name}</b><div class="rank-meta">${risk(x)} risk · ROI ${pct(roi(x))}</div></div><span class="badge ${roi(x)>=5?"risk-low":"risk-medium"}">${rec(x)}</span></div>`).join("")||'<div class="empty">No investments.</div>'
}
function renderProfile(){let p=state.profile,initial=(p.name||"U")[0].toUpperCase();$("#welcome").textContent=`Good to see you, ${p.name.split(" ")[0]}.`;$("#avatar").textContent=initial;$("#profileAvatar").textContent=initial;$("#profileName").textContent=p.name;$("#profileEmail").textContent=p.email;$("#userId").value=p.userId;$("#userName").value=p.name;$("#userEmail").value=p.email}
function renderAll(){renderMetrics();renderPortfolio();renderTop();renderHealth();renderPerformance();renderDonut();renderAnalysis();renderInsights();renderProfile()}
$("#search").oninput=renderPortfolio;$("#typeFilter").onchange=renderPortfolio;
$("#openAdd").onclick=()=>openModal();$("#closeModal").onclick=()=>$("#investmentModal").classList.add("hidden");
function openModal(x=null){$("#investmentModal").classList.remove("hidden");$("#modalTitle").textContent=x?"Edit Investment":"Add Investment";$("#editId").value=x?x.id:"";$("#invName").value=x?x.name:"";$("#invType").value=x?x.type:"Stock";$("#invQty").value=x?x.qty:"";$("#invPurchase").value=x?x.purchase:"";$("#invCurrent").value=x?x.current:""}
window.editInvestment=id=>{let x=state.investments.find(a=>a.id===id);if(x)openModal(x)}
window.deleteInvestment=id=>{let x=state.investments.find(a=>a.id===id);if(x&&confirm(`Delete ${x.name} from your portfolio?`)){state.investments=state.investments.filter(a=>a.id!==id);save()}}
$("#investmentForm").onsubmit=e=>{e.preventDefault();let id=Number($("#editId").value)||Date.now();let x={id,name:$("#invName").value.trim(),type:$("#invType").value,qty:Number($("#invQty").value),purchase:Number($("#invPurchase").value),current:Number($("#invCurrent").value)};let idx=state.investments.findIndex(a=>a.id===id);if(idx>=0)state.investments[idx]=x;else state.investments.push(x);save();$("#investmentModal").classList.add("hidden")}
$("#saveProfile").onclick=()=>{state.profile.userId=$("#userId").value.trim();state.profile.name=$("#userName").value.trim()||"User";state.profile.email=$("#userEmail").value.trim();save();alert("Profile saved successfully.");nav("dashboard")}
$("#resetDemo").onclick=()=>{if(confirm("Reset to the Review 2 demo portfolio?")){state=structuredClone(defaultState);save();nav("dashboard")}}
renderAll();
