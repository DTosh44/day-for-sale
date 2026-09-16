const YEAR = 2027;

const launchClaims = {
  "2027-01-02": "I bought a Saturday on the internet. Sensible.",
  "2027-03-17": "A pigeon from Birmingham would like the record to show: no regrets.",
  "2027-04-23": "Future historians: this seemed funny at the time.",
  "2027-06-06": "The internet has made worse purchasing decisions.",
  "2027-07-07": "Seven. Seven. Twenty-seven. That was reason enough.",
  "2027-09-16": "This is where the archive started getting interesting.",
  "2027-11-11": "Eleven eleven. Make a wish. Then buy the date.",
  "2027-12-12": "Twelve twelve. Neat dates deserve unnecessary permanence."
};

const auctionDates = new Set([
  "2027-01-01",
  "2027-02-14",
  "2027-04-01",
  "2027-05-04",
  "2027-10-31",
  "2027-12-24",
  "2027-12-25",
  "2027-12-31"
]);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let currentMonth = 0;

const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const dayModal = document.getElementById("dayModal");
const modalEyebrow = document.getElementById("modalEyebrow");
const modalDate = document.getElementById("modalDate");
const modalBody = document.getElementById("modalBody");
const searchModal = document.getElementById("searchModal");

function dateKey(monthIndex, day) {
  return `${YEAR}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function longDate(monthIndex, day) {
  return `${day} ${monthNames[monthIndex]} ${YEAR}`;
}

function getDateState(key) {
  if (launchClaims[key]) return "claimed";
  if (auctionDates.has(key)) return "auction";
  return "available";
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthTitle.textContent = monthNames[currentMonth];

  const firstDay = new Date(Date.UTC(YEAR, currentMonth, 1)).getUTCDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(Date.UTC(YEAR, currentMonth + 1, 0)).getUTCDate();

  for (let i = 0; i < mondayOffset; i += 1) {
    const empty = document.createElement("span");
    empty.className = "day-cell empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(currentMonth, day);
    const state = getDateState(key);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day-cell ${state}`;
    cell.textContent = day;
    cell.dataset.date = key;
    cell.setAttribute("aria-label", `${longDate(currentMonth, day)} — ${state}`);
    cell.addEventListener("click", () => openDate(key));
    calendarGrid.appendChild(cell);
  }
}

function parseKey(key) {
  const [, month, day] = key.split("-").map(Number);
  return { monthIndex: month - 1, day };
}

function openDate(key) {
  const { monthIndex, day } = parseKey(key);
  const state = getDateState(key);
  modalDate.textContent = longDate(monthIndex, day);

  if (state === "available") {
    modalEyebrow.textContent = "AVAILABLE DATE";
    modalBody.innerHTML = `
      <p class="modal-copy">This date is still available. Claim it for your message, celebration, announcement, joke, memory or business.</p>
      <div class="modal-price"><span>Ordinary date</span><strong>£1</strong></div>
      <button class="button button-yellow full reserve-button" type="button" data-reserve="${key}">Claim this day →</button>
      <p class="modal-copy"><small>Checkout will be connected before public launch. For now, this preview shows the complete date-selection experience.</small></p>
    `;
    modalBody.querySelector("[data-reserve]").addEventListener("click", () => reservePreview(key));
  } else if (state === "auction") {
    modalEyebrow.textContent = "SPECIAL DAY AUCTION";
    modalBody.innerHTML = `
      <p class="modal-copy">This is one of the dates we expect more than one person may want, so it will be sold by transparent auction instead of at a price we choose.</p>
      <div class="modal-price"><span>Opening bid</span><strong>£1</strong></div>
      <button class="button button-dark full" type="button" data-watch="${key}">Watch this auction →</button>
      <p class="modal-copy"><small>No invented bids or inflated starting price. Bidding will open at launch and only the winning bidder will pay.</small></p>
    `;
    modalBody.querySelector("[data-watch]").addEventListener("click", () => saveWatch(key, "auction"));
  } else {
    modalEyebrow.textContent = "CLAIMED — LAUNCH MESSAGE";
    modalBody.innerHTML = `
      <div class="claimed-message">“${launchClaims[key]}”</div>
      <p class="modal-copy">This date was claimed by Day For Sale to help launch the archive. It is not presented as a paying customer.</p>
    `;
  }

  dayModal.showModal();
}

function reservePreview(key) {
  saveWatch(key, "date");
}

function saveWatch(key, type) {
  const saved = JSON.parse(localStorage.getItem("dayForSaleWatchlist") || "[]");
  if (!saved.includes(key)) saved.push(key);
  localStorage.setItem("dayForSaleWatchlist", JSON.stringify(saved));
  const action = modalBody.querySelector("button");
  if (action) {
    action.textContent = type === "auction" ? "Auction saved ✓" : "Date saved ✓";
    action.disabled = true;
  }
}

function goToMonth(monthIndex) {
  currentMonth = Math.max(0, Math.min(11, monthIndex));
  renderCalendar();
  document.getElementById("dates").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateStats() {
  const claimed = Object.keys(launchClaims).length;
  const available = 365 - claimed;
  const percent = (claimed / 365) * 100;
  document.getElementById("claimedCount").textContent = claimed;
  document.getElementById("heroClaimedCount").textContent = claimed;
  document.getElementById("daysLeft").textContent = `${available} days still available`;
  document.getElementById("yearProgress").style.width = `${percent}%`;
}

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  renderCalendar();
});

document.getElementById("browseAllDates").addEventListener("click", () => {
  const nextAvailableMonth = Array.from({ length: 12 }, (_, month) => month).find(month => {
    const days = new Date(Date.UTC(YEAR, month + 1, 0)).getUTCDate();
    return Array.from({ length: days }, (_, i) => dateKey(month, i + 1)).some(key => getDateState(key) === "available");
  });
  goToMonth(nextAvailableMonth ?? 0);
});

document.querySelectorAll("[data-scroll-to-dates]").forEach(button => {
  button.addEventListener("click", () => document.getElementById("dates").scrollIntoView({ behavior: "smooth" }));
});

document.querySelectorAll("[data-auction-date]").forEach(button => {
  button.addEventListener("click", () => openDate(button.dataset.auctionDate));
});

document.getElementById("closeModal").addEventListener("click", () => dayModal.close());
document.getElementById("closeSearch").addEventListener("click", () => searchModal.close());

document.getElementById("openSearch").addEventListener("click", () => searchModal.showModal());
document.getElementById("searchDateButton").addEventListener("click", () => {
  const value = document.getElementById("dateSearch").value;
  if (!value) return;
  const { monthIndex } = parseKey(value);
  searchModal.close();
  currentMonth = monthIndex;
  renderCalendar();
  openDate(value);
});

[dayModal, searchModal].forEach(dialog => {
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });
});

const menuButton = document.getElementById("menuButton");
const mobileNav = document.getElementById("mobileNav");
menuButton.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mobileNav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

renderCalendar();
updateStats();
