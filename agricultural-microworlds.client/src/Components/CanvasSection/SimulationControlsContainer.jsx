import {Component, Fragment} from "react";
import styles from "../../Styles/index.module.css";
import simulationMethods from "../../alterSimulationClasses/simulationMethods";
import { javascriptGenerator } from "blockly/javascript";

class SimulationControlsContainer extends Component {
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
    await this.alterCanvasRef.fetchData();

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

    const topBlocks = workspace.getTopBlocks(true);
    const startBlock = topBlocks.find(block => block.type === "start_program");

    if (!startBlock) {
        alert("You must use an 'On Begin' block to start the program!");
        // Re-enable button
        document.getElementById("runButton").disabled = false;
        return;
    }

    javascriptGenerator.init(workspace);

    // Generate code ONLY for the start block and what is attached to it
    const code = javascriptGenerator.blockToCode(startBlock);
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
    this.alterCanvasRef.stopMovement();
    runButton.disabled = false;
  }

  stopButtonOnClick() {
    this.alterCanvasRef.stopMovement();
    document.getElementById("runButton").disabled = false;
  }

  onSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    document.getElementById("speedDisplay").textContent = `${speed}x`;
    if (this.alterCanvasRef) {
      this.alterCanvasRef.setSpeedMultiplier(speed);
    }
  };

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

          <div className={styles.speedControlContainer}>
          <label htmlFor="speedSlider">Speed:</label>
          <input
            type="range"
            id="speedSlider"
            min="1"
            max="5"
            defaultValue="1"
            step="1"
            onChange={this.onSpeedChange}
            className={styles.speedSlider}
          />
          <span id="speedDisplay" className={styles.speedDisplay}>1x</span>
        </div>

          <div id="debug" className={styles.debug}>
            Drag blocks to workspace, then click Run
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimulationControlsContainer;
