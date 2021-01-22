import { connect } from "react-redux";
import "../../socket";
import './App.scss';
import Splash from "../Splash";
import Lobby from "../Lobby";
import Main from "../Main";
import GameOver from "../GameOver";

function App({ game, match }) {
  console.log('app component', { game, match });

  if (match.ready) {
    return <Main />;
  }

  switch(game.state) {
    case "splash":
      return <Splash />

    case "lobby":
      return <Lobby />;

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
