import Battleship from "../Battleship";
import Header from "../Header";
import "./Main.scss";

function Main() {
  return (
    <div className="Main screen">
      <Header />
      <Battleship />
    </div>
  );
}

export default Main;