import { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./gamedata.scss";

function GameData({ game }) {
  const [ loading, setLoading ] = useState(false);
  const [ gameData, setGameData ] = useState({});

  async function getGameData() {
    setLoading(true);
    
    const response = await fetch("/data/game-data.json");
    const data = await response.json();
    setGameData(data);
    
    setLoading(false);
  }

  useEffect(() => {
    if (game.state !== "paused") {
      return;
    }

    getGameData();
  }, [ game.state ]);

  return (
    <section className="game-data dashboard-section">
      <h1>Game Data</h1>
      { loading && 
        <div className="loading">Loading...</div>
      }
      { !loading && 
        <>
          <ul className="game-data__list">
            <li className="game-data__list__item">
              <span>Players</span><span>{ gameData.players }</span>
            </li>
            <li className="game-data__list__item">
              <span>Games played</span><span>{ gameData.gamesPlayed }</span>
            </li>
            <li className="game-data__list__item">
              <span>Bonus points</span><span>{ gameData.bonusPoints }</span>
            </li>
            <li className="game-data__list__item">
              <span>Ships sunk</span><span>{ gameData.shipsSunk }</span>
            </li>
            <li className="game-data__list__item">
              <span>hit/miss</span><span>{ gameData.hits }/{ gameData.misses }</span>
            </li>
          </ul>
          <h2>Humans</h2>
          <ul className="game-data__list">
            <li className="game-data__list__item">
              <span>Total shots</span><span>{ gameData.humanShots }</span>
            </li>
            <li className="game-data__list__item">
              <span>Total misses</span><span>{ gameData.humanMisses }</span>
            </li>
          </ul>
          <h2>Artificial inteligence</h2>
          <ul className="game-data__list">
            <li className="game-data__list__item">
              <span>Total shots</span><span>{ gameData.aiShots }</span>
            </li>
            <li className="game-data__list__item">
              <span>Total misses</span><span>{ gameData.aiMisses }</span>
            </li>
          </ul>
        </>
      }
    </section>
  );
}

const mapStateToProps = state => {
    return state;
  }
  
  const mapDispatchToProps = dispatch => {
    return {};
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(GameData);