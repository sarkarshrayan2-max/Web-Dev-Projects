// --- Pseudo Random Number Generator for Daily Mode ---
// Mulberry32 PRNG
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getDailySeed() {
  const d = new Date();
  return parseInt(`${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}`);
}

// --- Game State & Constants ---
const MAX_ROUNDS = 5;
let prng = null;

let gameState = {
  mode: 'solo', // 'solo', 'pass-and-play', 'daily'
  currentPlayer: 1, // 1 or 2
  round: 1,
  
  p1Score: 0,
  p2Score: 0,
  p1Errors: [],
  p2Errors: [],
  
  currentTarget: 0,
  currentGuess: 0,
  
  // Daily / Pass&Play pre-generated targets
  targets: []
};

// --- DOM Elements ---
const screens = {
  menu: document.getElementById('main-menu'),
  game: document.getElementById('game-screen'),
  roundResult: document.getElementById('round-result-modal'),
  finalResult: document.getElementById('results-screen'),
  leaderboard: document.getElementById('leaderboard-screen')
};

const UI = {
  modeDisplay: document.getElementById('current-mode-display'),
  roundDisplay: document.getElementById('round-display'),
  targetAngleDisplay: document.getElementById('target-angle-display'),
  playerTurnDisplay: document.getElementById('player-turn-display'),
  
  canvas: document.getElementById('angleCanvas'),
  ctx: document.getElementById('angleCanvas').getContext('2d'),
  confirmBtn: document.getElementById('confirm-btn'),
  nextRoundBtn: document.getElementById('next-round-btn'),
  feedbackToast: document.getElementById('feedback-toast'),
  
  // Round Result Modal
  resTitle: document.getElementById('round-title'),
  resTarget: document.getElementById('res-target'),
  resGuess: document.getElementById('res-guess'),
  resError: document.getElementById('res-error'),
  resPoints: document.getElementById('res-points'),
  
  // Final Results
  finalModeText: document.getElementById('final-mode-text'),
  finalScoreDisplay: document.getElementById('final-score-display'),
  singleStats: document.getElementById('single-player-stats'),
  multiStats: document.getElementById('multiplayer-stats'),
  avgErrorDisplay: document.getElementById('avg-error-display'),
  p1ScoreDisplay: document.getElementById('p1-score-display'),
  p2ScoreDisplay: document.getElementById('p2-score-display'),
  winnerDisplay: document.getElementById('winner-display'),
  shareBtn: document.getElementById('share-score-btn'),
  
  // Leaderboard
  lbTabs: document.querySelectorAll('.tab-btn'),
  lbList: document.getElementById('lb-list')
};

// --- Canvas Interaction Logic ---
let isDragging = false;
let cx, cy, radius;

function initCanvas() {
  const rect = UI.canvas.parentElement.getBoundingClientRect();
  UI.canvas.width = rect.width;
  UI.canvas.height = rect.width; // square
  
  cx = UI.canvas.width / 2;
  cy = UI.canvas.height / 2;
  radius = cx * 0.8;
  
  drawCanvas(0);
}

function getAngleFromEvent(e) {
  const rect = UI.canvas.getBoundingClientRect();
  let clientX, clientY;
  
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  
  const x = clientX - rect.left - cx;
  const y = clientY - rect.top - cy;
  
  // Calculate angle in degrees (0 is right, counter-clockwise)
  let angle = Math.atan2(-y, x) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  
  // Snap to 5 degree increments for slightly easier playing, or keep precise?
  // Let's keep it precise but round to nearest integer.
  return Math.round(angle);
}

function handleInputStart(e) {
  if(screens.roundResult.classList.contains('hidden') === false) return; // don't draw if modal open
  isDragging = true;
  gameState.currentGuess = getAngleFromEvent(e);
  drawCanvas(gameState.currentGuess);
}

function handleInputMove(e) {
  if (!isDragging) return;
  gameState.currentGuess = getAngleFromEvent(e);
  drawCanvas(gameState.currentGuess);
}

function handleInputEnd() {
  isDragging = false;
}

UI.canvas.addEventListener('mousedown', handleInputStart);
window.addEventListener('mousemove', handleInputMove);
window.addEventListener('mouseup', handleInputEnd);

UI.canvas.addEventListener('touchstart', handleInputStart, {passive: false});
window.addEventListener('touchmove', handleInputMove, {passive: false});
window.addEventListener('touchend', handleInputEnd);

