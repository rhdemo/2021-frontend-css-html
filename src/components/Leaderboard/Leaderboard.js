import { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./Leaderboard.scss";

function Leaderboard({ game }) {
  const [ loading, setLoading ] = useState(false);
  const [ leaders, setLeaders ] = useState([]);

  async function getLeaders() {
    setLoading(true);

    const response = await fetch("/data/leaders.json");
    const leaders = await response.json();
    setLeaders(leaders);

    setLoading(false);
  }

  function getPosition(index) {
    let position;

    switch (index) {
      case 0:
        position = "1st";
        break;

      case 1:
        position = "2nd";
        break;

      case 2:
        position = "3rd";
        break;
    
      default:
        position = `${index + 1}th`;
        break;
    }

    return position;
  }

  useEffect(() => {
    if (game.state !== "paused") {
      return;
    }

    getLeaders();
  }, [ game.state ]);

  return (
    <section className="top-ten dashboard-section ">
    <h1>Top Ten Players</h1>
    { loading && 
      <div className="loading">Loading...</div>
    }
    {!loading &&
    <>
      <ul className="top-ten__list">
        { leaders.map((leader, index) => 
          <li key={ index } className="top-ten__list__item">
            <span><sup>{ getPosition(index) }</sup></span>
            <span>{ leader.username }</span>
            <span>{ leader.points }</span>
          </li>
        )}
      </ul> 
      <div className="top-ten-announce">
        <h2>** Claim your prize **</h2>
        <p>Top ten players will recieve $50 for the cool stuff store</p>
        <p>Watch for your alert if you've won!</p>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Leaderboard);