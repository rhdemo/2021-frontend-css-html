import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import AttackGrid from "./utilities/attackgrid";
import ShipGrid from "./utilities/shipgrid";
import { boardLocked, attack, bonus, showError } from "./actions";
import target from "./images/target.svg";
import destroyer from "./images/2.svg";
import destroyerHit from "./images/2-hit.svg";
import submarine from "./images/3.svg";
import submarineHit from "./images/3-hit.svg";
import battleship from "./images/4.svg";
import battleshipHit from "./images/4-hit.svg";
import carrier from "./images/5.svg";
import carrierHit from "./images/5-hit.svg";
import bonusDestroyer from "./images/bonus-destroyer.svg";
import bonusSubmarine from "./images/bonus-sub.svg";
import bonusBattleship from "./images/bonus-battleship.svg";
import bonusCarrier from "./images/bonus-carrier.svg";
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
let bonusTargetShakeTimeout;

function Battleship({ game, board, player, opponent, boardLocked, attack, bonus, match, result, attacker, theActiveBoard, badAttack, showError }) {
  const attackGridRef = useRef();
  const shipGridRef = useRef();
  const [ lockingBoard, setLockingBoard ] = useState(false);
  const [ disableAttacks, setDisableAttacks ] = useState(false);
  const [ bonusHits, setBonusHits ] = useState(0);
  const [ bonusShip, setBonusShip ] = useState();
  const [ bonusShipClass, setBonusShipClass ] = useState("");
  const [ bonusTargetShakeClass, setBonusTargetShakeClass ] = useState("");
  const bonusHitsRef = useRef(bonusHits);
  bonusHitsRef.current = bonusHits;
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

  // bonus round logic
  useEffect(() => {
    if (match.state.phase !== "bonus") {
      return;
    }

    setBonusShipClass(result.type);

    switch (result.type) {
      case "Destroyer":
        setBonusShip(bonusDestroyer);
        break;

      case "Submarine":
        setBonusShip(bonusSubmarine);
        break;

      case "Battleship":
        setBonusShip(bonusBattleship);
        break;

      case "Carrier":
        setBonusShip(bonusCarrier);
        break;
    
      default:
        break;
    }

    setTimeout(() => {
      if (player.uuid === match.state.activePlayer) {
        bonus(bonusHitsRef.current);
        setBonusHits(0);
      }
    }, game.bonusDuration);
  }, [ game, match, player, result ]);

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

  function boardLockedHandler(event) {
    setLockingBoard(true);
    attackGrid.enabled = true;
    boardLocked(event.detail.ships);
  }

  function getFooterActionClasses() {
    let str = "ui-footer";

    if (match.state.phase === "not-ready") {
      if (!player.board.valid) {
        return `${str} ui-footer__action`;
      } else {
        return `${str} ui-footer__min`;
      }
    }

    if (match.state.phase === "bonus" && match.state.activePlayer === player.uuid) {
      return `${str} ui-footer__bonus`;
    }

    return `${str} ui-footer__min`;
  }

  function getActionButtonDisplay() {
    let display = "block";

    if (match.state.phase !== "not-ready" || (match.state.phase === "not-ready" && player.board.valid)) {
      display = "none";
    }

    return {
      display: display
    };
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

  function bonusTargetClickHandler() {
    setBonusHits(bonusHits + 1);
    
    setBonusTargetShakeClass("shake");

    clearTimeout(bonusTargetShakeTimeout);
    bonusTargetShakeTimeout = setTimeout(() => {
      setBonusTargetShakeClass("");
    }, 200);
  }

  const attackGridAttackHandler = event => {
    console.log('attack event detail', event.detail);
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
          <footer className={ getFooterActionClasses() }>
            <div className="ui-footer-overlay"></div>
            <div className="ui-footer__screen-text-wrap">
              { match.state.phase === "attack" && match.state.activePlayer === player.uuid &&
                <span className="ui-footer__screen-text-scroll ui-screen-text">** Take a shot ** Bonus Round ** Take a shot ** Bonus Round ** Bonus Round ** Take a shot ** Bonus Round ** Take a shot ** Bonus Round ** Take a shot ** Take a shot ** Bonus Round ** Take a shot ** Bonus Round ** Bonus Round ** Take a shot ** Bonus Round ** Take a shot ** Bonus Round ** Take a shot ** </span>
              }
              { match.state.phase === "bonus" && match.state.activePlayer === player.uuid &&
                <span className="ui-footer__screen-text-scroll ui-screen-text">** Bonus round ** Fire ** Bonus round ** Fire ** Bonus round ** Fire ** Bonus round ** Fire ** </span>
              }
            </div>
            <div className="ui-footer__bonus__sky"></div>
            <div className={ bonusShipClass + " ui-footer__bonus__ship"}>
            </div>
            <div className={ bonusTargetShakeClass + " ui-footer__bonus__target" }>
              <img src={ target } alt="" />
            </div>
            <div className="ui-footer__bonus__water"></div>
            <div className="ui-footer__bonus__points">+{ bonusHits }</div>
            <a href="#" className="ui-footer__bonus__action" aria-label="fire" onClick={ bonusTargetClickHandler }></a>
          </footer>
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
          <footer className={ getFooterActionClasses() }>
            <div className="ui-footer-overlay"></div>
            <div className="ui-footer__screen-text-wrap">
              { player.board && !player.board.valid && match.state.phase === "not-ready" &&
                <span className="ui-footer__screen-text-scroll ui-screen-text">** Position your ships ** ** Position your ships ** ** Position your ships ** ** Position your ships ** ** Position your ships ** ** Position your ships ** </span>
              }
              { player.board && player.board.valid && match.state.phase === "not-ready" &&
                <span className="ui-footer__screen-text-scroll ui-screen-text">** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** </span>
              }
              { match.state.phase === "attack" && match.state.activePlayer !== player.uuid &&
                <span className="ui-footer__screen-text-scroll ui-screen-text">** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** </span>
              }
            </div>
            <button className="ui-footer__btn unlock-message push-bottom" id="ship-grid-lock-btn" style={ getActionButtonDisplay() }>Click to Play</button>
          </footer>
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
    bonus: data => {
      console.log('sending bonus', data)
      dispatch(bonus(data));
    },
    showError: message => {
      dispatch(showError(message));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Battleship);
