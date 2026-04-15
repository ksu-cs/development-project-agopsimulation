import { Component, Fragment } from "react";
import styles from "../../Styles/index.module.css";
import simulationEngine from "../../SimulationEngine/simulationEngine";
import drawCanvas from "../../Rendering/drawCanvas";
import { javascriptGenerator } from "blockly/javascript";
import TractorSimManager from "../../Simulation/SimManagers/TractorSimManager";
import * as Blockly from "blockly";

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
      harvesterXml:
        '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
      seederXml:
        '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
    };

    this.workers = [];
    this.expectedWorkers = 0;
    this.completedWorkers = 0;

    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
    this.effectsButtonOnClick = this.effectsButtonOnClick.bind(this);
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
    this.simulationEngine.addEventListener("simulationCrashed", () => {
      this.stopButtonOnClick();
    });

    const effectsButton = document.getElementById("screenEffectsButton");
    if (effectsButton) effectsButton.checked = this.simulationEngine.useScreenEffects;

    const checkLoaded = setInterval(() => {
      const modules = Object.values(this.drawCanvas.renderModules);
      const allReady = modules.every(
        (m) => !m.imageCount || m.imageLoadCount >= m.imageCount,
      );
      console.log("interval over");
      if (allReady) {
        clearInterval(checkLoaded);
        // force initial draw with current engine state
        this.drawCanvas.renderAllModules();
      }
    }, 250);

    this.simulationEngine.timeStepEvent();

    await this.simulationEngine.loadStations();
    await this.simulationEngine.fetchData();
  }

  async runButtonOnClick() {
    await this.simulationEngine.fetchData();
    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = true;

    this.simulationEngine.resetEverything();

    const speedSlider = document.getElementById("speedSlider");
    if (speedSlider) {
      this.simulationEngine.setSpeedMultiplier(parseInt(speedSlider.value));
    }

    // Save the currently visible workspace to state so we have the latest code
    const currentXmlDom = Blockly.Xml.workspaceToDom(this.props.workspace);
    const currentXmlText = Blockly.Xml.domToText(currentXmlDom);
    if (this.state.selectedVehicle === 0) {
      this.state.harvesterXml = currentXmlText; // Mutate to avoid async delay
    } else {
      this.state.seederXml = currentXmlText;
    }

    // Helper to generate code in the background safely
    const generateHeadlessCode = (xmlText) => {
      if (!xmlText || !xmlText.includes("xmlns")) return "";
      const headless = new Blockly.Workspace();
      try {
        const dom = Blockly.utils.xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(dom, headless);
        javascriptGenerator.init(headless);
        const code = javascriptGenerator.workspaceToCode(headless);
        const vars = Object.values(javascriptGenerator.definitions_).join("\n");
        return vars + "\n" + code;
      } catch (error) {
        console.error("Headless code generation failed:", error);
        return "";
      } finally {
        headless.dispose();
      }
    };

    const harvesterCode = generateHeadlessCode(this.state.harvesterXml);
    const seederCode = generateHeadlessCode(this.state.seederXml);

    this.expectedWorkers = 0;
    this.completedWorkers = 0;

    const spawnWorker = (userCode, vType) => {
      if (!userCode.trim()) return;

      this.expectedWorkers++;
      const blob = this.createWorkerBlob(userCode);
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = (e) => {
        if (e.data.type === "COMMAND") {
          this.simulationEngine.handleWorkerMessage(
            { ...e.data, vehicleType: vType },
            worker,
          );
        } else if (e.data.type === "DONE") {
          this.completedWorkers++;
          if (this.completedWorkers === this.expectedWorkers) {
            this.stopButtonOnClick(); // Auto-stop when both finish
          }
        }
      };
      this.workers.push(worker);
    };

    // 0 = HARVESTER, 1 = SEEDER
    spawnWorker(harvesterCode, 0);
    spawnWorker(seederCode, 1);

    if (this.expectedWorkers > 0) {
      this.simulationEngine.startMoving();
    } else {
      alert("You must put code blocks on the workspace to run the simulation!");
      if (runButton) runButton.disabled = false;
    }
  }

  stopButtonOnClick() {
    if (this.simulationEngine) {
      this.simulationEngine.stopMovement();
    }
    this.simulationEngine;

    // Immediately kill all background workers
    this.workers.forEach((w) => w.terminate());
    this.workers = [];

    const runButton = document.getElementById("runButton");
    if (runButton) runButton.disabled = false;
  }

  effectsButtonOnClick() {
    if (this.simulationEngine) {
      this.simulationEngine.useScreenEffects = !this.simulationEngine.useScreenEffects;

      const effectsButton = document.getElementById("screenEffectsButton");
      if (effectsButton) effectsButton.checked = this.simulationEngine.useScreenEffects;
      
      this.simulationEngine.timeStepEvent();
    }
  }

  /**
   * onClick method for vehicle selection
   * switches camera to follow selected vehicle
   */
  handleImplementSelect = (vehicleType) => {
    // Save current workspace to state
    const currentXmlDom = Blockly.Xml.workspaceToDom(this.props.workspace);
    const currentXmlText = Blockly.Xml.domToText(currentXmlDom);

    if (this.state.selectedVehicle == 0) {
      this.setState({ harvesterXml: currentXmlText });
    } else {
      this.setState({ seederXml: currentXmlText });
    }

    // Load blocks for new tab
    const nextXmlText =
      vehicleType == 0 ? this.state.harvesterXml : this.state.seederXml;

    this.setState({ selectedVehicle: vehicleType }, () => {
      this.props.workspace.clear();
      const nextXmlDom = Blockly.utils.xml.textToDom(nextXmlText);
      Blockly.Xml.domToWorkspace(nextXmlDom, this.props.workspace);

      if (this.simulationEngine) {
        this.simulationEngine.setMainVehicleCamera(vehicleType);
      }
    });
  };

  createWorkerBlob(userCode) {
    const workerScript = `
      const simulationMethods = {
        _send: function(command, args) {
           return new Promise((resolve) => {
              const reqId = Math.random().toString(36).substring(7);
              self.postMessage({ 
                  type: 'COMMAND', 
                  command: command, 
                  args: args, 
                  requestId: reqId 
              });
              
              const listener = (e) => {
                  if (e.data.type === 'RESPONSE' && e.data.requestId === reqId) {
                      self.removeEventListener('message', listener);
                      resolve(e.data.result);
                  }
              };
              self.addEventListener('message', listener);
           });
        },
        
        moveForward: function(d) { return this._send('moveForward', [d]); },
        turnXDegrees: function(d) { return this._send('turnXDegrees', [d]); },
        waitXTime: function(d, t) { return this._send('waitXTime', [d, t]); },
        toggleHarvesting: function(b) { return this._send('toggleHarvesting', [b]); },
        toggleSeeding: function(b) { return this._send('toggleSeeding', [b]); },
        switchCropBeingPlanted: function(c) { return this._send('switchCropBeingPlanted', [c]); },
        CheckIfPlantInFront: function(c) { return this._send('CheckIfPlantInFront', [c]); }
      };

      async function runUserCode() {
         ${userCode}
      }

      runUserCode().then(() => {
          self.postMessage({ type: 'DONE' });
      }).catch(err => {
          console.error("Worker Error:", err);
      });
    `;
    return new Blob([workerScript], { type: "application/javascript" });
  }

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

          <div>
            <input
              type="checkbox"
              id="screenEffectsButton"
              className={styles.effectsButton}
              onClick={this.effectsButtonOnClick}
            />
            <label for="screenEffectsButton" className={styles.effectsButton}>Screen Effects</label>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimulationControlsContainer;
