import {Component, Fragment} from "react";
import styles from "../../Styles/index.module.css";
import simulationMethods from "../../alterSimulationClasses/simulationMethods";
import { javascriptGenerator } from "blockly/javascript";
import styles from "../index.module.css";
import Simulation from "./Simulation";
import Renderer from "./Renderer";
import CommandStack from "./CommandStack";
import React from "react";
import "./blocklyJSGenerator";

// --- New Constants ---
// simulation ticks per second
const SIMULATION_FPS = 60;
// milliseconds per simulation tick
const FIXED_TIME_STEP_MS = 1000 / SIMULATION_FPS;


class SimulationControlsContainer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = props.canvasRef;
    this.workspace = props.workspace;
    this.simulation = new Simulation();
    this.renderer = null;
    this.gameLoopId = null;
    this.lastFrameTime = 0;

    // This will store "leftover" time from the renderer
    this.timeAccumulator = 0;
    
    this.state = {
      simulationSpeed: 1,
    };

    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);

    this.toggleFastForward = this.toggleFastForward.bind(this);

  }
  async componentDidMount() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    this.renderer = new Renderer(canvas);
    await this.renderer.loadAssets();
    await this.simulation.loadStations();

    // --- Start the game loop ---
    // We need to pass the initial timestamp
    this.gameLoopId = requestAnimationFrame(this.gameLoop);
  }

  componentWillUnmount() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
  }

  gameLoop = (timestamp) => {
    // 1. Calculate time passed since the *last* frame (in milliseconds)
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestamp;
    }
    const deltaTimeMS = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // 2. Add the new time to our "accumulator"
    this.timeAccumulator += deltaTimeMS * this.state.simulationSpeed;

    // 3. Run simulation ticks
    // This is the core logic. We run *as many* simulation ticks
    // as needed to "catch up" with the real time that has passed.
    while (this.timeAccumulator >= FIXED_TIME_STEP_MS) {
      // --- Update the simulation model ---
      // We pass the fixed step time, converted to seconds
      this.simulation.update(FIXED_TIME_STEP_MS / 1000.0);

      // --- Subtract the time we just simulated ---
      this.timeAccumulator -= FIXED_TIME_STEP_MS;
    }

    // 4. Render the results
    // We can get the *latest* state from the simulation
    const currentState = this.simulation.getState();
    
    // The renderer draws the *current* state, which may be
    // "between" simulation ticks, but that's fine.
    if (this.renderer) {
      this.renderer.render(currentState);
    }
    
    // 5. Update UI (score, etc.)
    document.getElementById("scoreText").textContent = `Yield: ${currentState.yieldScore}`;

    // 6. Continue the loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop);
  };

  //#region button OnClick methods
  async runButtonOnClick() {
//await this.alterCanvasRef.fetchData();

    const { workspace } = this.props;
    if (!workspace) {
      console.warn("Workspace not ready yet");
      return;
    }
    const runButton = document.getElementById("runButton");
    runButton.disabled = true;

    // Reset speed
    // this.setState({ simulationSpeed: 1 });
    // document.getElementById("ffButton").textContent = `Fast Forward (1x)`;

    // 1. Reset the simulation to a clean state
    this.simulation.resetEverything();
    document.getElementById("weekText").textContent = `Week ${this.simulation.START_WEEK}`;


    javascriptGenerator.init(workspace);

    window.loopTrap = 1000;

    // --- NEW CODE GENERATION LOGIC ---
    let onRunCode = "";
    const onWeekEvents = {};
    let totalWeeks = 0;

    const topBlocks = workspace.getTopBlocks(false);

    for (const block of topBlocks) {
      if (block.type === "on_run") {
        // Get code from blocks *inside* the 'on_run' hat
        const child = block.getNextBlock();
        if (child) {
          onRunCode += javascriptGenerator.blockToCode(child);
        }
      } else if (block.type === "on_week_x") {
        // Get the week number from the input
        let weekNum = javascriptGenerator.valueToCode(
          block, "WEEKNUM", javascriptGenerator.ORDER_ATOMIC
        ) || "0";
        weekNum = parseInt(weekNum, 10);

        // Get code from blocks *inside* this hat
        const child = block.getNextBlock();
        if (child) {
          onWeekEvents[weekNum] = javascriptGenerator.blockToCode(child);
        }
      }
    }

    // 2. Fetch new weather data based on UI
    // We need to know total weeks. We can scan the generated code.
    const allCode = onRunCode + Object.values(onWeekEvents).join("\n");
    console.log("--- Generated On-Run Code ---", "\n" + onRunCode);
    console.log("--- Generated Event Triggers ---", onWeekEvents);

    const weeksMatch = (allCode.match(/simulation.queueWait\((.*?)\)/g) || [])
        .map(s => s.match(/simulation.queueWait\((.*)\)/)[1])
        .reduce((sum, w) => sum + (parseFloat(w) || 0), 0);
    
    // Also consider the week triggers themselves
    const maxEventWeek = Math.max(0, ...Object.keys(onWeekEvents).map(Number));
    totalWeeks = Math.max(weeksMatch, maxEventWeek, 52); // Fetch at least a year
    
    await this.simulation.fetchData(totalWeeks); 

    this.simulation.commandStack = new CommandStack();
    
    // --- Pass the triggers to the simulation ---
    this.simulation.setEventTriggers(onWeekEvents);

    // 3. Run the "on_run" code
    // This code is now SYNCHRONOUS. It just fills the commandQueue.
    if (onRunCode.trim()) {
      // If a loop runs more than this without finishing, it's likely a bug.
      window.loopTrap = 1000;

      try {
        const run = new Function(
          "simulation", // Pass in our simulation instance
          onRunCode,
        );
        run(this.simulation); // This executes instantly
      } catch (e) {
        console.error("Code Execution Error:", e);
        if (e.toString().includes("Infinite loop")) {
             alert("Infinite Loop Detected! \n\nRemember: 'While' loops run instantly. They cannot wait for the simulation to update. Use 'On Week X' blocks instead.");
        }
      }
    }
    
    runButton.disabled = false;
  }

  stopButtonOnClick() {
    // Stop just means "clear the command queue"
    this.simulation.resetEverything(); 
    document.getElementById("weekText").textContent = `Week ${this.simulation.START_WEEK}`;

    // this.setState({ simulationSpeed: 1 });
    // document.getElementById("ffButton").textContent = `Fast Forward (1x)`;

    document.getElementById("runButton").disabled = false;
  }

  toggleFastForward() {
    const newSpeed = this.state.simulationSpeed === 1 ? 5 : 1;
    this.setState({ simulationSpeed: newSpeed });
  }

  //#endregion

  render() {
    const { workspace, simulationSpeed } = this.state;
    
    return (
      <React.Fragment>
        <div className={styles.canvasArea}>
          <div className={styles.statTextContainer}>
            <p className={styles.statText} id="weekText">
              Week 1
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
          <input type="date" id="start" defaultValue="2024-06-01"/>

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
          <button
            onClick={this.toggleFastForward}
            id="ffButton"
            className={`${styles.ffButton} ${
              simulationSpeed > 1 ? styles.ffButtonActive : ""
            }`}
          >
            {`Fast Forward (${simulationSpeed}x)`}
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
