/**
 * Guess Number Game — Core Game Logic
 */

const STATE_KEY = 'guessNumberGameState';

// --- State ---
let state = null;

// --- DOM refs (populated on init) ---
let els = {};

/**
 * Initialize the game: parse URL params, restore saved state, or start fresh.
 */
function initGame() {
  // Cache DOM elements
  els = {
    difficultyBadge: document.getElementById('difficultyBadge'),
    rangeInfo: document.getElementById('rangeInfo'),
    guessRemaining: document.getElementById('guessRemaining'),
    hintBtn: document.getElementById('hintBtn'),
    guessInput: document.getElementById('guessInput'),
    submitBtn: document.getElementById('submitBtn'),
    feedback: document.getElementById('feedback'),
    historyBody: document.getElementById('historyBody'),
    modal: document.getElementById('gameOverModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalBtn: document.getElementById('modalBtn')
  };

  // Try to restore saved state
  const saved = loadState();
  if (saved && saved.isGameOver === false) {
    state = saved;
    renderAll();
    return;
  }

  // Start new game from URL params
  const params = new URLSearchParams(window.location.search);
  const diff = params.get('difficulty') || 'normal';
  const config = getDifficultyConfig(diff);

  state = {
    difficulty: diff,
    targetNumber: generateTargetNumber(config.min, config.max),
    min: config.min,
    max: config.max,
    remainingGuesses: config.guesses,
    maxGuesses: config.guesses,
    history: [],
    hintsUsed: 0,
    hintClampMin: config.min,
    hintClampMax: config.max,
    isGameOver: false,
    status: 'playing'
  };

  saveState();
  renderAll();
}

/**
 * Update the input-error class based on validity.
 */
function setInputError(hasError) {
  if (hasError) {
    els.guessInput.classList.add('input-error');
  } else {
    els.guessInput.classList.remove('input-error');
  }
}

/**
 * Update low-guesses pulse on remaining count.
 */
function updateRemainingClass() {
  if (state.remainingGuesses <= 2 && state.status === 'playing') {
    els.guessRemaining.classList.add('low');
  } else {
    els.guessRemaining.classList.remove('low');
  }
}

// --- Persistence ---
function saveState() {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore storage errors */ }
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// --- Rendering ---
function renderAll() {
  if (!state) return;
  const config = getDifficultyConfig(state.difficulty);

  els.difficultyBadge.textContent = config.label;
  els.difficultyBadge.style.background = config.color + '33';
  els.difficultyBadge.style.color = config.color;

  els.rangeInfo.textContent = `范围：${state.hintClampMin} ~ ${state.hintClampMax}`;
  els.guessRemaining.textContent = `剩余次数：${state.remainingGuesses} / ${state.maxGuesses}`;

  els.hintBtn.disabled = state.isGameOver || state.remainingGuesses <= 1;
  els.guessInput.disabled = state.isGameOver;
  els.submitBtn.disabled = state.isGameOver;

  updateRemainingClass();
  renderHistory();
}

function renderHistory() {
  els.historyBody.innerHTML = '';
  state.history.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.className = `history-row history-${entry.result}`;
    // Only the newest entry (last in array, rendered first) gets animation delay != 0
    if (index < state.history.length - 1) {
      row.style.animationDelay = '0s';
    } else {
      row.style.animationDelay = '0.1s';
    }

    const numCell = document.createElement('td');
    numCell.textContent = entry.guess;

    const resultCell = document.createElement('td');
    resultCell.textContent = entry.result === 'win' ? '猜对了！' :
                             entry.result === 'high' ? '高了' : '低了';

    row.appendChild(numCell);
    row.appendChild(resultCell);
    els.historyBody.appendChild(row);
  });
}

function showFeedback(message, type) {
  els.feedback.textContent = message;
  els.feedback.className = 'feedback ' + (type || '');
  els.feedback.style.display = 'block';
}

