import { connect } from "react-redux";
import Leaderboard from "../Leaderboard";
import UI from "../UI";
import GameData from "../GameData";
import { changeBoard } from "./actions";
import "./Main.scss";
import { useEffect } from "react";

const BOARD_CHANGE_DELAY = 1000;

function Main({ _activeBoard, theActiveBoard, changeBoard }) {
  useEffect(() => {
    if (_activeBoard === theActiveBoard) {
      return;
    }

    setTimeout(() => {
      changeBoard();
    }, BOARD_CHANGE_DELAY);
  }, [ _activeBoard, theActiveBoard ]);

  return (
    <div className="body-wrap">
      <Leaderboard />
      <UI />
      <GameData />
    </div>
  );
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {
    changeBoard: () => {
      dispatch(changeBoard());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);