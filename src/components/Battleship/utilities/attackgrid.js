import Grid from "./grid.js";

// This is where we'll send the server an attack.
// Different types of attacks can be made and the
// server will send the types of attacks and the
// number of each type.
//
// The attack grid will be dumb in that it will not
// know any of the enemy ship positions. We'll rely
// on the server for that.
//
// To attack:
// The user will choose an attack type, select a
// position on the grid, and then hit a "Fire"
// button at the bottom of the grid to send the
// attack top/left location, the orientation, and
// the type of attack.
//
// Server response after an attack:
// The server will send back whether the attack
// was a hit or miss and whether or not a ship was
// destroyed. It's possible with the type of attacks
// that multiple ships could be destroyed with a
// single attack.

class AttackGrid extends Grid {
  get enabled() {
    return this.enabled;
  }

  set enabled(bool) {
    if (bool) {
      console.log(`${this.constructor.name} - Attack grid enabled`);
      this.addListeners();
      this.attacking = false;
    } else {
      console.log(`${this.constructor.name} - Attack grid disabled`);
      this.removeListeners();
    }
  }

  constructor(configuration) {
    super(configuration);

    this.gridClickHandler = this.gridClickHandler.bind(this);
    this.attack = this.attack.bind(this);
    this.recordAttack = this.recordAttack.bind(this);

    this.attacking = false;
    this.attackType = "1x1";
    this.attackOrigin = {};
    this.attackOrientation = "horizontal"; // hardcoded for now
    this.selectedGridBoxes = null;
    this.enabled = configuration.initialState.enabled || false;
    this.initialAttacks = configuration.initialState.attacks;

    this.setInitialAttacks();
  }

  setInitialAttacks() {
    this.initialAttacks.forEach(attack => {
      const {result} =  attack
      // get the box
      const box = this.element.querySelector(`.box[row="${result.origin[1]}"][column="${result.origin[0]}"]`);
      if (box) {
        if (result.hit) {
          box.classList.add("hit");
        } else {
          box.classList.add("miss");
        }
      }
    });
  }

  getGridBoxes(origin, attackType) {
    const boxes = [];

    if (!origin || !attackType) {
      return boxes;
    }

    const attackTypeArr = attackType.split("x");
    const iterations = attackTypeArr.reduce((acc, current) => acc * current);

    let x = origin.x;
    let y = origin.y;

    for (let i = 0; i < iterations; i++) {
      const box = this.element.querySelector(`.box[column="${x}"][row="${y}"]`);
      if (box) {
        boxes.push(box);
      }

      x++;

      if (x >= origin.x + parseInt(attackTypeArr[0], 10)) {
        x = origin.x;
        y++;
      }
    }

    return boxes;
  }

  gridClickHandler(event) {
    if (this.attacking) {
      return;
    }

    const box = event.target;

    if (box.classList.contains("miss") || box.classList.contains("hit")) {
      return;
    }

    if (this.selectedGridBoxes) {
      this.selectedGridBoxes.forEach(box => box.classList.remove("attacking"));
    }

    const row = parseInt(box.getAttribute("row"), 10);
    const column = parseInt(box.getAttribute("column"), 10);

    this.attackOrigin = {
      x: column,
      y: row
    };

    const gridBoxes = this.getGridBoxes(this.attackOrigin, this.attackType);
    gridBoxes.forEach(box => box.classList.add("attacking"));
    this.selectedGridBoxes = gridBoxes;

    // bypassing the shot selection
    this.attack();
  }

  attack() {
    if (!this.attackType || this.attackOrigin.x === null || this.attackOrigin.y === null || !this.attackOrientation) {
      return;
    }

    const attackEvent = new CustomEvent("attackgrid:attack", {
      bubbles: true,
      detail: {
        type: this.attackType,
        origin: [this.attackOrigin.x, this.attackOrigin.y],
        orientation: this.attackOrientation
      }
    });

    console.log(`${this.constructor.name} - Attacking: `, attackEvent.detail);
    this.attacking = true;
    this.element.dispatchEvent(attackEvent);
  }

  addListeners() {
    this.element.addEventListener("click", this.gridClickHandler, false);
  }

  removeListeners() {
    this.element.removeEventListener("click", this.gridClickHandler, false);
  }

  recordAttack(message) {
    const position = message.position;

    // find the grid box
    const gridBox = this.element.querySelector(`.box[row="${position.y}"][column="${position.x}"]`);

    if (message.hit) {
      gridBox.classList.add("hit");

      // if the ship has been destroyed, add a destroyed class to its pieces
      if (message.destroyed) {
        // message.ship.state.forEach(piece => {
        //   const coordinates = piece.coordinates;
        //   const box = this.element.querySelector(`.box[row="${coordinates.y}"][column="${coordinates.x}"]`);
        //   box.classList.add("destroyed");
        // });

        // alert(`You destroyed the ${message.type}`);
      }
    } else {
      gridBox.classList.add("miss");
    }

    gridBox.classList.remove("attacking");

    this.attackOrigin = {};
  }

  clearBadAttack() {
    // find the grid box
    const gridBox = this.element.querySelector(`.box[row="${this.attackOrigin.y}"][column="${this.attackOrigin.x}"]`);
    if (!gridBox) {
      return;
    }
    
    gridBox.classList.remove("attacking");

    this.attackOrigin = {};
    this.attacking = false;
  }

  resetBoard() {
    const boxes = [...this.element.querySelectorAll(`.box`)];
    boxes.forEach(box => box.classList.remove("attacking", "miss", "hit"));
  }
}

export default AttackGrid;
