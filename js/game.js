/* =========================================
   game.js — 贪吃蛇核心（CSS控制背景色版）
   ========================================= */

const canvas = document.getElementById('gameCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d');
  const COLS = 20;
  const ROWS = 20;
  const CELL = canvas.width / COLS;

  const DIFFICULTY = {
    easy:   { speed: 200, wrap: true,  obstacles: 0 },
    normal: { speed: 120, wrap: false, obstacles: 0 },
    hard:   { speed: 70,  wrap: false, obstacles: 8 }
  };

  let snake, dir, nextDir, food, score;
  let obstacles = [];
  let timer = null;
  let running = false, paused = false, over = false;
  let currentDiff = 'normal';
  let speed = DIFFICULTY.normal.speed;
  let audioCtx = null;

  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const msgEl = document.getElementById('gameMsg');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const speedSelect = document.getElementById('speedSelect');

  bestEl.textContent = getBestScore();

  function playBeep(freq, duration) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* 忽略 */ }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    running = paused = over = false;
    clearInterval(timer);
    placeFood();
    placeObstacles();
    scoreEl.textContent = 0;
    draw();
  }

  function placeFood() {
    let tries = 0;
    do {
      food = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
      tries++;
    } while (tries < 200 && (
      snake.some(s => s.x === food.x && s.y === food.y) ||
      obstacles.some(o => o.x === food.x && o.y === food.y)
    ));
  }

  function placeObstacles() {
    obstacles = [];
    const cfg = DIFFICULTY[currentDiff];
    for (let i = 0; i < cfg.obstacles; i++) {
      let o, tries = 0;
      do {
        o = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        tries++;
      } while (tries < 200 && (
        snake.some(s => s.x === o.x && s.y === o.y) ||
        obstacles.some(e => e.x === o.x && e.y === o.y) ||
        (Math.abs(o.x - 10) < 3 && Math.abs(o.y - 10) < 3)
      ));
      obstacles.push(o);
    }
  }

  function draw() {
    // 【关键修复】清空画布，露出 CSS 中设置的背景色
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 根据主题画网格线
    const isLight = document.body.classList.contains('light');
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)';
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
    }

    // 障碍
    obstacles.forEach(o => {
      ctx.fillStyle = '#475569';
      roundRect(o.x * CELL + 2, o.y * CELL + 2, CELL - 4, CELL - 4, 4);
      ctx.fill();
    });

    // 食物脉动
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.15;
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(fx, fy, CELL * 0.35 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 蛇身渐变
    snake.forEach((s, i) => {
      const t = i / Math.max(snake.length - 1, 1);
      const r = Math.round(74 + (34 - 74) * t);
      const g = Math.round(222 + (197 - 222) * t);
      const b = Math.round(128 + (94 - 128) * t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 5);
      ctx.fill();
    });

    // 蛇眼睛
    const head = snake[0];
    if (head) {
      ctx.fillStyle = '#0a0d1a';
      const cx = head.x * CELL + CELL / 2;
      const cy = head.y * CELL + CELL / 2;
      const eo = CELL * 0.18, es = CELL * 0.1;
      let ex1, ey1, ex2, ey2;
      if (dir.x === 1)       { ex1 = cx + eo; ey1 = cy - eo; ex2 = cx + eo; ey2 = cy + eo; }
      else if (dir.x === -1) { ex1 = cx - eo; ey1 = cy - eo; ex2 = cx - eo; ey2 = cy + eo; }
      else if (dir.y === -1) { ex1 = cx - eo; ey1 = cy - eo; ex2 = cx + eo; ey2 = cy - eo; }
      else                   { ex1 = cx - eo; ey1 = cy + eo; ex2 = cx + eo; ey2 = cy + eo; }
      ctx.beginPath(); ctx.arc(ex1, ey1, es, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex2, ey2, es, 0, Math.PI * 2); ctx.fill();
    }
  }

  document.addEventListener('themechange', () => {
    draw();
  });

  function step() {
    if (!running || paused) return;

    dir = nextDir;
    let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const cfg = DIFFICULTY[currentDiff];

    if (cfg.wrap) {
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;
    } else {
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return gameOver();
      }
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      playBeep(880, 0.08);
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    running = false; over = true;
    clearInterval(timer);
    pauseBtn.disabled = true;
    restartBtn.disabled = false;
    msgEl.textContent = `游戏结束！得分 ${score}，去首页提交成绩吧`;
    msgEl.style.color = '#f87171';
    playBeep(200, 0.3);

    setBestScore(score);
    bestEl.textContent = getBestScore();
    localStorage.setItem('snake_last_score', score);
    addPlayCount();
  }

  function start() {
    if (running || over) return;
    running = true; paused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    pauseBtn.textContent = '暂停';
    msgEl.textContent = '游戏中…';
    msgEl.style.color = '#8b93ad';
    playBeep(660, 0.1);
    clearInterval(timer);
    timer = setInterval(step, speed);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '继续' : '暂停';
    msgEl.textContent = paused ? '已暂停' : '游戏中…';
  }

  function restart() {
    clearInterval(timer);
    reset();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    msgEl.textContent = '按“开始”或方向键出发';
    msgEl.style.color = '#8b93ad';
  }

  function setDir(x, y) {
    if (x === -nextDir.x && y === -nextDir.y) return;
    nextDir = { x, y };
    if (!running && !over) start();
  }

  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'w'].includes(k))          { e.preventDefault(); setDir(0, -1); }
    else if (['arrowdown', 's'].includes(k))   { e.preventDefault(); setDir(0, 1); }
    else if (['arrowleft', 'a'].includes(k))   { e.preventDefault(); setDir(-1, 0); }
    else if (['arrowright', 'd'].includes(k))  { e.preventDefault(); setDir(1, 0); }
    else if (k === ' ') { e.preventDefault(); togglePause(); }
  });

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restart);

  speedSelect.addEventListener('change', () => {
    currentDiff = speedSelect.value;
    speed = DIFFICULTY[currentDiff].speed;
    if (running) {
      clearInterval(timer);
      timer = setInterval(step, speed);
    }
    restart();
  });

  const dpad = document.getElementById('dpad');
  if (dpad) {
    dpad.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-dir]');
      if (!btn) return;
      const d = btn.dataset.dir;
      if (d === 'up')    setDir(0, -1);
      if (d === 'down')  setDir(0, 1);
      if (d === 'left')  setDir(-1, 0);
      if (d === 'right') setDir(1, 0);
    });
  }

  let touchStart = null;
  canvas.addEventListener('touchstart', (e) => { touchStart = e.touches[0]; }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.clientX;
    const dy = e.touches[0].clientY - touchStart.clientY;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });

  reset();
}