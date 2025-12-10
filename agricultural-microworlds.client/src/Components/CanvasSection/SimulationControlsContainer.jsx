import { Component, Fragment } from "react";
import styles from "../../Styles/index.module.css";
import simulationEngine from "../../alterSimulationClasses/simulationEngine";
import drawCanvas from "../../alterSimulationClasses/drawCanvas";
import Simulation from "../../Simulation/Simulation";
import { javascriptGenerator } from "blockly/javascript";

class SimulationControlsContainer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
    this.workspace = props.workspace;
    this.simulationEngine = null;

    // These binds failed because the functions didn't exist in your file
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
    this.simulationEngine.updateCamera();
    this.simulationEngine.timeStepEvent();
    this.drawCanvas.setSpriteOnLoadMethods();
    await this.simulationEngine.loadStations();

    // Instantiate new Simulation
    this.alterCanvasRef = new Simulation(canvas);
    this.alterCanvasRef.setSpriteOnLoadMethods();
    await this.alterCanvasRef.loadStations();
  }

  // Helper to extract code from blocks
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

    // Call Simulation Methods
    await this.alterCanvasRef.fetchData();
    this.simulationEngine.resetEverything();
    this.simulationEngine.startMoving();

    // Generate Code
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
      this.alterCanvasRef.stopMovement();
      if (runButton) runButton.disabled = false;
      return;
    }

    // Process Chunks
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
    this.alterCanvasRef.stopMovement();
    if (runButton) runButton.disabled = false;
  }

  // --- RESTORED MISSING METHOD ---
  stopButtonOnClick() {
    this.simulationEngine.stopMovement();
    document.getElementById("runButton").disabled = false;
  }

  onSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    document.getElementById("speedDisplay").textContent = `${speed}x`;
    if (this.simulationEngine) {
      this.simulationEngine.setSpeedMultiplier(speed);
    }
    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = false;
  }

  // --- RESTORED MISSING RENDER ---
  render() {
    return (
      <Fragment>
        {/* Controls Section */}
        <div className={styles.controlsContainer}>
          <div className={styles.controlGroup}>
            <label>Station:</label>
            <select id="station" className={styles.dropdown}></select>
          </div>
          <div className={styles.controlGroup}>
            <label>Start Date:</label>
            <input type="date" id="start" defaultValue="2021-01-01" />
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
          <div className={styles.infoGroup}>
            <span id="dateText">Date: --</span>
            <span id="gddText">GDD: 0.00</span>
            <span id="scoreText">Yield: 0</span>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimulationControlsContainer;
