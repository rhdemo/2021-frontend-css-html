import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { playAgain } from "./actions";
import "./GameOver.scss";

function GameOver({ player, opponent, match, playAgain, game, score }) {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isTop10, setIsTop10 ] = useState(false);
  
  useEffect(() => {
    if (game.state !== "stopped") {
      return;
    }

    checkForWinner();
  }, [ game ]);

  async function checkForWinner() {
    setIsLoading(true);
    
    const response = await fetch(`https://scoring-service-battleships-scoring.apps.summit-gcp.eior.p2.openshiftapps.com/scoring/${game.uuid}/ranking?max=10`)
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });

    if (!response) {
      return;
    }
    
    const data = await response.json();
    setIsLoading(false);
    setIsTop10(true);
  }

  return (
    <div className="game-over screen">
      { isLoading && 
        <div className="loading">
          <p>Loading...</p>
        </div>
      }
      { !isLoading &&
        <>
          { game.state !== "stopped" && 
            <>
            { match.winner === player.uuid
              ? <>
                  <h1 className="game-over__title">Congrats</h1>
                  <h2 className="game-over__sub-title">Congratulations, { player.username }!<br />
                  You beat our artificial player - { opponent.username }!</h2>
                </>
              : <>
                  <h1 className="game-over__title">Game Over</h1>
                  <h2 className="game-over__sub-title">Oh no, { player.username }!<br />
                  You lost to our artificial player -  { opponent.username }!</h2>
                </>
            }
            <p>Score: { score.total }</p>
            <button className="game-over__action" onClick={ playAgain }>Play again</button>
            </>
          }
          { game.state === "stopped" &&
            <>
              { isTop10 &&
                <>
                  <h1 className="game-over__title">Congrats</h1>
                  <h2 className="game-over__sub-title">Congratulations, { player.username }!</h2>
                  <h3>You've made into the Top 10. Click the button below to claim your prize.</h3>
                  <a href={ "https://docs.google.com/forms/d/e/1FAIpQLSdIxGRaccPn73DiqbD7Df_4hNm1xhiD8r1KNn-mqFBl1wEg9g/viewform?usp=pp_url&entry.651719787=" + player.uuid + "&entry.1100509786=" + player.username } className="game-over__action">Claim your prize</a>
                </>
              }
              { !isTop10 && 
                <>
                  <h1 className="game-over__title">Game Over</h1>
                  <h2 className="game-over__sub-title">I hope you had fun. See ya next year!</h2>
                </>
              }           
            </>
          }
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