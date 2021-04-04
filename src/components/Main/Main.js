import { connect } from "react-redux";
import Leaderboard from "../Leaderboard";
import UI from "../UI";
import GameData from "../GameData";
import { changeBoard } from "./actions";
import "./Main.scss";
import { useEffect, useState } from "react";

const BOARD_CHANGE_DELAY = 1000;

function Main({ _activeBoard, theActiveBoard, changeBoard, game }) {
  const [ bodyWrapClasses, setBodyWrapClasses ] = useState("body-wrap");
  useEffect(() => {
    if (_activeBoard === theActiveBoard) {
      return;
    }

    setTimeout(() => {
      changeBoard();
    }, BOARD_CHANGE_DELAY);
  }, [ _activeBoard, theActiveBoard, changeBoard ]);

  useEffect(() => {
    const classes = ["body-wrap"];

    switch (game.state) {
      case "paused":
        classes.push("paused")    
        break;
      
      default:
    }

    setBodyWrapClasses(classes.join(" "));
  }, [ game ]);

  return (
    <div className={ bodyWrapClasses }>
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