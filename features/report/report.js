const RANK_TITLES = [
  { name: "Beginner", minHours: 0 },
  { name: "Apprentice", minHours: 2 },
  { name: "Journeyman", minHours: 15 },
  { name: "Expert", minHours: 30 },
  { name: "Master", minHours: 60 },
  { name: "Grandmaster", minHours: 100 },
];

function getRankTier(hoursFocused) {
  let currentIndex = 0;

  for (let i = 0; i < RANK_TITLES.length; i++) {
    if (hoursFocused >= RANK_TITLES[i].minHours) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const current = RANK_TITLES[currentIndex];
  const next = RANK_TITLES[currentIndex + 1] || null;

  return { current, next };
}

function getRankProgress(hoursFocused) {
  const { current, next } = getRankTier(hoursFocused);

  if (!next) return 100;

  const range = next.minHours - current.minHours;
  if (range === 0) return 100;

  const earned = hoursFocused - current.minHours;

  return Math.round((earned / range) * 100);
}

function calcHoursFocused(sessions) {
  const totalMinutes = sessions
    .filter(s => s.type === "work")
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return Math.round((totalMinutes / 60) * 10) / 10;
}

function calcDaysAccessed(accessLog) {
  const uniqueDays = new Set(accessLog.map(e => e.date));
  return uniqueDays.size;
}

function calcStreak(sessions) {
  const dates = new Set(
    sessions
      .filter(s => s.type === "work")
      .map(s => s.date)
  );

  let streak = 0;
  let cursor = new Date();

  const format = (d) => d.toISOString().slice(0, 10);

  if (!dates.has(format(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(format(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getWeekBuckets(sessions, offset = 0) {
  const today = new Date();

  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return labels.map((label, i) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    const dateStr = current.toISOString().slice(0, 10);

    const minutes = sessions
      .filter(s => s.date === dateStr && s.type === "work")
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return { label, minutes };
  });
}
let weekOffset = 0;
let chartMode = "week";

async function initReport() {
  initReportTabs();
  initReportChartControls();

  const sessions = await Storage.sessions.getAll();
  const access = await Storage.access.getAll();

  const hours = calcHoursFocused(sessions);
  const { current, next } = getRankTier(hours);
  const progress = getRankProgress(hours);

  document.getElementById("report-ranking").innerHTML = `
  <div class="rank-badge"> ${current.name}</div>

  <div class="progress-bar">
    <div class="progress-fill" style="width:${progress}%"></div>
  </div>

  <p>${progress}% to ${next ? next.name : "MAX"}</p>
`;

  const container = document.getElementById("report-summary");
  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  requestAnimationFrame(() => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    drawBarChart(canvas, getWeekBuckets(sessions));
  });

  const detailHTML = sessions
  .slice()
  .reverse()
  .map(s => `
    <div class="session-item">
      <strong>${s.date}</strong>
      <span>${s.durationMinutes} min</span>
    </div>
  `)
  .join("");

document.getElementById("report-detail").innerHTML = detailHTML;
}

function redrawChart() {
  Storage.sessions.getAll().then(sessions => {
    const canvas = document.querySelector('#report canvas');
    if (!canvas) return;

    const data =
      chartMode === "week"
        ? getWeekBuckets(sessions, weekOffset)
        : getMonthBuckets(sessions);

    drawBarChart(canvas, data);
  });
}

function initReportTabs() {
  const buttons = document.querySelectorAll(".report-subtab-btn");
  const panels = document.querySelectorAll(".report-subpanel");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");

      const target = document.getElementById(btn.dataset.subtab);
      if (target) target.classList.add("active");
    });
  });
}

function initReportChartControls() {
  const prevBtn = document.getElementById("week-prev");
  const nextBtn = document.getElementById("week-next");
  const weekBtn = document.getElementById("chart-week");
  const monthBtn = document.getElementById("chart-month");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      weekOffset--;
      redrawChart();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      weekOffset++;
      redrawChart();
    });
  }

  if (weekBtn) {
    weekBtn.addEventListener("click", () => {
      chartMode = "week";
      redrawChart();
    });
  }

  if (monthBtn) {
    monthBtn.addEventListener("click", () => {
      chartMode = "month";
      redrawChart();
    });
  }
}