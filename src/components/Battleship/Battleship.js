import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import Modal from "../Modal";
import { boardLocked, attack, bonus } from "./actions";
import "./Battleship.scss";

/*
 * Ships not positioned:
 * - Show ship grid
 * - Hide enemy grid
 *
 * Ships positioned, waiting on enemy
 * - Show ship grid
 * - Hide enemy grid
 *
 * Ships positioned, your turn
 * - Show enemy grid
 * - Hide ship grid
 *
 * Ships positioned, enemy's turn
 * - Show ship grid
 * - Hide enemy grid
 */

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

let modalTimeout;

let attackGrid;
let shipGrid;

function Battleship({ game, board, player, opponent, boardLocked, attack, bonus, match, result, attacker }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ disableAttacks, setDisableAttacks ] = useState(false);
  const [ turnModalHidden, setTurnModalHidden ] = useState({ hidden: true });
  const [ turnModalText, setTurnModalText ] = useState("");
  const [ positionModalHidden, setPositionModalHidden ] = useState({ hidden: true });
  const [ bonusModalHidden, setBonusModalHidden ] = useState({ hidden: true });
  const [ activeBoard, setActiveBoard ] = useState(null);
  const [ enemyShips, setEnemyShips ] = useState({
    "Submarine": {
      destroyed: false
    },
    "Destroyer": {
      destroyed: false
    },
    "Battleship": {
      destroyed: false
    },
    "Carrier": {
      destroyed: false
    }
  });

  // initial configuraton
  useEffect(() => {
    const shipGridLocked = player.board && player.board.positions && player.board.valid;
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

    setEnemyShips({
      "Submarine": {
        destroyed: false
      },
      "Destroyer": {
        destroyed: false
      },
      "Battleship": {
        destroyed: false
      },
      "Carrier": {
        destroyed: false
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
      if (match.state.phase === 'not-ready') {
        setActiveBoard("ship");
        return;
      }

      modalTimeout = 1500;
      let activeModal;
      let isBonusRound = false;

      if (player.uuid === match.state.activePlayer && match.state.phase === "attack") {
        setTurnModalText("Your turn");
        attackGrid.enabled = true;
        setDisableAttacks(false);
        setActiveBoard("attack");
        activeModal = setTurnModalHidden;
      } else if (player.uuid === match.state.activePlayer && match.state.phase === "bonus") {
        setTurnModalText("Sending bonus");
        modalTimeout = game.bonusDuration;
        activeModal = setBonusModalHidden;
        isBonusRound = true;
        attackGrid.enabled = false;
        setDisableAttacks(true);
        setActiveBoard("attack");
        bonus(0);
      } else {
        setTurnModalText("Enemy's turn");
        attackGrid.enabled = false;
        setDisableAttacks(true);
        setActiveBoard("ship");
        activeModal = setTurnModalHidden;
      }

      activeModal(null);

      setTimeout(() => {
        activeModal({ hidden: true });
        if (isBonusRound) {
          // bonus(0);
        }

        isBonusRound = false;
      }, modalTimeout);

      return;
    }

      result.position = {
        x: result.origin[0],
        y: result.origin[1]
      };

      // if the player is the attacker, record the result
      // on the attack grid. otherwise, record the incoming
      // attack on the shipgrid
      if (attacker === player.uuid) {
        attackGrid.recordAttack(result);
      } else {
        shipGrid.incomingAttack(result);
      }

      // if the attack destroyed a ship, record it.
      // @TODO: show interstitial animation
      if (result.destroyed) {
        if (player.uuid === match.state.activePlayer) {
          enemyShips[result.type].destroyed = true;
          setEnemyShips({...enemyShips});
          // alert(`You destroyed the ${result.type}`);
        } else {
          // alert(`Your ${result.type} was destroyed`);
        }
      }

      // wait for a short period before showing the
      // turn modal
      let activeModal;
      let isBonusRound = false;

      setTimeout(() => {
        if (player.uuid === match.state.activePlayer && match.state.phase === "attack") {
          setTurnModalText("Your turn");
          attackGrid.enabled = true;
          setDisableAttacks(false);
          setActiveBoard("attack");
          activeModal = setTurnModalHidden;
        } else if (player.uuid === match.state.activePlayer && match.state.phase === "bonus") {
          setTurnModalText("Sending default bonus value");
          modalTimeout = game.bonusDuration;
          activeModal = setBonusModalHidden;
          isBonusRound = true;
          // bonus(0)
        } else {
          setTurnModalText("Enemy's turn");
          attackGrid.enabled = false;
          setDisableAttacks(true);
          setActiveBoard("ship");
          activeModal = setTurnModalHidden;
        }

        activeModal(null);

        setTimeout(() => {
          activeModal({ hidden: true });

          if (isBonusRound) {
            bonus(0);
          }

          isBonusRound = false;
        }, modalTimeout);
      }, 1000);

  }, [ result, attacker, player, match ]);

  // show a modal if the player has not set up
  // their board yet
  useEffect(() => {
    if (player.board && player.board.valid) {
      setPositionModalHidden({ hidden: true });
    } else {
      setPositionModalHidden(null);

      setTimeout(() => {
        setPositionModalHidden({ hidden: true });
      }, modalTimeout);
    }
  }, [ player.board ]);

  useEffect(() => {
    if (!opponent || !opponent.board) {
      return;
    }

    Object.keys(opponent.board).forEach(key => {
      enemyShips[key].destroyed = true;
    });

    setEnemyShips({...enemyShips});
  }, [ opponent ]);

  function boardLockedHandler(event) {
    attackGrid.enabled = true;
    boardLocked(event.detail.ships);
  }

  const attackGridAttackHandler = event => {
    console.log('attack event detail', event.detail)
    attack(event.detail);
  }

  return (
    <div className="Battleship">
      <div className={ activeBoard === "attack" ? "board-container" : "board-container hide" }>
        <div className="board push-bottom">
          <h2>Enemy's Board</h2>
          <div className="opponent-ships-list push-bottom">
          { Object.keys(enemyShips).map((enemyShipKey, index) =>
            <div key={ index }><input type="checkbox" disabled checked={ !!enemyShips[enemyShipKey].destroyed } />{ enemyShipKey }</div>
          )}
          </div>
          <div id="attack-grid" ref={ attackGridRef }></div>
          <p>Choose a cell to attack</p>
        </div>
      </div>
      <div className={ activeBoard === "ship" ? "board-container" : "board-container hide" }>
        <div className="board push-top">
          <h2>Your Board</h2>
          <div id="ship-grid" ref={ shipGridRef } className="push-bottom"></div>
          <button className="unlock-message push-bottom" id="ship-grid-lock-btn" style={{ display: match.state.phase !== "not-ready" ? "none" : "block" }}>Lock the board</button>
          { player.board && player.board.valid && match.state.phase === "not-ready" &&
            <h3>Board is locked</h3>
          }
          { player.board && player.board.valid && match.state.phase === "not-ready" &&
            <p>Waiting for your enemy to position their ships</p>
          }
          { match.state.phase !== "not-ready" && match.state.activePlayer !== player.uuid &&
            <p>Waiting for your enemy to attack</p>
          }
          { match.state.phase !== "not-ready" && match.state.activePlayer === player.uuid &&
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
      <Modal { ...bonusModalHidden }>
        <h2>Bonus Round</h2>
        <button>Click!!!</button>
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
    },
    bonus: data => {
      console.log('sending bonus', data)
      dispatch(bonus(data));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Battleship);
