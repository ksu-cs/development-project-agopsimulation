import { javascriptGenerator } from "blockly/javascript";
import styles from "../index.module.css";
import simulationMethods from "../simulationMethods";
import React from "react";
import "./blocklyJSGenerator";

class SimulationCanvasContainer extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.alterCanvasRef = null;
    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
  }

  async componentDidMount() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    this.alterCanvasRef = new simulationMethods(canvas);
    this.alterCanvasRef.setSpriteOnLoadMethods();
    await this.alterCanvasRef.loadStations();
  }

  //#region button OnClick methods
  async runButtonOnClick() {
    const { workspace } = this.props;
    if (!workspace) {
      console.warn("Workspace not ready yet");
      return;
    }
    const runButton = document.getElementById("runButton");
    runButton.disabled = true;

      this.alterCanvasRef.resetEverything();
      runButton.disabled = false;
    this.alterCanvasRef.startMoving();

    const allBlocks = workspace.getAllBlocks(false);

    if (allBlocks.length > 0) {
      const code = javascriptGenerator.workspaceToCode(workspace);
      console.log(code);

      if (code.trim()) {
        try {
          const run = new Function(
            "simulationMethods",
            `
return (async () => { ${code} })();`,
          );
          await run(this.alterCanvasRef);
        } catch (e) {
          console.error("ERROR:", e);
        }
      }
    }
    this.alterCanvasRef.stopMovement();
    runButton.disabled = false;
  }

  stopButtonOnClick() {
    this.alterCanvasRef.stopMovement();
    document.getElementById("runButton").disabled = false;
  }
  //#endregion

  render() {
    return (
      <React.Fragment>
        <div className={styles.canvasArea}>
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
          <label htmlFor="station">Choose a station:</label>
          <select id="station">
            <option>Loading stations...</option>
          </select>

          <label htmlFor="start">Start date:</label>
          <input type="date" id="start" />

          <pre id="output"></pre>
          <button
            onClick={this.runButtonOnClick}
            id="runButton"
            className={styles.runButton}
          >
            Run Code
          </button>
          <button
            onClick={this.stopButtonOnClick}
            id="stopButton"
            className={styles.stopButton}
          >
            Stop
          </button>
          <div id="debug" className="debug">
            Drag blocks to workspace, then click Run
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SimulationCanvasContainer;
