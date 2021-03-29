import { useState, useEffect } from "react";
import { connect } from "react-redux";
import "./Header.scss";
import { ReactComponent as Badge } from "./images/badges/badge-1.svg";

function Header({ theActiveBoard, player }) {
  const [ pointsText, setPointsText ] = useState("points");
  const [ screenText, setScreenText ] = useState("");

  useEffect(() => {
    if (player.score === 1) {
      setPointsText("point");
    }
  }, [ player.score ]);

  useEffect(() => {
    // need bonus round
    if (theActiveBoard === "attack") {
      setScreenText("Enemy Board");
    } else {
      setScreenText("Your Board");
    }
  }, [ theActiveBoard ]);

  return (
    <header className="ui-header">
      <div className="ui-header-main">
        <Badge className="ui-header-main__badge" title="Badge" />
        <span className="ui-header-main__title">{ player.username }</span>
        <span className="ui-header-main__points">{/*{ player.score } { pointsText }*/}</span>
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
