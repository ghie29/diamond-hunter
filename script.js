let balance = 1000;
let bet = 1;
let bombs = [];
let gameStarted = false;
let mineCount = 1;
let multiplier = 1.04; // 👈 set default for 1 mine
let revealedTiles = 0;
let isMuted = false;
let tilesRevealed = 0;


function calculateBaseMultiplier(mineCount) {
  // Base multiplier for 1 mine
  const base = 1.04;
  const maxMines = 24;
  const maxMultiplier = 3.14;

  if (mineCount <= 1) return base;
  if (mineCount >= maxMines) return maxMultiplier;

  const multiplier = base + (mineCount - 1) * ((maxMultiplier - base) / (maxMines - 1));
  return parseFloat(multiplier.toFixed(2));
}



function calculateStartingMultiplier(mines) {
  const totalTiles = 25;
  const safeTiles = totalTiles - mines;

  if (safeTiles <= 0 || mines >= totalTiles) return 0;

  const base = 1.04; // Starting multiplier for 1 mine

  // Use logarithmic scale to simulate realistic risk-reward curve
  const multiplier = base + Math.log10(mines + 1) * 1.5;

  return parseFloat(multiplier.toFixed(2));
}


function updateUI() {
  const betInput = document.getElementById("betInput");
  const mineInput = document.getElementById("mineInput");

  if (betInput) betInput.value = bet;
  if (mineInput) mineInput.value = mineCount;

  animateValue("multiplierBot", multiplier);
  animateValue("balance", balance);
}

// Allow direct typing
document.getElementById("betInput").addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  if (!isNaN(value) && value >= 1 && value <= balance) {
    bet = value;
    updateUI();
  }
});

document.getElementById("mineInput").addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  if (!isNaN(value) && value >= 1 && value <= 24) {
    mineCount = value;
    multiplier = calculateBaseMultiplier(mineCount);
    updateUI();
  }
});



function startGame() {
  if (gameStarted || bet > balance) return;
  gameStarted = true;
  revealedTiles = 0;
  bombs = generateBombs(mineCount);

  multiplier = calculateBaseMultiplier(mineCount); // ✅ Use calculated base multiplier

  animateValue("balance", balance - bet);
  balance -= bet;

  animateValue("multiplierBot", multiplier);
  document.getElementById("winnings").textContent = "0.00";

  updateUI();
  createGrid();
  disableControls();
  document.getElementById("mainActionButton").textContent = "💸 Cash Out";
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
  updateUI();
  createGrid();
  enableControls();
  document.getElementById("mainActionButton").textContent = "▶ Start Game";
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
  if (type === "min") bet = 1;
  else if (type === "-") bet = Math.max(1, bet - 1);
  else if (type === "+") bet = Math.min(balance, bet + 1);
  else if (type === "max") bet = Math.min(balance, 500);
  updateUI();
}


function changeMines(type) {
  if (type === "-" && mineCount > 1) mineCount--;
  if (type === "+" && mineCount < 24) mineCount++;

  multiplier = calculateBaseMultiplier(mineCount); // ✅ Update multiplier with new mine count
  animateValue("multiplierBot", multiplier);       // ✅ Animate multiplier on screen

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
    if (!gameStarted) {
    showStartGamePopup(); // 👈 Show "please press start game" popup
    return;
  }

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
  document.querySelectorAll('.bet-btn, .mines-btn, .btn.small').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('disabled-btn');
  });
}


function enableControls() {
  document.querySelectorAll('.bet-btn, .mines-btn, .btn.small').forEach(btn => {
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
  if (!isMuted) document.getElementById("bombSound").play();

  // Shake the entire wrapper
  const wrapper = document.querySelector('.wrapper');
  wrapper.classList.add('shake');

  // Reset game after short delay
  setTimeout(() => {
    wrapper.classList.remove('shake');
    resetGame();
  }, 600);
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


const usedUsers = new Set();

function generateRandomUsername() {
  const names = ["mark", "john", "paul", "mike", "james", "ian", "leo", "jay", "josh", "rey",
  "jake", "ken", "marc", "eric", "ed", "louie", "neil", "ryan", "tom", "sam",
  "vince", "carl", "arlo", "dave", "jeff", "joel", "chris", "alden", "alvin", "ron",
  "bryan", "dan", "gabe", "don", "rj", "joey", "nate", "zack", "sean", "miguel", "miggy",
  "ced", "franz", "keith", "enzo", "migs", "noel", "pierce", "rolly", "ton", "wade",
  "caloy", "troy", "juris", "karlo", "raven", "elton", "jolo", "andrei", "cesar", "emil",
  "gino", "howie", "ice", "jasper", "kobe", "luis", "marlo", "omar", "pao", "ram",
  "steve", "ty", "ugo", "vic", "xian", "yves", "zoren", "aldo", "ben", "chito", "dennis",
  "ethan", "fritz", "gil", "henry", "ivan", "juno", "karl", "lem", "manny", "nash",
  "oscar", "phil", "quinn", "roland", "santi", "tim", "uly", "vince", "warren", "yuri"];
  let username;
  do {
    const name = names[Math.floor(Math.random() * names.length)];
    const number = Math.floor(Math.random() * 100);
    username = `${name}${number}`;
  } while (usedUsers.has(username));
  usedUsers.add(username);
  return username;
}

function generateMaskedGCashNumber() {
  const last2 = Math.floor(10 + Math.random() * 90); // Random 2-digit ending
  return `09***${last2}`;
}

function generateFakeLog() {
  if (usedUsers.size >= 500) return; // Limit fake entries

  const actions = [
    "successfully claimed",
    "received a GCash payout of",
    "cashed out via GCash:",
    "won and withdrew",
    "prize sent to GCash:"
  ];

  const username = generateRandomUsername();
  const gcash = generateMaskedGCashNumber();
  const amount = (Math.random() * 400 + 50).toFixed(2);
  const action = actions[Math.floor(Math.random() * actions.length)];

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString();

  const log = document.createElement("div");
  log.className = "log-item";
  log.textContent = `${date} ${time} - ${username} • ${gcash} ${action} ₱${amount}`;

  const logsBox = document.getElementById("logsBox");
  logsBox.prepend(log);

  while (logsBox.children.length > 5) {
    logsBox.removeChild(logsBox.lastChild);
  }
}


// Generate 5 logs on load
for (let i = 0; i < 5; i++) {
  setTimeout(generateFakeLog, i * 500); // small delay between each
}

// Continue generating every 6 seconds
setInterval(generateFakeLog, 6000);


function showStartGamePopup() {
  const popup = document.getElementById("startGamePopup");
  popup.classList.remove("hidden");

  setTimeout(() => {
    popup.classList.add("hidden");
  }, 2000); // Hide after 2 seconds
}
