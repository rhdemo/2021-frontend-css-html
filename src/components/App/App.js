import { connect } from "react-redux";
import "../../socket";
import './App.scss';
import Splash from "../Splash";
import Lobby from "../Lobby";
import Main from "../Main";
import GameOver from "../GameOver";
import ErrorMessage from "../ErrorMessage";

function App({ game, match }) {
  console.log('app component', { game, match });

  let view;

  switch(game.state) {
    case "splash":
      view = <Splash />
      break;

    case "lobby":
      view = <Lobby />;
      break;

    case "play":
      view = <Main />;
      break;

    case "gameover":
      view = <GameOver />;
      break;

    default:
      view = <Splash />;
  }

  if (match.ready) {
    view = <Main />;
  }

  return (
    <>
      { view }
      <ErrorMessage />
    </>
  )
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
