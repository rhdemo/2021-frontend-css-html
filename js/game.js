// Battleship!!!
// A lot of the drag and drop code was inspired
// by https://www.kirupa.com/html5/drag.htm
// I was hoping to use HTML5 drag and drop but it doesn't
// work well on mobile and it seems silly to build two
// completely different mechanisms for dragging and dropping

const lockBtn = document.getElementById("lock-btn");
const attackGridContainer = document.getElementById("attack-grid");
const gridContainer = document.getElementById("grid");
const gridRows = 5;
const gridColumns = 5;
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

const initialState = {
  "carrier": {
    id: 0,
    position: {
      x: 0,
      y: 0
    }
  },
  "patrol-boat": {
    id: 1,
    position: {
      x: 3,
      y: 3
    }
  },
  "battleship": {
    id: 2,
    position: {
      x: 1,
      y: 2
    },
    orientation: "horizontal"
  }
};

const opponentState = {
  "destroyer": {
    id: 0,
    position: {
      x: 1,
      y: 1
    }
  },
  "patrol-boat": {
    id: 1,
    position: {
      x: 0,
      y: 0
    },
    orientation: "horizontal"
  },
  "battleship": {
    id: 2,
    position: {
      x: 1,
      y: 4
    },
    orientation: "horizontal"
  }
}

const plays = [];

let activeItem = null;
let activePiece = null;
let initialX = null;
let initialY = null;
let currentX = null;
let currentY = null;
let offsetX = 0;
let offsetY = 0;
let currentBox = null;
let currentBoxes = null;
let gridDimensions = {};
let playerTurn = true;

// build a grid that looks like this
// reference image:
// https://techcommunity.microsoft.com/t5/image/serverpage/image-id/74120iEFB3B5B6BE577E0C
/*
 * |   | 1 | 2 | 3 | 4 | 5 |
 * | A |   |   |   |   |   |
 * | B |   |   |   |   |   |
 * | C |   |   |   |   |   |
 * | D |   |   |   |   |   |
 * | E |   |   |   |   |   |
 */
function buildGrid(container, rows = 4, columns = 4) {
  const rowsAlpha = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const template = document.getElementById("box-tmpl");
  const fragment = document.createDocumentFragment();

  let row = 0;
  let column = 0;

  for (let i = 0; i < rows * columns; i++) {
    let clone = template.content.cloneNode(true);
    let box = clone.querySelector(".box");

    column = i % columns;
    row = Math.floor(i / columns);

    // each grid box will look like this
    // <div class="box" row-alpha="LETTER" row="NUMBER" column="NUMBER">
    box.setAttribute("row-alpha", rowsAlpha[row]);
    box.setAttribute("row", row);
    box.setAttribute("column", column);

    fragment.appendChild(clone);
  }

  container.appendChild(fragment);

  if (gridDimensions.width) {
    return;
  }

  let boxDimensions = container.children[0].getBoundingClientRect();

  gridDimensions = {
    width: boxDimensions.width * columns,
    height: boxDimensions.height * rows,
    boxWidth: boxDimensions.width,
    boxHeight: boxDimensions.height
  };
}