// --- Game Actions ---
function submitGuess() {
  if (!state || state.isGameOver) return;

  const raw = els.guessInput.value.trim();
  if (raw === '') {
    setInputError(true);
    showFeedback('请输入一个数字', 'error');
    return;
  }

  const guess = Number(raw);
  if (!Number.isInteger(guess)) {
    setInputError(true);
    showFeedback('请输入有效的整数', 'error');
    return;
  }

  if (guess < state.hintClampMin || guess > state.hintClampMax) {
    setInputError(true);
    showFeedback(`请输入 ${state.hintClampMin} ~ ${state.hintClampMax} 之间的数字`, 'error');
    return;
  }

  // Valid guess
  els.guessInput.value = '';
  setInputError(false);
  state.remainingGuesses--;

  let result;
  if (guess === state.targetNumber) {
    result = 'win';
    state.status = 'won';
    state.isGameOver = true;
  } else if (guess > state.targetNumber) {
    result = 'high';
  } else {
    result = 'low';
  }

  state.history.push({
    guess,
    result,
    timestamp: Date.now()
  });

  // Check loss condition
  if (state.remainingGuesses <= 0 && state.status !== 'won') {
    state.status = 'lost';
    state.isGameOver = true;
  }

  saveState();
  renderAll();

  if (result === 'win') {
    showFeedback(`🎉 猜对了！就是 ${guess}`, 'success');
    setTimeout(() => showGameOverModal(), 800);
  } else if (state.isGameOver && state.status === 'lost') {
    showFeedback(`😢 游戏结束！答案是 ${state.targetNumber}`, 'error');
    setTimeout(() => showGameOverModal(), 800);
  } else {
    showFeedback(result === 'high' ? '📈 高了，再小一点' : '📉 低了，再大一点', 'info');
  }
}

function useHint() {
  if (!state || state.isGameOver) return;
  if (state.remainingGuesses <= 1) {
    showFeedback('剩余次数不足，无法使用提示', 'error');
    return;
  }

  // Consume one guess for the hint
  state.remainingGuesses--;
  const hintResult = generateHint(state.targetNumber, state.hintClampMin, state.hintClampMax, state.hintsUsed);
  state.hintsUsed++;

  if (hintResult.clampMin !== null) state.hintClampMin = hintResult.clampMin;
  if (hintResult.clampMax !== null) state.hintClampMax = hintResult.clampMax;

  saveState();
  renderAll();
  showFeedback(hintResult.hint, 'hint');
}

function showGameOverModal() {
  els.modal.classList.add('visible');
  els.modal.style.display = 'flex';

  if (state.status === 'won') {
    const score = calculateScore(state.remainingGuesses, state.difficulty);
    const config = getDifficultyConfig(state.difficulty);
    els.modalTitle.textContent = '🎉 恭喜过关！';
    els.modalBody.innerHTML = `
      <p>你用了 <strong>${state.history.length}</strong> 次猜中了数字 <strong>${state.targetNumber}</strong></p>
      <p>剩余次数：${state.remainingGuesses} / ${state.maxGuesses}</p>
      <p>难度系数：${config.coefficient}</p>
      <p class="score">得分：<strong>${score}</strong></p>
    `;
    // Save to scoreboard
    saveScoreToLocalStorage({
      date: new Date().toISOString(),
      difficulty: config.label,
      guessesUsed: state.history.length,
      remaining: state.remainingGuesses,
      score: score
    });
  } else {
    els.modalTitle.textContent = '😢 游戏结束';
    els.modalBody.innerHTML = `
      <p>目标数字是 <strong>${state.targetNumber}</strong></p>
      <p>共猜测 ${state.history.length} 次，次数耗尽</p>
      <p>下次加油！</p>
    `;
  }

  els.modalBtn.textContent = '再来一局';
  els.modalBtn.onclick = () => {
    els.modal.style.display = 'none';
    resetGame();
  };
}

function resetGame() {
  sessionStorage.removeItem(STATE_KEY);
  window.location.href = 'index.html';
}

// --- Scoreboard persistence ---
function saveScoreToLocalStorage(record) {
  try {
    const existing = JSON.parse(localStorage.getItem('guessNumberScores') || '[]');
    existing.push(record);
    localStorage.setItem('guessNumberScores', JSON.stringify(existing));
  } catch (e) { /* ignore */ }
}

// --- Event binding ---
document.addEventListener('DOMContentLoaded', () => {
  initGame();

  document.getElementById('submitBtn').addEventListener('click', submitGuess);
  document.getElementById('hintBtn').addEventListener('click', useHint);
  document.getElementById('guessInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitGuess();
  });
  document.getElementById('guessInput').addEventListener('focus', () => {
    setInputError(false);
  });
});