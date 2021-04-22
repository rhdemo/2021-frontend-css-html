import { useEffect } from "react";
import { connect } from "react-redux";
import { playAgain } from "./actions";
import "./GameOver.scss";

function GameOver({ player, opponent, match, playAgain, game }) {
  useEffect(() => {
    if (game.state !== "stopped") {
      return;
    }

    checkForWinner();
  }, [ game ]);

  async function checkForWinner() {
    const response = await fetch("")
      .catch(err => console.log(err));

    if (!response) {
      return;
    }
    
    const data = await response.json();
  }

  return (
    <div className="game-over screen">
      <h1 className="game-over__title">Game Over</h1>
      { game.state !== "stopped" && 
        <>
        { match.winner === player.uuid
          ? <>
              <h2 className="game-over__sub-title">Congrats, { player.username }!<br />
              You beat our artificial player - { opponent.username }!</h2>
            </>
          : <>
              <h2 className="game-over__sub-title">Oh no, { player.username }!<br />
              You lost to our artificial player -  { opponent.username }!</h2>
            </>
        }
        <button className="game-over__action" onClick={ playAgain }>Play again</button>
        </>
      }
      { game.state === "stopped" &&
        <>
          <h2 className="game-over__sub-title">I hope you had fun. See ya next year!</h2>
          <h3>Congratulations, you've made it into the top 10!</h3>
          <a href={ "https://docs.google.com/forms/d/e/1FAIpQLSdIxGRaccPn73DiqbD7Df_4hNm1xhiD8r1KNn-mqFBl1wEg9g/viewform?usp=pp_url&entry.651719787=" + player.uuid + "&entry.1100509786=" + player.username } className="game-over__action">Claim your prize</a>
        </>
      }
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