document.addEventListener('DOMContentLoaded', () => {
  let currentUsername = '';
  let wordLength = 5;
  let maxAttempts = 6;
  let secretWord = '';
  let currentAttempt = 0;
  let currentGuess = '';
  let isGameOver = false;
  let startTime = null;

  const currentUserDisplay = document.getElementById('current-user-display');
  const btnChangeUser = document.getElementById('btn-change-user');
  const btnShowRanking = document.getElementById('btn-show-ranking');
  const btnNewGame = document.getElementById('btn-new-game');
  const gridBoard = document.getElementById('grid-board');
  const messageContainer = document.getElementById('message-container');
  const keyboardContainer = document.getElementById('keyboard');

  const modalUser = document.getElementById('modal-user');
  const modalRanking = document.getElementById('modal-ranking');
  const inputUsername = document.getElementById('input-username');
  const btnSaveUser = document.getElementById('btn-save-user');
  const closeRanking = document.getElementById('close-ranking');
  const rankingBody = document.getElementById('ranking-body');

  const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  init();

  function init() {
    setupUser();
    setupEventListeners();
    renderKeyboard();
    startNewGame();
  }

  function setupUser() {
    currentUsername = StorageModule.getUser();
    if (!currentUsername) {
      modalUser.classList.add('active');
    } else {
      currentUserDisplay.textContent = currentUsername;
    }
  }

  function setupEventListeners() {
    btnSaveUser.addEventListener('click', () => {
      const val = inputUsername.value.trim();
      if (val) {
        StorageModule.setUser(val);
        currentUsername = val;
        currentUserDisplay.textContent = val;
        modalUser.classList.remove('active');
      }
    });

    btnChangeUser.addEventListener('click', () => {
      inputUsername.value = currentUsername;
      modalUser.classList.add('active');
    });

    btnShowRanking.addEventListener('click', () => {
      renderRanking();
      modalRanking.classList.add('active');
    });

    closeRanking.addEventListener('click', () => {
      modalRanking.classList.remove('active');
    });

    document.querySelectorAll('.btn-len').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-len').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        wordLength = parseInt(e.target.dataset.len, 10);
        maxAttempts = (wordLength === 5 || wordLength === 6) ? 6 : 7;
        startNewGame();
      });
    });

    btnNewGame.addEventListener('click', () => {
      startNewGame();
    });

    document.addEventListener('keydown', handlePhysicalKeyPress);
  }

async function startNewGame() {
  isGameOver = true;
  messageContainer.textContent = 'Obteniendo palabra... ⏳';

  // Llama al servicio asíncrono
  secretWord = await WordService.getRandomWord(wordLength);
  
  currentAttempt = 0;
  currentGuess = '';
  isGameOver = false;
  startTime = Date.now();
  messageContainer.textContent = '';

  renderBoard();
  resetKeyboardColors();
}

  function renderBoard() {
    gridBoard.innerHTML = '';
    gridBoard.style.gridTemplateColumns = `repeat(${wordLength}, 52px)`;

    for (let row = 0; row < maxAttempts; row++) {
      for (let col = 0; col < wordLength; col++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${row}-${col}`;
        gridBoard.appendChild(tile);
      }
    }
  }

  function renderKeyboard() {
    keyboardContainer.innerHTML = '';
    KEYBOARD_LAYOUT.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';
      row.forEach(key => {
        const keyBtn = document.createElement('button');
        keyBtn.className = 'key';
        keyBtn.setAttribute('data-key', key);
        if (key === 'ENTER' || key === 'BACKSPACE') {
          keyBtn.classList.add('large');
          keyBtn.textContent = key === 'BACKSPACE' ? '⌫' : 'ENTER';
        } else {
          keyBtn.textContent = key;
        }
        keyBtn.addEventListener('click', () => handleVirtualKeyPress(key));
        rowDiv.appendChild(keyBtn);
      });
      keyboardContainer.appendChild(rowDiv);
    });
  }

  function resetKeyboardColors() {
    document.querySelectorAll('.key').forEach(key => {
      key.classList.remove('correct', 'present', 'absent');
    });
  }

  function handlePhysicalKeyPress(e) {
    if (isGameOver || modalUser.classList.contains('active') || modalRanking.classList.contains('active')) return;

    const key = e.key.toUpperCase();
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else if (/^[A-ZÑ]$/i.test(key) && key.length === 1) {
      addLetter(key);
    }
  }

  function handleVirtualKeyPress(key) {
    if (isGameOver) return;
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else {
      addLetter(key);
    }
  }

  function addLetter(letter) {
    if (currentGuess.length < wordLength) {
      currentGuess += letter;
      const col = currentGuess.length - 1;
      const tile = document.getElementById(`tile-${currentAttempt}-${col}`);
      tile.textContent = letter;
      tile.classList.add('filled');
    }
  }

  function removeLetter() {
    if (currentGuess.length > 0) {
      const col = currentGuess.length - 1;
      const tile = document.getElementById(`tile-${currentAttempt}-${col}`);
      tile.textContent = '';
      tile.classList.remove('filled');
      currentGuess = currentGuess.slice(0, -1);
    }
  }

  function submitGuess() {
    if (currentGuess.length !== wordLength) {
      messageContainer.textContent = `La palabra debe tener ${wordLength} letras.`;
      return;
    }

    messageContainer.textContent = '';
    const statusArray = evaluateGuess(currentGuess, secretWord);

    for (let i = 0; i < wordLength; i++) {
      const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
      const status = statusArray[i];
      tile.classList.add(status);
      updateKeyboardKey(currentGuess[i], status);
    }

    if (currentGuess === secretWord) {
      endGame(true);
    } else {
      currentAttempt++;
      currentGuess = '';
      if (currentAttempt >= maxAttempts) {
        endGame(false);
      }
    }
  }

  function evaluateGuess(guess, target) {
    const result = new Array(wordLength).fill('absent');
    const targetCounts = {};

    for (let char of target) {
      targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    for (let i = 0; i < wordLength; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
        targetCounts[guess[i]]--;
      }
    }

    for (let i = 0; i < wordLength; i++) {
      if (result[i] !== 'correct') {
        const char = guess[i];
        if (targetCounts[char] && targetCounts[char] > 0) {
          result[i] = 'present';
          targetCounts[char]--;
        }
      }
    }

    return result;
  }

  function updateKeyboardKey(letter, status) {
    const keyBtn = document.querySelector(`.key[data-key="${letter}"]`);
    if (!keyBtn) return;

    if (status === 'correct') {
      keyBtn.classList.remove('present', 'absent');
      keyBtn.classList.add('correct');
    } else if (status === 'present' && !keyBtn.classList.contains('correct')) {
      keyBtn.classList.remove('absent');
      keyBtn.classList.add('present');
    } else if (status === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
      keyBtn.classList.add('absent');
    }
  }

  function endGame(won) {
    isGameOver = true;
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    if (won) {
      const record = StorageModule.saveScore({
        username: currentUsername || 'Jugador Anónimo',
        wordLength,
        attemptsUsed: currentAttempt + 1,
        maxAttempts,
        elapsedSeconds
      });
      messageContainer.textContent = `¡Felicidades! Ganaste con ${record.score} pts 🎉`;
    } else {
      messageContainer.textContent = `¡Fin del juego! La palabra era: ${secretWord}`;
    }
  }

  function renderRanking() {
    const rankings = StorageModule.getRankings().slice(0, 10);
    rankingBody.innerHTML = '';

    if (rankings.length === 0) {
      rankingBody.innerHTML = '<tr><td colspan="6">No hay registros aún</td></tr>';
      return;
    }

    rankings.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.username}</td>
        <td>${item.wordLength}</td>
        <td>${item.attemptsUsed}/${item.maxAttempts}</td>
        <td><strong>${item.score}</strong></td>
        <td>${item.date}</td>
      `;
      rankingBody.appendChild(tr);
    });
  }
});

