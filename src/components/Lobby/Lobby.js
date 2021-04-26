import { connect } from "react-redux";
import { ReactComponent as Logo } from "./images/logo.svg";
import "./Lobby.scss";
function Lobby({ match, player }) {
  // @TODO remove waiting message when we move away
  // from player vs. player.
  return (
    <div className="lobby screen">
      <Logo className="lobby-logo" title="Ship Wars" />
      <h2 className="lobby-text">Game starting soon</h2>
      { match.state.phase==="not-ready" &&
        <p className="text-center">Waiting for another player</p>
      }
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
