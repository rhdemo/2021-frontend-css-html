import { connect } from "react-redux";
import UI from "../UI";
import { changeBoard } from "./actions";
import "./Main.scss";
import { useEffect, useState } from "react";

const BOARD_CHANGE_DELAY = 1000;
const REPLAY_BOARD_CHANGE_DELAY = 200;

function Main({ _activeBoard, theActiveBoard, changeBoard, game, match, player, replay }) {
  const [ bodyWrapClasses, setBodyWrapClasses ] = useState("body-wrap");
  useEffect(() => {
    if (_activeBoard === theActiveBoard) {
      return;
    }

    const delay = replay ? REPLAY_BOARD_CHANGE_DELAY : BOARD_CHANGE_DELAY;

    setTimeout(() => {
      changeBoard();
    }, delay);
  }, [ _activeBoard, theActiveBoard, changeBoard ]);

  useEffect(() => {
    const classes = ["body-wrap"];

    switch (game.state) {
      case "paused":
        classes.push("paused")    
        break;
      
      default:
    }

    if (game.state !== "paused" && match.state.phase === "bonus" && player.uuid === match.state.activePlayer) {
      classes.push("bonus-round");
    }

    setBodyWrapClasses(classes.join(" "));
  }, [ game, match, player ]);

  return (
    <div className={ bodyWrapClasses }>
      <UI />
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