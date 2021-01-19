import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import { boardLocked, attack } from "./actions";
import "./Battleship.scss";

function Battleship({ board, player, boardLocked, attack }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();

  useEffect(() => {
    new AttackGrid({
      rows: board.rows,
      columns: board.columns,
      container: attackGridRef.current,
      initialState: {}
    });

    new ShipGrid({
      rows: board.rows,
      columns: board.columns,
      container: shipGridRef.current,
      initialState: {
        ships: player.shipPositions
      }
    });
  }, [player.shipPositions]);

  document.addEventListener("shipgrid:locked", event => boardLocked(event.detail.board));
  document.addEventListener("attackgrid:attack", event => attack(event.detail));

  return (
    <div className="Battleship">
      <div>
        <h2>Enemy Grid</h2>
        <div id="attack-grid" ref={ attackGridRef }></div>
        <button id="attack-grid-fire-btn">Fire now!</button>
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