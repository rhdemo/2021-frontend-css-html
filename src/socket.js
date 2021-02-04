import store from "./store";
import { getLocalStorage } from "./reducer";

let socket;

// const MAX_RETRIES = 10;
const RETRY_DELAY = 1000;
let numRetries = 0;
let retryInterval;

function connect() {
  if (window.location.hostname.includes('localhost')) {
    socket = new WebSocket("ws://localhost:3000/game");
  } else {
    const host = window.location.hostname.replace('game-frontend', 'game-server-frontend')
    socket = new WebSocket(`ws://${host}/game`);
  }

  socket.onopen = event => {
    numRetries = 0;
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

      case "attack-result":
        store.dispatch({
          type: "ATTACK_RESULT",
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

      default:
    }
  }

  socket.onclose = event => {
    numRetries = 0;

    retryInterval = setInterval(() => {

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

function playAgain() {
  sendConfigurationFrame();
}

connect();

export default socket;
export { boardLocked, attack, playAgain };
