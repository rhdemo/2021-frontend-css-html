import { connect } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { bonus } from "./actions";
import target from "./images/target.svg";
import bonusDestroyer from "./images/bonus-destroyer.svg";
import bonusSubmarine from "./images/bonus-sub.svg";
import bonusBattleship from "./images/bonus-battleship.svg";
import bonusCarrier from "./images/bonus-carrier.svg";
import "./Footer.scss";

let bonusTargetShakeTimeout;

function Footer({ player, match, game, result, bonus, theActiveBoard, replay }) {
  const [ bonusHits, setBonusHits ] = useState(0);
  const [ bonusShip, setBonusShip ] = useState();
  const [ bonusShipClass, setBonusShipClass ] = useState("");
  const [ bonusTargetShakeClass, setBonusTargetShakeClass ] = useState("");
  const gameRef = useRef(game);
  gameRef.current = game;
  const bonusHitsRef = useRef(bonusHits);
  bonusHitsRef.current = bonusHits;

  // bonus round logic
  useEffect(() => {
    if (match.state.phase !== "bonus") {
      return;
    }

    if (replay) {
      return;
    }

    if (!result) {
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
      if (player.uuid === match.state.activePlayer && gameRef.current.state !== "paused") {
        bonus(bonusHitsRef.current);
        
        setTimeout(() => {
          setBonusHits(0);
        }, 100);
      }
    }, game.bonusDuration);
  }, [ game, match, player, result, replay ]);

  function bonusTargetClickHandler() {
    if (match.state.phase !== "bonus") {
      return;
    }
    
    setBonusHits(bonusHits + 1);
    
    setBonusTargetShakeClass("shake");

    clearTimeout(bonusTargetShakeTimeout);
    bonusTargetShakeTimeout = setTimeout(() => {
      setBonusTargetShakeClass("");
    }, 200);
  }

  function getFooterActionClasses() {
    let str = "ui-footer";

    if (game.state === "paused") {
      return `${str} ui-footer__min`;
    }

    if (match.state.phase === "not-ready") {
      if (!player.board.valid) {
        return `${str} ui-footer__action`;
      } else {
        return `${str} ui-footer__min`;
      }
    }

    if (match.state.phase === "bonus" && match.state.activePlayer === player.uuid && !replay) {
      return `${str} ui-footer__bonus`;
    }

    return `${str} ui-footer__min`;
  }

  function getActionButtonDisplay() {
    let display = "block";

    if (match.state.phase !== "not-ready" || (match.state.phase === "not-ready" && player.board.valid)) {
      display = "none";
    }

    if (game.state === "paused" && match.state.phase === "not-ready") {
      display = "none";
    }

    return {
      display: display
    };
  }

  return (
    <footer className={ getFooterActionClasses() }>
      <div className="ui-footer-overlay"></div>
      <div className="ui-footer__screen-text-wrap">
        { !replay && 
          <>
            { player.board && !player.board.valid && match.state.phase === "not-ready" &&
              <span className="ui-footer__screen-text-scroll ui-screen-text">** Position your ships ** ** Position your ships ** ** Position your ships ** ** Position your ships ** ** Position your ships ** ** Position your ships ** </span>
            }
            { player.board && player.board.valid && match.state.phase === "not-ready" &&
              <span className="ui-footer__screen-text-scroll ui-screen-text">** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** ** Waiting for enemy ** </span>
            }
            { match.state.phase === "attack" && theActiveBoard === "ship" && match.state.activePlayer !== player.uuid &&
              <span className="ui-footer__screen-text-scroll ui-screen-text">** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** ** Incoming enemy attack ** </span>
            }
            { match.state.phase === "attack" && theActiveBoard === "attack" && match.state.activePlayer === player.uuid &&
              <span className="ui-footer__screen-text-scroll ui-screen-text">** Take a shot ** Take a shot ** Take a shot ** Take a shot ** Take a shot ** Take a shot ** Take a shot ** Take a shot ** Take a shot ** Take a shot ** </span>
            }
            { match.state.phase === "bonus" && match.state.activePlayer === player.uuid && !replay &&
              <span className="ui-footer__screen-text-scroll ui-screen-text">** Bonus round ** Fire ** Bonus round ** Fire ** Bonus round ** Fire ** Bonus round ** Fire ** </span>
            }
          </>
        }
        { replay &&
          <span className="ui-footer__screen-text-scroll ui-screen-text">** Replay ** ** Replay ** ** Replay ** ** Replay ** ** Replay ** ** Replay ** ** Replay ** ** Replay ** ** Replay **</span>
        }
      </div>
      <div className="ui-footer__bonus__sky"></div>
      <div className={ bonusShipClass + " ui-footer__bonus__ship"}></div>
      <div className={ bonusTargetShakeClass + " ui-footer__bonus__target" }>
        <img src={ target } alt="" />
      </div>
      <div className="ui-footer__bonus__water"></div>
      <div className="ui-footer__bonus__points">+{ bonusHits }</div>
      <button className="ui-footer__bonus__action" aria-label="fire" onClick={ bonusTargetClickHandler }></button>
      <button className="ui-footer__btn unlock-message push-bottom" id="ship-grid-lock-btn" style={ getActionButtonDisplay() }>Click to Play</button>
    </footer>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {
    bonus: data => {
      // console.log('sending bonus', data)
      dispatch(bonus(data));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);

