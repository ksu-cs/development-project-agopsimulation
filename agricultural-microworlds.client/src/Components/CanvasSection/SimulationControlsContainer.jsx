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

    // Harvester = 0, Seeder = 1, Collector = 2
    this.state = {
      selectedVehicle: 0,
      vehiclesXml: {
        0: {
          name: "Harvester",
          xml:
          '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
        },
        1: {
          name: "Seeder",
          xml:
          '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
        },
        2: {
          name: "Collector",
          xml:
          '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
        }
      },
      showXmlInput: false,
    };

    this.workers = [];
    this.expectedWorkers = 0;
    this.completedWorkers = 0;

    this.runButtonOnClick = this.runButtonOnClick.bind(this);
    this.stopButtonOnClick = this.stopButtonOnClick.bind(this);
    this.effectsButtonOnClick = this.effectsButtonOnClick.bind(this);
    this.printWorkspaceXml = this.printWorkspaceXml.bind(this);
    this.loadWorkspaceXml = this.loadWorkspaceXml.bind(this);
    this.toggleXmlInput = this.toggleXmlInput.bind(this);
    this.xmlInputRef = null;
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
    this.simulationEngine.addEventListener("simulationEngineTimeStep", (e) =>
      this.drawCanvas.handleTimeStep(e),
    );
    this.simulationEngine.addEventListener("simulationCrashed", () => {
      this.stopButtonOnClick();
    });
    this.simulationEngine.addEventListener("simulationEngineTimeStep", (e) => {
      this.props.statsEventHandler(e);
    });

    const effectsButton = document.getElementById("screenEffectsButton");
    if (effectsButton)
      effectsButton.checked = this.simulationEngine.useScreenEffects;

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

    // Save the currently visible workspace to state so we have the latest code
    const currentXmlDom = Blockly.Xml.workspaceToDom(this.props.workspace);
    const currentXmlText = Blockly.Xml.domToText(currentXmlDom);

    // Update the current workspace's XML before generating headless code
    this.state.vehiclesXml[this.state.selectedVehicle].xml = currentXmlText;

    // Generate headless code for each workspace after updating the current workspace
    Object.entries(this.state.vehiclesXml).forEach(([key, value]) => {
      spawnWorker(generateHeadlessCode(value.xml), parseInt(key));
    })

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
      this.simulationEngine.useScreenEffects =
        !this.simulationEngine.useScreenEffects;

      const effectsButton = document.getElementById("screenEffectsButton");
      if (effectsButton)
        effectsButton.checked = this.simulationEngine.useScreenEffects;

      if (!this.simulationEngine.isRunning)
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

    this.setState((prevState) => ({
      vehiclesXml: {
        ...prevState.vehiclesXml,
        [prevState.selectedVehicle]: {
          ...prevState.vehiclesXml[prevState.selectedVehicle],
          xml: currentXmlText
        }
      },
    }));

    // Load blocks for new tab
    const nextXmlText = this.state.vehiclesXml[vehicleType]?.xml || "";

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
           console.log("WORKER sending", command, args);
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
        CheckIfPlantInFront: function(c) { return this._send('CheckIfPlantInFront', [c]); },
        fillVehicleFuelTank: function(v) { return this._send('fillVehicleFuelTank', [v]); },
        toggleWatering: function(b) { return this._send('toggleWatering', [b]); },
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

  /**
   * Exports the XML of all Blockly workspaces as JSON and logs to console
   */
  printWorkspaceXml() {
    // Save the currently visible workspace before exporting
    const currentXmlDom = Blockly.Xml.workspaceToDom(this.props.workspace);
    const currentXmlText = Blockly.Xml.domToText(currentXmlDom);

    // Update the current workspace's XML before exporting
    this.state.vehiclesXml[this.state.selectedVehicle].xml = currentXmlText;


    const jsonString = JSON.stringify(this.state.vehiclesXml, null, 2);
    console.log("=== Blockly Workspace JSON ===");
    console.log(jsonString);
    console.log("=== End Blockly Workspace JSON ===");

    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(jsonString).then(() => {
      console.log("Workspace JSON copied to clipboard!");
    });
  }

  /**
   * Loads workspace XML from a JSON string
   */
  loadWorkspaceXml() {
    const jsonString = this.xmlInputRef?.value;

    if (!jsonString || jsonString.trim() === "") {
      alert("Please paste a JSON workspace configuration");
      return;
    }

    try {
      const workspaceData = JSON.parse(jsonString);

      // Validate that we have the expected fields
      if (
        !workspaceData[0] || !workspaceData[0].xml
      ) {
        alert(
          "Invalid JSON format. Must be at least one vehicle XML field",
        );
        return;
      }

      // Update state with loaded XML
      this.setState({
        vehiclesXml: workspaceData,
      });

      this.props.workspace.clear();
      const xmlDom = Blockly.utils.xml.textToDom(workspaceData[this.state.selectedVehicle].xml);
      Blockly.Xml.domToWorkspace(xmlDom, this.props.workspace);

      alert("Workspace loaded successfully!");

      // Clear the input and hide it
      if (this.xmlInputRef) {
        this.xmlInputRef.value = "";
      }
      this.setState({ showXmlInput: false });
    } catch (error) {
      alert(`Error parsing JSON: ${error.message}`);
    }
  }

  /**
   * Toggles the visibility of the XML input area
   */
  toggleXmlInput() {
    this.setState({ showXmlInput: !this.state.showXmlInput });
  }

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
            {this.state.selectedVehicle === 0
              ? "Harvester"
              : this.state.selectedVehicle === 1
                ? "Seeder"
                : "Collector"}
          </div>

          <div className={styles.buttonGroup}>
            {
              Object.entries(this.state.vehiclesXml).map(([index]) => {
                <button className = {styles.camera_btn} onClick={() => this.handleImplementSelect(index)}>
                  {this.state.vehiclesXml[index].name}
                </button>
              })
            }
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
            <button
              id="collectorCameraButton"
              className={styles.camera_btn}
              onClick={() => this.handleImplementSelect(2)}
            >
              Collector
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
            <label
              htmlFor="screenEffectsButton"
              className={styles.effectsButton}
            >
              Screen Effects
            </label>
          </div>

          <div
            style={{
              marginTop: "15px",
              borderTop: "1px solid #ccc",
              paddingTop: "10px",
            }}
          >
            <button
              id="exportWorkspaceXmlButton"
              className={styles.runButton}
              onClick={this.printWorkspaceXml}
              style={{ width: "100%", marginBottom: "10px" }}
            >
              Export Workspace JSON
            </button>

            <button
              id="loadWorkspaceJsonButton"
              className={styles.runButton}
              onClick={this.toggleXmlInput}
              style={{
                width: "100%",
                marginBottom: this.state.showXmlInput ? "10px" : "0px",
              }}
            >
              {this.state.showXmlInput ? "Cancel" : "Load Workspace JSON"}
            </button>

            {this.state.showXmlInput && (
              <>
                <label
                  htmlFor="xmlInput"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "5px",
                    marginTop: "10px",
                  }}
                >
                  Import Workspace JSON:
                </label>
                <textarea
                  id="xmlInput"
                  ref={(ref) => (this.xmlInputRef = ref)}
                  placeholder="Paste JSON workspace configuration here"
                  style={{
                    width: "100%",
                    height: "150px",
                    padding: "8px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  id="importWorkspaceXmlButton"
                  className={styles.runButton}
                  onClick={this.loadWorkspaceXml}
                  style={{ width: "100%" }}
                >
                  Load
                </button>
              </>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimulationControlsContainer;
