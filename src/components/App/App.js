import { connect } from "react-redux";
import './App.scss';
import Lobby from "../Lobby";
import Main from "../Main";
import GameOver from "../GameOver";
import ErrorMessage from "../ErrorMessage";

function App({ game, match }) {
  console.log('app component', { game, match });

  let view;

  if (game.state === "lobby") {
    view = <Lobby />;
  }

  if (game.state === "active" || game.state === "paused" || game.state === "replay") {
    view = <Main />;
  }

  if (match.winner) {
    view = <GameOver />;
  }

  if (game.state === "stopped") {
    view = <GameOver />;
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
