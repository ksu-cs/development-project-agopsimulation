import { Component, Fragment } from "react";
import styles from "../../Styles/index.module.css";
import WeatherData from "./WeatherData";

/**
 * @classdesc Creates the simulation canvas and the simulation stats
 */
class CanvasContainer extends Component {
  /**
   * Constructs the component
   * @param {*} props Holds the canvasRef that the canvas will use
   */
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
  }

  render() {
    return (
      <Fragment>
        <div
          className={`${styles.canvasArea} ${styles.alignItemsCenterColumn}`}
        >
          <div className={styles.statTextContainer}>
            <p className={styles.statText} id="dateText">
              Date: --
            </p>
            <p className={styles.statText} id="scoreText">
              Yield: 0
            </p>
            <p className={styles.statText} id="gddText">
              Growth Days: 0.00
            </p>
              <p className={styles.statText} id="rainText">
              Precipitation: 0.00
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
