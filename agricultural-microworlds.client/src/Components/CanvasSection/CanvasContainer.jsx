import { Component, Fragment } from "react";
import styles from "../../Styles/index.module.css";
import WeatherData from "./WeatherData";
import StatsContainer from "./StatsContainer";

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
          <StatsContainer {...this.props.statsProps} />
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
