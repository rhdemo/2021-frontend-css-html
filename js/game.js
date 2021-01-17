import Ship from "./ship.js";
import ShipGrid from "./shipgrid.js";
import AttackGrid from "./attackgrid.js";

// Battleship!!!
// A lot of the drag and drop code was inspired
// by https://www.kirupa.com/html5/drag.htm
// I was hoping to use HTML5 drag and drop but it doesn't
// work well on mobile and it seems silly to build two
// completely different mechanisms for dragging and dropping

// This will not be stored on the client. It's just here
// for testing purposes.
const opponentState = {
  "destroyer": {
    id: 0,
    origin: {
      x: 1,
      y: 1
    },
    type: "destroyer",
    state: [
      { coordinates: { x: 1, y: 1 }, hit: false },
      { coordinates: { x: 1, y: 2 }, hit: false },
      { coordinates: { x: 1, y: 3 }, hit: false }
    ]
  },
  "patrol-boat": {
    id: 1,
    origin: {
      x: 0,
      y: 0
    },
    type: "patrol-boat",
    orientation: "horizontal",
    state: [
      { coordinates: { x: 0, y: 0 }, hit: false }
    ]
  },
  "battleship": {
    id: 2,
    origin: {
      x: 1,
      y: 4
    },
    type: "battleship",
    orientation: "horizontal",
    state: [
      { coordinates: { x: 1, y: 4 }, hit: false },
      { coordinates: { x: 2, y: 4 }, hit: false },
      { coordinates: { x: 3, y: 4 }, hit: false },
      { coordinates: { x: 4, y: 4 }, hit: false }
    ]
  }
};

/*
 * [x, 0, 0, 0, 0] Patrol Boat
 * [0, x, 0, 0, 0] Destroyer
 * [0, x, 0, 0, 0] Destroyer
 * [0, x, 0, 0, 0] Destroyer
 * [0, x, x, x, x] Battleship
 */
const opponentGridPositions = [
  [{ ship: "patrol-boat", hit: false, position: 0 }, null, null, null, null],
  [null, { ship: "destroyer", hit: false, position: 0 }, null, null, null],
  [null, { ship: "destroyer", hit: false, position: 1 }, null, null, null],
  [null, { ship: "destroyer", hit: false, position: 2 }, null, null, null],
  [null, { ship: "battleship", hit: false, position: 0 }, { ship: "battleship", hit: false, position: 1 }, { ship: "battleship", hit: false, position: 2 }, { ship: "battleship", hit: false, position: 3 }]
];

// When the ship grid is locked by the player, we'll get this
// information from the "shipgrid:locked" event. It should be
// in the same format at the opponentGridPositions array.
let playerShipGridPositions;
let randomAttacks;

class Game {
  get playerTurn() {
    return this.playerTurn;
  }

  set playerTurn(bool) {
    if (this.attackGrid) {
      this.attackGrid.enabled = bool;
    }

    if (bool) {
      console.log(`${this.constructor.name} - Player's turn`);
    } else {
      if (this.shipGrid && this.shipGrid.locked) {
        console.log(`${this.constructor.name} - Opponents's turn`);
      }
    }
  }

  constructor(configuration) {
    this.shipGridLockedHandler = this.shipGridLockedHandler.bind(this);
    this.attackGridAttackHandler = this.attackGridAttackHandler.bind(this);
    this.incomingAttackHandler = this.incomingAttackHandler.bind(this);

    this.rows = configuration.rows;
    this.columns = configuration.columns;
    this.initialState = configuration.initialState;
    this.attackGridContainer = document.getElementById("attack-grid");
    this.shipGridContainer = document.getElementById("ship-grid");

    // This should be handled by the web socket
    this.playerTurn = false;
  }

  render() {
    this.attackGrid = new AttackGrid({
      rows: this.rows,
      columns: this.columns,
      container: this.attackGridContainer,
      initialState: this.initialState
    });

    this.shipGrid = new ShipGrid({
      rows: this.rows,
      columns: this.columns,
      container: this.shipGridContainer,
      initialState: this.initialState
    });
  }

  start() {
    this.render();
    this.addListeners();
  }

