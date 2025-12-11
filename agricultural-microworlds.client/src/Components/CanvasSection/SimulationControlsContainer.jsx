import { Component, Fragment } from "react";
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
    this.drawCanvas = null;

    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
  }

  async componentDidMount() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    const canvasWidth = 500;
    const canvasHeight = 500;
    this.simulationEngine = new simulationEngine(canvasWidth, canvasHeight);
    this.drawCanvas = new drawCanvas(canvas, canvasWidth, canvasHeight);
    this.simulationEngine.addEventListener("simulationEngineCreated", (e) =>
      this.drawCanvas.handleTimeStep(e),
    );

    this.simulationEngine.timeStepEvent();
    this.drawCanvas.setSpriteOnLoadMethods();

    await this.simulationEngine.loadStations();
    await this.simulationEngine.fetchData();
  }

  addBlocksToArray(block) {
    let nextBlock = block.getNextBlock();
    if (nextBlock != null) {
      return javascriptGenerator.blockToCode(nextBlock);
    }
    return "";
  }

  async runButtonOnClick() {
    await this.simulationEngine.fetchData();

    const { workspace } = this.props;
    if (!workspace) return;

    javascriptGenerator.init(workspace);
    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = true;

    this.simulationEngine.resetEverything();

    // FIX: Apply the speed slider value immediately on Run
    const speedSlider = document.getElementById("speedSlider");
    if (speedSlider) {
      this.simulationEngine.setSpeedMultiplier(parseInt(speedSlider.value));
    }

    this.simulationEngine.startMoving();

    const allBlocks = workspace.getAllBlocks(false);
    let blockChunks = [];

    allBlocks.forEach((block) => {
      if (block.type === "start_program") {
        let currentChunk = this.addBlocksToArray(block);
        if (currentChunk !== "")
          blockChunks.push(currentChunk.split(/\r?\n/).filter(Boolean));
      }
    });

    if (blockChunks.length <= 0) {
      alert("You must use an 'On Begin' block to start the program!");
      this.simulationEngine.stopMovement();
      if (runButton) runButton.disabled = false;
      return;
    }

    const variablesCode = Object.values(javascriptGenerator.definitions_).join(
      "\n",
    );
    let formattedCode = "";
    let chunkIdx = 0;

    while (blockChunks.length > 0) {
      let c = 0;
      for (c = 0; c < blockChunks[chunkIdx].length; c++) {
        formattedCode += blockChunks[chunkIdx][c] + "\n";
        if (blockChunks[chunkIdx][c].includes("await")) {
          c++;
          break;
        }
      }
      blockChunks[chunkIdx].splice(0, c);
      if (blockChunks[chunkIdx].length <= 0) blockChunks.splice(chunkIdx, 1);
      if (blockChunks.length > 0)
        chunkIdx = (chunkIdx + 1) % blockChunks.length;
    }

    const finalCode = variablesCode + "\n" + formattedCode;

    if (finalCode !== "") {
      if (finalCode.trim()) {
        try {
          const run = new Function(
            "simulationMethods",
            `return (async () => { ${finalCode} })();`,
          );
          await run(this.simulationEngine);
        } catch (e) {
          console.error("ERROR executing blockly code:", e);
        }
      }
    }

    this.simulationEngine.stopMovement();
    if (runButton) runButton.disabled = false;
  }

  stopButtonOnClick() {
    if (this.simulationEngine) {
      this.simulationEngine.stopMovement();
    }
    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = false;
  }

  onSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    const label = document.getElementById("speedLabel");
    if (label) label.textContent = `${speed}x`;
    if (this.simulationEngine) {
      this.simulationEngine.setSpeedMultiplier(speed);
    }
  };

  render() {
    return (
      <Fragment>
        <div className={styles.controlsContainer}>
          <div
            className={styles.controlGroup}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              <label htmlFor="speedSlider" style={{ fontWeight: "bold" }}>
                Sim Speed:
              </label>
              <span id="speedLabel" style={{ fontWeight: "bold" }}>
                1x
              </span>
            </div>
            <input
              type="range"
              id="speedSlider"
              min="1"
              max="5"
              defaultValue="1"
              step="1"
              onChange={this.onSpeedChange}
              style={{ width: "100%" }}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              id="runButton"
              className={styles.runButton}
              onClick={this.runButtonOnClick}
            >
              Run
            </button>
            <button
              id="stopButton"
              className={styles.stopButton}
              onClick={this.stopButtonOnClick}
            >
              Stop
            </button>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimulationControlsContainer;