function setBoxShipIds(box, shipId, remove) {
  let shipIdsAttr = box.getAttribute("ship-ids");

  if (shipIdsAttr) {
    let shipIdsArr = shipIdsAttr.split(",");

    if (remove) {
      shipIdsArr = shipIdsArr.filter(id => id !== shipId);
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

function positionShips() {
  const shipTemplate = document.getElementById("ship-tmpl");
  const shipPieceTemplate = document.getElementById("ship-piece-tmpl");

  Object.keys(initialState).forEach(key => {
    const shipDefinition = shipDefinitions[key];
    const shipId = initialState[key].id;
    const shipPosition = initialState[key].position;
    const orientation = initialState[key].orientation;

    // create the ship
    const shipClone = shipTemplate.content.cloneNode(true);
    const shipElement = shipClone.querySelector(".ship");
    shipElement.setAttribute("ship-id", shipId);
    shipElement.setAttribute("type", key);
    shipElement.setAttribute("orientation", "vertical");

    // create the pieces in the ship
    for (let i = 0; i < shipDefinition.length; i++) {
      const shipPieceClone = shipPieceTemplate.content.cloneNode(true);
      const shipPieceElement = shipPieceClone.querySelector(".ship-piece");
      shipPieceElement.setAttribute("ship-piece", i);
      shipPieceElement.setAttribute("type", key)
      shipPieceElement.setAttribute("ship-id", shipId);
      shipPieceElement.textContent = i + 1;
      shipElement.insertBefore(shipPieceElement, shipElement.querySelector(".rotate"));
    }

    // position the ship on the grid
    // find the grid position first
    const gridElement = document.querySelector(`.box[row="${shipPosition.y}"][column="${shipPosition.x}"]`);
    shipElement.style.left = `${gridElement.offsetLeft}px`;
    shipElement.style.top = `${gridElement.offsetTop}px`;

    // rotate the ship if the orientation is horizontal
    if (orientation && orientation === "horizontal") {
      shipElement.setAttribute("orientation", "horizontal");
      shipElement.style.transformOrigin = "32px 32px";
      shipElement.style.transform = "rotate(-90deg)";
    }

    // add the ship to the grid
    gridContainer.appendChild(shipElement);

    // let the board know that the grid should be "occupied"
    // underneath the ship
    const gridBoxes = getGridBoxes(gridElement, shipElement.children[0], shipElement);
    gridBoxes.forEach(gridBox => {
      setBoxShipIds(gridBox, shipId);
    });
  });
}

function getGridBoxes(box, shipPiece, shipContainer) {
  if (!box || !shipPiece || !shipContainer) {
    return;
  }

  const shipDefinition = shipDefinitions[shipContainer.getAttribute("type")];
  const orientation = shipContainer.getAttribute("orientation");
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
      gridBox = gridContainer.querySelector(`.box[row="${startingBox + i}"][column="${box.getAttribute("column")}"]`);
    } else {
      gridBox = gridContainer.querySelector(`.box[row="${box.getAttribute("row")}"][column="${startingBox + i}"]`);
    }

    if (gridBox) {
      gridBoxes.push(gridBox);
    }
  }

  return gridBoxes;
}

function highLightGrid(box) {
  if (!currentBox || !activeItem) {
    return;
  }

  const shipDefinition = shipDefinitions[activeItem.getAttribute("type")];
  const gridBoxes = getGridBoxes(box, activePiece, activeItem);

  // if we already have some grid boxes and they aren't
  // the same as the gridBoxes we just identified, remove
  // the "green" class from all of the current boxes
  if (currentBoxes && currentBoxes !== gridBoxes) {
    [...currentBoxes].forEach(currentBox => {
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

  currentBoxes = gridBoxes;
}

function dragStart(event) {
  const target = event.target;

  if (!target.classList.contains("ship-piece")) {
    return;
  }

  const shipContainer = target.parentElement;
  const shipId = shipContainer.getAttribute("ship-id");
  activePiece = target;
  activeItem = shipContainer;

  activeItem.classList.add("dragging");
  gridContainer.classList.add("dragging");

  let box;

  [...document.querySelectorAll(".ship")].forEach(ship => ship.style.pointerEvents = "none");

  if (event.type === "touchstart") {
    initialX = event.touches[0].clientX - (parseInt(activeItem.style.left, 10) || offsetX);
    initialY = event.touches[0].clientY - (parseInt(activeItem.style.top, 10) || offsetY);
    gridContainer.classList.add("dragging-touch");

    // find the grid item underneath
    // event.target won't work on mobile
    box = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
  } else {
    initialX = event.clientX - (parseInt(activeItem.style.left, 10) || offsetX);
    initialY = event.clientY - (parseInt(activeItem.style.top, 10) || offsetY);

    // get the grid item underneath
    box = document.elementFromPoint(event.clientX, event.clientY);
  }

  // remove the "occupied" attributes from the boxes
  // underneath the ship
  const gridBoxes = getGridBoxes(box, activePiece, activeItem);
  gridBoxes.forEach(gridBox => {
    if (!gridBox) {
      return;
    }

    setBoxShipIds(gridBox, shipId, true);
  });

  currentBox = box;
  highLightGrid(currentBox);
}

function drag(event) {
  if (!activeItem) {
    return;
  }

  // this is super necessary on mobile devices
  // it prevents the pull down to refresh functionality
  event.preventDefault();

  let box;
  const shipDefinition = shipDefinitions[activeItem.getAttribute("type")];
  const orientation = activeItem.getAttribute("orientation");
  const yMultiplier = orientation === "vertical" ? shipDefinition.length : 1;
  const xMultiplier = orientation === "vertical" ? 1 : shipDefinition.length;

  if (event.type === "touchmove") {
    currentX = event.touches[0].clientX - initialX;
    currentY = event.touches[0].clientY - initialY;

    // find the grid item underneath
    // event.target won't work on mobile
    box = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
  } else {
    currentX = event.clientX - initialX;
    currentY = event.clientY - initialY;

    // get the grid item underneath
    box = event.target
  }

  // don't allow the ship to leave the grid
  if (currentY < 0) {
    currentY = 0;
  }

  if (currentY > gridDimensions.height - gridDimensions.boxHeight * yMultiplier) {
    currentY = gridDimensions.height - gridDimensions.boxHeight * yMultiplier;
  }

  if (currentX < 0) {
    currentX = 0;
  }

  if (currentX > gridDimensions.width - gridDimensions.boxWidth * xMultiplier) {
    currentX = gridDimensions.width - gridDimensions.boxWidth * xMultiplier;
  }

  offsetX = currentX;
  offsetY = currentY;

  // move the ship
  activeItem.style.left = `${currentX}px`;
  activeItem.style.top = `${currentY}px`;

  // if we have a box, let's highlight the landing
  // zone boxes
  if (box) {
    // highlight the grid placement
    highLightGrid(box);
    currentBox = box;
  } else {
    highLightGrid(currentBox);
  }
}

function dragEnd(event) {
  gridContainer.classList.remove("dragging");
  gridContainer.classList.remove("dragging-touch");
  let shipId;

  if (activeItem) {
    shipId = activeItem.getAttribute("ship-id");
    [...document.querySelectorAll(".ship")].forEach(ship => ship.style.pointerEvents = "initial");
    activeItem.classList.remove("dragging");

    // lock the activeItem into the grid
    if (currentBox) {
      // figure out if we are at the top, somewhere in the middle,
      // or the bottom
      const shipDefinition = shipDefinitions[activeItem.getAttribute("type")];
      const shipPiece = activePiece.getAttribute("ship-piece");
      const orientation = activeItem.getAttribute("orientation");

      // how far do we need to go to get to the first piece
      const distance = shipPiece % shipDefinition.length;

      // if the orientation is vertical, get the row attribute
      // if the orientation is horizontal, use the column attribute
      const attribute = orientation === "vertical" ? "row" : "column";
      const startingBox = parseInt(currentBox.getAttribute(attribute), 10) - distance;
      let startingGridElement;

      if (orientation === "vertical") {
        startingGridElement = gridContainer.querySelector(`.box[row="${startingBox}"][column="${currentBox.getAttribute("column")}"]`)
      } else {
        startingGridElement = gridContainer.querySelector(`.box[row="${currentBox.getAttribute("row")}"][column="${startingBox}"]`);
      }

      if (startingGridElement) {
        activeItem.style.left = `${startingGridElement.offsetLeft}px`;
        activeItem.style.top = `${startingGridElement.offsetTop}px`;
      }
    }

    activeItem = null;
    activePiece = null;
  }

  if (currentBoxes) {
    currentBoxes.forEach(box => {
      if (!box) {
        return;
      }

      box.classList.remove("green", "red");
      setBoxShipIds(box, shipId);
    });
  }

  initialX = null;
  initialY = null;
  currentX = null;
  currentY = null;
  offsetX = 0;
  offsetY = 0;
  currentBox = null;
  currentBoxes = null;
}

// logic for rotating a ship
function shipClick(event) {
  if (!event.target.classList.contains("rotate")) {
    return;
  }

  // let's rotate the ship 90 degrees with the anchor point
  // at the "top" of the ship
  const ship = event.target.parentElement;
  const shipId = ship.getAttribute("ship-id");
  const orientation = ship.getAttribute("orientation");
  const rect = ship.getBoundingClientRect();
  const box = document.elementsFromPoint(rect.left, rect.top).filter(element => element.classList.contains("box"))[0];

  // get the original boxes and remove the "occupied" attribute
  const originalGridBoxes = getGridBoxes(box, ship.children[0], ship);
  originalGridBoxes.forEach(box => {
    // box.removeAttribute("occupied");
    setBoxShipIds(box, shipId, true);
  });

  if (orientation === "vertical") {
    ship.style.transformOrigin = "32px 32px";
    ship.style.transform = "rotate(-90deg)";
  } else {
    ship.style.transformOrigin = null;
    ship.style.transform = null;
  }

  ship.setAttribute("orientation", orientation === "vertical" ? "horizontal" : "vertical");

  // get the new grid boxes underneath the ship and set them
  // to "occupied"
  const gridBoxes = getGridBoxes(box, ship.children[0], ship);
  gridBoxes.forEach(box => {
    // box.setAttribute("occupied", "true");
    setBoxShipIds(box, shipId);
  });
}

// this is a super cheap way of validating the board.
// just make sure the number of grid boxes that are
// "occupied" equals the number of ship pieces
function gridIsValid() {
  const shipPieces = document.querySelectorAll(".ship-piece");
  const occupiedGridBoxes = document.querySelectorAll(`.grid .box[occupied="true"]`);

  return shipPieces.length === occupiedGridBoxes.length;
}

function lockShipsInBoard() {
  const ships = document.querySelectorAll(".ship");
  [...ships].forEach(ship => {
    const shipId = ship.getAttribute("ship-id");
    const shipPieces = [...ship.querySelectorAll(".ship-piece")];
    const shipGridBoxes = [...gridContainer.querySelectorAll(`.box[occupied="true"][ship-ids="${shipId}"]`)];

    shipGridBoxes.forEach((shipGridBox, index) => {
      shipGridBox.appendChild(shipPieces[index]);
    });
  });
}

function lockBoard() {
  if (!gridIsValid()) {
    alert("The configuration of the ships is not valid");
    return;
  }

  removeGridContainerListeners();
  lockShipsInBoard();
  addGridBoxClickListeners();
  addAttackGridClickListeners();
  document.body.classList.add("locked");
  gridContainer.classList.add("locked");
}

function gridBoxRandomAttack() {

}

function gridBoxAttackHandler(event) {
  // using currentTarget in case the box has a child of a
  // ship in it
  const gridBox = event.currentTarget;
  const row = gridBox.getAttribute("row");
  const column = gridBox.getAttribute("column");

  checkAttack({ row, column });
}

// if it's a hit, add a "hit" class and a "miss"
// class if not.
// if we have a hit, check the whole ship to see if it
// should sink
function checkAttack(coords) {
  let hit = false;
  const gridBox = gridContainer.querySelector(`.box[row="${coords.row}"][column="${coords.column}"]`);

  if (gridBox.children.length === 1) {
    const shipPiece = gridBox.children[0];
    const shipId = shipPiece.getAttribute("ship-id");

    shipPiece.classList.add("hit");
    gridBox.classList.add("hit");
    hit = true;

    if (isShipDestroyed(shipPiece)) {
      destroyShip(shipId);
    }
  } else {
    gridBox.classList.add("miss");
  }

  return hit;
}

function checkOpponentAttack(coords) {
  let hit = false;



  return hit;
}

function isShipDestroyed(shipPiece) {
  const shipId = shipPiece.getAttribute("ship-id");
  const shipType = shipPiece.getAttribute("type");
  const shipPiecesHit = gridContainer.querySelectorAll(`.ship-piece.hit[ship-id="${shipId}"]`);

  return shipPiecesHit.length === shipDefinitions[shipType].length;
}

function destroyShip(shipId) {
  const shipPieces = gridContainer.querySelectorAll(`.ship-piece[ship-id="${shipId}"]`);
  [...shipPieces].forEach(shipPiece => shipPiece.classList.add("destroyed"));
}

function attackBoxHandler(event) {
  if (!playerTurn) {
    return;
  }

  const attackBox = event.target;
  const coords = {
    x: attackBox.getAttribute("column"),
    y: attackBox.getAttribute("row")
  };

  console.log(coords);
}

function recordTurn() {

}

function addGridContainerListeners() {
  gridContainer.addEventListener("touchstart", dragStart, false);
  gridContainer.addEventListener("touchmove", drag, false);
  gridContainer.addEventListener("touchend", dragEnd, false);

  gridContainer.addEventListener("mousedown", dragStart, false);
  gridContainer.addEventListener("mousemove", drag, false);
  gridContainer.addEventListener("mouseup", dragEnd, false);
  gridContainer.addEventListener("click", shipClick, false);
}

function removeGridContainerListeners() {
  gridContainer.removeEventListener("touchstart", dragStart, false);
  gridContainer.removeEventListener("touchmove", drag, false);
  gridContainer.removeEventListener("touchend", dragEnd, false);

  gridContainer.removeEventListener("mousedown", dragStart, false);
  gridContainer.removeEventListener("mousemove", drag, false);
  gridContainer.removeEventListener("mouseup", dragEnd, false);
  gridContainer.removeEventListener("click", shipClick);
}

function addBtnListeners() {
  lockBtn.addEventListener("click", lockBoard);
}

function addGridBoxClickListeners() {
  const gridBoxes = gridContainer.querySelectorAll(".box");
  [...gridBoxes].forEach(gridBox => gridBox.addEventListener("click", gridBoxAttackHandler));
}

function addAttackGridClickListeners() {
  const attackBoxes = attackGridContainer.querySelectorAll(".box");
  [...attackBoxes].forEach(attackBox => attackBox.addEventListener("click", attackBoxHandler));
}

function attachListeners() {
  addGridContainerListeners();
  addAttackGridClickListeners();
  addBtnListeners();
}

function init() {
  buildGrid(attackGridContainer, gridRows, gridColumns);
  buildGrid(gridContainer, gridRows, gridColumns);
  positionShips();
  attachListeners();
}

init();
