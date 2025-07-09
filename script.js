let balance = 1000;
let bet = 90;
let bombs = [];
let gameStarted = false;
let mineCount = 3;
let multiplier = 1.0;
let revealedTiles = 0;
let tilesRevealed = 0;
let isMuted = false;

function updateUI() {
  animateValue("balance", balance);
  document.getElementById("betAmount").textContent = bet.toFixed(0);
  document.getElementById("mineCount").textContent = mineCount;
  animateValue("multiplierBot", multiplier);
}

function startGame() {
  if (gameStarted || bet > balance) return;

  gameStarted = true;
  tilesRevealed = 0;
  revealedTiles = 0;
  multiplier = 1.0;
  bombs = generateBombs(mineCount);

  balance -= bet;
  animateValue("balance", balance);
  animateValue("multiplierBot", multiplier);
  document.getElementById("winnings").textContent = "0.00";

  updateUI();
  createGrid();
  disableControls();
  updateMainButton("cancel");
}

function cashOut() {
  const winnings = bet * multiplier;
  if (!isMuted) document.getElementById("winSound").play();

  balance += winnings;
  animateValue("balance", balance);
  showPopup(winnings);
  resetGame();
}

function cancelGame() {
  balance += bet;
  animateValue("balance", balance);
  resetGame();
}

function resetGame() {
  gameStarted = false;
  bombs = [];
  tilesRevealed = 0;
  revealedTiles = 0;
  multiplier = 1.0;
  updateUI();
  createGrid();
  enableControls();
  updateMainButton("start");
}

function handleMainAction() {
  const btn = document.getElementById("mainActionButton");
  const label = btn.textContent.trim();

  if (label === "▶ Start Game") {
    startGame();
  } else if (label === "❌ Cancel") {
    cancelGame();
  } else if (label === "💸 Cash Out") {
    cashOut();
  }
}

function updateMainButton(state) {
  const btn = document.getElementById("mainActionButton");

  if (state === "start") {
    btn.textContent = "▶ Start Game";
    btn.className = "button btn-start";
  } else if (state === "cancel") {
    btn.textContent = "❌ Cancel";
    btn.className = "button btn-cancel";
  } else if (state === "cashout") {
    btn.textContent = "💸 Cash Out";
    btn.className = "button btn-cashout";
  }
}

function changeBet(type) {
  if (type === "min") bet = 10;
  else if (type === "-") bet = Math.max(10, bet - 10);
  else if (type === "+") bet = Math.min(balance, bet + 10);
  else if (type === "max") bet = Math.min(balance, 500);
  updateUI();
}

function changeMines(type) {
  if (type === "-" && mineCount > 1) mineCount--;
  if (type === "+" && mineCount < 20) mineCount++;
  updateUI();
}

function generateBombs(count) {
  const indexes = [];
  while (indexes.length < count) {
    const rand = Math.floor(Math.random() * 25);
    if (!indexes.includes(rand)) indexes.push(rand);
  }
  return indexes;
}

function createGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let i = 0; i < 25; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.innerHTML = `
      <div class="tile-inner">
        <div class="tile-front"></div>
        <div class="tile-back"></div>
      </div>
    `;

    tile.addEventListener("click", () => handleClick(tile, i));
    grid.appendChild(tile);
  }
}

function handleClick(tile, index) {
  if (!gameStarted || tile.classList.contains("revealed")) return;

  tile.classList.add("revealed");

  const back = tile.querySelector(".tile-back");

  if (!isMuted) document.getElementById("flipSound").play();

  if (bombs.includes(index)) {
    back.style.backgroundImage = "url('assets/images/bomb.webp')";
    back.innerHTML = "";
    if (!isMuted) document.getElementById("bombSound").play();
    showBombPopup();
  } else {
    back.style.backgroundImage = "url('assets/images/diamond.webp')";
    back.innerHTML = "";

    revealedTiles++;
    tilesRevealed++;
    multiplier += 0.2;

    animateValue("multiplierBot", multiplier);
    animateValue("winnings", bet * multiplier);

    if (tilesRevealed === 1) updateMainButton("cashout");
  }
}

