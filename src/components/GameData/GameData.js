import "./gamedata.scss";

function GameData() {
  return (
    <section className="game-data dashboard-section ">
    <h1>Game Data</h1>
    <ul className="game-data__list">
        <li className="game-data__list__item">
            <span>Players</span><span>10009</span>
        </li>
        <li className="game-data__list__item">
            <span>Games played</span><span>1900</span>
        </li>
        <li className="game-data__list__item">
            <span>Bonus points</span><span>310009</span>
        </li>
        <li className="game-data__list__item">
            <span>Ships sunk</span><span>3209</span>
        </li>
        <li className="game-data__list__item">
            <span>hit/miss</span><span>200/700</span>
        </li>
    </ul>
    <h2>Humans</h2>
    <ul className="game-data__list">
        <li className="game-data__list__item">
            <span>Total shots</span><span>10009</span>
        </li>
        <li className="game-data__list__item">
            <span>Total misses</span><span>1900</span>
        </li>
    </ul>
    <h2>Artificial inteligence</h2>
    <ul className="game-data__list">
        <li className="game-data__list__item">
            <span>Total shots</span><span>10009</span>
        </li>
        <li className="game-data__list__item">
            <span>Total misses</span><span>1900</span>
        </li>
    </ul>
</section>
  );
}

export default GameData;