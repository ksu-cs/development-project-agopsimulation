import { Component, Fragment } from "react";
import styles from "../../Styles/index.module.css";
import simulationEngine from "../../alterSimulationClasses/simulationEngine";
import drawCanvas from "../../alterSimulationClasses/drawCanvas";
import { javascriptGenerator } from "blockly/javascript";
import TractorSimManager from "../../Simulation/SimManagers/TractorSimManager";

/**
 * @classdesc Creates the buttons and other UI components that can control the simulation, aside from the blocks.
 * Creates the simulationEngine and the canvas renderer
 */
class SimulationControlsContainer extends Component {
  /**
   * Constructs the SimulationControlsContainer
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
    this.workspace = props.workspace;
    this.simulationEngine = null;
    this.drawCanvas = null;

    // Harvester = 0, Seeder = 1
    this.state = {
      selectedVehicle: 0,
    };

    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
  }

  /**
   * Initializes objects that need information only available after mounting
   */
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

  /**
   * Gets the code converstion for the next block
   * @param {*} block The last block that was added to the list
   * @returns The code representation of the block or an empty string if null
   */
  addBlocksToArray(block) {
    let nextBlock = block.getNextBlock();
    if (nextBlock != null) {
      return javascriptGenerator.blockToCode(nextBlock);
    }
    return "";
  }

  /**
   * The onClick method for the Run Button
   */
  async runButtonOnClick() {
    await this.simulationEngine.fetchData();

    const { workspace } = this.props;
    if (!workspace) return;

    javascriptGenerator.init(workspace);
    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = true;

    this.simulationEngine.resetEverything();

    // Apply the speed slider value immediately on Run
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

    let chunkIdx = 0;
    let codeSegments = [];

    while (blockChunks.length > 0) {
      let c = 0;
      let bracketsOpen = 0;
      let formattedCode = "";

      for (c = 0; c < blockChunks[chunkIdx].length; c++) {
        formattedCode += blockChunks[chunkIdx][c] + "\n";

        // If there's a loop, we want to continue with that loop before switching to the next chunk, for now.
        if (blockChunks[chunkIdx][c].includes("{")) bracketsOpen++;

        //Allow proceding to the next chunk once the amount of open brackets drops back down to zero.
        let hasClosure = blockChunks[chunkIdx][c].includes("}");
        if (hasClosure) bracketsOpen = Math.max(bracketsOpen - 1, 0);

        // Only switch over once the loop has completed.
        if (
          bracketsOpen <= 0 &&
          (hasClosure || blockChunks[chunkIdx][c].includes("await"))
        ) {
          c++;
          break;
        }
      }

      bracketsOpen = 0;
      codeSegments.push(formattedCode);

      blockChunks[chunkIdx].splice(0, c);
      if (blockChunks[chunkIdx].length <= 0) {
        blockChunks.splice(chunkIdx, 1);
        chunkIdx %= blockChunks.length;
      } else if (blockChunks.length > 0)
        chunkIdx = (chunkIdx + 1) % blockChunks.length;
    }

    // Combine definitions with the logic
    codeSegments.concat([variablesCode + "\n"], blockChunks);

    if (codeSegments.length > 0) {
      console.log(codeSegments);

      for (let i = 0; i < codeSegments.length; i++) {
        if (codeSegments[i].trim()) {
          try {
            const run = new Function(
              "simulationMethods",
              `return (async () => { 
                              ${codeSegments[i]} 
                          })();`,
            );
            await run(this.simulationEngine);
          } catch (e) {
            console.error("ERROR:", e);
          }
        }
      }
    }

    this.simulationEngine.stopMovement();
    if (runButton) runButton.disabled = false;
  }

  /**
   * The onClick Method for the stop button
   */
  stopButtonOnClick() {
    if (this.simulationEngine) {
      this.simulationEngine.stopMovement();
    }
    this.simulationEngine
    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = false;
  }

  /**
   * onClick method for vehicle selection
   * switches camera to follow selected vehicle
   */
  handleImplementSelect = (vehicleType) => {
    this.setState({ selectedVehicle: vehicleType });
    if (this.simulationEngine) {
      this.simulationEngine.setMainVehicleCamera(vehicleType);
    }
  };

  /**
   * Changes what needs it when the speed of the simulation changes
   */
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

          <div
            style={{
              textAlign: "center",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Camera Following:{" "}
            {this.state.selectedVehicle === 1 ? "Seeder" : "Harvester"}
          </div>

          <div className={styles.buttonGroup}>
            <button
              id="harvesterCameraButton"
              className={styles.camera_btn}
              onClick={() => this.handleImplementSelect(0)}
            >
              Harvester
            </button>
            <button
              id="seederCameraButton"
              className={styles.camera_btn}
              onClick={() => this.handleImplementSelect(1)}
            >
              Seeder
            </button>
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
