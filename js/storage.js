const STORAGE_KEYS = {
  USER: 'wordle_user',
  RANKINGS: 'wordle_rankings'
};

const StorageModule = {
  getUser() {
    return localStorage.getItem(STORAGE_KEYS.USER) || '';
  },

  setUser(username) {
    localStorage.setItem(STORAGE_KEYS.USER, username.trim());
  },

  getRankings() {
    const raw = localStorage.getItem(STORAGE_KEYS.RANKINGS);
    return raw ? JSON.parse(raw) : [];
  },

  saveScore({ username, wordLength, attemptsUsed, maxAttempts, elapsedSeconds }) {
    const remainingAttempts = maxAttempts - attemptsUsed;
    const score = Math.max(0, (remainingAttempts + 1) * wordLength * 100 - Math.floor(elapsedSeconds));

    const newRecord = {
      username,
      wordLength,
      attemptsUsed,
      maxAttempts,
      score,
      date: new Date().toISOString().split('T')[0]
    };

    const rankings = this.getRankings();
    rankings.push(newRecord);
    rankings.sort((a, b) => b.score - a.score);

    localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(rankings));
    return newRecord;
  }
};