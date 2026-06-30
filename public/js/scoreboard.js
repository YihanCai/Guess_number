/**
 * Guess Number Game — Scoreboard Logic
 */

const SCORES_KEY = 'guessNumberScores';

function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function renderScoreboard() {
  const scores = loadScores();
  const body = document.getElementById('scoreboardBody');
  const empty = document.getElementById('emptyState');

  if (scores.length === 0) {
    body.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  body.innerHTML = '';

  // Show newest first
  const reversed = [...scores].reverse();
  for (const record of reversed) {
    const tr = document.createElement('tr');

    const date = new Date(record.date);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    tr.innerHTML = `
      <td class="cell-date">${dateStr}</td>
      <td><span class="badge-sm badge-${record.difficulty === '简单' ? 'easy' : record.difficulty === '困难' ? 'hard' : 'normal'}">${record.difficulty}</span></td>
      <td>${record.guessesUsed}</td>
      <td>${record.remaining}</td>
      <td class="cell-score">${record.score}</td>
    `;

    body.appendChild(tr);
  }
}

function clearScores() {
  if (!confirm('确定要清空所有战绩记录吗？')) return;
  localStorage.removeItem(SCORES_KEY);
  renderScoreboard();
}

document.addEventListener('DOMContentLoaded', () => {
  renderScoreboard();
  document.getElementById('clearBtn').addEventListener('click', clearScores);
});