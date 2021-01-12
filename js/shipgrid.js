import Grid from "./grid.js";
import Ship from "./ship.js";

const shipDefinitions = {
  "carrier": {
    length: 5
  },
  "battleship": {
    length: 4
  },
  "destroyer": {
    length: 3
  },
  "submarine": {
    length: 2
  },
  "patrol-boat": {
    length: 1
  }
};

class ShipGrid extends Grid {
  get locked() {
    this.element.classList.contains("locked");
  }

  set locked(bool) {
    if (bool) {
      this.element.classList.add("locked");
      this.lockButton.disabled = true;
    } else {
      this.element.classList.remove("locked");
      this.lockButton.disabled = false;
    }
  }

  set dragging(bool) {
    super.dragging = bool;

    Object.keys(this.ships).forEach(key => {
      const ship = this.ships[key];
      ship.dragging = bool;
    });
  }

  constructor(configuration) {
    super(configuration);

    this.dragStart = this.dragStart.bind(this);
    this.drag = this.drag.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.shipRotateBeforeHandler = this.shipRotateBeforeHandler.bind(this);
    this.shipRotateHandler = this.shipRotateHandler.bind(this);
    this.lockBoard = this.lockBoard.bind(this);

    this.state = configuration.initialState;
    this.rows = configuration.rows;
    this.columns = configuration.columns;
    this.lockButton = document.getElementById("ship-grid-lock-btn");
    this.ships = {};
    this.activeShipPiece = null;
    this.initialX = null;
    this.initialY = null;
    this.currentX = null;
    this.currentY = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentBox = null;
    this.currentBoxes = null;
    this.locked = false;

    this.buildShips();
    this.setShipPositions();
    this.addListeners();
  }

  buildShips() {
    const ships = this.state.ships;

    Object.keys(ships).forEach(key => {
      const shipPosition = ships[key].position;
      const initialShipConfiguration = Object.assign(ships[key], shipDefinitions[key]);
      const ship = new Ship(initialShipConfiguration);

      this.ships[ship.id] = ship;
    });
  }

  setBoxShipIds(box, shipId, remove) {
    let shipIdsAttr = box.getAttribute("ship-ids");

    if (shipIdsAttr) {
      let shipIdsArr = shipIdsAttr.split(",");

      if (remove) {
        shipIdsArr = shipIdsArr.filter(id => parseInt(id, 10) !== shipId);
      } else {
        if (!shipIdsArr.includes(shipId)) {
          shipIdsArr.push(shipId);
        }
      }

      if (shipIdsArr.length === 0) {
        box.removeAttribute("occupied");
        box.removeAttribute("ship-ids");
      } else {
        box.setAttribute("occupied", "true");
        box.setAttribute("ship-ids", shipIdsArr.join(","));
      }
    } else {
      box.setAttribute("ship-ids", shipId);
      box.setAttribute("occupied", "true");
    }
  }

  setShipPositions() {
    Object.keys(this.ships).forEach(key => {
      const ship = this.ships[key];
      const position = ship.configuration.position;

      // position the ship on the grid
      // find the grid position first
      const gridElement = this.element.querySelector(`.box[row="${position.y}"][column="${position.x}"]`);
      ship.position = {
        x: gridElement.offsetLeft,
        y: gridElement.offsetTop
      };

      // add the ship to the grid
      this.element.appendChild(ship.element);

      // let the board know that the grid should be "occupied"
      // underneath the ship
      const gridBoxes = this.getGridBoxes(gridElement, ship.element.children[0], ship);
      gridBoxes.forEach(gridBox => this.setBoxShipIds(gridBox, ship.id));
    });
  }

