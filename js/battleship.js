// Battleship!
// This is where will manage the state of the Game
// States:
// 1. Lobby
// 2. Game
// 3. Pause
// 4. Game over

import Game from "./game.js";

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

const game = new Game(configuration);
game.start();
