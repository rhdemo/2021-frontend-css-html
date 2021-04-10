import { connect } from "react-redux";
import { playAgain } from "./actions";
import "./GameOver.scss";

function GameOver({ player, opponent, match, playAgain }) {
  return (
    <div className="game-over screen">
      <h1 className="game-over__title"> game over</h1>
      { match.winner === player.uuid
        ? <>
            <h2 className="game-over__sub-title">Congrats, { player.username }!<br />
            You beat { opponent.username }!</h2>
          </>
        : <>
            <h2 className="game-over__sub-title">Oh no, { player.username }!<br />
            You lost to { opponent.username }!</h2>
          </>
      }
      <button className="game-over__action" onClick={ playAgain }>Play again</button>
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