  getGridBoxes(box, shipPiece, ship) {
    if (!box || !shipPiece || !ship) {
      return;
    }

    const shipDefinition = shipDefinitions[ship.type];
    const orientation = ship.orientation;
    // figure out if we are at the top, somewhere in the middle,
    // or the bottom
    const whichPiece = parseInt(shipPiece.getAttribute("ship-piece"), 10);

    // how far do we need to go to get to the anchor point (box 1)
    const distance = whichPiece % shipDefinition.length;

    // if the orientation is vertical, get the row attribute
    // if the orientation is horizontal, use the column attribute
    const attribute = orientation === "vertical" ? "row" : "column";
    const startingBox = parseInt(box.getAttribute(attribute), 10) - distance;
    const gridBoxes = [];

    for (let i = 0; i < shipDefinition.length; i++) {
      let gridBox;
      if (orientation === "vertical") {
        gridBox = this.element.querySelector(`.box[row="${startingBox + i}"][column="${box.getAttribute("column")}"]`);
      } else {
        gridBox = this.element.querySelector(`.box[row="${box.getAttribute("row")}"][column="${startingBox + i}"]`);
      }

      if (gridBox) {
        gridBoxes.push(gridBox);
      }
    }

    return gridBoxes;
  }

  highLightGrid(box) {
    if (!this.currentBox || !this.activeItem || !this.activeShipPiece) {
      return;
    }

    const shipDefinition = shipDefinitions[this.activeItem.type];
    const gridBoxes = this.getGridBoxes(box, this.activeShipPiece, this.activeItem);

    // if we already have some grid boxes and they aren't
    // the same as the gridBoxes we just identified, remove
    // the "green" class from all of the current boxes
    if (this.currentBoxes && this.currentBoxes !== gridBoxes) {
      [...this.currentBoxes].forEach(currentBox => {
        if (!currentBox) {
          return;
        }

        currentBox.classList.remove("green", "red");
      });
    }

    // if any of the gridBoxes are "occupied", they should
    // get a "red" class, otherwise give them a "green"
    // class
    const isOneGridBoxOccupied = gridBoxes.find(gridBox => {
      if (!gridBox) {
        return false;
      }

      return gridBox.hasAttribute("occupied");
    });

    // if the number of gridBoxes does not equal the length
    // of the ship, the class should be "red"
    const equalBoxesAndShipLength = gridBoxes.length === shipDefinition.length;

    const gridBoxClass = isOneGridBoxOccupied || !equalBoxesAndShipLength ? "red" : "green";

    // loop through all of the grid boxes and give them a
    // "green" class or a "red" class if one is occupied
    [...gridBoxes].forEach(gridBox => {
      if (!gridBox) {
        return;
      };

      gridBox.classList.add(gridBoxClass);
    });

    this.currentBoxes = gridBoxes;
  }

  dragStart(event) {
    const target = event.target;

    if (!target.classList.contains("ship-piece")) {
      return;
    }

    const ship = this.ships[target.parentElement.getAttribute("ship-id")];
    const shipId = ship.id

    this.activeShipPiece = target;
    this.activeItem = ship;
    this.dragging = true;

    let box;

    if (event.type === "touchstart") {
      this.draggingTouch = true;
      this.initialX = event.touches[0].clientX - (parseInt(this.activeItem.position.x, 10) || this.offsetX);
      this.initialY = event.touches[0].clientY - (parseInt(this.activeItem.position.y, 10) || this.offsetY);

      // find the grid item underneath
      // event.target won't work on mobile
      box = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      this.initialX = event.clientX - (parseInt(this.activeItem.position.x, 10) || this.offsetX);
      this.initialY = event.clientY - (parseInt(this.activeItem.position.y, 10) || this.offsetY);

      // get the grid item underneath
      box = document.elementFromPoint(event.clientX, event.clientY);
    }

    // remove the "occupied" attributes from the grid boxes
    // underneath the ship
    const gridBoxes = this.getGridBoxes(box, this.activeShipPiece, this.activeItem);
    gridBoxes.forEach(gridBox => this.setBoxShipIds(gridBox, shipId, true));

    this.currentBox = box;
    this.highLightGrid(this.currentBox);
  }

