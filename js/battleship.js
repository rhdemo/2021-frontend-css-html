// Battleship!
// This is where will manage the state of the Game
// States:
// 1. Lobby
// 2. Game
// 3. Pause
// 4. Game over

import socket from "./socket.js";
import Game from "./game.js";
import store from "./store.js";

const screens = [...document.querySelectorAll(".screen")];
let currentScreen = "splash";
let game;

// This will come from the server and ships will be randomly
// positioned
const initialState = {
  rows: 5,
  columns: 5,
  attacks: {
    "1x1": 5,
    "2x1": 5
  },
  ships: {
    "carrier": {
      id: 0,
      position: {
        x: 0,
        y: 0
      },
      type: "carrier",
      state: []
    },
    "patrol-boat": {
      id: 1,
      position: {
        x: 3,
        y: 3
      },
      type: "patrol-boat",
      state: []
    },
    "battleship": {
      id: 2,
      position: {
        x: 1,
        y: 2
      },
      type: "battleship",
      orientation: "horizontal",
      state: []
    }
  }
};

const configuration = {
  rows: 5,
  columns: 5,
  initialState
}

// const game = new Game(configuration);
// game.start();

function showScreen(screen) {
  if (screen === currentScreen) {
    return;
  }

  for (let i = 0; i < screens.length; i++) {
    if (screens[i].id === screen) {
      screens[i].removeAttribute("hidden");
      currentScreen = screen;    
    } else {
      screens[i].setAttribute("hidden", "");
    }
  }
}


store.subscribe(() => {
  showScreen(store.getState().game.state);
  // console.log(proxy.getState());
  // // console.log(store.getState());
  // // console.log(proxy.game.state);
});