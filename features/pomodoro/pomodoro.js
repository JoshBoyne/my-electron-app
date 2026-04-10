
const POMODORO_PHASES = { IDLE: 'idle', WORK: 'work', BREAK: 'break' };
const WORK_SECONDS  = 25 * 60;
const BREAK_SECONDS = 5  * 60;
const RING_RADIUS   = 90;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 565.5

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getProgress(remaining, total) {
  return total === 0 ? 0 : remaining / total;
}

function getStrokeDashoffset(progress) {
  return RING_CIRCUMFERENCE * (1 - progress);
}


function initPomodoro() {
  const displayEl  = document.getElementById('pomodoro-time');
  const ringEl     = document.getElementById('pomodoro-ring');
  const phaseEl    = document.getElementById('pomodoro-phase');
  const startWorkBtn  = document.getElementById('pomodoro-start-work');
  const startBreakBtn = document.getElementById('pomodoro-start-break');
  const resetBtn      = document.getElementById('pomodoro-reset');

  ringEl.setAttribute('r',  RING_RADIUS);
  ringEl.setAttribute('stroke-dasharray', RING_CIRCUMFERENCE);

  let state = {
    phase:      POMODORO_PHASES.IDLE,
    remaining:  WORK_SECONDS,
    total:      WORK_SECONDS,
    intervalId: null,
  };

  function render() {
    displayEl.textContent = formatTime(state.remaining);
    const progress = getProgress(state.remaining, state.total);
    ringEl.setAttribute('stroke-dashoffset', getStrokeDashoffset(progress));

    const section = document.getElementById('pomodoro');
    section.dataset.phase = state.phase;

    const labels = {
      [POMODORO_PHASES.IDLE]:  'Ready',
      [POMODORO_PHASES.WORK]:  'Focus',
      [POMODORO_PHASES.BREAK]: 'Break',
    };
    phaseEl.textContent = labels[state.phase];

    startWorkBtn.disabled  = state.phase === POMODORO_PHASES.WORK;
    startBreakBtn.disabled = state.phase === POMODORO_PHASES.BREAK;
  }

  function clearTimer() {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function startCountdown() {
    clearTimer();
    state.intervalId = setInterval(() => {
      state.remaining -= 1;
      if (state.remaining <= 0) {
        state.remaining = 0;
        clearTimer();
        if (state.phase === POMODORO_PHASES.WORK) {
          state.phase     = POMODORO_PHASES.BREAK;
          state.remaining = BREAK_SECONDS;
          state.total     = BREAK_SECONDS;
          startCountdown();
        } else {
          state.phase     = POMODORO_PHASES.IDLE;
          state.remaining = WORK_SECONDS;
          state.total     = WORK_SECONDS;
        }
      }
      render();
    }, 1000);
  }

  startWorkBtn.addEventListener('click', () => {
    clearTimer();
    state.phase     = POMODORO_PHASES.WORK;
    state.remaining = WORK_SECONDS;
    state.total     = WORK_SECONDS;
    startCountdown();
    render();
  });

  startBreakBtn.addEventListener('click', () => {
    clearTimer();
    state.phase     = POMODORO_PHASES.BREAK;
    state.remaining = BREAK_SECONDS;
    state.total     = BREAK_SECONDS;
    startCountdown();
    render();
  });

  resetBtn.addEventListener('click', () => {
    clearTimer();
    state.phase     = POMODORO_PHASES.IDLE;
    state.remaining = WORK_SECONDS;
    state.total     = WORK_SECONDS;
    render();
  });

  render();
}
