// ===============================
// ESCAPE THE WEIRD WORLD GAME
// ===============================

let currentLevel = 0;

const levels = [
    {
        name: "🧊 Lazy Apartment",
        password: "PAST",
        objects: [
            {
                emoji: "🍪",
                title: "Cookie Jar",
                text: "You ate 3 cookies today.\nClue: P"
            },
            {
                emoji: "🧊",
                title: "Fridge",
                text: "Only 2 milk bottles left.\nClue: A"
            },
            {
                emoji: "📻",
                title: "Radio",
                text: "Lucky number today is 7.\nClue: S"
            },
            {
                emoji: "🍞",
                title: "Toaster",
                text: "Bread is overrated.\nClue: T"
            }
        ]
    },

    {
        name: "🚿 Worst Bathroom",
        password: "QUACK",
        objects: [
            {
                emoji: "🦆",
                title: "Rubber Duck",
                text: "QUACK QUACK...\nTranslation: Q"
            },
            {
                emoji: "🚿",
                title: "Shower",
                text: "Water is judging you.\nClue: U"
            },
            {
                emoji: "🧻",
                title: "Toilet Paper",
                text: "Emergency supply: A C K"
            }
        ]
    },

    {
        name: "🎮 Gamer Room",
        password: "NOOB",
        objects: [
            {
                emoji: "🎮",
                title: "Controller",
                text: "You pressed all buttons.\nClue: N"
            },
            {
                emoji: "💻",
                title: "PC",
                text: "Blue screen of skill issue.\nClue: O"
            },
            {
                emoji: "🍕",
                title: "Pizza Box",
                text: "Pizza is older than your GPU.\nClue: B"
            },
            {
            emoji: "📦",
            title: "Mysterious Box",
            text: "It contains nothing… like your ranked teammates.\n(No clue here 😂)"
            }
        ]
    },

    {
        name: "👽 Alien Office",
        password: "EARTH",
        objects: [
            {
                emoji: "👽",
                title: "Alien Boss",
                text: "We studied humans.\nConclusion: E"
            },
            {
                emoji: "📡",
                title: "Space Terminal",
                text: "Signal received from Earth.\nClue: A"
            },
            {
                emoji: "☕",
                title: "Cosmic Coffee",
                text: "Tastes like dark matter.\nClue: R"
            },
            {
                emoji: "🪐",
                title: "Planet Map",
                text: "Your home is marked.\nClue: T H"
            }
        ]
    }
];

// ===============================
// DOM ELEMENTS
// ===============================

const objectGrid = document.getElementById("objectGrid");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const passwordInput = document.getElementById("passwordInput");
const unlockBtn = document.getElementById("unlockBtn");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const successScreen = document.getElementById("successScreen");

// collected letters
let collected = "";

// ===============================
// LOAD LEVEL
// ===============================

function loadLevel() {

    const level = levels[currentLevel];

    document.getElementById("roomTitle").textContent =
        level.name;

    document.getElementById("roomDescription").textContent =
        "Explore objects and collect funny clues to unlock this room.";

    objectGrid.innerHTML = "";

    collected = "";
    passwordInput.value = "";

    updateUI();

    level.objects.forEach(obj => {

        const div = document.createElement("div");
        div.classList.add("object");

        div.innerHTML = `
            <span class="emoji">${obj.emoji}</span>
            <h3>${obj.title}</h3>
            <p>Click to inspect</p>
        `;

        div.onclick = () => openObject(obj);

        objectGrid.appendChild(div);
    });
}

// ===============================
// OPEN OBJECT
// ===============================

function openObject(obj) {

    modalTitle.textContent = obj.title;
    modalBody.innerText = obj.text;

    modal.style.display = "flex";

    // extract letters from clue text
    const match = obj.text.match(/Clue:\s*([A-Z ]+)/i);

    if (match) {
        const letters = match[1].replace(/\s/g, "");
        collected += letters;
        updateUI();
    }
}

// ===============================
// CLOSE MODAL
// ===============================

function closeModal() {
    modal.style.display = "none";
}

// ===============================
// UPDATE UI
// ===============================

function updateUI() {

    const level = currentLevel + 1;

    progressText.textContent =
        `${level} / ${levels.length} Rooms`;

    progressFill.style.width =
        `${(level / levels.length) * 100}%`;
}

// ===============================
// UNLOCK ROOM
// ===============================

unlockBtn.onclick = () => {

    const level = levels[currentLevel];

    if (passwordInput.value.toUpperCase() === level.password) {

        currentLevel++;

        if (currentLevel >= levels.length) {
            showWin();
        } else {
            loadLevel();
        }

    } else {
        alert("❌ Wrong password! Even Grandma is disappointed.");
    }
};

// ===============================
// WIN SCREEN
// ===============================

function showWin() {
    successScreen.style.display = "flex";
}

// ===============================
// CLOSE MODAL ON BACKDROP CLICK
// ===============================

window.onclick = function(e) {
    if (e.target === modal) {
        closeModal();
    }
};

// ===============================
// START GAME
// ===============================

loadLevel();