  addListeners() {
    // Listener for when the ship grid is locked.
    // We'll need to send this back to the server
    // and when we're ready to start playing we'll
    // enable the attack grid.
    document.addEventListener("shipgrid:locked", this.shipGridLockedHandler, false);

    // Listener for when an attack is made.
    // The result of this will actually come from the server
    document.addEventListener("attackgrid:attack", this.attackGridAttackHandler, false);

    // Listener for an incoming attack from the web socket
    document.addEventListener("incomingattack", this.incomingAttackHandler, false);
  }

  removeListeners() {
    document.removeEventListener("shipgrid:locked", this.shipGridLockedHandler, false);
    document.removeEventListener("attackgrid:attack", this.attackGridAttackHandler, false);
    document.removeEventListener("incomingattack", this.incomingAttackHandler, false);
  }

  // This is a temporary function until we get a human
  // or AI player
  generateRandomAttack() {
    const randomAttack = randomAttacks.splice(Math.floor(Math.random() * randomAttacks.length), 1)[0];
    let hit = false;
    let destroyed = false;
    let ship = null;
    let position = null;
    let coordinates = randomAttack.coordinates;

    // If we hit a ship, log the hit and check if the
    // ship has been destroyed
    if (randomAttack.ship) {
      const shipFromState = this.initialState.ships[randomAttack.ship];
      shipFromState.state[randomAttack.position].hit = true;
      ship = shipFromState.type;

      hit = true;
      position = randomAttack.position;

      // Check to see if the entire ship has been destroyed
      const hitsRemaining = shipFromState.state.filter(shipPiece => shipPiece.hit === false).length;
      if (hitsRemaining === 0) {
        destroyed = true;
      }
    }

    return {
      hit,
      destroyed,
      ship,
      position,
      coordinates
    };
  }

  simulateAttack() {
    const delay = 1500;
    console.log(`${this.constructor.name} - Simulating an attack in ${delay / 1000} seconds`);

    setTimeout(() => {
      const message = this.generateRandomAttack();
      const event = new CustomEvent("incomingattack", {
        detail: message
      });

      console.log(event);

      document.dispatchEvent(event);
    }, delay);
  }

  shipGridLockedHandler(event) {
    playerShipGridPositions = event.detail.board;

    // Create an array for some random attacks
    // Take this out once we have a real player
    let row = 0;
    let column = 0;
    randomAttacks = [];

    playerShipGridPositions.flat().forEach((gridBox, index) => {
      column = index % this.columns;
      row = Math.floor(index / this.columns);
      gridBox = Object.assign({}, gridBox, {
        coordinates: {
          x: column,
          y: row
        }
      });

      randomAttacks.push(gridBox);
    });

    this.playerTurn = true;
  }

  attackGridAttackHandler(event) {
    const origin = event.detail.origin;
    const returnMessage = {
      hit: false,
      destroyed: false,
      ship: null,
      position: origin
    };

    // check the fake opponent state to see if this was a hit
    // go down (origin.y) and then over (origin.x)
    const result = opponentGridPositions[origin.y][origin.x];
    if (result) {
      // If the ship was already hit at this position,
      // do nothing.
      if (result.hit) {
        return;
      }

      const position = result.position;
      let destroyed = false;

      result.hit = true;
      opponentState[result.ship].state[position].hit = true;

      // Check to see if the entire ship has been destroyed
      const hitsRemaining = opponentState[result.ship].state.filter(shipPiece => shipPiece.hit === false).length;
      if (hitsRemaining === 0) {
        destroyed = true;
      }

      returnMessage.hit = true;
      returnMessage.destroyed = destroyed;
      returnMessage.ship = opponentState[result.ship];
    }

    console.log(`${this.constructor.name} - Attack response`, returnMessage);
    this.attackGrid.recordAttack(returnMessage);

    this.playerTurn = false;
    this.simulateAttack();
  }

  incomingAttackHandler(event) {
    console.log(`${this.constructor.name} - Incoming attack`);
    this.shipGrid.incomingAttack(event.detail);
    this.playerTurn = true;
  }
}

export default Game;
