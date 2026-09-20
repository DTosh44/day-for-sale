const YEARS = [2027, 2028, 2029, 2030];
const LAUNCH_DATE = "2027-01-01";
const DEFAULT_PRICE = 1;
const PAYHIP_CHECKOUT_URL = ""; // Optional: add a generic Payhip £1 checkout URL before launch.

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const shortMonthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const houseClaims = {
  "2027-01-02": { owner: "Buy A Day", message: "I bought a Saturday on the internet. Sensible.", house: true },
  "2027-03-17": { owner: "A pigeon from Birmingham", message: "For the record: no regrets.", house: true },
  "2027-04-23": { owner: "Future historians", message: "This seemed funny at the time.", house: true },
  "2027-06-06": { owner: "The Internet", message: "We have made worse purchasing decisions.", house: true },
  "2027-07-07": { owner: "Seven", message: "Seven. Seven. Twenty-seven. That was reason enough.", house: true },
  "2027-09-16": { owner: "Buy A Day", message: "This is where the archive started getting interesting.", house: true },
  "2027-11-11": { owner: "Someone making a wish", message: "Eleven eleven. Make a wish. Then buy the date.", house: true },
  "2027-12-12": { owner: "Twelve", message: "Neat dates deserve unnecessary permanence.", house: true }
};

const premiumMonthDays = new Set(["01-01","02-14","04-01","05-04","10-31","12-24","12-25","12-31"]);
const premiumNames = {"01-01":"New Year's Day","02-14":"Valentine's Day","04-01":"April Fool's Day","05-04":"May the Fourth","10-31":"Halloween","12-24":"Christmas Eve","12-25":"Christmas Day","12-31":"New Year's Eve"};

const store = loadStore();
const app = document.getElementById("app");
const claimModal = document.getElementById("claimModal");
const bidModal = document.getElementById("bidModal");
const searchModal = document.getElementById("searchModal");