  drag(event) {
    if (!this.activeItem) {
      return;
    }

    // this is super necessary on mobile devices
    // it prevents the pull down to refresh functionality
    event.preventDefault();

    let box;
    const shipDefinition = shipDefinitions[this.activeItem.type];
    const orientation = this.activeItem.orientation;
    const yMultiplier = orientation === "vertical" ? shipDefinition.length : 1;
    const xMultiplier = orientation === "vertical" ? 1 : shipDefinition.length;

    if (event.type === "touchmove") {
      this.currentX = event.touches[0].clientX - this.initialX;
      this.currentY = event.touches[0].clientY - this.initialY;

      // find the grid item underneath
      // event.target won't work on mobile
      box = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      // get the grid item underneath
      box = event.target
    }

    // don't allow the ship to leave the grid
    if (this.currentY < 0) {
      this.currentY = 0;
    }

    if (this.currentY > this.gridDimensions.height - this.gridDimensions.boxHeight * yMultiplier) {
      this.currentY = this.gridDimensions.height - this.gridDimensions.boxHeight * yMultiplier;
    }

    if (this.currentX < 0) {
      this.currentX = 0;
    }

    if (this.currentX > this.gridDimensions.width - this.gridDimensions.boxWidth * xMultiplier) {
      this.currentX = this.gridDimensions.width - this.gridDimensions.boxWidth * xMultiplier;
    }

    this.offsetX = this.currentX;
    this.offsetY = this.currentY;

    // move the ship
    this.activeItem.position = {
      x: this.currentX,
      y: this.currentY
    };

    // if we have a box, let's highlight the landing
    // zone boxes
    if (box) {
      // highlight the grid placement
      this.highLightGrid(box);
      this.currentBox = box;
    } else {
      this.highLightGrid(this.currentBox);
    }
  }

  dragEnd(event) {
    this.dragging = false;
    this.draggingTouch = false;

    let shipId;

    if (this.activeItem) {
      shipId = this.activeItem.id;

      // lock the activeItem into the grid
      if (this.currentBox) {
        // figure out if we are at the top, somewhere in the middle,
        // or the bottom
        const shipDefinition = shipDefinitions[this.activeItem.type];
        const shipPiece = this.activeShipPiece.getAttribute("ship-piece");
        const orientation = this.activeItem.orientation;

        // how far do we need to go to get to the first piece
        const distance = shipPiece % shipDefinition.length;

        // if the orientation is vertical, get the row attribute
        // if the orientation is horizontal, use the column attribute
        const attribute = orientation === "vertical" ? "row" : "column";
        const startingBox = parseInt(this.currentBox.getAttribute(attribute), 10) - distance;
        let startingGridElement;

        if (orientation === "vertical") {
          startingGridElement = this.element.querySelector(`.box[row="${startingBox}"][column="${this.currentBox.getAttribute("column")}"]`)
        } else {
          startingGridElement = this.element.querySelector(`.box[row="${this.currentBox.getAttribute("row")}"][column="${startingBox}"]`);
        }

        if (startingGridElement) {
          this.activeItem.position = {
            x: startingGridElement.offsetLeft,
            y: startingGridElement.offsetTop
          };
        }
      }

      this.activeItem = null;
      this.activeShipPiece = null;
    }

    if (this.currentBoxes) {
      this.currentBoxes.forEach(box => {
        if (!box) {
          return;
        }

        box.classList.remove("green", "red");
        this.setBoxShipIds(box, shipId);
      });
    }

    this.initialX = null;
    this.initialY = null;
    this.currentX = null;
    this.currentY = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentBox = null;
    this.currentBoxes = null;
  }

  shipRotateBeforeHandler(event) {
    const ship = this.ships[event.target.getAttribute("ship-id")];
    const shipId = ship.id;
    const orientation = ship.orientation;
    const rect = ship.element.getBoundingClientRect();
    const box = document.elementsFromPoint(rect.left, rect.top).filter(element => element.classList.contains("box"))[0];

    // get the original boxes and remove the "occupied" attribute
    const originalGridBoxes = this.getGridBoxes(box, ship.element.children[0], ship);
    originalGridBoxes.forEach(box => {
      this.setBoxShipIds(box, shipId, true);
    });
  }

  shipRotateHandler(event) {
    const ship = this.ships[event.target.getAttribute("ship-id")];
    const shipId = ship.id;
    const orientation = ship.orientation;
    const rect = ship.element.getBoundingClientRect();
    const box = document.elementsFromPoint(rect.left, rect.top).filter(element => element.classList.contains("box"))[0];

    // get the new grid boxes underneath the ship and set them
    // to "occupied"
    const gridBoxes = this.getGridBoxes(box, ship.element.children[0], ship);
    gridBoxes.forEach(box => {
      this.setBoxShipIds(box, shipId);
    });
  }

