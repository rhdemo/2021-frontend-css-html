import { boardLocked, attack } from "./socket";

const initialState = {
  board: {
    rows: 5,
    columns: 5
  },
  game: {
    state: "splash"
  },
  match: {
    ready: false
  },
  player: {},
  error: {
    message: null
  }
};

function appReducer(state = initialState, action) {
  switch (action.type) {
    case "CONFIGURATION":
      const game = action.payload.game;
      const player = action.payload.player;
      const match = action.payload.match;

      updateLocalStorage({
        gameId: game.uuid,
        playerId: player.uuid,
        username: player.username
      });

      console.log('ready', match.ready);

      return {
        ...state,
        game,
        player,
        match
      };

    case "BOARD_LOCKED":
      boardLocked(action.payload);
      return state;

    case "ATTACK":
      attack(action.payload);
      return state;

    case "SHOW_ERROR_MESSAGE":
      return {
        ...state,
        error: {
          message: action.payload
        }
      };

    case "HIDE_ERROR_MESSAGE":
      return {
        ...state,
        error: {
          message: null
        }
      };

    default:
      return state;
  }
}

function getLocalStorage() {
  return {
    gameId: localStorage.getItem("gameId"),
    playerId: localStorage.getItem("playerId"),
    username: localStorage.getItem("username")
  };
}

function updateLocalStorage({ gameId, playerId, username }) {
  localStorage.setItem("gameId", gameId);
  localStorage.setItem("playerId", playerId);
  localStorage.setItem("username", username);
}

export { appReducer, getLocalStorage };
