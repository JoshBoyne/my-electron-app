function drawBarChart(canvas, buckets) {
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;

  canvas.width  = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const width  = canvas.clientWidth;
  const height = canvas.clientHeight;

  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;

  const chartWidth  = width - paddingLeft;
  const chartHeight = height - paddingTop - paddingBottom;

  ctx.clearRect(0, 0, width, height);

  const max = Math.max(...buckets.map(b => b.minutes), 1);

  const slotW = chartWidth / buckets.length;
  const barW  = slotW * 0.55;
  const gap   = (slotW - barW) / 2;

  buckets.forEach((b, i) => {
    const barHeight = (b.minutes / max) * chartHeight;

    const x = paddingLeft + i * slotW + gap;
    const y = paddingTop + chartHeight - barHeight;

    ctx.fillStyle = '#e94560';
    ctx.fillRect(x, y, barW, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      b.label,
      x + barW / 2,
      height - 10
    );
  });
}

function redrawChart() {
  const canvas = document.querySelector('#report canvas');
  if (!canvas) return;

  Storage.sessions.getAll().then((sessions) => {
    const buckets = getWeekBuckets(sessions);
    drawBarChart(canvas, buckets);
  });
}

function initReportChart() {
  const reportTabBtn = document.querySelector('[data-tab="report"]');

  if (!reportTabBtn) return;

  reportTabBtn.addEventListener('click', () => {
    requestAnimationFrame(redrawChart);
  });
}

initReportChart();