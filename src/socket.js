import store from "./store";
import { getLocalStorage } from "./reducer";

let socket;

const RETRY_DELAY = 5000;
const MAX_RETRIES = 50;
let numRetries = 0;
let retryTimeout;

function connect() {
  if (window.location.hostname.includes('localhost')) {
    socket = new WebSocket("ws://localhost:3000/game");
  } else {
    const host = window.location.hostname.replace('game-frontend', 'game-server-frontend');
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${host}/game`);
  }

  socket.onopen = event => {
    numRetries = 0;

    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }

    sendConfigurationFrame();
  }

  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    const data = message.data;

    switch (message.type) {
      case "configuration":
        store.dispatch({
          type: "CONFIGURATION",
          payload: data
        });
        break;

      case "game-state":
        store.dispatch({
          type: "GAME_STATE",
          payload: data
        });
        break;

      case "attack-result":
        store.dispatch({
          type: "ATTACK_RESULT",
          payload: data
        });

        // @TODO: remove once the score is integrated
        setTimeout(() => {
          store.dispatch({
            type: "SCORE_UPDATE", 
            payload: { delta: 5 }
          });
        }, 0);
        break;

      case "bonus-result":
        store.dispatch({
          type: "ATTACK_RESULT",
          payload: data
        });
        break;

      case "score-update":
        store.dispatch({
          type: "SCORE_UPDATE",
          payload: data
        });
        break;

      case "invalid-payload":
        store.dispatch({
          type: "SHOW_ERROR_MESSAGE",
          payload: data.info
        });
        break;

      case "server-error":
        store.dispatch({
          type: "SHOW_ERROR_MESSAGE",
          payload: "Server error"
        });
        break;

      case "bad-attack":
        store.dispatch({
          type: "BAD_ATTACK",
          payload: data
        });
        break;

      default:
    }
  }

  socket.onclose = event => {
    console.log("socket closed");
    numRetries++;

    if (numRetries === MAX_RETRIES) {
      console.log(`reached max number of reconnect tries: ${MAX_RETRIES}. refresh the page to try again`);
      return;
    }

    retryTimeout = setTimeout(() => {
      console.log(`socket reconnect try: ${numRetries}`);
      connect();
    }, RETRY_DELAY);
  }

  socket.onerror = error => {

  }
}

function sendConfigurationFrame() {
  if (!socket) {
    return;
  }

  let data = {};

    // get a previously connected player
    const previousPlayer = getLocalStorage();
    if (previousPlayer.gameId && previousPlayer.playerId && previousPlayer.username) {
      data = previousPlayer;
    }

    // inject the ai parameter if forced using the querystring
    if (window.location.search.includes('useAiOpponent')) {
      data.useAiOpponent = window.location.search.includes('useAiOpponent=true') ? true : false
    }

    // send a connection frame
    const message = {
      type: "connection",
      data
    };

    socket.send(JSON.stringify(message));
}

function boardLocked(payload) {
  if (!socket) {
    return;
  }

  const message = {
    type: "ship-positions",
    data: payload.board
  };

  socket.send(JSON.stringify(message));
}

function attack(payload) {
  if (!socket) {
    return;
  }

  const message = {
    type: "attack",
    data: payload
  };

  console.log("Socket-attack: sending attack frame");
  socket.send(JSON.stringify(message));
}

function bonus(payload) {
  if (!socket) {
    return;
  }

  const message = {
    type: "bonus",
    data: payload
  };

  console.log("Socket-bonus: sending bonus frame");
  socket.send(JSON.stringify(message));
}

function playAgain() {
  sendConfigurationFrame();
}

connect();

export default socket;
export { boardLocked, attack, bonus, playAgain };
