import { Component, Fragment } from "react";
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
    await this.alterCanvasRef.fetchData();

    const { workspace } = this.props;
    if (!workspace) {
      console.warn("Workspace not ready yet");
      return;
    }

    javascriptGenerator.init(workspace);

    const runButton = document.getElementById("runButton");
    runButton.disabled = true;

    this.alterCanvasRef.resetEverything();
    runButton.disabled = false;
    this.alterCanvasRef.startMoving();

    const allBlocks = workspace.getAllBlocks(false);
    let blockChunks = [];

    allBlocks.forEach((block) => {
      if (block.type == "start_program") {
        let currentChunk = "";
        currentChunk = this.addBlocksToArray(block);

        if (currentChunk != "")
          blockChunks.push(currentChunk.split(/\r?\n/).filter(Boolean));
      }
    });

    if (blockChunks.length <= 0) {
      alert("You must use an 'On Begin' block to start the program!");
      this.alterCanvasRef.stopMovement(); // Ensure we stop if no code runs
      runButton.disabled = false;
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
            await run(this.alterCanvasRef);
          } catch (e) {
            console.error("ERROR:", e);
          }
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
