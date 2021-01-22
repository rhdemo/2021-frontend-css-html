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
  player: {}
};

function appReducer(state = initialState, action) {
  switch (action.type) {
    case "CONFIGURATION":
      const game = action.payload.game;
      const player = action.payload.player;
      const match = action.payload.match;

      updateLocalStorage({
        gameId: game.uuid,
        matchId: match.uuid,
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

      return state;

    default:
      return state;
  }
}

function getLocalStorage() {
  return {
    gameId: localStorage.getItem("gameId"),
    matchId: localStorage.getItem("matchId"),
    playerId: localStorage.getItem("playerId"),
    username: localStorage.getItem("username")
  };
}

function updateLocalStorage({ gameId, playerId, username, matchId }) {
  localStorage.setItem("gameId", gameId);
  localStorage.setItem("playerId", playerId);
  localStorage.setItem("matchId", matchId);
  localStorage.setItem("username", username);
}

export { appReducer, getLocalStorage };