function drawCanvas(angle) {
  const ctx = UI.ctx;
  ctx.clearRect(0, 0, UI.canvas.width, UI.canvas.height);
  
  // Base Circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim();
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Draw center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();

  // Draw 0 Degree Line (Base line)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Fill arc area
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, 0, -angle * (Math.PI / 180), true);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.fill();
  
  // Draw Draggable Line
  const rad = -angle * (Math.PI / 180);
  const ex = cx + radius * Math.cos(rad);
  const ey = cy + radius * Math.sin(rad);
  
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4;
  ctx.stroke();
}


// --- Screen Navigation ---
function switchScreen(screenId) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenId].classList.add('active');
}

function showMainMenu() {
  switchScreen('menu');
  stopConfetti();
}

function quitGame() {
  if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
    showMainMenu();
  }
}

function showLeaderboards() {
  switchScreen('leaderboard');
  renderLeaderboard('solo');
}


// --- Game Logic ---

function startGame(mode) {
  gameState = {
    mode: mode,
    currentPlayer: 1,
    round: 1,
    p1Score: 0,
    p2Score: 0,
    p1Errors: [],
    p2Errors: [],
    targets: []
  };

  // Generate targets
  if (mode === 'daily') {
    prng = mulberry32(getDailySeed());
    for(let i=0; i<MAX_ROUNDS; i++) {
      gameState.targets.push(Math.floor(prng() * 350) + 5); // 5 to 355
    }
  } else if (mode === 'pass-and-play') {
    for(let i=0; i<MAX_ROUNDS; i++) {
      gameState.targets.push(Math.floor(Math.random() * 350) + 5);
    }
  }

  // Setup UI
  let modeStr = mode === 'solo' ? 'Solo Mode' : (mode === 'daily' ? 'Daily Challenge' : 'Pass & Play');
  UI.modeDisplay.textContent = modeStr;
  
  if (mode === 'pass-and-play') {
    UI.playerTurnDisplay.classList.remove('hidden');
    UI.playerTurnDisplay.textContent = "Player 1's Turn";
  } else {
    UI.playerTurnDisplay.classList.add('hidden');
  }

  switchScreen('game');
  initCanvas();
  startRound();
}

function startRound() {
  // Hide modal
  screens.roundResult.classList.add('hidden');
  
  UI.roundDisplay.textContent = gameState.round;
  
  if (gameState.mode === 'solo') {
    gameState.currentTarget = Math.floor(Math.random() * 350) + 5;
  } else {
    gameState.currentTarget = gameState.targets[gameState.round - 1];
  }
  
  UI.targetAngleDisplay.textContent = `${gameState.currentTarget}°`;
  gameState.currentGuess = 0;
  drawCanvas(0);
}

UI.confirmBtn.addEventListener('click', () => {
  const error = Math.abs(gameState.currentTarget - gameState.currentGuess);
  
  // Handle circular math (e.g. 359 and 1 is error 2)
  const actualError = error > 180 ? 360 - error : error;
  
  // Calculate score (max 1000 per round)
  let points = 0;
  if (actualError <= 20) {
    points = Math.floor(((20 - actualError) / 20) * 1000);
  }
  
  // Easter Egg Feedback
  if (actualError === 0) {
    showToast("🔥 PERFECT! +1000 🔥");
    points = 1000;
  } else if (actualError <= 2) {
    showToast("Amazing!");
  } else if (gameState.currentGuess === 69 || gameState.currentGuess === 420) {
    showToast("Nice. 😎");
  }

  // Save Stats
  if (gameState.currentPlayer === 1) {
    gameState.p1Score += points;
    gameState.p1Errors.push(actualError);
  } else {
    gameState.p2Score += points;
    gameState.p2Errors.push(actualError);
  }

  // Show Modal
  UI.resTarget.textContent = `${gameState.currentTarget}°`;
  UI.resGuess.textContent = `${gameState.currentGuess}°`;
  UI.resError.textContent = `${actualError}°`;
  UI.resPoints.textContent = `+${points}`;
  
  UI.resTitle.textContent = (gameState.mode === 'pass-and-play') 
    ? `Player ${gameState.currentPlayer} - Round ${gameState.round} Complete`
    : `Round ${gameState.round} Complete`;

  screens.roundResult.classList.remove('hidden');
});

UI.nextRoundBtn.addEventListener('click', () => {
  if (gameState.mode === 'pass-and-play' && gameState.currentPlayer === 1) {
    // Switch to Player 2
    gameState.currentPlayer = 2;
    UI.playerTurnDisplay.textContent = "Player 2's Turn";
    UI.playerTurnDisplay.style.color = 'var(--danger)';
    startRound();
  } else {
    // Next Round or Finish
    if (gameState.round < MAX_ROUNDS) {
      gameState.round++;
      if (gameState.mode === 'pass-and-play') {
        gameState.currentPlayer = 1;
        UI.playerTurnDisplay.textContent = "Player 1's Turn";
        UI.playerTurnDisplay.style.color = 'var(--secondary)';
      }
      startRound();
    } else {
      finishGame();
    }
  }
});

