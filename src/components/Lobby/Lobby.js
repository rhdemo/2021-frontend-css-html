import { connect } from "react-redux";
import Avatar from "../Avatar";
import "./Lobby.scss";

function Lobby({ match, player }) {
  // @TODO remove waiting message when we move away
  // from player vs. player.
  return (
    <div className="Lobby screen">
      <h1>Battleship</h1>
      <h2>Lobby</h2>
      <Avatar />
      <h3>{ player.username }</h3>
      { !match.ready && 
        <p>Waiting for another player to join</p>
      }
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);