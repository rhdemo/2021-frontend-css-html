import { boardLocked, attack, bonus, playAgain } from "./socket";
import store from "./store";

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
  },
  score: {
    total: 0,
    delta: 0
  },
  highScore: 0
};

let replay = false;
let interval;

function appReducer(state = initialState, action) {
  let game;
  let player;
  let opponent;
  let match;
  let result;
  let attacker;
  let _activeBoard;
  let theActiveBoard;
  let score;
  let highScore;

  switch (action.type) {
    case "CONFIGURATION":
      game = action.payload.game;
      player = action.payload.player;
      opponent = action.payload.opponent;
      match = action.payload.match;
      score = getCurrentMatchScore(game, match);
      score.delta = 0;
      highScore = getHighScore(game);

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

      // console.log('match phase', match.state.phase);

      return {
        ...state,
        game,
        player,
        opponent,
        match,
        score,
        highScore,
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
      theActiveBoard = _activeBoard;

      if (game.state === "replay") {
        replay = true;
        const matchAttackResults = getMatchAttackResults();
        const storedGame = matchAttackResults[game.uuid];
        const matches = storedGame.matches;
        
        let matchCount = 0;
        let count = 0;
        // const totalMatches = matches.length;
        const totalMatches = 1;
        const initialReplayShipGridConfiguration = matches[matchCount].attacks[0].payload.player.board.positions;

        interval = setInterval(() => {
          store.dispatch(matches[matchCount].attacks[count]);
          count++;

          if (count === matches[matchCount].attacks.length) {
            matchCount++;

            if (matchCount !== totalMatches) {
              return;
            }

            replay = false;
            // console.log("replay over");
            clearInterval(interval);
          }
        }, 500);

        return {
          ...state,
          game,
          initialReplayShipGridConfiguration
        };
      } else {
        if (interval) {
          clearInterval(interval);
        }
      }

      highScore = getHighScore(game);

      return {
        ...state,
        game,
        highScore,
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
      // console.log('processing attack result', action);
      
      // store the attack result for replay only if the game state
      // is not in replay
      if (!replay) {
        storeMatchAttackResults(action);
      }
      
      game = action.payload.game;
      match = action.payload.match;
      player = action.payload.player;
      result = action.payload.result;
      attacker = action.payload.attacker;
      opponent = action.payload.opponent;
      score = getCurrentMatchScore(game, match);

      _activeBoard = determineBoard(game, match, player, replay, attacker);

      if (replay) {
        theActiveBoard = _activeBoard;
      }

      const returnData = {
        ...state,
        player,
        match,
        result,
        attacker,
        opponent,
        score,
        _activeBoard
      }

      if (replay) {
        returnData.theActiveBoard = theActiveBoard;
        returnData.replay = true;
      }

      return returnData;

    case "CHANGE_BOARD":
      theActiveBoard = determineBoard(state.game, state.match, state.player);

      return {
        ...state,
        theActiveBoard
      };

    case "SCORE_UPDATE":
      score = action.payload;

      // store the match score in localStorage
      const matchAttackResults = getMatchAttackResults();
      const gameMatches = matchAttackResults[state.game.uuid].matches;

      for (let i = 0; i < gameMatches.length; i++) {
        if (gameMatches[i].matchUUID === state.match.uuid) {
          const currentMatch = gameMatches[i];
          const updatedScore = {
            total: currentMatch.score.total += score.delta,
            delta: score.delta
          };

          currentMatch.score = updatedScore;
          score = updatedScore;
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
        "attacks": [],
        "score": {
          total: 0,
          delta: 0
        }
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
      score: {
        total: 0,
        delta: 0
      }
    }

    game.matches.push(match);
  }

  // make sure that the match.state.phase is attack so
  // we don't show bonus rounds on replay
  const attackCopy = JSON.parse(JSON.stringify(attack));
  attackCopy.payload.match.state.phase = "attack";

  // if there is a winner, add 200 points
  // to the total score and then delete
  // the winner property so we don't show the
  // game over screen during replay
  if (attackCopy.payload.match.winner) {
    match.score.total += 200;
    delete attackCopy.payload.match.winner;
  }

  // push the attack to the game
  match.attacks.push(attackCopy);

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

function determineBoard(game, match, player, replay, attacker) {
  if (!game || !match || !player) {
    return "ship";
  }

  if (game.state === "active" && match.state.phase === "not-ready") {
    return "ship";
  }

  if (replay) {
    if (player.uuid === attacker) {
      // console.log("ATTACK BOARD");
      return "attack";
    } else {
      // console.log("SHIP BOARD");
      return "ship";
    }
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

function getCurrentMatchScore(gameObj, match) {
  const matchAttackResults = getMatchAttackResults();
  const game = matchAttackResults[gameObj.uuid];

  if (!game) {
    return {
      total: 0,
      delta: 0
    };
  }

  const matches = game.matches;
  let currentMatch = {
    score: {
      total: 0,
      delta: 0
    }
  };
  
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].matchUUID === match.uuid) {
      currentMatch = matches[i];
      break;
    }
  }

  return currentMatch.score;
}

function getHighScore(gameObj) {
  const matchAttackResults = getMatchAttackResults();
  const game = matchAttackResults[gameObj.uuid];

  if (!game) {
    return 0;
  }

  const matches = game.matches;
  let highScore = 0;

  for (let i = 0; i < matches.length; i++) {
    let score = matches[i].score.total;

    if (score > highScore) {
      highScore = score;
    }
  }

  return highScore;
}

export { appReducer, getLocalStorage };
