import "./Leaderboard.scss";

function Leaderboard() {
  return (
    <section className="top-ten dashboard-section ">
    <h1>Top Ten Players</h1>
    <ul className="top-ten__list">
        <li className="top-ten__list__item"><span><sup>1st</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>2nd</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>3rd</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>4th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>5th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>6th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>7th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>8th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>9th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
        <li className="top-ten__list__item"><span><sup>10th</sup></span><span>Gen. fuzzy pants</span><span>1400</span></li>
    </ul> 
    <div className="top-ten-announce">
        <h2>** Claim your prize **</h2>
        <p>Top ten players will recieve $50 for the cool stuff store</p>
        <p>Watch for your alert if you've won!</p>
    </div>
</section>
  );
}

export default Leaderboard;