  // this is a super cheap way of validating the board.
  // just make sure the number of grid boxes that are
  // "occupied" equals the number of ship pieces
  gridIsValid() {
    const shipPieces = this.element.querySelectorAll(".ship-piece");
    const occupiedGridBoxes = this.element.querySelectorAll(`.box[occupied="true"]`);

    return shipPieces.length === occupiedGridBoxes.length;
  }

  incomingAttack(message) {
    console.log(`${this.constructor.name} - Incoming attack`, message);
    const position = message.position;
    const coordinates = message.coordinates;

    // find the grid box
    const gridBox = this.element.querySelector(`.box[row="${coordinates.y}"][column="${coordinates.x}"]`);
    const shipPiece = this.element.querySelector(`.ship-piece[type="${message.ship}"][ship-piece="${position}"]`);

    if (message.hit) {
      gridBox.classList.add("hit");
      shipPiece.classList.add("hit");

      if (message.destroyed) {
        [...this.element.querySelectorAll(`.ship-piece[type="${message.ship}"]`)].forEach(shipPiece => shipPiece.classList.add("destroyed"));
        alert(`Your ${message.ship} has been destroyed`);
      }
    } else {
      gridBox.classList.add("miss");
    }
  }

  addListeners() {
    this.element.addEventListener("touchstart", this.dragStart, false);
    this.element.addEventListener("touchmove", this.drag, false);
    this.element.addEventListener("touchend", this.dragEnd, false);

    this.element.addEventListener("mousedown", this.dragStart, false);
    this.element.addEventListener("mousemove", this.drag, false);
    this.element.addEventListener("mouseup", this.dragEnd, false);

    this.element.addEventListener("ship:rotate-before", this.shipRotateBeforeHandler, false);
    this.element.addEventListener("ship:rotate", this.shipRotateHandler, false);

    this.lockButton.addEventListener("click", this.lockBoard, false);
  }

  removeListeners() {
    this.element.removeEventListener("touchstart", this.dragStart, false);
    this.element.removeEventListener("touchmove", this.drag, false);
    this.element.removeEventListener("touchend", this.dragEnd, false);

    this.element.removeEventListener("mousedown", this.dragStart, false);
    this.element.removeEventListener("mousemove", this.drag, false);
    this.element.removeEventListener("mouseup", this.dragEnd, false);

    this.element.removeEventListener("ship:rotate-before", this.shipRotateBeforeHandler, false);
    this.element.removeEventListener("ship:rotate", this.shipRotateHandler, false);

    this.lockButton.removeEventListener("click", this.lockBoard, false);
  }

  lockBoard() {
    if (!this.gridIsValid()) {
      const message = "The configuration of ships is not valid";
      alert(message);
      console.log(`${this.constructor.name} - ${message}`);
      return;
    }

    console.log(`${this.constructor.name} - Ship grid locked. Ready to play.`);
    this.locked = true;
    this.removeListeners();

    // build a representation of the board to send to
    // the server
    const board = [];
    let currentRow;

    [...this.element.querySelectorAll(".box")].forEach(box => {
      const row = parseInt(box.getAttribute("row"), 10);
      const column = parseInt(box.getAttribute("column"), 10);
      const occupied = box.hasAttribute("occupied");
      const shipId = box.getAttribute("ship-ids");

      if (column === 0) {
        currentRow = [];
      }

      if (occupied) {
        const shipType = this.element.querySelector(`.ship[ship-id="${shipId}"]`).getAttribute("type");
        const ship = this.state.ships[shipType];
        ship.destroyed = false;
        ship.state.push({
          coordinates: {
            x: column,
            y: row
          },
          hit: false
        });

        currentRow.push({
          ship: shipType,
          hit: false,
          position: ship.state.length - 1
        });
      } else {
        currentRow.push(null);
      }

      // we're at the end, push the currentRow
      // into the board
      if (column === this.columns - 5) {
        board.push(currentRow);
      }
    });

    // send an event with the state of the board
    const event = new CustomEvent("shipgrid:locked", {
      bubbles: true,
      detail: {
        state: this.state,
        board: board
      }
    });

    this.element.dispatchEvent(event);
  }
}

export default ShipGrid;
