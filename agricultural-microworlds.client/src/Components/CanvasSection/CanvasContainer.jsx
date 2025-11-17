import {Component, Fragment} from "react";
import styles from "../../Styles/index.module.css";
import WeatherData from "./WeatherData";

class CanvasContainer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
  }

  render() {
    return (
      <Fragment>
        <div
          className={`${styles.canvasArea} ${styles.canvasSection} ${styles.alignItemsCenterColumn}`}
        >
          <div className={styles.statTextContainer}>
            <p className={styles.statText} id="weekText">
              Week 0
            </p>
            <p className={styles.statText} id="scoreText">
              Yield: 0
            </p>
            <p className={styles.statText} id="gddText">
              Growth Days: 0.00
            </p>
          </div>
          <canvas
            id="gameCanvas"
            ref={this.canvasRef}
            className={styles.gameCanvas}
          />
          <WeatherData />
        </div>
      </Fragment>
    );
  }
}

export default CanvasContainer;
