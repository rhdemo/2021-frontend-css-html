import Battleship from "../Battleship";
import Header from "../Header";
import "./Main.scss";

function Main() {
  return (
    <div className="Main">
      <Header />
      <div>
        <Battleship />
      </div>
    </div>
  );
}

export default Main;