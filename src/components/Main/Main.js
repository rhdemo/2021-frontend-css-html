import Leaderboard from "../Leaderboard";
import UI from "../UI";
import GameData from "../GameData";
import "./Main.scss";

function Main() {
  return (
    
    
    <div className="body-wrap">
      <Leaderboard />
      <UI />
      <GameData />
    </div>
  );
}

export default Main;