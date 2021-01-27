import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import Modal from "../Modal";
import { boardLocked, attack } from "./actions";
import "./Battleship.scss";

// temporary fix. the initial configuration
// for ships should be coming from the socket
const ships = {
  "Submarine": {
    id: 0,
    origin: [0, 0]
  },
  "Destroyer": {
    id: 1,
    origin: [2, 2]
  },
  "Battleship": {
    id: 2,
    origin: [1, 1],
    orientation: "horizontal"
  }
};

const modalTimeout = 3000;

let attackGrid;
let shipGrid;

function Battleship({ board, player, boardLocked, attack, match, result }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ attackType, setAttackType ] = useState(null);
  const [ disableAttacks, setDisableAttacks ] = useState(false);
  const [ turnModalHidden, setTurnModalHidden ] = useState({ hidden: true });
  const [ turnModalText, setTurnModalText ] = useState("");
  const [ positionModalHidden, setPositionModalHidden ] = useState({ hidden: true });
  
  // initial configuraton
  useEffect(() => {
    const shipGridLocked = player.board && player.board.positions ? true : false;
    const attackGridEnabled = shipGridLocked ? true : false;

    attackGrid = new AttackGrid({
      rows: board.rows,
      columns: board.columns,
      container: attackGridRef.current,
      initialState: {
        enabled: attackGridEnabled,
        attacks: player.attacks
      }
    });

    shipGrid = new ShipGrid({
      rows: board.rows,
      columns: board.columns,
      container: shipGridRef.current,
      initialState: {
        ships: (player.board) ? player.board.positions : ships,
        locked: shipGridLocked
      }
    });
  
    document.addEventListener("shipgrid:locked", boardLockedHandler);
    document.addEventListener("attackgrid:attack", attackGridAttackHandler);
  }, []);

  // set the attackType on the attack grid
  // so when the user clicks a box on the grid,
  // we show the correct shot type
  useEffect(() => {
    if (!attackGrid || !attackType) {
      return;
    }

    attackGrid.attackType = attackType;
  }, [attackType]);

  // show a modal to indicate who's turn it is
  useEffect(() => {
    if (!match.ready) {
      return;
    }

    if (player.uuid === match.activePlayer) {
      setTurnModalText("Your turn");
      attackGrid.enabled = true;
      setDisableAttacks(false);
    } else {
      setTurnModalText("Enemy's turn");
      attackGrid.enabled = false;
      setDisableAttacks(true);
    }

    setTurnModalHidden(null);

    setTimeout(() => {
      setTurnModalHidden({ hidden: true });
    }, modalTimeout);
  }, [ player.uuid, match.activePlayer, match.ready ]);

  // record the result of the last attack on
  // the attack grid
  useEffect(() => {
    if (!result) {
      return;
    }

    result.forEach(attack => {
      attack.position = {
        x: attack.origin[0],
        y: attack.origin[1]
      };

      attackGrid.recordAttack(attack);
    });
  }, [ result ]);

  // record an incoming attack on the ship grid
  useEffect(() => {
    if (!player.board || !player.board.positions) {
      return;
    }

    Object.keys(player.board.positions).forEach(key => {
      const ship = player.board.positions[key];
      ship.cells.forEach((cell, index) => {
        if (!cell.hit) {
          return;
        }

        cell.type = key;
        cell.position = index;
        cell.coordinates = {
          x: cell.origin[0],
          y: cell.origin[1]
        };
        
        shipGrid.incomingAttack(cell);
      });
    });
  }, [ player.board ]);

  // show a modal if the player has not set up
  // their board yet
  useEffect(() => {
    if (player.board) {
      setPositionModalHidden({ hidden: true });
    } else {
      setPositionModalHidden(null);

      setTimeout(() => {
        setPositionModalHidden({ hidden: true });
      }, modalTimeout);
    }
  }, [ player.board ]);

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
      <div className={ !match.ready || match.activePlayer !== player.uuid ? "hide" : "" }>
        <div className="board push-bottom">
          <h2>Enemy Grid</h2>
          <div id="attack-grid" ref={ attackGridRef }></div>
          <div className="push-bottom">
            <p>Choose an attack</p>
            <label>
              <input type="radio" name="shot-type" value="1x1" onChange={ shotTypeChangeHandler } disabled={ disableAttacks ? "disabled" : null }></input>
              1x1
            </label>
            <label>
              <input type="radio" name="shot-type" value="2x1" onChange={ shotTypeChangeHandler } disabled={ disableAttacks ? "disabled" : null }></input>
              2x1
            </label>
            <label>
              <input type="radio" name="shot-type" value="4x1" onChange={ shotTypeChangeHandler } disabled={ disableAttacks ? "disabled" : null }></input>
              4x1
            </label>
            <label>
              <input type="radio" name="shot-type" value="2x2" onChange={ shotTypeChangeHandler } disabled={ disableAttacks ? "disabled" : null }></input>
              2x2
            </label>
          </div>
          <button id="attack-grid-fire-btn" className="push-bottom">Fire now!</button>
        </div>
      </div>
      <div className={ match.activePlayer === player.uuid ? "hide" : "" }>
        <div className="board push-top">
          <h2>Your Board</h2>
          <div id="ship-grid" ref={ shipGridRef } className="push-bottom"></div>
          <button className="unlock-message push-bottom" id="ship-grid-lock-btn">Lock the board</button>
          { player.board && player.board.positions &&
            <h3>Board is locked</h3>
          }
          { player.board && !match.ready &&
            <p>Waiting for your opponent to position their ships</p>
          }
          { match.ready && match.activePlayer !== player.uuid &&
            <p>Waiting for your opponent to attack</p>
          }
        </div>
      </div>
      <Modal { ...turnModalHidden }>
        <h2>{ turnModalText }</h2>
      </Modal>
      <Modal { ...positionModalHidden }>
        <h2>Position your ships</h2>
      </Modal>
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