function finishGame() {
  screens.roundResult.classList.add('hidden');
  switchScreen('finalResult');

  const modeStr = gameState.mode === 'solo' ? 'Solo Challenge' : (gameState.mode === 'daily' ? 'Daily Challenge' : 'Pass & Play');
  UI.finalModeText.textContent = modeStr;

  if (gameState.mode === 'pass-and-play') {
    UI.singleStats.classList.add('hidden');
    UI.multiStats.classList.remove('hidden');
    
    UI.finalScoreDisplay.textContent = "DONE";
    UI.p1ScoreDisplay.textContent = gameState.p1Score;
    UI.p2ScoreDisplay.textContent = gameState.p2Score;
    
    if (gameState.p1Score > gameState.p2Score) {
      UI.winnerDisplay.textContent = "Player 1 Wins! 🏆";
      UI.winnerDisplay.style.color = 'var(--secondary)';
      startConfetti();
    } else if (gameState.p2Score > gameState.p1Score) {
      UI.winnerDisplay.textContent = "Player 2 Wins! 🏆";
      UI.winnerDisplay.style.color = 'var(--danger)';
      startConfetti();
    } else {
      UI.winnerDisplay.textContent = "It's a Tie! 🤝";
      UI.winnerDisplay.style.color = 'var(--text-main)';
    }
  } else {
    UI.singleStats.classList.remove('hidden');
    UI.multiStats.classList.add('hidden');
    
    UI.finalScoreDisplay.textContent = gameState.p1Score;
    const avgError = (gameState.p1Errors.reduce((a, b) => a + b, 0) / MAX_ROUNDS).toFixed(1);
    UI.avgErrorDisplay.textContent = `${avgError}°`;
    
    if (gameState.p1Score > 3500) startConfetti();

    // Save to Leaderboard
    saveScore(gameState.mode, gameState.p1Score);
  }

  // Share link setup
  UI.shareBtn.onclick = () => {
    let text = `I scored ${gameState.p1Score} points in Precision Angle Challenge (${modeStr})!\nAverage Error: ${(gameState.p1Errors.reduce((a, b) => a + b, 0) / MAX_ROUNDS).toFixed(1)}°\nCan you beat me?`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Result copied to clipboard!");
    });
  };
}

function showToast(msg) {
  UI.feedbackToast.textContent = msg;
  UI.feedbackToast.classList.remove('hidden');
  
  // Re-trigger animation
  UI.feedbackToast.style.animation = 'none';
  UI.feedbackToast.offsetHeight; // trigger reflow
  UI.feedbackToast.style.animation = null;

  setTimeout(() => {
    UI.feedbackToast.classList.add('hidden');
  }, 1500);
}


// --- Leaderboards (Local Storage) ---
function saveScore(mode, score) {
  let scores = JSON.parse(localStorage.getItem(`angle_lb_${mode}`)) || [];
  scores.push({
    score: score,
    date: new Date().toLocaleDateString()
  });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10); // Keep top 10
  localStorage.setItem(`angle_lb_${mode}`, JSON.stringify(scores));
}

function renderLeaderboard(mode) {
  UI.lbList.innerHTML = '';
  let scores = JSON.parse(localStorage.getItem(`angle_lb_${mode}`)) || [];
  
  if (scores.length === 0) {
    UI.lbList.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:2rem;">No scores yet. Play a game!</p>`;
    return;
  }

  scores.forEach((s, index) => {
    const li = document.createElement('li');
    li.className = 'lb-item';
    li.innerHTML = `
      <span class="lb-rank">#${index + 1}</span>
      <span class="lb-date">${s.date}</span>
      <span class="lb-score">${s.score} pts</span>
    `;
    UI.lbList.appendChild(li);
  });
}

function switchLbTab(mode) {
  UI.lbTabs.forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  renderLeaderboard(mode);
}


// --- Confetti Easter Egg ---
let confettiAnim;
function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  
  for(let i=0; i<100; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 5 - 2.5
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
      if(p.y > canvas.height) p.y = -20;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    });
    confettiAnim = requestAnimationFrame(render);
  }
  render();
}

function stopConfetti() {
  cancelAnimationFrame(confettiAnim);
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Global Resize handling for Canvas
window.addEventListener('resize', () => {
  if (screens.game.classList.contains('active')) {
    initCanvas();
    drawCanvas(gameState.currentGuess);
  }
});
