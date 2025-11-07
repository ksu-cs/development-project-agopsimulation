import { javascriptGenerator } from "blockly/javascript";
import styles from "../index.module.css";
import simulationMethods from "../simulationMethods";
import React from "react";
import './blocklyJSGenerator';

class SimulationCanvasContainer extends React.Component {
  constructor(props) {
      super(props);
      this.canvasRef = React.createRef();
      this.alterCanvasRef = null;
      this.runButtonOnClick = this.runButtonOnClick.bind(this);
      this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
      this.resetButtonOnClick = this.resetButtonOnClick.bind(this);
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    this.alterCanvasRef = new simulationMethods(canvas);
    this.alterCanvasRef.setSpriteOnLoadMethods();
  }

  //#region button OnClick methods
  async runButtonOnClick() {

    const{ workspace } = this.props;
    if (!workspace){
      console.warn("Workspace not ready yet");
      return;
    }
    
    const runButton = document.getElementById("runButton");
      runButton.disabled = true;

      this.alterCanvasRef.startMoving();

    const allBlocks = workspace.getAllBlocks(false);

    if (allBlocks.length > 0) {
      const code = javascriptGenerator.workspaceToCode(workspace);
        console.log(code);

      if (code.trim()) {
        try {
            const run = new Function("simulationMethods", `
return (async () => { ${code} })();`);
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

  resetButtonOnClick() {
    this.alterCanvasRef.stopMovement();
    this.alterCanvasRef.resetPosition();
    document.getElementById("runButton").disabled = false;
  }
  //#endregion

  render() {
    return (
      <React.Fragment>
        <div className={styles.canvasArea}>
          <p id="scoreText" className={styles.scoreText}>
            Yield: 0
          </p>
          <canvas
            id="gameCanvas"
            ref={this.canvasRef}
            className={styles.gameCanvas}
          />
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
          <button
            onClick={this.resetButtonOnClick}
            id="resetButton"
            className={styles.resetButton}
          >
            Reset Position
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
