const descriptionEl = document.getElementById("description");
const roomNameEl = document.getElementById("room-name");
const inventoryEl = document.getElementById("inventory");
const srAnnouncementEl = document.getElementById("screen-reader-announce");
const sceneEl = document.getElementById("scene");

const state = {
  currentRoom: "start",
  inventory: [],
  hasLantern: false,
  hasKey: false,
  gameWon: false,
};

const rooms = {
  start: {
    name: "Moonlit Courtyard",
    description:
      "You stand in a moonlit courtyard. A stone archway leads east. To your west, a lantern hangs from a post. The air smells faintly of rain.",
    exits: { east: "garden", west: "lanternPost" },
    items: [],
  },
  lanternPost: {
    name: "Lantern Post",
    description:
      "A rusted lantern hangs from a metal post. The light flickers softly. You can return east to the courtyard.",
    exits: { east: "start" },
    items: ["lantern"],
  },
  garden: {
    name: "Whispering Garden",
    description:
      "A narrow garden path bends around roses and stone statues. A small door stands north. To the west is the courtyard.",
    exits: { west: "start", north: "innerGarden" },
    items: ["key"],
  },
  innerGarden: {
    name: "Inner Garden",
    description:
      "The air is still here. You see a locked gate ahead. A bronze plaque reads: 'Only the one who carries light may pass.'",
    exits: { south: "garden" },
    items: [],
    gateLocked: true,
  },
};

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function announce(text) {
  srAnnouncementEl.textContent = text;
}

function playTone(frequency = 440, duration = 0.12, type = "sine") {
  if (!("AudioContext" in window || "webkitAudioContext" in window)) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.04;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    gainNode.disconnect();
    oscillator.disconnect();
    audioCtx.close();
  }, duration * 1000);
}

function renderRoom() {
  const room = rooms[state.currentRoom];
  roomNameEl.textContent = room.name;
  descriptionEl.textContent = room.description;

  if (state.inventory.length === 0) {
    inventoryEl.textContent = "Empty";
  } else {
    inventoryEl.textContent = state.inventory.join(", ");
  }

  sceneEl.focus();
}

function describeCurrentRoom() {
  const room = rooms[state.currentRoom];
  const text = `${room.name}. ${room.description}`;
  descriptionEl.textContent = text;
  speak(text);
  announce(text);
}

function getCurrentRoom() {
  return rooms[state.currentRoom];
}

function go(direction) {
  const room = getCurrentRoom();
  const nextRoom = room.exits[direction];

  if (!nextRoom) {
    const message = "You cannot go that way.";
    descriptionEl.textContent = message;
    speak(message);
    announce(message);
    playTone(180, 0.15, "triangle");
    return;
  }

  state.currentRoom = nextRoom;

  if (state.currentRoom === "innerGarden" && !state.hasLantern) {
    const message =
      "The passage is too dark. You need a light source before you can continue.";
    descriptionEl.textContent = message;
    speak(message);
    announce(message);
    state.currentRoom = "garden";
    playTone(120, 0.22, "sawtooth");
    return;
  }

  if (state.currentRoom === "innerGarden" && state.hasLantern && !state.gameWon) {
    const message =
      "You carry the lantern. The gate opens. Congratulations, you have escaped the garden.";
    descriptionEl.textContent = message;
    speak(message);
    announce(message);
    playTone(660, 0.2, "square");
    state.gameWon = true;
    renderRoom();
    return;
  }

  renderRoom();
  playTone(440, 0.08, "sine");
  describeCurrentRoom();
}

function takeItem() {
  const room = getCurrentRoom();
  const item = room.items[0];

  if (!item) {
    const message = "There is nothing here to take.";
    speak(message);
    announce(message);
    descriptionEl.textContent = message;
    playTone(180, 0.14, "triangle");
    return;
  }

  if (state.inventory.includes(item)) {
    const message = `You already have the ${item}.`;
    speak(message);
    announce(message);
    descriptionEl.textContent = message;
    return;
  }

  state.inventory.push(item);

  if (item === "lantern") {
    state.hasLantern = true;
  }

  if (item === "key") {
    state.hasKey = true;
  }

  room.items = [];

  const message = `You take the ${item}.`;
  descriptionEl.textContent = message;
  speak(message);
  announce(message);
  playTone(520, 0.12, "square");
  renderRoom();
}

function useItem() {
  if (!state.hasLantern) {
    const message = "You do not have anything to use right now.";
    descriptionEl.textContent = message;
    speak(message);
    announce(message);
    return;
  }

  if (state.currentRoom === "innerGarden") {
    const message = "You use the lantern to reveal the hidden lock. The gate is open.";
    descriptionEl.textContent = message;
    speak(message);
    announce(message);
    state.gameWon = true;
    renderRoom();
    return;
  }

  const message = "There is nothing useful to use here.";
  descriptionEl.textContent = message;
  speak(message);
  announce(message);
}

function lookAround() {
  const room = getCurrentRoom();
  const exits = Object.keys(room.exits);

  const message = `You are in ${room.name}. Exits: ${exits.join(", ")}. ${
    room.items.length ? `You see ${room.items.join(", ")}.` : "There is nothing else here."
  }`;

  descriptionEl.textContent = message;
  speak(message);
  announce(message);
}

function inventoryStatus() {
  const items = state.inventory.length ? state.inventory.join(", ") : "Empty";
  const message = `Your inventory contains: ${items}.`;
  descriptionEl.textContent = message;
  speak(message);
  announce(message);
}

function helpText() {
  const message =
    "Controls: W or Arrow Up to move north, A or Arrow Left to move west, S or Arrow Down to move south, D or Arrow Right to move east. L to look, I for inventory, T to take, U to use, H for help, Q to quit.";
  descriptionEl.textContent = message;
  speak(message);
  announce(message);
}

function quitGame() {
  const message = "The adventure ends here. Press any movement key to start again.";
  descriptionEl.textContent = message;
  speak(message);
  announce(message);
  playTone(150, 0.18, "sawtooth");
  state.currentRoom = "start";
  state.inventory = [];
  state.hasLantern = false;
  state.hasKey = false;
  state.gameWon = false;
  renderRoom();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["w", "arrowup"].includes(key)) {
    event.preventDefault();
    go("north");
  } else if (["a", "arrowleft"].includes(key)) {
    event.preventDefault();
    go("west");
  } else if (["s", "arrowdown"].includes(key)) {
    event.preventDefault();
    go("south");
  } else if (["d", "arrowright"].includes(key)) {
    event.preventDefault();
    go("east");
  } else if (key === "l") {
    lookAround();
  } else if (key === "i") {
    inventoryStatus();
  } else if (key === "h") {
    helpText();
  } else if (key === "t") {
    takeItem();
  } else if (key === "u") {
    useItem();
  } else if (key === "q") {
    quitGame();
  }
});

renderRoom();
describeCurrentRoom();
