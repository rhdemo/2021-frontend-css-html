import { useState, useEffect } from "react";
import { connect } from "react-redux";
import Avatar from "../Avatar";
import "./Header.scss";

function Header({ player }) {
  const [ pointsText, setPointsText ] = useState("points");

  useEffect(() => {
    if (player.score === 1) {
      setPointsText("point");
    }
  }, [ player.score ]);

  return (
    <header className="Header">
      <Avatar />
      <div>
        <h2>{ player.username }</h2>
        <div>{ player.score } { pointsText }</div>
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
