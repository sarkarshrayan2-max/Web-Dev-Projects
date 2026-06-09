/**
 * Grid Recall Challenge - Main Script
 */

// --- DOM Elements ---
const screens = {
  menu: document.getElementById('screen-menu'),
  game: document.getElementById('screen-game'),
  gameOver: document.getElementById('modal-game-over'),
  leaderboard: document.getElementById('screen-leaderboard')
};

const UI = {
  livesDisplay: document.getElementById('lives-display'),
  levelDisplay: document.getElementById('level-display'),
  scoreDisplay: document.getElementById('score-display'),
  streakBadge: document.getElementById('streak-badge'),
  streakValue: document.getElementById('streak-value'),
  targetCount: document.getElementById('target-count'),
  statusText: document.getElementById('status-text'),
  
  gameGrid: document.getElementById('game-grid'),
  
  finalLevel: document.getElementById('final-level'),
  finalScore: document.getElementById('final-score'),
  finalStreak: document.getElementById('final-streak'),
  lbList: document.getElementById('lb-list')
};

// --- Game State ---
const MAX_LIVES = 3;
let state = {
  isPlaying: false,
  lives: MAX_LIVES,
  level: 1,
  score: 0,
  streak: 1,
  highestStreak: 1,
  
  gridSize: 3, // 3x3 initially
  targetLength: 3, // Initially 3 tiles to remember
  
  sequence: [], // Array of indices that are the target
  playerInput: [], // Array of indices the player has clicked so far
  
  phase: 'idle' // 'idle', 'flashing', 'input'
};

// --- Navigation ---
function switchScreen(screenId) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenId].classList.add('active');
}

function showMainMenu() {
  switchScreen('menu');
  screens.gameOver.classList.add('hidden');
}

function showLeaderboards() {
  switchScreen('leaderboard');
  renderLeaderboard();
}

function quitGame() {
  if (confirm("Are you sure you want to quit?")) {
    state.isPlaying = false;
    showMainMenu();
  }
}

// --- Core Game Loop ---

function startGame() {
  state = {
    isPlaying: true,
    lives: MAX_LIVES,
    level: 1,
    score: 0,
    streak: 1,
    highestStreak: 1,
    gridSize: 3,
    targetLength: 3,
    sequence: [],
    playerInput: [],
    phase: 'idle'
  };

  screens.gameOver.classList.add('hidden');
  switchScreen('game');
  updateHUD();
  
  startLevel();
}

function startLevel() {
  if (!state.isPlaying) return;
  
  // Calculate difficulty progression
  state.gridSize = state.level >= 10 ? 5 : (state.level >= 5 ? 4 : 3);
  state.targetLength = 2 + Math.floor(state.level / 2) + (state.level % 2); 
  // Level 1: 3, Level 2: 3, Level 3: 4, Level 4: 4, Level 5: 5...
  
  // Cap target length so it never exceeds grid size
  const maxTiles = state.gridSize * state.gridSize;
  if (state.targetLength > maxTiles - 1) {
    state.targetLength = maxTiles - 1;
  }

  state.playerInput = [];
  updateHUD();
  generateGrid();
  
  setStatus("Get Ready!", "memorize");
  state.phase = 'flashing';
  UI.gameGrid.classList.add('unclickable');

  // Short delay before flashing
  setTimeout(() => {
    if (!state.isPlaying) return;
    generateSequence();
    flashSequence();
  }, 1000);
}

function generateGrid() {
  UI.gameGrid.innerHTML = '';
  UI.gameGrid.className = `game-grid size-${state.gridSize}x${state.gridSize} unclickable`;
  
  const totalTiles = state.gridSize * state.gridSize;
  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = i;
    tile.addEventListener('click', () => handleTileClick(i, tile));
    UI.gameGrid.appendChild(tile);
  }
}

function generateSequence() {
  const totalTiles = state.gridSize * state.gridSize;
  state.sequence = [];
  
  // Pick random unique indices
  while (state.sequence.length < state.targetLength) {
    const r = Math.floor(Math.random() * totalTiles);
    if (!state.sequence.includes(r)) {
      state.sequence.push(r);
    }
  }
}

