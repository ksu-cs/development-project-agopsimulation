import React from "react";
import styles from "../Styles/index.module.css";
import simulationMethods from "../alterSimulationClasses/simulationMethods";
import { javascriptGenerator } from "blockly/javascript";

class SimulationControlsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
    this.workspace = props.workspace;
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
        <div
          className={`${styles.canvasSection} ${styles.alignItemsCenterColumn}`}
        >
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

export default SimulationControlsContainer;
