/**
 * Guess Number Game — Utility Functions
 */

const DIFFICULTIES = {
  easy:   { min: 1, max: 50,  guesses: 10, coefficient: 3,  label: '简单',  color: '#4caf50' },
  normal: { min: 1, max: 100, guesses: 7,  coefficient: 5,  label: '普通',  color: '#ffc107' },
  hard:   { min: 1, max: 200, guesses: 5,  coefficient: 10, label: '困难',  color: '#f44336' }
};

/**
 * Generate a random integer between min and max (inclusive).
 */
function generateTargetNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a hint string based on how many hints have already been used.
 * Each hint narrows the possibility space.
 * Returns an object: { hint: string, clampMin, clampMax } where clampMin/clampMax
 * are the updated range bounds (or null if unchanged).
 */
function generateHint(target, currentMin, currentMax, hintsUsed) {
  const range = currentMax - currentMin + 1;

  if (hintsUsed === 0) {
    // First hint: parity
    const parity = target % 2 === 0 ? '偶数' : '奇数';
    return { hint: `提示：目标数字是 ${parity}`, clampMin: null, clampMax: null };
  }

  if (hintsUsed === 1) {
    // Second hint: upper/lower half of current range
    const mid = Math.floor((currentMin + currentMax) / 2);
    if (target <= mid) {
      return { hint: `提示：目标数字 ≤ ${mid}`, clampMin: null, clampMax: mid };
    } else {
      return { hint: `提示：目标数字 > ${mid}`, clampMin: mid + 1, clampMax: null };
    }
  }

  if (hintsUsed === 2) {
    // Third hint: divisible by 3
    const div3 = target % 3 === 0;
    return { hint: `提示：目标数字${div3 ? '能' : '不能'}被 3 整除`, clampMin: null, clampMax: null };
  }

  // Fourth+ hint: narrow to a quarter of the range
  const quarter = Math.ceil(range / 4);
  const qStart = currentMin + quarter * (hintsUsed % 4);
  const qEnd = Math.min(qStart + quarter - 1, currentMax);
  if (target >= qStart && target <= qEnd) {
    return { hint: `提示：目标数字在 ${qStart} ~ ${qEnd} 之间`, clampMin: qStart, clampMax: qEnd };
  }
  return { hint: `提示：目标数字不在 ${qStart} ~ ${qEnd} 之间`, clampMin: null, clampMax: null };
}

/**
 * Calculate score for a won game.
 * Score = remaining guesses × difficulty coefficient
 */
function calculateScore(remainingGuesses, difficultyKey) {
  const coeff = DIFFICULTIES[difficultyKey].coefficient;
  return remainingGuesses * coeff;
}

/**
 * Get difficulty config from query string or session storage key.
 */
function getDifficultyConfig(key) {
  return DIFFICULTIES[key] || DIFFICULTIES.normal;
}
