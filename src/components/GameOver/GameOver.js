import { connect } from "react-redux";
import { playAgain } from "./actions";
import "./GameOver.scss";

function GameOver({ player, opponent, match, playAgain }) {
  return (
    <div className="GameOver screen">
      <h1>Game Over</h1>
      { match.winner === player.uuid
        ? <>
            <h2>Congratulations, { player.username }!</h2>
            <p>You beat { opponent.username }!</p>
          </>
        : <>
            <h2>Oh no, { player.username }!</h2>
            <p>You lost to { opponent.username }!</p>
          </>
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