function loadStore() {
  const fallback = { claims: {}, bids: {}, auctionEnds: {} };
  try { return { ...fallback, ...JSON.parse(localStorage.getItem("buyADayStore") || "{}") }; }
  catch { return fallback; }
}
function saveStore() { localStorage.setItem("buyADayStore", JSON.stringify(store)); }
function keyFor(year, month, day) { return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`; }
function parseKey(key) { const [year,month,day] = key.split("-").map(Number); return {year,month,day}; }
function dateFromKey(key) { const {year,month,day}=parseKey(key); return new Date(Date.UTC(year,month-1,day)); }
function prettyDate(key) { const {year,month,day}=parseKey(key); return `${day} ${monthNames[month-1]} ${year}`; }
function shortDate(key) { const {year,month,day}=parseKey(key); return `${day} ${shortMonthNames[month-1]} ${year}`; }
function todayKey() { const now = new Date(); return keyFor(now.getFullYear(), now.getMonth()+1, now.getDate()); }
function claimFor(key) {
  if (store.claims[key]) return store.claims[key];
  if (houseClaims[key]) return houseClaims[key];
  if (isPremium(key) && new Date(auctionEnd(key)) <= new Date()) {
    const winner = topBid(key);
    if (winner) return { owner: winner.name, email: winner.email, message: winner.message || "I won this day at auction.", link: winner.link || "", auction: true, amount: winner.amount, purchasedAt: winner.time };
  }
  return null;
}
function isPremium(key) { const {month,day}=parseKey(key); return premiumMonthDays.has(`${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`); }
function premiumName(key) { const {month,day}=parseKey(key); return premiumNames[`${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`] || "Special day"; }
function stateFor(key) { if (claimFor(key)) return "claimed"; if (isPremium(key)) return "auction"; return "available"; }
function bidsFor(key) { return (store.bids[key] || []).slice().sort((a,b)=>b.amount-a.amount || a.time.localeCompare(b.time)); }
function topBid(key) { return bidsFor(key)[0] || null; }
function nextBid(key) { const current=topBid(key); return current ? Math.max(current.amount+1, 2) : 1; }
function defaultAuctionEnd(key) { const d=dateFromKey(key); d.setUTCDate(d.getUTCDate()-30); d.setUTCHours(20,0,0,0); return d.toISOString(); }
function auctionEnd(key) { return store.auctionEnds[key] || defaultAuctionEnd(key); }
function formatMoney(n) { return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n); }
function escapeHTML(value="") { return String(value).replace(/[&<>'"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function toast(message) { const el=document.getElementById("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600); }
function daysInMonth(year, month) { return new Date(Date.UTC(year,month,0)).getUTCDate(); }
function firstMondayOffset(year, month) { const d=new Date(Date.UTC(year,month-1,1)).getUTCDay(); return (d+6)%7; }
function statusCounts(year) { let claimed=0, auction=0, available=0; for(let m=1;m<=12;m++){ for(let d=1;d<=daysInMonth(year,m);d++){ const s=stateFor(keyFor(year,m,d)); if(s==="claimed") claimed++; else if(s==="auction") auction++; else available++; }} return {claimed,auction,available,total:claimed+auction+available}; }
function getRoute() { return location.hash.replace(/^#\/?/,"") || "home"; }
function setTitle(title) { document.title = `${title} — Buy A Day`; }

function layoutHero() {
  const counts=statusCounts(2027);
  return `<section class="hero shell">
    <div class="hero-copy"><p class="eyebrow">ONE DATE. ONE MESSAGE. FOREVER.</p><h1>Buy a day.<br><span>Say something.</span></h1>
    <p class="hero-intro">Pick a date from £1, leave your message and make that tiny square of the calendar yours on Buy A Day. When it arrives, it becomes Today. Afterwards, it lives in the archive.</p>
    <div class="hero-actions"><a class="button button-yellow" href="#/dates">Choose your day <span>→</span></a><a class="button button-outline" href="#/today">See Today</a></div>
    <div class="hero-proof"><strong>${counts.claimed}</strong><span>2027 dates already claimed</span><i></i><span>${counts.available} ordinary dates still available</span></div></div>
    <div class="hero-art" aria-hidden="true"><div class="sun-orbit"></div><div class="poster poster-main"><span>BUY A DAY</span><strong>YOUR DATE.<br>YOUR MESSAGE.</strong><small>FROM £1</small></div><div class="poster poster-blue"><span>2027</span><strong>365</strong><small>little pieces of internet history</small></div><div class="poster poster-mint">An A Brighter Internet project.</div></div>
  </section>`;
}

function renderHome() {
  setTitle("Pick a date. Leave your mark");
  const today=todayKey();
  app.innerHTML = `${layoutHero()}
  <section class="ticker"><div class="ticker-track"><span>ORDINARY DAYS £1</span><i></i><span>SPECIAL DAYS BY AUCTION</span><i></i><span>ONE MESSAGE PER DATE</span><i></i><span>ARCHIVED FOREVER</span><i></i><span>ORDINARY DAYS £1</span></div></section>
  <section class="shell home-grid">
    <a class="feature-card feature-today" href="#/today"><p class="eyebrow">TODAY</p><h2>${prettyDate(today)}</h2><p>${today < LAUNCH_DATE ? "The public archive opens on 1 January 2027. Until then, this is the countdown to the first day." : claimFor(today) ? `“${escapeHTML(claimFor(today).message)}”` : "Nobody claimed today — yet."}</p><span>Open Today →</span></a>
    <a class="feature-card feature-buy" href="#/dates"><p class="eyebrow">BUY A DAY</p><h2>Most dates cost £1.</h2><p>Birthday, anniversary, launch date, random Tuesday. Choose one before somebody else does.</p><span>Browse dates →</span></a>
    <a class="feature-card feature-auction" href="#/auctions"><p class="eyebrow">SPECIAL DAYS</p><h2>Some days go to auction.</h2><p>Christmas, Valentine's Day, Halloween and other high-demand dates start at £1. The market decides.</p><span>See auctions →</span></a>
  </section>
  ${renderHowStrip()}
  <section class="archive-tease"><div class="shell split"><div><p class="eyebrow">THE ARCHIVE</p><h2>Every message gets a permanent date.</h2><p>Browse the years, revisit old days and share a direct link to any claimed date.</p><a class="button button-yellow" href="#/archive">Browse the archive →</a></div><div class="archive-mini">${Object.entries(houseClaims).slice(0,3).map(([key,c])=>`<a href="#/day/${key}"><span>${shortDate(key)}</span><strong>“${escapeHTML(c.message)}”</strong><small>— ${escapeHTML(c.owner)}</small></a>`).join("")}</div></div></section>`;
}

function renderHowStrip() { return `<section class="how-strip shell"><article><span>01</span><h3>Choose a date</h3><p>Ordinary dates are £1. Special dates are auctioned.</p></article><article><span>02</span><h3>Leave your message</h3><p>Add your name, words and an optional link.</p></article><article><span>03</span><h3>Become Today</h3><p>Your message takes over its date when that day arrives.</p></article><article><span>04</span><h3>Stay in the archive</h3><p>Your permanent day page remains shareable afterwards.</p></article></section>`; }

function renderToday() {
  setTitle("Today");
  const key=todayKey(), claim=claimFor(key), before=key<LAUNCH_DATE;
  app.innerHTML = `<section class="today-page"><div class="shell today-shell"><p class="eyebrow">TODAY ON BUY A DAY</p><h1>${prettyDate(key)}</h1>${before ? `<div class="today-message prelaunch"><span>THE ARCHIVE OPENS 1 JANUARY 2027</span><blockquote>“Today will belong to somebody. We’re just not selling 2026.”</blockquote><p>Buy A Day starts with 2027. Choose a future date now and your message will appear here when it arrives.</p><a class="button button-yellow" href="#/dates">Choose a 2027 date →</a></div>` : claim ? `<div class="today-message"><span>${claim.house?"FOUNDING MESSAGE":"TODAY'S OWNER"}</span><blockquote>“${escapeHTML(claim.message)}”</blockquote><p>— ${escapeHTML(claim.owner)}</p>${claim.link?`<a href="${escapeHTML(claim.link)}" target="_blank" rel="noopener">Visit their link →</a>`:""}<button class="button button-outline" data-share="${key}">Share this day</button></div>` : `<div class="today-message"><span>UNCLAIMED</span><blockquote>“Nobody bought today.”</blockquote><p>This can happen. The empty days become part of the archive too.</p></div>`}</div></section>
  <section class="shell adjacent-days"><a href="#/day/${shiftKey(key,-1)}">← ${shortDate(shiftKey(key,-1))}</a><a href="#/day/${shiftKey(key,1)}">${shortDate(shiftKey(key,1))} →</a></section>`;
  bindShareButtons();
}
function shiftKey(key, amount) { const d=dateFromKey(key); d.setUTCDate(d.getUTCDate()+amount); return keyFor(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate()); }

function renderDates(year=2027, month=1) {
  year=YEARS.includes(Number(year))?Number(year):2027; month=Math.min(12,Math.max(1,Number(month)||1));
  setTitle(`Buy a day in ${year}`); const counts=statusCounts(year);
  app.innerHTML = `<section class="page-hero compact shell"><p class="eyebrow">BUY A DAY</p><h1>Pick your date.</h1><p>Ordinary dates cost £1. Black dates are claimed. Yellow dates are sold by auction.</p></section>
  <section class="shell calendar-layout"><div class="calendar-panel"><div class="calendar-toolbar"><button class="month-arrow" data-month="${month===1?12:month-1}" data-year="${month===1?year-1:year}">←</button><div><select id="yearSelect">${YEARS.map(y=>`<option value="${y}" ${y===year?"selected":""}>${y}</option>`).join("")}</select><h2>${monthNames[month-1]}</h2></div><button class="month-arrow" data-month="${month===12?1:month+1}" data-year="${month===12?year+1:year}">→</button></div>
  <div class="weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div class="calendar-grid">${renderMonthCells(year,month)}</div><div class="legend"><span><i class="available"></i>£1</span><span><i class="auction"></i>Auction</span><span><i class="claimed"></i>Claimed</span></div></div>
  <aside class="year-summary"><span class="status-pill">${year===2027?"NOW OPEN":"OPEN"}</span><strong>${year}</strong><h3>${counts.claimed} claimed</h3><div class="progress"><span style="width:${(counts.claimed/counts.total)*100}%"></span></div><p><b>${counts.available}</b> ordinary dates available for £1.<br><b>${counts.auction}</b> special dates by auction.</p><div class="month-jump">${monthNames.map((name,i)=>`<a class="${i+1===month?"active":""}" href="#/dates/${year}/${i+1}">${name.slice(0,3)}</a>`).join("")}</div></aside></section>`;
  bindCalendar(year,month);
}
function renderMonthCells(year,month){ const offset=firstMondayOffset(year,month); let html=""; for(let i=0;i<offset;i++) html+='<span class="day-cell empty"></span>'; for(let day=1;day<=daysInMonth(year,month);day++){ const key=keyFor(year,month,day), state=stateFor(key); html+=`<button class="day-cell ${state}" data-key="${key}" aria-label="${prettyDate(key)} ${state}"><b>${day}</b><small>${state==="available"?"£1":state==="auction"?"BID":"SOLD"}</small></button>`;} return html; }
function bindCalendar(year,month){ document.querySelectorAll("[data-key]").forEach(b=>b.addEventListener("click",()=>location.hash=`#/day/${b.dataset.key}`)); document.querySelectorAll("[data-month]").forEach(b=>b.addEventListener("click",()=>{const y=YEARS.includes(Number(b.dataset.year))?b.dataset.year:year; location.hash=`#/dates/${y}/${b.dataset.month}`})); document.getElementById("yearSelect").addEventListener("change",e=>location.hash=`#/dates/${e.target.value}/${month}`); }

function renderDay(key) {
  if(!/^20\d\d-\d\d-\d\d$/.test(key)){ location.hash="#/dates"; return; }
  setTitle(prettyDate(key)); const state=stateFor(key), claim=claimFor(key), bid=topBid(key);
  app.innerHTML = `<section class="day-page ${state}"><div class="shell day-shell"><div class="day-date"><p class="eyebrow">${state==="available"?"AVAILABLE FOR £1":state==="auction"?"SPECIAL DAY AUCTION":"CLAIMED DATE"}</p><h1>${prettyDate(key)}</h1><div class="day-number">${parseKey(key).day}</div></div><div class="day-content">${state==="available"?`<h2>This day could be yours.</h2><p>Buy it for £1 and add a message that appears on Buy A Day when this date arrives, then remains in the archive.</p><button class="button button-yellow" data-claim="${key}">Buy this day for £1 →</button>`:state==="auction"?`<span class="status-pill">AUCTION</span><h2>${premiumName(key)}</h2><p>This date starts at £1. Highest valid bid wins. Only the winner pays.</p><div class="bid-summary"><span>${bid?"Current bid":"Opening bid"}</span><strong>${formatMoney(bid?bid.amount:1)}</strong></div><p class="auction-close">Closes ${formatDateTime(auctionEnd(key))}</p><button class="button button-dark" data-bid="${key}">Place a bid →</button><a class="text-link" href="#/auctions">See all auctions</a>`:`<span class="status-pill">${claim.house?"FOUNDING MESSAGE":claim.auction?"AUCTION WINNER":"CLAIMED"}</span><blockquote>“${escapeHTML(claim.message)}”</blockquote><p class="owner-line">— ${escapeHTML(claim.owner)}${claim.auction?` · winning bid ${formatMoney(claim.amount)}`:""}</p>${claim.link?`<a class="button button-outline" href="${escapeHTML(claim.link)}" target="_blank" rel="noopener">Visit link →</a>`:""}<button class="text-link" data-share="${key}">Share this day</button>`}</div></div></section>
  <section class="shell adjacent-days"><a href="#/day/${shiftKey(key,-1)}">← ${shortDate(shiftKey(key,-1))}</a><a href="#/day/${shiftKey(key,1)}">${shortDate(shiftKey(key,1))} →</a></section>`;
  bindDayActions();
}
function formatDateTime(iso){ return new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"}).format(new Date(iso)); }

function renderAuctions() {
  setTitle("Auctions");
  const items=[]; YEARS.forEach(year=>premiumMonthDays.forEach(md=>items.push(`${year}-${md}`)));
  app.innerHTML=`<section class="page-hero shell"><p class="eyebrow">SPECIAL DAYS</p><h1>Let the market decide.</h1><p>Every special-day auction starts at £1. Bidding is free. Only the winning bidder pays.</p></section><section class="shell auction-list">${items.map(key=>{const bid=topBid(key);return `<article class="auction-row"><div class="auction-date"><span>${String(parseKey(key).day).padStart(2,"0")}</span><small>${shortMonthNames[parseKey(key).month-1].toUpperCase()}<br>${parseKey(key).year}</small></div><div><span class="status-pill">AUCTION</span><h2>${premiumName(key)}</h2><p>Closes ${formatDateTime(auctionEnd(key))}</p></div><div class="auction-price"><span>${bid?"Current bid":"Starts at"}</span><strong>${formatMoney(bid?bid.amount:1)}</strong><small>${bidsFor(key).length} ${bidsFor(key).length===1?"bid":"bids"}</small></div><div><a class="button button-dark small" href="#/day/${key}">${bid?"Bid again":"Place bid"} →</a></div></article>`}).join("")}</section>`;
}

function renderArchive(year=2027) {
  year=YEARS.includes(Number(year))?Number(year):2027; setTitle(`Archive ${year}`);
  const claims=[]; for(let m=1;m<=12;m++) for(let d=1;d<=daysInMonth(year,m);d++){const key=keyFor(year,m,d), c=claimFor(key); if(c) claims.push([key,c]);}
  app.innerHTML=`<section class="archive-hero"><div class="shell"><p class="eyebrow">THE ARCHIVE</p><h1>Messages, fixed to a date.</h1><p>Every claimed date gets a permanent page. Browse a year, revisit a memory or see what somebody decided was worth saying.</p><div class="year-tabs">${YEARS.map(y=>`<a class="${y===year?"active":""}" href="#/archive/${y}">${y}</a>`).join("")}</div></div></section><section class="shell archive-grid">${claims.length?claims.map(([key,c])=>`<a class="archive-item" href="#/day/${key}"><span>${shortDate(key)}</span><blockquote>“${escapeHTML(c.message)}”</blockquote><small>— ${escapeHTML(c.owner)}</small></a>`).join(""):`<div class="empty-state"><h2>No claimed dates yet.</h2><p>This year is waiting for its first message.</p><a class="button button-yellow" href="#/dates/${year}/1">Choose a date →</a></div>`}</section>`;
}

function renderAbout(){setTitle("How it works"); app.innerHTML=`<section class="page-hero shell"><p class="eyebrow">HOW IT WORKS</p><h1>One day. One message. Forever.</h1><p>Buy A Day is deliberately simple: ordinary dates are cheap, important dates are auctioned, and every claimed day becomes a permanent part of the archive.</p></section>${renderHowStrip()}<section class="shell rules"><article><h2>What can I write?</h2><p>Dedications, announcements, jokes, memories, small-business messages and links are all fine. Illegal, hateful, abusive, deceptive or privacy-invasive content can be removed.</p></article><article><h2>Do I own the calendar date?</h2><p>No. You are buying the exclusive message slot for that date on Buy A Day, not legal ownership of the date itself.</p></article><article><h2>How do auctions work?</h2><p>Special dates start at £1. Anyone can bid. The highest valid bid wins. A bid in the final five minutes extends the auction by five minutes to prevent last-second sniping.</p></article></section>`;}

function openClaim(key){
  document.getElementById("claimModalContent").innerHTML=`<p class="eyebrow">BUY ${shortDate(key).toUpperCase()}</p><h2>Make this day yours.</h2><p class="modal-copy">For £1, your message will appear on this date and remain in the archive.</p><form id="claimForm" class="form-stack"><label class="field"><span>Your name / display name</span><input name="owner" maxlength="60" required placeholder="Darren" /></label><label class="field"><span>Email</span><input name="email" type="email" required placeholder="you@example.com" /></label><label class="field"><span>Your message</span><textarea name="message" maxlength="280" required placeholder="Say something worth keeping…"></textarea><small><span id="charCount">0</span>/280</small></label><label class="field"><span>Optional link</span><input name="link" type="url" placeholder="https://…" /></label><label class="check"><input name="terms" type="checkbox" required /> <span>I understand I am buying the exclusive message slot on Buy A Day for this date, subject to content rules.</span></label><div class="checkout-box"><span>Total</span><strong>£1</strong></div><button class="button button-yellow full" type="submit">${PAYHIP_CHECKOUT_URL?"Continue to checkout":"Complete demo purchase"} →</button><p class="form-note">${PAYHIP_CHECKOUT_URL?"Your payment is handled securely by Payhip/Stripe.":"Model mode: this saves the purchase in this browser. Connect Payhip/Stripe + a shared database before taking public payments."}</p></form>`;
  claimModal.showModal(); const form=document.getElementById("claimForm"), textarea=form.message; textarea.addEventListener("input",()=>document.getElementById("charCount").textContent=textarea.value.length); form.addEventListener("submit",e=>{e.preventDefault(); const fd=new FormData(form), payload={owner:fd.get("owner").trim(),email:fd.get("email").trim(),message:fd.get("message").trim(),link:fd.get("link").trim(),purchasedAt:new Date().toISOString(),price:1}; if(PAYHIP_CHECKOUT_URL){sessionStorage.setItem("pendingBuyADay",JSON.stringify({key,payload})); location.href=PAYHIP_CHECKOUT_URL; return;} store.claims[key]=payload; saveStore(); claimModal.close(); toast(`${prettyDate(key)} is now claimed.`); location.hash=`#/day/${key}`; });
}

function openBid(key){
  if (new Date(auctionEnd(key)) <= new Date()) { toast("This auction has closed."); return; }
  const current=topBid(key), minimum=nextBid(key); document.getElementById("bidModalContent").innerHTML=`<p class="eyebrow">${premiumName(key).toUpperCase()}</p><h2>${prettyDate(key)}</h2><div class="bid-summary"><span>${current?"Current bid":"Opening bid"}</span><strong>${formatMoney(current?current.amount:1)}</strong></div><p class="modal-copy">Auction closes ${formatDateTime(auctionEnd(key))}. Only the winning bidder pays.</p><form id="bidForm" class="form-stack"><label class="field"><span>Name</span><input name="name" required maxlength="60" /></label><label class="field"><span>Email</span><input name="email" type="email" required /></label><label class="field"><span>Your bid (minimum ${formatMoney(minimum)})</span><div class="money-input"><span>£</span><input name="amount" type="number" min="${minimum}" step="1" value="${minimum}" required /></div></label><label class="field"><span>Message if you win</span><textarea name="message" maxlength="280" required placeholder="What should appear on your day?"></textarea></label><label class="field"><span>Optional link</span><input name="link" type="url" placeholder="https://…" /></label><label class="check"><input type="checkbox" required /> <span>I understand this is a binding bid in the live version and the winner will be charged the winning amount.</span></label><button class="button button-dark full" type="submit">Place bid →</button><p class="form-note">Model mode: bids are saved in this browser. Production requires shared storage and Stripe payment authorisation.</p></form>${current?`<div class="bid-history"><h3>Recent bids</h3>${bidsFor(key).slice(0,5).map(b=>`<div><span>${escapeHTML(b.name)}</span><strong>${formatMoney(b.amount)}</strong></div>`).join("")}</div>`:""}`; bidModal.showModal(); document.getElementById("bidForm").addEventListener("submit",e=>{e.preventDefault(); const fd=new FormData(e.target), amount=Number(fd.get("amount")); if(amount<nextBid(key)){toast(`Minimum bid is ${formatMoney(nextBid(key))}.`); return;} const now=new Date(), end=new Date(auctionEnd(key)); if(end-now<=5*60*1000 && end-now>0){end.setMinutes(end.getMinutes()+5); store.auctionEnds[key]=end.toISOString();} store.bids[key]=store.bids[key]||[]; store.bids[key].push({name:fd.get("name").trim(),email:fd.get("email").trim(),message:fd.get("message").trim(),link:fd.get("link").trim(),amount,time:new Date().toISOString()}); saveStore(); bidModal.close(); toast(`Bid of ${formatMoney(amount)} placed.`); renderDay(key); }); }

function bindDayActions(){ document.querySelectorAll("[data-claim]").forEach(b=>b.addEventListener("click",()=>openClaim(b.dataset.claim))); document.querySelectorAll("[data-bid]").forEach(b=>b.addEventListener("click",()=>openBid(b.dataset.bid))); bindShareButtons(); }
function bindShareButtons(){ document.querySelectorAll("[data-share]").forEach(b=>b.addEventListener("click",async()=>{const key=b.dataset.share, url=`${location.origin}${location.pathname}#/day/${key}`; try{if(navigator.share) await navigator.share({title:prettyDate(key),text:"A day on Buy A Day",url}); else {await navigator.clipboard.writeText(url); toast("Day link copied.");}}catch{}})); }

function route(){ const route=getRoute().split("/"); window.scrollTo(0,0); if(route[0]==="home") renderHome(); else if(route[0]==="today") renderToday(); else if(route[0]==="dates") renderDates(route[1],route[2]); else if(route[0]==="day") renderDay(route[1]); else if(route[0]==="auctions") renderAuctions(); else if(route[0]==="archive") renderArchive(route[1]); else if(route[0]==="about") renderAbout(); else renderHome(); app.focus({preventScroll:true}); }

function init(){
  window.addEventListener("hashchange",route);
  document.getElementById("openSearch").addEventListener("click",()=>searchModal.showModal());
  document.getElementById("searchDateButton").addEventListener("click",()=>{const value=document.getElementById("dateSearch").value;if(value){searchModal.close();location.hash=`#/day/${value}`;}});
  document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.close).close()));
  [claimModal,bidModal,searchModal].forEach(dialog=>dialog.addEventListener("click",e=>{const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close();}));
  const menu=document.getElementById("menuButton"), nav=document.getElementById("mobileNav"); menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));}); nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");}));
  route();
}
init();
