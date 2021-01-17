const initialState = {
  game: {
    state: "lobby"
  },
  player: {}
};

function appReducer(state = initialState, action) {
  switch (action.type) {
    case "CONFIGURATION":
      const game = action.payload.game;
      const player = action.payload.player;

      updateLocalStorage({
        gameId: game.uuid,
        playerId: player.uuid,
        username: player.username
      });

      return {
        ...state,
        game,
        player
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