function toggleMute() {
  isMuted = !isMuted;
  const muteBtn = document.getElementById("muteButton");
  muteBtn.textContent = isMuted ? "🔇" : "🔊";

  if (isMuted) {
    document.getElementById("winSound").pause();
    document.getElementById("bgMusic")?.pause();
  } else {
    document.getElementById("bgMusic")?.play();
  }
}

function disableControls() {
  document.querySelectorAll('.bet-btn, .mines-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('disabled-btn');
  });
}

function enableControls() {
  document.querySelectorAll('.bet-btn, .mines-btn').forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('disabled-btn');
  });
}

function showPopup(amount) {
  const popup = document.getElementById("popup");
  const amountSpan = document.getElementById("popup-amount");

  animateValue("popup-amount", amount, 1000);
  popup.classList.remove("hidden");

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  setTimeout(() => {
    popup.classList.add("hidden");
  }, 3000);
}

function showBombPopup() {
  const popup = document.getElementById("bombPopup");
  popup.classList.remove("hidden");

  setTimeout(() => {
    popup.classList.add("hidden");
    resetGame();
  }, 2500);
}

function animateValue(id, end, duration = 800) {
  const obj = document.getElementById(id);
  if (!obj) return;

  let start = parseFloat(obj.textContent.replace(/[^0-9.-]+/g, "")) || 0;
  const range = end - start;
  const stepTime = Math.max(20, duration / Math.abs(range || 1));
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const value = start + (range * Math.min(progress / duration, 1));
    obj.textContent = value.toFixed(2);
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      obj.textContent = end.toFixed(2);
    }
  }

  requestAnimationFrame(step);
}

// ▶️ Initialize game
createGrid();
updateUI();
updateMainButton("start");




function generateNewLog() {
  const logBox = document.getElementById("logsBox");
  const usernames = [
    "luckybee33", "pixelninja", "user_king23", "nightwolf88",
    "cryptofox77", "gamer101", "sneakycat", "dreamcatcher", "spartan89"
  ];
  const messages = [
    "won $[amount] 🎉",
    "cashed out $[amount]",
    "earned $[amount] 💰",
    "withdrew $[amount]",
    "won $[amount] jackpot!"
  ];

  const user = usernames[Math.floor(Math.random() * usernames.length)];
  const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
  const amount = (Math.floor(Math.random() * 50) + 5) * 100; // $500–$5000
  const message = messageTemplate.replace("[amount]", amount.toLocaleString());

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement("div");
  div.textContent = `${time} — ${user} ${message}`;
  logBox.appendChild(div);

  // Keep only the last 5 logs visible
  while (logBox.children.length > 5) {
    logBox.removeChild(logBox.firstChild);
  }
}

// Call once at start
generateInitialLogs();

// Then repeat every 5 seconds
setInterval(generateNewLog, 5000);


function generateInitialLogs() {
  const logs = [];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const phone = `09${Math.floor(Math.random() * 90 + 10)}****${Math.floor(Math.random() * 900 + 100)}`;
    const amount = [150, 200, 300, 500, 1000][Math.floor(Math.random() * 5)];
    const log = `${timestamp} • ${phone} just cashed out ₱${amount} via GCash!`;
    logs.push(log);
  }

  const logsBox = document.getElementById("logsBox");
  logsBox.innerHTML = logs.map(msg => `<p>${msg}</p>`).join('');
}


function generateInitialLogs() {
  const logBox = document.getElementById("logsBox");
  const usernames = [
    "luckybee33", "pixelninja", "user_king23", "nightwolf88",
    "cryptofox77", "gamer101", "sneakycat", "dreamcatcher", "spartan89"
  ];
  const messages = [
    "won $[amount] 🎉",
    "cashed out $[amount]",
    "earned $[amount] 💰",
    "withdrew $[amount]",
    "won $[amount] jackpot!"
  ];

  for (let i = 0; i < 5; i++) {
    const user = usernames[Math.floor(Math.random() * usernames.length)];
    const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
    const amount = (Math.floor(Math.random() * 50) + 5) * 100; // e.g., $500 - $5,000
    const message = messageTemplate.replace("[amount]", amount.toLocaleString());

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement("div");
    div.textContent = `${time} — ${user} ${message}`;
    logBox.appendChild(div);
  }
}

function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  document.getElementById("datetime").textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call
