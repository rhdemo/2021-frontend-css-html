import { combineReducers } from "react-redux";
import { boardLocked, attack, bonus, playAgain } from "./socket";

const initialState = {
  board: {
    rows: 5,
    columns: 5
  },
  game: {
    state: "splash"
  },
  match: {
    state: {
      phase: "not-ready"
    }
  },
  player: {},
  error: {
    message: null
  }
};

function appReducer(state = initialState, action) {
  let game;
  let player;
  let opponent;
  let match;
  let result;
  let attacker;
  let _activeBoard;
  let theActiveBoard;

  switch (action.type) {
    case "CONFIGURATION":
      game = action.payload.game;
      player = action.payload.player;
      opponent = action.payload.opponent;
      match = action.payload.match;

      _activeBoard = determineBoard(game, match, player);
      theActiveBoard = _activeBoard

      updateLocalStorage({
        gameId: game.uuid,
        playerId: player.uuid,
        username: player.username
      });

      console.log('match phase', match.state.phase);

      return {
        ...state,
        game,
        player,
        opponent,
        match,
        _activeBoard,
        theActiveBoard
      };

    case "GAME_STATE":
      game = action.payload.game;

      _activeBoard = determineBoard(game, state.match, state.player);
      theActiveBoard = _activeBoard

      return {
        ...state,
        game,
        _activeBoard,
        theActiveBoard 
      };

    case "BOARD_LOCKED":
      boardLocked(action.payload);
      return state;

    case "ATTACK":
      attack(action.payload);
      return state;

    case "BONUS":
      bonus(action.payload);
      return state;

    case "ATTACK_RESULT":
      console.log('processing attack result', action);
      game = action.payload.game;
      match = action.payload.match;
      player = action.payload.player;
      result = action.payload.result;
      attacker = action.payload.attacker;

      _activeBoard = determineBoard(game, match, player);

      return {
        ...state,
        player,
        match,
        result,
        attacker,
        _activeBoard
      };

    case "CHANGE_BOARD":
      theActiveBoard = determineBoard(state.game, state.match, state.player);

      return {
        ...state,
        theActiveBoard
      };

    case "PLAY_AGAIN":
      clearLocalStorage();
      state = undefined;
      playAgain();
      return appReducer(state, { type: null });

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

    case "BAD_ATTACK":
      return {
        ...state,
        badAttack: action.payload
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

function clearLocalStorage() {
  localStorage.clear();
}

function determineBoard(game, match, player) {
  if (!game || !match || !player) {
    return "ship";
  }

  if (game.state === "active" && match.state.phase === "not-ready") {
    return "ship";
  }

  if ((game.state === "active" || game.state === "paused") && (match.state.phase === "attack" || match.state.phase === "bonus")) {
    if (player.uuid === match.state.activePlayer) {
      return "attack";
    } else {
      return "ship";
    }
  }
}

export { appReducer, getLocalStorage };
