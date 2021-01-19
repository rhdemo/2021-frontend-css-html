import { connect } from "react-redux";
import Avatar from "../Avatar";
import "./Lobby.scss";

function Lobby({ player }) {
  return (
    <div className="Lobby">
      <h1>Battleship</h1>
      <h2>Lobby</h2>
      <Avatar />
      <h3>{ player.username }</h3>
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);