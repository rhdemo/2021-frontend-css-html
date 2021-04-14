import { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import "./Header.scss";
import { ReactComponent as Badge } from "./images/badges/badge-1.svg";

function Header({ theActiveBoard, player }) {
  const [ playerPoints, setPlayerPoints ] = useState(0);
  const [ playerPointDifferential, setPlayerPointDifferential ] = useState(0);
  const [ playerPointDifferentialClasses, setPlayerPointDifferentialClasses ] = useState("");
  const [ pointsText, setPointsText ] = useState("points");
  const [ screenText, setScreenText ] = useState("");
  const prevPlayerPointsRef = useRef();

  prevPlayerPointsRef.current = playerPoints;

  function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  useEffect(() => {
    if (playerPoints === 1) {
      setPointsText("point");
    }

    let timeout;

    const pointDifferential = playerPoints - prevPlayerPointsRef.current;
    setPlayerPointDifferential(pointDifferential);

    if (pointDifferential > 0) {
      setPlayerPointDifferentialClasses("show");

      timeout = setTimeout(() => {
        setPlayerPointDifferentialClasses("");
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [ playerPoints ]);

  useEffect(() => {
    // need bonus round
    if (theActiveBoard === "attack") {
      setScreenText("Enemy Board");
    } else {
      setScreenText("Your Board");
    }
  }, [ theActiveBoard ]);

  useInterval(() => {
    const randomPointValue = Math.floor(Math.random() * (25 - 5) + 5);
    setPlayerPoints(playerPoints + randomPointValue);
    prevPlayerPointsRef.current = playerPoints;
  }, 5000);

  return (
    <header className="ui-header">
      <div className="ui-header-main">
        <Badge className="ui-header-main__badge" title="Badge" />
        <span className="ui-header-main__title">{ player.username }</span>
        <span className="ui-header-main__points">{ playerPoints } { pointsText }</span>
        <div className={ playerPointDifferentialClasses + " ui-header-main__points-animate" }>
            +{ playerPointDifferential } points
        </div>
      </div>
      <div className="ui-header-sub">
        <span className="ui-header-sub__text ui-screen-text">**** { screenText } ****</span>
      </div>
    </header>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
