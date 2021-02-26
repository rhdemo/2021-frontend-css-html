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
  },
  "Carrier": {
    id: 3,
    origin: [0, 4],
    orientation: "horizontal"
  }
};

const modalTimeout = 1500;

let attackGrid;
let shipGrid;

function Battleship({ board, player, opponent, boardLocked, attack, match, result, attacker }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ disableAttacks, setDisableAttacks ] = useState(false);
  const [ turnModalHidden, setTurnModalHidden ] = useState({ hidden: true });
  const [ turnModalText, setTurnModalText ] = useState("");
  const [ positionModalHidden, setPositionModalHidden ] = useState({ hidden: true });

  // initial configuraton
  useEffect(() => {
    const shipGridLocked = player.board && player.board.positions && player.board.positions.valid;
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
        attacks: opponent.attacks,
        locked: shipGridLocked,
      }
    });

    document.addEventListener("shipgrid:locked", boardLockedHandler);
    document.addEventListener("attackgrid:attack", attackGridAttackHandler);
  }, []);

  // record the result of the last attack on
  // the attack grid
  useEffect(() => {
    if (!result) {
      // there wasn't an attack, we just need to
      // indicate who's turn it is.
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

      return;
    }

    result.forEach(attack => {
      attack.position = {
        x: attack.origin[0],
        y: attack.origin[1]
      };

      // if the player is the attacker, record the result
      // on the attack grid. otherwise, record the incoming
      // attack on the shipgrid
      if (attacker === player.uuid) {
        attackGrid.recordAttack(attack);
      } else {
        shipGrid.incomingAttack(attack);
      }

      // wait for a short period before showing the
      // turn modal
      setTimeout(() => {
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
      }, 1000);
    });
  }, [ result, attacker, player, match ]);

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

  function boardLockedHandler(event) {
    attackGrid.enabled = true;
    boardLocked(event.detail.ships);
  }

  const attackGridAttackHandler = event => {
    attack(event.detail);
  }

  return (
    <div className="Battleship">
      {/* <div className={ !match.ready || match.activePlayer !== player.uuid ? "hide" : "" }> */}
      <div>
        <div className="board push-bottom">
          <h2>Enemy's Board</h2>
          <div id="attack-grid" ref={ attackGridRef }></div>
        </div>
      </div>
      {/* <div className={ match.ready && match.activePlayer === player.uuid ? "hide" : "" }> */}
      <div>
        <div className="board push-top">
          <h2>Your Board</h2>
          <div id="ship-grid" ref={ shipGridRef } className="push-bottom"></div>
          <button className="unlock-message push-bottom" id="ship-grid-lock-btn" style={{ display: match.ready ? "none" : "block" }}>Lock the board</button>
          { player.board && player.board.positions &&
            <h3>Board is locked</h3>
          }
          { player.board && !match.ready &&
            <p>Waiting for your enemy to position their ships</p>
          }
          { match.ready && match.activePlayer !== player.uuid &&
            <p>Waiting for your enemy to attack</p>
          }
          { match.ready && match.activePlayer === player.uuid &&
            <p>Your turn</p>
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
