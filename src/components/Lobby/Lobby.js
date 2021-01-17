import { connect } from "react-redux";

function Lobby({ player }) {
  return (
    <div>
      <h1>Battleship</h1>
      <h2>Lobby</h2>
      <p>Welcome { player.username }</p>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    player: state.player
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);