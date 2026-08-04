const manifest = await fetchJson("data/manifest.json");
const reports = [...manifest.reports].sort((a, b) => b.key.localeCompare(a.key));
const site = manifest.site ?? {};
const dated = site.mode !== "collection";
const cache = new Map();

const board = document.querySelector("#board");
const status = document.querySelector("#status");
const dateNav = document.querySelector("#dateNav");
const dateLabel = document.querySelector("#dateLabel");
const dateToggle = document.querySelector("#dateToggle");
const dateMenu = document.querySelector("#dateMenu");
const older = document.querySelector("#older");
const newer = document.querySelector("#newer");
const siteTitle = document.querySelector("#siteTitle");
const brandMark = document.querySelector("#brandMark");

document.title = site.title || "瀑布流站点";
siteTitle.textContent = site.title || "瀑布流站点";
document.documentElement.style.setProperty("--accent", site.accent || "#23B985");
if (site.brandMark) {
  brandMark.src = site.brandMark;
  brandMark.hidden = false;
}
if (!dated) dateNav.hidden = true;

let currentIndex = initialIndex();
let calendarYear = Number(reports[currentIndex]?.key.slice(0, 4)) || new Date().getFullYear();
let calendarMonth = (Number(reports[currentIndex]?.key.slice(5, 7)) || 1) - 1;
let activeColumns = 0;

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`无法加载 ${url}`);
  return response.json();
}

function initialIndex() {
  if (!reports.length) return 0;
  const requested = new URLSearchParams(location.search).get("date");
  const index = reports.findIndex((report) => report.key === requested);
  return index >= 0 ? index : 0;
}

function columnCount() {
  return window.innerWidth <= 680 ? 1 : window.innerWidth <= 920 ? 2 : 3;
}

function cardElement(card) {
  const details = document.createElement("details");
  if (card.tone) details.dataset.tone = card.tone;

  const summary = document.createElement("summary");
  const label = document.createElement("span");
  label.className = "label";
  label.textContent = card.label || "";
  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = card.title || "";
  const toggle = document.createElement("span");
  toggle.className = "toggle";
  toggle.setAttribute("aria-hidden", "true");
  summary.append(label, title, toggle);

  const content = document.createElement("div");
  content.className = "content";
  content.innerHTML = card.bodyHtml || "";
  details.append(summary, content);
  return details;
}

function renderCards(report) {
  board.replaceChildren();
  const count = columnCount();
  activeColumns = count;
  const columns = Array.from({ length: count }, () => {
    const column = document.createElement("div");
    column.className = "column";
    board.appendChild(column);
    return column;
  });
  report.cards.forEach((card, index) => columns[index % count].appendChild(cardElement(card)));
}

async function loadReport(index, pushHistory = true) {
  if (index < 0 || index >= reports.length) return;
  currentIndex = index;
  const item = reports[index];
  status.textContent = "";
  try {
    let report = cache.get(item.key);
    if (!report) {
      report = await fetchJson(item.file);
      cache.set(item.key, report);
    }
    renderCards(report);
    dateLabel.textContent = item.label;
    older.disabled = index >= reports.length - 1;
    newer.disabled = index <= 0;
    calendarYear = Number(item.key.slice(0, 4)) || calendarYear;
    calendarMonth = (Number(item.key.slice(5, 7)) || calendarMonth + 1) - 1;
    closeCalendar();
    if (dated && pushHistory) {
      const url = new URL(location.href);
      url.searchParams.set("date", item.key);
      history.pushState({ date: item.key }, "", url);
    }
  } catch (error) {
    console.error(error);
    board.replaceChildren();
    status.textContent = "内容暂时无法加载。";
  }
}

function closeCalendar() {
  dateMenu.hidden = true;
  dateToggle.setAttribute("aria-expanded", "false");
}

function renderCalendar() {
  dateMenu.replaceChildren();
  const head = document.createElement("div");
  head.className = "calendar-head";
  const previous = monthButton("‹", "上个月", -1);
  const title = document.createElement("strong");
  title.textContent = `${calendarYear}年${calendarMonth + 1}月`;
  const next = monthButton("›", "下个月", 1);
  head.append(previous, title, next);

  const weekdays = document.createElement("div");
  weekdays.className = "weekdays";
  "日一二三四五六".split("").forEach((day) => {
    const span = document.createElement("span");
    span.className = "weekday";
    span.textContent = day;
    weekdays.appendChild(span);
  });

  const days = document.createElement("div");
  days.className = "calendar-days";
  const first = new Date(calendarYear, calendarMonth, 1).getDay();
  const total = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  for (let i = 0; i < first; i += 1) days.appendChild(document.createElement("span"));
  for (let day = 1; day <= total; day += 1) {
    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const index = reports.findIndex((report) => report.key === key);
    const button = document.createElement("button");
    button.className = "calendar-day";
    button.type = "button";
    button.textContent = String(day);
    button.setAttribute("aria-label", `${calendarYear}年${calendarMonth + 1}月${day}日`);
    if (index >= 0) {
      button.classList.add("has-report");
      if (index === currentIndex) button.classList.add("active");
      button.addEventListener("click", () => void loadReport(index));
    } else {
      button.disabled = true;
    }
    days.appendChild(button);
  }
  dateMenu.append(head, weekdays, days);
}

function monthButton(text, label, delta) {
  const button = document.createElement("button");
  button.className = "month-arrow";
  button.type = "button";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", () => {
    calendarMonth += delta;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear -= 1;
    }
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear += 1;
    }
    renderCalendar();
  });
  return button;
}

older.addEventListener("click", () => void loadReport(currentIndex + 1));
newer.addEventListener("click", () => void loadReport(currentIndex - 1));
dateToggle.addEventListener("click", () => {
  dateMenu.hidden = !dateMenu.hidden;
  dateToggle.setAttribute("aria-expanded", String(!dateMenu.hidden));
  if (!dateMenu.hidden) renderCalendar();
});
document.addEventListener("click", (event) => {
  if (!dateMenu.hidden && !dateNav.contains(event.target)) closeCalendar();
});
window.addEventListener("popstate", () => {
  const index = initialIndex();
  void loadReport(index, false);
});
window.addEventListener("resize", () => {
  if (activeColumns !== columnCount()) void loadReport(currentIndex, false);
});

if (reports.length) await loadReport(currentIndex, false);
else status.textContent = "暂无内容。";

