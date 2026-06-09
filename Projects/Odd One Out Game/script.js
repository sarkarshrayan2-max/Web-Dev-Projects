let score = 0;
let time = 10;
let timer;
let lock = false;
let oddIndex = -1;

const pools = [
  ["🐶","🐶","🐶","🐶","🐱","🐶"],
  ["⚽","⚽","⚽","⚽","🏀","⚽"],
  ["🚗","🚗","🚗","🚗","🚲","🚗"],
  ["🍕","🍕","🍕","🍕","🍔","🍕"],
  ["🎵","🎵","🎵","🎵","🎧","🎵"],
  ["🍎","🍎","🍎","🍎","🍌","🍎"]
];

function startGame() {
  score = 0;
  document.getElementById("score").innerText = score;
  nextRound();
}

function startTimer() {
  clearInterval(timer);
  time = 10;
  document.getElementById("time").innerText = time;

  timer = setInterval(() => {
    time--;
    document.getElementById("time").innerText = time;

    if (time <= 0) {
      clearInterval(timer);
      lock = true;
      document.getElementById("result").innerText = "⏰ Time Over!";
    }
  }, 1000);
}

function generateRound() {
  let items = [...pools[Math.floor(Math.random() * pools.length)]];

  // ensure exactly one odd
  let oddValues = ["🐱","🏀","🚲","🍔","🎧","🍌"];
  let odd = oddValues[Math.floor(Math.random() * oddValues.length)];

  oddIndex = Math.floor(Math.random() * items.length);
  items[oddIndex] = odd;

  return items;
}

function nextRound() {
  lock = false;
  let box = document.getElementById("gameBox");
  box.innerHTML = "";
  document.getElementById("result").innerText = "";

  let items = generateRound();

  items.forEach((val, i) => {
    let div = document.createElement("div");
    div.className = "item";
    div.innerText = val;

    div.onclick = () => handleClick(div, i);

    box.appendChild(div);
  });

  startTimer();
}

function handleClick(div, index) {
  if (lock) return;

  lock = true;

  if (index === oddIndex) {
    score++;
    div.classList.add("correct");
    document.getElementById("result").innerText = "✅ Correct!";
  } else {
    div.classList.add("wrong");
    document.getElementById("result").innerText = "❌ Wrong!";
  }

  document.getElementById("score").innerText = score;

  setTimeout(nextRound, 800);
}

startGame();