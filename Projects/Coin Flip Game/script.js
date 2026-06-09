let wins = 0;
let losses = 0;
let streak = 0;

function play(choice) {
  const coin = document.getElementById("coin");
  const resultText = document.getElementById("result");

  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);

  coin.classList.add("flip");
  resultText.innerText = "Flipping...";

  setTimeout(() => {
    const result = Math.random() < 0.5 ? "heads" : "tails";

    coin.classList.remove("flip");
    coin.innerText = result === "heads" ? "🙂" : "🪙";

    if (choice === result) {
      wins++;
      streak++;
      resultText.innerText = `🎉 You Win! It was ${result}`;
    } else {
      losses++;
      streak = 0;
      resultText.innerText = `😢 You Lose! It was ${result}`;
    }

    updateStats();

    buttons.forEach(btn => btn.disabled = false);
  }, 1000);
}

function updateStats() {
  document.getElementById("wins").innerText = wins;
  document.getElementById("losses").innerText = losses;
  document.getElementById("streak").innerText = streak;
}
function resetGame() {
  wins = 0;
  losses = 0;
  streak = 0;

  document.getElementById("coin").innerText = "🪙";
  document.getElementById("result").innerText = "Game Reset! Choose Heads or Tails";

  updateStats();
}