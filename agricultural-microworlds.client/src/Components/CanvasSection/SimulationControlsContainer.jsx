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
  }

  addBlocksToArray(block) {
    let nextBlock = block.getNextBlock();
    if (nextBlock != null) {
      //console.log(block.nextConnection);
      return javascriptGenerator.blockToCode(nextBlock);
    }

    return "";
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
    //console.log(allBlocks);

    let blockChunks = [];

    allBlocks.forEach((block) => {
      if (block.type == "start_program") {
        let currentChunk = "";
        currentChunk = this.addBlocksToArray(block);
        //console.log("Current Chunk:" + currentChunk);

        if (currentChunk != "")
          blockChunks.push(currentChunk.split(/\r?\n/).filter(Boolean));
      }
    });

    if (blockChunks.length <= 0) {
      alert("You must use an 'On Begin' block to start the program!");
    }

    //console.log("Chunks:" + blockChunks);
    let formattedCode = "";
    let chunkIdx = 0;

    while (blockChunks.length > 0) {
      let c = 0;
      //console.log("Chunk length:" + blockChunks[chunkIdx].length);
      for (c = 0; c < blockChunks[chunkIdx].length; c++) {
        formattedCode += blockChunks[chunkIdx][c];
        if (blockChunks[chunkIdx][c].includes("await")) {
          c++;
          break;
        }

        //console.log("Current code:" + formattedCode);
      }

      blockChunks[chunkIdx].splice(0, c);
      if (blockChunks[chunkIdx].length <= 0) blockChunks.splice(chunkIdx, 1);
      if (blockChunks.length > 0)
        chunkIdx = (chunkIdx + 1) % blockChunks.length;
    }

    if (formattedCode != "") {
      console.log(formattedCode);

      if (formattedCode.trim()) {
        try {
          const run = new Function(
            "simulationMethods",
            `
              return (async () => { ${formattedCode} })();`,
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
        <div className={`${styles.alignItemsCenterColumn}`}>
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
            <span id="speedDisplay" className={styles.speedDisplay}>
              1x
            </span>
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
