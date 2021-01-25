import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import { boardLocked, attack } from "./actions";
import "./Battleship.scss";

// temporary fix. the initial configuration
// for ships should be coming from the socket
const ships = {
  "Submarine": {
    id: 0,
    position: [0, 0]
  },
  "Destroyer": {
    id: 1,
    position: [2, 2]
  },
  "Battleship": {
    id: 2,
    position: [1, 1],
    orientation: "horizontal"
  }
}

let attackGrid;
let shipGrid;

function Battleship({ board, player, boardLocked, attack }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ attackType, setAttackType ] = useState(null);
  
  useEffect(() => {
    const shipGridLocked = player.board && player.board.positions ? true : false;
    const attackGridEnabled = shipGridLocked ? true : false;

    attackGrid = new AttackGrid({
      rows: board.rows,
      columns: board.columns,
      container: attackGridRef.current,
      initialState: {
        enabled: attackGridEnabled
      }
    });

    shipGrid = new ShipGrid({
      rows: board.rows,
      columns: board.columns,
      container: shipGridRef.current,
      initialState: {
        // ships: player.shipPositions
        ships: ships,
        locked: shipGridLocked
      }
    });
  
    document.addEventListener("shipgrid:locked", boardLockedHandler);
    document.addEventListener("attackgrid:attack", attackGridAttackHandler);
  }, []);

  useEffect(() => {
    if (!attackGrid || !attackType) {
      return;
    }

    attackGrid.attackType = attackType;
  }, [attackType]);

  function shotTypeChangeHandler(event) {
    setAttackType(event.target.value);
  }

  function boardLockedHandler(event) {
    attackGrid.enabled = true;
    boardLocked(event.detail.ships);
  }

  const attackGridAttackHandler = event => {
    attack(event.detail);
  }

  return (
    <div className="Battleship">
      <div className="board push-bottom">
        <h2>Enemy Grid</h2>
        <div id="attack-grid" ref={ attackGridRef }></div>
        <div className="push-bottom">
          <p>Choose an attack</p>
          <label>
            <input type="radio" name="shot-type" value="1x1" onChange={ shotTypeChangeHandler }></input>
            1x1
          </label>
          <label>
            <input type="radio" name="shot-type" value="2x1" onChange={ shotTypeChangeHandler }></input>
            2x1
          </label>
          <label>
            <input type="radio" name="shot-type" value="4x1" onChange={ shotTypeChangeHandler }></input>
            4x1
          </label>
          <label>
            <input type="radio" name="shot-type" value="2x2" onChange={ shotTypeChangeHandler }></input>
            2x2
          </label>
        </div>
        <button id="attack-grid-fire-btn" className="push-bottom">Fire now!</button>
      </div>
      <div className="board push-top">
        <h2>Your Board</h2>
        <div id="ship-grid" ref={ shipGridRef } className="push-bottom"></div>
        <button className="unlock-message push-bottom" id="ship-grid-lock-btn">Lock the board</button>
        { player.board && player.board.positions &&
          <h3>Board is locked</h3>
        }
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {
    boardLocked: ships => {
      dispatch(boardLocked(ships));
    },
    attack: data => {
      dispatch(attack(data));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Battleship);