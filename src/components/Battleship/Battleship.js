import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import { boardLocked, attack } from "./actions";
import "./Battleship.scss";

let attackGrid;
let shipGrid;

function Battleship({ board, player, boardLocked, attack }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ attackType, setAttackType ] = useState(null);
  
  useEffect(() => {
    attackGrid = new AttackGrid({
      rows: board.rows,
      columns: board.columns,
      container: attackGridRef.current,
      initialState: {}
    });

    shipGrid = new ShipGrid({
      rows: board.rows,
      columns: board.columns,
      container: shipGridRef.current,
      initialState: {
        ships: player.shipPositions
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
    boardLocked(event.detail.board);
  }

  const attackGridAttackHandler = event => {
    attack(event.detail);
  }

  return (
    <div className="Battleship">
      <div>
        <h2>Enemy Grid</h2>
        <div id="attack-grid" ref={ attackGridRef }></div>
        <button id="attack-grid-fire-btn">Fire now!</button>
        <div>
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
      </div>
      <div>
        <h2>Your Board</h2>
        <div id="ship-grid" ref={ shipGridRef }></div>
        <button className="unlock-message" id="ship-grid-lock-btn">Lock the board</button>
    		<div className="lock-message">
    			<h3>Board is locked</h3>
    			<p>Simulate an attack by clicking a box</p>
    		</div>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {
    boardLocked: board => {
      dispatch(boardLocked(board));
    },
    attack: data => {
      dispatch(attack(data));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Battleship);