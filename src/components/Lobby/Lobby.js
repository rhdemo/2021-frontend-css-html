import { connect } from "react-redux";
import { ReactComponent as Logo } from "./images/logo.svg";
import "./Lobby.scss";
function Lobby({ match, player }) {
  // @TODO remove waiting message when we move away
  // from player vs. player.
  return (
    <div className="lobby screen">
      <Logo className="lobby-logo" title="shipwars" />
      <h2 className="lobby-text">Game starting soon</h2>
      { match.state.phase==="not-ready" &&
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
