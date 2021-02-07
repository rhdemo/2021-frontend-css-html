import { connect } from "react-redux";
import { playAgain } from "./actions";
import "./GameOver.scss";

function GameOver({ player, match, playAgain }) {
  return (
    <div className="GameOver screen">
      <h1>Game Over</h1>
      { match.winner === player.uuid
        ? <h2>You won!</h2>
        : <h2>You lost!</h2>
      }
      <button onClick={ playAgain }>Play again?</button>
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {
    playAgain: () => {
      dispatch(playAgain());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(GameOver);