import * as React from "react";
import styles from '../index.module.css';

class SimulationCanvasContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <div className={styles.canvasArea}>
          <p className={styles.scoreText}>Yield: 0</p>
          <canvas className={styles.gameCanvas}/>
          <button className={styles.runButton}>Run Code</button>
          <button className={styles.stopButton}>Stop</button>
          <button className={styles.resetButton}>Reset Position</button>
          <div className="debug">Drag blocks to workspace, then click Run</div>
        </div>
      </React.Fragment>
    );
  }
}

export default SimulationCanvasContainer;
