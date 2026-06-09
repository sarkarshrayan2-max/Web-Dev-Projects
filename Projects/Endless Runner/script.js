const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 360, H = 400;
canvas.width = W;
canvas.height = H;

const scoreVal = document.getElementById('scoreVal');
const speedVal = document.getElementById('speedVal');
const bestVal = document.getElementById('bestVal');
const overlay = document.getElementById('overlay');
const resetBtn = document.getElementById('resetBtn');
const moScore = document.getElementById('moScore');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'endlessrunner_best';

const GROUND_Y = 356;
const RUNNER_W = 18, RUNNER_H = 24;
const RUNNER_X = 60;
const GRAVITY = 0.42;
const JUMP_FORCE = -7.2;
const BASE_SPEED = 2.6;
const BASE_INTERVAL = 64;

let score = 0;
let bestScore = 0;
let speedMul = 1;
let spawnInterval = BASE_INTERVAL;
let runner = {};
let obstacles = [];
let particles = [];
let spawnTimer = 0;
let frameCount = 0;
let diffTimer = 0;
let gameRunning = false;
let animId = null;
let shakeTimer = 0;

function loadBest() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved > 0) { bestScore = saved; bestVal.textContent = bestScore; }
  } catch {}
}

function saveBest(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
}

function resetRunner() {
  runner = { x: RUNNER_X, y: GROUND_Y - RUNNER_H, w: RUNNER_W, h: RUNNER_H, vy: 0, grounded: true };
}

function resetGame() {
  score = 0; speedMul = 1; spawnInterval = BASE_INTERVAL;
  obstacles = []; particles = [];
  spawnTimer = 0; frameCount = 0; diffTimer = 0; shakeTimer = 0;
  resetRunner();
  updateHUD();
  overlay.classList.remove('active');
  gameRunning = true;
}

function updateHUD() {
  scoreVal.textContent = Math.floor(score);
  speedVal.textContent = speedMul.toFixed(1) + '×';
  bestVal.textContent = bestScore;
}

function spawnObstacle() {
  const w = 14 + Math.random() * 18;
  const h = 16 + Math.random() * 16;
  obstacles.push({
    x: W, y: GROUND_Y - h, w, h,
    type: Math.random() < 0.35 ? 'tall' : 'short',
  });
}

function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function addSplash(x, y, color, count) {
  for (let i = 0; i < (count || 8); i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 2.5;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color, r: 1.5 + Math.random() * 2.5 });
  }
}

function gameOver() {
  gameRunning = false;
  if (animId) cancelAnimationFrame(animId);
  const finalScore = Math.floor(score);
  if (finalScore > bestScore) { bestScore = finalScore; bestVal.textContent = bestScore; saveBest(bestScore); }
  moScore.textContent = finalScore;
  moBest.textContent = bestScore;
  setTimeout(() => overlay.classList.add('active'), 400);
}

function update() {
  if (!gameRunning) return;

  runner.vy += GRAVITY;
  runner.y += runner.vy;

  if (runner.y + runner.h >= GROUND_Y) {
    runner.y = GROUND_Y - runner.h;
    runner.vy = 0;
    runner.grounded = true;
  } else {
    runner.grounded = false;
  }

  frameCount++;
  diffTimer++;

  if (diffTimer >= 600) {
    diffTimer = 0;
    speedMul = Math.min(speedMul + 0.2, 3.5);
    spawnInterval = Math.max(spawnInterval - 3, 22);
    updateHUD();
  }

  score += 0.05 * speedMul;
  if (frameCount % 10 === 0) updateHUD();

  spawnTimer++;
  if (spawnTimer >= spawnInterval / speedMul) {
    spawnTimer = 0;
    spawnObstacle();
    if (Math.random() < 0.15) spawnObstacle();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= BASE_SPEED * speedMul;

    if (o.x + o.w < 0) { obstacles.splice(i, 1); continue; }

    if (aabb(runner.x, runner.y, runner.w, runner.h, o.x, o.y, o.w, o.h)) {
      shakeTimer = 14;
      addSplash(runner.x + runner.w / 2, runner.y + runner.h / 2, '#ff2a5f', 16);
      addSplash(o.x + o.w / 2, o.y + o.h / 2, '#00f0ff', 12);
      gameOver();
      return;
    }
  }

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.03;
  }

  if (shakeTimer > 0) shakeTimer--;
}

function draw() {
  ctx.save();

  if (shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * shakeTimer * 0.6;
    const sy = (Math.random() - 0.5) * shakeTimer * 0.6;
    ctx.translate(sx, sy);
  }

  ctx.clearRect(-10, -10, W + 20, H + 20);
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let y = 40; y < GROUND_Y; y += 50) {
    ctx.fillRect(0, y, W, 1);
  }

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 4);
  ctx.lineTo(W, GROUND_Y + 4);
  ctx.stroke();

  for (const o of obstacles) {
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.25)';
    ctx.shadowBlur = 12;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(o.x + 3, o.y + 3, o.w - 6, 4);
  }

  ctx.shadowColor = '#ff2a5f';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ff2a5f';
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(runner.x + 3, runner.y + 3, runner.w - 6, 3);

  ctx.fillStyle = '#fff';
  ctx.fillRect(runner.x + 4, runner.y + 6, 3, 3);
  ctx.fillRect(runner.x + 11, runner.y + 6, 3, 3);

  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function loop() {
  update();
  draw();
  if (gameRunning) animId = requestAnimationFrame(loop);
}

function jump() {
  if (!gameRunning || !runner.grounded) return;
  runner.vy = JUMP_FORCE;
  runner.grounded = false;
}

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Space' || e.key === 'ArrowUp') {
    e.preventDefault(); jump();
  }
});

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });
canvas.addEventListener('click', jump);

resetBtn.addEventListener('click', () => { resetGame(); loop(); });

loadBest();
resetGame();
loop();
