import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import { boardLocked, attack, showError } from "./actions";
import destroyer from "./images/2.svg";
import destroyerHit from "./images/2-hit.svg";
import submarine from "./images/3.svg";
import submarineHit from "./images/3-hit.svg";
import battleship from "./images/4.svg";
import battleshipHit from "./images/4-hit.svg";
import carrier from "./images/5.svg";
import carrierHit from "./images/5-hit.svg";
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

let attackGrid;
let shipGrid;

function Battleship({ game, board, player, opponent, boardLocked, attack, match, result, attacker, theActiveBoard, badAttack, showError, replay }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ lockingBoard, setLockingBoard ] = useState(false);
  const [ disableAttacks, setDisableAttacks ] = useState(false);
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

    // clean up when the component is unmounted
    return () => {
      attackGrid.removeListeners();
      attackGrid.resetBoard();
      shipGrid.resetBoard();
      document.removeEventListener("shipgrid:locked", boardLockedHandler);
      document.removeEventListener("attackgrid:attack", attackGridAttackHandler);
    }
  }, []);

  // enable or disable functions on a board
  // based on which board is showing
  useEffect(() => {
    if (theActiveBoard === "attack") {
      attackGrid.enabled = true;
      setDisableAttacks(false);
    } else {
      attackGrid.enabled = false;
      setDisableAttacks(true);
    }
  }, [ theActiveBoard ]);

  // record the result of an attack
  useEffect(() => {
    if (!result) {
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
  }, [ result, attacker, player, match ]);

  useEffect(() => {
    if (!opponent || !opponent.board || !opponent.board.positions) {
      return;
    }

    Object.keys(opponent.board.positions).forEach(key => {
      enemyShips[key].destroyed = true;
    });

    setEnemyShips({...enemyShips});
  }, [ opponent ]);

  useEffect(() => {
    if (badAttack) {
      attackGrid.clearBadAttack();
    }
  }, [ badAttack ]);

  useEffect(() => {
    if (!lockingBoard) {
      return;
    }

    if (!player.board.valid) {
      showError("Invalid ship placement");
      shipGrid.unlockBoard();
      return;
    }

    setLockingBoard(false);
  }, [ player, showError ]);

  useEffect(() => {
    if (game.state !== "replay") {
      return;
    }

    // console.log("REPLAY!!!");
    shipGrid.resetBoard();
    attackGrid.resetBoard();
  }, [ game ]);

  function boardLockedHandler(event) {
    setLockingBoard(true);
    attackGrid.enabled = true;
    boardLocked(event.detail.ships);
  }

  function getShipTracker(enemyShipKey) {
    let ship;
    const destroyed = enemyShips[enemyShipKey].destroyed;

    switch (enemyShipKey) {
      case "Destroyer":
        ship = destroyed ? destroyerHit : destroyer;
        break;

      case "Submarine":
        ship = destroyed ? submarineHit : submarine;
        break;

      case "Battleship":
        ship = destroyed ? battleshipHit : battleship;
        break;

      case "Carrier":
        ship = destroyed ? carrierHit : carrier;
        break;
    
      default:
        break;
    }

    return (
      <img src={ ship } />
    );
  }

  const attackGridAttackHandler = event => {
    // console.log('attack event detail', event.detail);
    attack(event.detail);
  }

  return (
    <div className={ match.state.phase === "bonus" ? "Battleship bonus-round" : "Battleship"}>
      <div className={ theActiveBoard === "attack" ? "board-container" : "board-container hide" }>
        <div className="board push-bottom">
          <div id="attack-grid" className="ship-grid" ref={ attackGridRef }>
            <div className="bouy"></div>
            <div className="bouy"></div>
            <div className="bouy"></div>
            <div className="bouy"></div>
          </div>
          <ul className="ui-progress">
          { Object.keys(enemyShips).map((enemyShipKey, index) =>
            <li key={ index }>
              { getShipTracker(enemyShipKey) }
              { enemyShipKey }
            </li>
          )}
          </ul>
          <div className="pause-grid">
            <span>p</span>
            <span>a</span>
            <span>u</span>
            <span>s</span>
            <span>e</span>
          </div>
        </div>
      </div>
      <div className={ theActiveBoard === "ship" ? "board-container" : "board-container hide" }>
        <div className="board">
          <div id="ship-grid" className={ match.state.phase === "not-ready" ? "not-ready ship-grid" : "ship-grid" } ref={ shipGridRef }>
            <div className="bouy"></div>
            <div className="bouy"></div>
            <div className="bouy"></div>
            <div className="bouy"></div>
          </div>
          <div className="pause-grid">
            <span>p</span>
            <span>a</span>
            <span>u</span>
            <span>s</span>
            <span>e</span>
          </div>
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
    boardLocked: ships => {
      dispatch(boardLocked(ships));
    },
    attack: data => {
      dispatch(attack(data));
    },
    showError: message => {
      dispatch(showError(message));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Battleship);
