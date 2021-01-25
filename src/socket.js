import store from "./store";
import { getLocalStorage } from "./reducer";

let socket;

// const MAX_RETRIES = 10;
const RETRY_DELAY = 1000;
let numRetries = 0;
let retryInterval;

function connect() {
  socket = new WebSocket("ws://localhost:3000/game");

  socket.onopen = event => {
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

    numRetries = 0;
    socket.send(JSON.stringify(message));
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

      case "attack":

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

function boardLocked(payload) {
  if (!socket) {
    return;
  }

  const message = {
    type: "ship-positions",
    data: payload
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

connect();

export default socket;
export { boardLocked, attack };
