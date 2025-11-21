import {Component, Fragment} from "react";
import styles from "../../Styles/index.module.css";
import simulationEngine from "../../alterSimulationClasses/simulationEngine";
import drawCanvas from "../../alterSimulationClasses/drawCanvas";
import { javascriptGenerator } from "blockly/javascript";

class SimulationControlsContainer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
    this.workspace = props.workspace;
    this.simulationEngine = null;
    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
  }
  async componentDidMount() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    this.simulationEngine = new simulationEngine(canvas);
      this.drawCanvas = new drawCanvas(canvas);

      this.simulationEngine.addEventListener('simulationEngineCreated', (e) => this.drawCanvas.handleTimeStep(e));

      this.simulationEngine.dispatchEventa();
    this.simulationEngine.setSpriteOnLoadMethods();
    await this.simulationEngine.loadStations();
  }

  //#region button OnClick methods
  async runButtonOnClick() {
await this.simulationEngine.fetchData();

    const { workspace } = this.props;
    if (!workspace) {
      console.warn("Workspace not ready yet");
      return;
    }
    const runButton = document.getElementById("runButton");
    runButton.disabled = true;

    this.simulationEngine.resetEverything();
    runButton.disabled = false;
    this.simulationEngine.startMoving();

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
          await run(this.simulationEngine);
        } catch (e) {
          console.error("ERROR:", e);
        }
      }
    }
    this.simulationEngine.stopMovement();
    runButton.disabled = false;
  }

  stopButtonOnClick() {
    this.simulationEngine.stopMovement();
    document.getElementById("runButton").disabled = false;
  }
  //#endregion

  render() {
    return (
      <Fragment>
        <div
          className={`${styles.alignItemsCenterColumn}`}
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
          <div id="debug" className={styles.debug}>
            Drag blocks to workspace, then click Run
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimulationControlsContainer;