// Agrega esta función de Confeti nativo en JS al final de js/app.js
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 8 + 4,
    color: ['#2ea043', '#d29922', '#58a6ff', '#f85149', '#a371f7'][Math.floor(Math.random() * 5)],
    speedY: Math.random() * 3 + 2,
    speedX: Math.random() * 2 - 1,
    rotation: Math.random() * 360
  }));

  let animationFrame;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += 2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (particles.some(p => p.y < canvas.height)) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }
  render();
}

// Reemplaza addLetter en js/app.js para agregar la clase .pop
function addLetter(letter) {
  if (currentGuess.length < wordLength) {
    currentGuess += letter;
    const col = currentGuess.length - 1;
    const tile = document.getElementById(`tile-${currentAttempt}-${col}`);
    tile.textContent = letter;
    tile.classList.add('filled', 'pop');
    setTimeout(() => tile.classList.remove('pop'), 150);
  }
}

// Reemplaza submitGuess para aplicar la animación Flip escalonada
function submitGuess() {
  if (currentGuess.length !== wordLength) {
    messageContainer.textContent = `La palabra debe tener ${wordLength} letras.`;
    return;
  }

  messageContainer.textContent = '';
  const statusArray = evaluateGuess(currentGuess, secretWord);

  for (let i = 0; i < wordLength; i++) {
    const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
    const status = statusArray[i];

    // Animación escalonada (flip)
    setTimeout(() => {
      tile.classList.add('flip');
      tile.classList.add(status);
      updateKeyboardKey(currentGuess[i], status);
    }, i * 200);
  }

  const delayTotal = wordLength * 200;

  setTimeout(() => {
    if (currentGuess === secretWord) {
      // Aplicar baile a las letras ganadoras
      for (let i = 0; i < wordLength; i++) {
        const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
        tile.classList.add('dance');
      }
      endGame(true);
    } else {
      currentAttempt++;
      currentGuess = '';
      if (currentAttempt >= maxAttempts) {
        endGame(false);
      }
    }
  }, delayTotal + 100);
}

// Actualiza endGame para activar el Confeti
function endGame(won) {
  isGameOver = true;
  const elapsedSeconds = (Date.now() - startTime) / 1000;

  if (won) {
    const record = StorageModule.saveScore({
      username: currentUsername || 'Jugador Anónimo',
      wordLength,
      attemptsUsed: currentAttempt + 1,
      maxAttempts,
      elapsedSeconds
    });

    launchConfetti();
    messageContainer.innerHTML = `<span style="color: #3fb950;">¡VICTORIA! 🎉 Puntos: ${record.score}</span>`;
  } else {
    messageContainer.textContent = `¡Fin del juego! La palabra era: ${secretWord}`;
  }
}