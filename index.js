const gameBoard = document.getElementById("gameBoard");
const rollBtn = document.getElementById("rollBtn");
const turnText = document.getElementById("turn");
const diceResult = document.getElementById("diceResult");
const modeRadios = document.querySelectorAll('input[name="mode"]');
let gameMode = 2;

modeRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    gameMode = parseInt(
      document.querySelector('input[name="mode"]:checked').value
    );
    resetGame();
  });
});

const boardSize = 100;
const players = [
  { position: 1, element: null, class: "player1" },
  { position: 1, element: null, class: "player2" },
];
let currentPlayer = 0;
let playerNames = ["Player 1", "Player 2"];

const snakes = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

const ladders = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

function createBoard() {
  gameBoard.innerHTML = "";
  for (let i = boardSize; i > 0; i--) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.id = `square-${i}`;
    square.textContent = i;

    if (snakes[i]) {
      square.classList.add("snake-square");
      square.textContent += " 🐍 ";
    }
    if (ladders[i]) {
      square.classList.add("ladder-square");
      square.textContent += " 🪜";
    }

    gameBoard.appendChild(square);
  }
}

function placePlayers() {
  players.forEach((player, index) => {
    const square = document.getElementById(`square-${player.position}`);
    const token = document.createElement("div");
    token.classList.add("player", player.class);
    token.textContent = index === 0 ? "🐭" : "🐱";
    square.appendChild(token);
    player.element = token;
  });
}

function movePlayer(steps) {
  let player = players[currentPlayer];
  let current = player.position;
  let target = current + steps > 100 ? 100 : current + steps;

  let interval = setInterval(() => {
    const oldSquare = document.getElementById(`square-${player.position}`);
    if (player.element && oldSquare.contains(player.element)) {
      oldSquare.removeChild(player.element);
    }

    player.position += 1;

    const newSquare = document.getElementById(`square-${player.position}`);
    newSquare.appendChild(player.element);

    if (player.position >= target) {
      clearInterval(interval);

      let finalPos = player.position;
      let message = "";

      if (snakes[finalPos]) {
        finalPos = snakes[finalPos];
        message = `Oh no! ${playerNames[currentPlayer]} was bitten by a snake 🐍!`;
      } else if (ladders[finalPos]) {
        const climbed = ladders[finalPos] - finalPos;
        finalPos = ladders[finalPos];
        message = `Yay! ${playerNames[currentPlayer]} climbed a ladder 🪜 +${climbed} squares!`;
      }

      if (finalPos !== player.position) {
        setTimeout(() => {
          const fromSquare = document.getElementById(
            `square-${player.position}`
          );
          fromSquare.removeChild(player.element);
          const toSquare = document.getElementById(`square-${finalPos}`);
          toSquare.appendChild(player.element);
          player.position = finalPos;

          document.getElementById("actionMessage").textContent = message;
          updatePlayerPosition(currentPlayer);
        }, 300);
      } else {
        document.getElementById("actionMessage").textContent = message;
        updatePlayerPosition(currentPlayer);
      }

      if (player.position === 100) {
        turnText.textContent = `${playerNames[currentPlayer]} wins! 🏆`;
        launchConfetti();
        rollBtn.disabled = true;
        return;
      }

      currentPlayer = currentPlayer === 0 ? 1 : 0;
      turnText.textContent = `${playerNames[currentPlayer]}'s Turn 🎲`;
    }
  }, 300);
}

rollBtn.addEventListener("click", () => {
  const roll = Math.floor(Math.random() * 6) + 1;
  const diceImg = document.getElementById("diceImg");
  diceImg.classList.add("animate-roll");
  setTimeout(() => {
    diceImg.src = `https://upload.wikimedia.org/wikipedia/commons/${diceRollImagePath(
      roll
    )}`;
    diceImg.classList.remove("animate-roll");
    diceResult.textContent = `You rolled a ${roll}`;
    movePlayer(roll);
    if (gameMode === 1 && currentPlayer === 1) {
      rollBtn.disabled = true;
      setTimeout(() => {
        const comRoll = Math.floor(Math.random() * 6) + 1;
        diceImg.src = `https://upload.wikimedia.org/wikipedia/commons/${diceRollImagePath(
          comRoll
        )}`;
        diceResult.textContent = `Computer rolled a ${comRoll}`;
        movePlayer(comRoll);
        rollBtn.disabled = false;
      }, 1000);
    }
  }, 600);
});

function diceRollImagePath(num) {
  const paths = {
    1: "1/1b/Dice-1-b.svg",
    2: "5/5f/Dice-2-b.svg",
    3: "b/b1/Dice-3-b.svg",
    4: "f/fd/Dice-4-b.svg",
    5: "0/08/Dice-5-b.svg",
    6: "2/26/Dice-6-b.svg",
  };
  return paths[num];
}

function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;
  const colors = ["#bb0000", "#ffffff", "#00bb00", "#0000bb"];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

document.getElementById("startGameBtn").addEventListener("click", () => {
  const name1 = document.getElementById("player1Name").value.trim();
  const name2 = document.getElementById("player2Name").value.trim();
  if (name1) playerNames[0] = name1;
  if (name2) playerNames[1] = name2;
  turnText.textContent = `${playerNames[currentPlayer]}'s Turn 🎲`;
});

const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
let musicPlaying = false;

musicToggle.addEventListener("click", () => {
  if (!musicPlaying) {
    bgMusic.play();
    musicToggle.textContent = "⏸️ Pause Music";
  } else {
    bgMusic.pause();
    musicToggle.textContent = "🎵 Play Music";
  }
  musicPlaying = !musicPlaying;
});

createBoard();
placePlayers();

function resetGame() {
  players[0].position = 1;
  players[1].position = 1;
  currentPlayer = 0;
  document.getElementById("gameBoard").innerHTML = "";
  createBoard();
  placePlayers();
  turnText.textContent = `${playerNames[currentPlayer]}'s Turn 🎲`;
  diceResult.textContent = "";
  rollBtn.disabled = false;
  document.getElementById("actionMessage").textContent = "";
}

function updatePlayerPosition(playerIndex) {
  document
    .querySelectorAll(`.player${playerIndex + 1}`)
    .forEach((e) => e.remove());
  const player = players[playerIndex];
  const square = document.getElementById(`square-${player.position}`);
  const token = document.createElement("div");
  token.classList.add("player", player.class);
  token.textContent = playerIndex === 0 ? "🐭" : "🐱";

  const message = document.getElementById("actionMessage").textContent;
  if (message.includes("climbed a ladder")) {
    token.classList.add("bounce");
  } else if (message.includes("bitten by a snake")) {
    token.classList.add("shake");
  } else if (message.includes("wins")) {
    token.classList.add("winner");
  }

  square.appendChild(token);
  player.element = token;
}
