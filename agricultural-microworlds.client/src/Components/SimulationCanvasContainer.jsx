import * as React from "react";
import { javascriptGenerator } from "blockly/javascript";
import styles from "../index.module.css";
import simulationMethods from "../simulationMethods";

class SimulationCanvasContainer extends React.Component {
  constructor(props) {
    super(props);
    this.simulation = new simulationMethods(); 
  }
//#region button OnClick methods
  async runButtonOnClick() {
    const runButton = document.getElementById("runButton");
    runButton.disabled = true;

    this.simulation.isMoving = true;

    const workspace = this.simpleWorkspace.current.workspace;

    const allBlocks = workspace.getAllBlocks(false);

    if (allBlocks.length > 0) {
      const code = javascriptGenerator.workspaceToCode(workspace);

      if (code.trim()) {
        try {
          // Wrap the code in an async function and execute
          const asyncCode = `(async function() { ${code} })()`;
          await eval(asyncCode);
        } catch (e) {
          console.error("ERROR:", e);
        }
      }
    }
    this.simulation.isMoving = false;
    runButton.disabled = false;
  }

  stopButtonOnClick() {
    this.simulation.stopMovement();
    document.getElementById("runButton").runButton.disabled = false;
  }

  resetButtonOnClick() {
    this.simulation.stopMovement();
    this.simulation.resetPosition();
    document.getElementById("runButton").runButton.disabled = false;
  }
  //#endregion

//#region exported canvas altering methods
 moveForward(duration){
  this.simulation.moveForward(duration);
 }
 turnLeft(){
  this.simulation.turnLeft();
 }
 turnRight() {
    this.simulation.turnRight();
  }

  TurnXLeft(amount) {
    this.simulation.TurnXLeft(amount);
  }

  TurnXRight(amount) {
    this.simulation.TurnXRight(amount);
  }
  turnHarvestingOn() {
    this.simulation.turnHarvestingOn();
  }
  turnHarvestingOff() {
    this.simulation.turnHarvestingOff();
  }
  turnSeedingOn() {
    this.simulation.turnSeedingOn();
  }
  turnSeedingOff() {
    this.simulation.turnSeedingOff();
  }
//#endregion

  render() {
    this.simulation.drawFieldAndTractor();
    return (
      <React.Fragment>
        <div className={styles.canvasArea}>
          <p className={styles.scoreText}>Yield: 0</p>
          <canvas id="gameCanvas" className={styles.gameCanvas} />
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
