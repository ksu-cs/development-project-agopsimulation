import { javascriptGenerator } from "blockly/javascript";
import styles from "../index.module.css";
import simulationMethods from "../simulationMethods";
import React from "react";
import "./blocklyJSGenerator";

class SimulationCanvasContainer extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
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
    const runButton = document.getElementById("runButton");
    runButton.disabled = true;

      this.alterCanvasRef.resetEverything();
      runButton.disabled = false;
    this.alterCanvasRef.startMoving();

    const allBlocks = workspace.getAllBlocks(false);
    //console.log(allBlocks);

    let blockChunks = [];

    allBlocks.forEach(block => {
      if (block.type == "start_program") {
        let currentChunk = "";
        currentChunk = this.addBlocksToArray(block);
        //console.log("Current Chunk:" + currentChunk);

        if (currentChunk != "")
          blockChunks.push(currentChunk.split(/\r?\n/).filter(Boolean));
      }
    });

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
      if (blockChunks[chunkIdx].length <= 0)
        blockChunks.splice(chunkIdx, 1);
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
        <div className={styles.canvasArea}>
          <div className={styles.statTextContainer}>
            <p className={styles.statText} id="weekText">
              Week 0
            </p>
            <p className={styles.statText} id="scoreText">
              Yield: 0
            </p>
            <p className={styles.statText} id="gddText">
              Growth Days: 0.00
            </p>
          </div>
          <canvas
            id="gameCanvas"
            ref={this.canvasRef}
            className={styles.gameCanvas}
          />
          <label htmlFor="station">Choose a station:</label>
          <select id="station">
            <option>Loading stations...</option>
          </select>

          <label htmlFor="start">Start date:</label>
          <input type="date" id="start" />

          <pre id="output"></pre>
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

export default SimulationCanvasContainer;
