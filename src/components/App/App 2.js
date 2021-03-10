import { connect } from "react-redux";
import "../../socket";
import './App.scss';
import Splash from "../Splash";
import Lobby from "../Lobby";
import Main from "../Main";
import GameOver from "../GameOver";

function App({ game }) {
  switch(game.state) {
    case "splash":
      return <Splash />
    
    case "lobby":
      // return <Lobby />;
      return <Main />;

    case "play":
      return <Main />;

    case "gameover":
      return <GameOver />;

    default:
      return <Splash />;
  }
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