function flashSequence() {
  setStatus("Memorize...", "memorize");
  const tiles = Array.from(UI.gameGrid.children);
  
  // Flash them on
  state.sequence.forEach(index => {
    tiles[index].classList.add('flash');
  });

  // Keep them on based on level (faster at higher levels)
  const flashDuration = Math.max(800, 1500 - (state.level * 50));

  setTimeout(() => {
    if (!state.isPlaying) return;
    // Turn off
    tiles.forEach(t => t.classList.remove('flash'));
    
    // Short pause before allowing input
    setTimeout(() => {
      if (!state.isPlaying) return;
      setStatus("Your Turn!", "recall");
      state.phase = 'input';
      UI.gameGrid.classList.remove('unclickable');
    }, 200);
    
  }, flashDuration);
}

// --- Input Handling ---

function handleTileClick(index, tileElement) {
  if (state.phase !== 'input') return;
  
  // Ignore already clicked correct tiles
  if (state.playerInput.includes(index)) return;

  // Check if clicked index is part of the target sequence
  if (state.sequence.includes(index)) {
    // Correct pick
    state.playerInput.push(index);
    tileElement.classList.add('correct');
    
    // Check if level complete
    if (state.playerInput.length === state.sequence.length) {
      levelComplete();
    }
  } else {
    // Wrong pick
    tileElement.classList.add('wrong');
    wrongPick();
  }
}

function levelComplete() {
  state.phase = 'idle';
  UI.gameGrid.classList.add('unclickable');
  
  setStatus("Perfect!", "perfect");
  
  // Calculate Score
  const points = (100 * state.level) * state.streak;
  state.score += points;
  state.streak++;
  state.level++;
  
  if (state.streak > state.highestStreak) {
    state.highestStreak = state.streak;
  }

  updateHUD();

  setTimeout(() => {
    startLevel();
  }, 1000);
}

function wrongPick() {
  state.phase = 'idle';
  UI.gameGrid.classList.add('unclickable');
  
  setStatus("Wrong!", "wrong");
  
  state.lives--;
  state.streak = 1;
  updateHUD();
  
  if (state.lives <= 0) {
    setTimeout(() => endGame(), 800);
  } else {
    // Retry level
    setTimeout(() => {
      startLevel();
    }, 1200);
  }
}

// --- UI Updates ---

function updateHUD() {
  UI.levelDisplay.textContent = state.level;
  UI.scoreDisplay.textContent = state.score;
  UI.streakValue.textContent = state.streak;
  
  // Highlight streak badge if > 3
  if (state.streak >= 3) {
    UI.streakBadge.classList.add('highlight');
  } else {
    UI.streakBadge.classList.remove('highlight');
  }
  
  UI.targetCount.textContent = state.targetLength;

  // Update Lives
  const hearts = Array.from(UI.livesDisplay.children);
  hearts.forEach((heart, idx) => {
    if (idx < state.lives) {
      heart.classList.add('active');
    } else {
      heart.classList.remove('active');
    }
  });
}

function setStatus(text, typeClass) {
  UI.statusText.textContent = text;
  UI.statusText.className = 'status-text'; // reset
  void UI.statusText.offsetWidth; // trigger reflow
  UI.statusText.classList.add(typeClass);
}

// --- Game Over & Leaderboard ---

function endGame() {
  state.isPlaying = false;
  
  UI.finalLevel.textContent = state.level;
  UI.finalScore.textContent = state.score;
  UI.finalStreak.textContent = `x${state.highestStreak}`;
  
  saveScore(state.score, state.level);
  
  screens.gameOver.classList.remove('hidden');
}

function saveScore(score, level) {
  if (score === 0) return;
  let scores = JSON.parse(localStorage.getItem('grid_recall_lb')) || [];
  scores.push({
    score: score,
    level: level,
    date: new Date().toLocaleDateString()
  });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem('grid_recall_lb', JSON.stringify(scores));
}

function renderLeaderboard() {
  UI.lbList.innerHTML = '';
  let scores = JSON.parse(localStorage.getItem('grid_recall_lb')) || [];
  
  if (scores.length === 0) {
    UI.lbList.innerHTML = `<li style="justify-content:center; color:var(--text-muted);">No scores yet. Play a game!</li>`;
    return;
  }

  scores.forEach((s, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="lb-rank">#${index + 1}</span>
      <span class="lb-date">Lvl ${s.level}</span>
      <span class="lb-score">${s.score} pts</span>
    `;
    UI.lbList.appendChild(li);
  });
}
