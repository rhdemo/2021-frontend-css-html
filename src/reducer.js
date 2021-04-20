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

      // get the matchAttackResults from localStorage.
      // any gameUUID that doesn't match the current game
      // UUID should be deleted
      cleanMatchAttackResults(game.uuid);

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

      // check to see if the game uuid has changed.
      // if it's different, clear localStorage and
      // reload the page
      if (state.game.uuid && state.game.uuid !== game.uuid) {
        localStorage.clear();
        window.location.reload();
        return;
      }

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
      
      // store the attack result for replay
      storeMatchAttackResults(action);
      
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

    case "SCORE_UPDATE":
      if (state.attacker !== state.player.uuid) {
        return {
          ...state
        };
      }

      const scoreDelta = action.payload.delta;
      let score;
      
      // get the score from the current match in localStorage
      // and increment it
      const matchAttackResults = getMatchAttackResults();
      const gameMatches = matchAttackResults[state.game.uuid].matches;

      for (let i = 0; i < gameMatches.length; i++) {
        if (gameMatches[i].matchUUID === state.match.uuid) {
          const currentMatch = gameMatches[i];
          currentMatch.score += scoreDelta;
          score = {
            current: currentMatch.score,
            delta: scoreDelta
          }
          break;
        }
      }

      // store everything again in localStorage
      localStorage.setItem("matchAttackResults", JSON.stringify(matchAttackResults));

      return {
        ...state,
        score
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

function getMatchAttackResults() {
  return JSON.parse(localStorage.getItem("matchAttackResults")) || {};
}

function storeMatchAttackResults(attack) {
  /*
  record each attack result for replay 
  structure
  {
    "gameUUID": "gameId",
    "matches": [
      {
        "matchUUID": "soemthing",
        "date": "fjkldas",
        "attacks": []
      }
    ]
  }
  */
  
  const matchAttacks = getMatchAttackResults();
  const gameId = attack.payload.game.uuid;
  const matchId = attack.payload.match.uuid;

  // search for the game
  let game = matchAttacks[gameId];

  // if we don't have the game, create it
  if (!game) {
    game = {
      gameUUID: gameId,
      matches: []
    }

    matchAttacks[gameId] = game;
  }

  // search for the match in the array
  let match = game.matches.find(match => match.matchUUID === matchId);
  

  // if we don't have a match yet, create it and push it to the
  // matchAttacks array
  if (!match) {
    match = {
      matchUUID: matchId,
      attacks: [],
      score: 0
    }

    game.matches.push(match);
  }

  // push the attack to the game
  match.attacks.push(attack);

  localStorage.setItem("matchAttackResults", JSON.stringify(matchAttacks));
}

function clearLocalStorage() {
  localStorage.removeItem("gameId");
  // localStorage.clear();
}

function cleanMatchAttackResults(gameUUID) {
  const matchAttackResults = getMatchAttackResults();

  Object.keys(matchAttackResults).forEach(key => {
    if (key !== gameUUID) {
      delete matchAttackResults[key];
    }
  });

  localStorage.setItem("matchAttackResults", JSON.stringify(matchAttackResults));
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

  if (game.state === "paused" && match.state.phase === "not-ready") {
    return "ship";
  }
}

// record each attack result for replay
// structure
// [
//   {
//     "gameUUID": "soemthing",
//     "date": "fjkldas",
//     "attacks": []
//   }
// ]

export { appReducer, getLocalStorage };
