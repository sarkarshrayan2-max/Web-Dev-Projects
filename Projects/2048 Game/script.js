const SIZE = 4;
const KEY = "wdp.2048.best";
const $ = (s) => document.querySelector(s);
const tilesEl = $("#tiles"), cellsEl = document.querySelector(".cells");
const scoreEl = $("#score"), bestEl = $("#best"), msgEl = $("#msg");

let grid, score = 0, best = Number(localStorage.getItem(KEY) || 0);

// Build 16 background cells once.
for (let i = 0; i < SIZE * SIZE; i++) {
  const d = document.createElement("div");
  d.className = "cell-bg";
  cellsEl.appendChild(d);
}

function empty() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }

function addRandom() {
  const slots = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) slots.push([r, c]);
  if (!slots.length) return;
  const [r, c] = slots[Math.floor(Math.random() * slots.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  const f = row.filter((v) => v);
  const out = [];
  let gained = 0;
  for (let i = 0; i < f.length; i++) {
    if (f[i] === f[i + 1]) { out.push(f[i] * 2); gained += f[i] * 2; i++; }
    else out.push(f[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

function rotate(g) {
  const n = empty();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) n[c][SIZE - 1 - r] = g[r][c];
  return n;
}

function move(dir) {
  // Rotate so we always slide "left", then rotate back.
  const turns = { left: 0, up: 1, right: 2, down: 3 }[dir];
  let g = grid;
  for (let i = 0; i < turns; i++) g = rotate(g);
  let gained = 0, changed = false;
  for (let r = 0; r < SIZE; r++) {
    const { row, gained: x } = slide(g[r]);
    if (row.some((v, c) => v !== g[r][c])) changed = true;
    g[r] = row; gained += x;
  }
  for (let i = 0; i < (4 - turns) % 4; i++) g = rotate(g);
  if (!changed) return false;
  grid = g; score += gained; return true;
}

function anyMoves() {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!grid[r][c]) return true;
    if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
    if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
  }
  return false;
}

function render() {
  tilesEl.replaceChildren();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const v = grid[r][c]; if (!v) continue;
    const t = document.createElement("div");
    t.className = `tile t-${v}`;
    t.style.gridRowStart = r + 1;
    t.style.gridColumnStart = c + 1;
    t.style.fontSize = v >= 1024 ? "1.4rem" : v >= 128 ? "1.7rem" : "2rem";
    t.textContent = v;
    tilesEl.appendChild(t);
  }
  scoreEl.textContent = score;
  if (score > best) { best = score; localStorage.setItem(KEY, best); }
  bestEl.textContent = best;
  if (grid.flat().includes(2048)) showMsg("You reached 2048. Keep going.");
  else if (!anyMoves()) showMsg("No more moves. Press New game.");
  else hideMsg();
}

function showMsg(t) { msgEl.hidden = false; msgEl.textContent = t; }
function hideMsg() { msgEl.hidden = true; }

function newGame() { grid = empty(); score = 0; addRandom(); addRandom(); render(); }

function step(dir) { if (move(dir)) { addRandom(); render(); } }

document.addEventListener("keydown", (e) => {
  const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  if (map[e.key]) { e.preventDefault(); step(map[e.key]); }
});

// Swipe
let sx = 0, sy = 0;
const board = $("#board");
board.addEventListener("touchstart", (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
board.addEventListener("touchend", (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - sx, dy = t.clientY - sy;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) step(dx > 0 ? "right" : "left");
  else step(dy > 0 ? "down" : "up");
});

$("#reset").addEventListener("click", newGame);
newGame();
