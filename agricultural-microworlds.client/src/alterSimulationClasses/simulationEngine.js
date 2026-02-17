import { StateManager } from "../States/StateManager";
import {
  CROP_STAGES,
  CROP_TYPES,
  CropState,
} from "../States/StateClasses/CropState";
import TractorState from "../States/StateClasses/TractorState";
import WeatherState from "../States/StateClasses/WeatherState";
import timeStepData from "./timeStepData";
import WeatherManager from "../Simulation/SimManagers/WeatherSimManager";
import CropManager from "../Simulation/SimManagers/CropSimManager";
import TractorManager from "../Simulation/SimManagers/TractorSimManager";
import {
  CreateBlankField,
  InitializeField,
} from "../BinaryArrayAbstractionMethods/BinaryFieldAbstraction";

/*
simulationEngine.js

1. Maintains the official Simulation State
2. Runs Game Loop
3. Coordinates Simulation Managers
4. Connects aync Blockly commands with loop

*/
export default class simulationEngine extends EventTarget {
  constructor() {
    super();

    this.stateManager = new StateManager();

    // Constants
    this.TILE_SIZE = 8;
    this.ROWS = 300;
    this.COLS = 300;
    this.TILE_WIDTH = this.TILE_SIZE;
    this.TILE_HEIGHT = this.TILE_SIZE;
    this.FRAME_WIDTH = 64;
    this.FRAME_HEIGHT = 64;

    this.worldPixelWidth = this.COLS * this.TILE_WIDTH;
    this.worldPixelHeight = this.ROWS * this.TILE_HEIGHT;

    // Logic managers. Handle rules for Weather, Crops, and Tractor
    this.managers = [
      new WeatherManager(),
      new CropManager(),
      new TractorManager(),
    ];

    // initialize default state of world
    this.initializeStates();

    // Loop variables
    this.lastFrameTime = 0;
    this.animationId = -1;
    this.isRunning = false;
    this.nightFadeProgress = -1.0; // -1.0 = Day, 0.0+ = Night
    this.simulationSessionId = 0;

    // Active Task System to sync Logic with Physics
    this.activeTask = null;
  }

  // Helper: Get manager instance
  getManager(type) {
    return this.managers.find((m) => m instanceof type);
  }

  // Sets up initial state for grid
  initializeStates() {
    // 1. Setup weather
    const weatherState = new WeatherState();

    if (this.managers) {
      const weatherMgr = this.managers.find((m) => m instanceof WeatherManager);
      if (weatherMgr && typeof weatherMgr.applyCacheToState === "function") {
        weatherMgr.applyCacheToState(weatherState);
      }
    }
    this.stateManager.initState("weather", weatherState);

    // 2. Setup tractor
    const tractor = new TractorState();
    tractor.x = (this.COLS * this.TILE_SIZE) / 2;
    tractor.y = (this.ROWS * this.TILE_SIZE) / 2;
    this.stateManager.initState("tractor", tractor);

    //3. Setup field
    const field = CreateBlankField(this.ROWS, this.COLS);

    const initialCrop = new CropState();
    initialCrop.changeCropType(CROP_TYPES.SOY);
    initialCrop.stage = CROP_STAGES.MATURE;
    initialCrop.currentGDD = 0;

    InitializeField(field, initialCrop);

    this.stateManager.initState("field", field);
  }

  // Loop Control
  startMoving() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.loop();
    }
  }

  stopMovement() {
    this.isRunning = false;
    this.simulationSessionId++;
    this.activeTask = null;
    this.nightFadeProgress = -1.0;
    cancelAnimationFrame(this.animationId);
    this.timeStepEvent();
  }

  // Main game loop
  loop(timestamp) {
    if (!this.isRunning) return;

    if (!timestamp) timestamp = performance.now();
    const realDeltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    const oldStates = this.stateManager.states;
    const nextStates = {};

    // 1. Calculate Simulated Time
    const weather = oldStates.weather;
    const speedMult = weather ? weather.speedMultiplier : 1;
    const safeRealDelta = Math.min(realDeltaTime, 0.1);
    const simDeltaTime = safeRealDelta * speedMult;

    // 2. Clone States
    for (const key in oldStates) {
      if (oldStates[key] && typeof oldStates[key].clone === "function") {
        nextStates[key] = oldStates[key].clone();
      } else if (key === "field") {
        nextStates[key] = oldStates[key].slice();
      }
    }

    // 3. Run Managers
    for (const sm of this.managers) {
      sm.update(simDeltaTime, oldStates, nextStates);
    }

    // 4. Handle Active Tasks
    if (this.activeTask) {
      if (this.activeTask.sessionId !== this.simulationSessionId) {
        this.activeTask = null;
      } else {
        if (this.activeTask.type === "TIMER") {
          this.activeTask.timeLeft -= simDeltaTime;
          if (this.activeTask.timeLeft <= 0) {
            if (nextStates.tractor) nextStates.tractor.isMoving = false;

            this.resolveActiveTask();
          }
        } else if (this.activeTask.type === "TURN") {
          const t = nextStates.tractor;
          const diff = Math.abs(t.goalAngle - t.angle);
          if (diff < 0.5) {
            t.angle = t.goalAngle;
            this.resolveActiveTask();
          }
        }
      }
    }

    // 5. Commit States
    for (const key in nextStates) {
      this.stateManager.commitState(key, nextStates[key]);
    }

    // 6. Update Visuals
    this.timeStepEvent();

    this.animationId = requestAnimationFrame(this.loop.bind(this));
  }

  resolveActiveTask() {
    if (this.activeTask && this.activeTask.resolve) {
      const resolve = this.activeTask.resolve;
      const type = this.activeTask.type;
      this.activeTask = null;

      if (type === "TIMER") {
        const t = this.stateManager.getState("tractor");
        if (t) t.isMoving = false;
        this.nightFadeProgress = -1.0;
      }

      resolve();
    }
  }

  // Gives snapshot of required data to visualization
  timeStepEvent() {
    const tractor = this.stateManager.getState("tractor");
    const field = this.stateManager.getState("field");
    const weather = this.stateManager.getState("weather");

    if (!tractor || !field || !weather) return;

    // Handle case where startDate is null (initial load before Fetch)
    let dateString = "Not Started";
    if (weather.startDate) {
      const dateObj = new Date(weather.startDate);
      dateObj.setDate(weather.startDate.getDate() + weather.currentDayIndex);
      dateString = dateObj.toLocaleDateString();
    }

    // Calculate GDD String
    const gddString = weather.cumulativeGDD.toFixed(2);

    this.dispatchEvent(
      new CustomEvent("simulationEngineCreated", {
        bubbles: true,
        detail: new timeStepData(
          tractor.angle,
          tractor.yieldScore,
          tractor.x,
          tractor.y,
          this.nightFadeProgress,
          field,
          this.COLS,
          dateString,
          gddString,
        ),
      }),
    );
  }

  // --- ASYNC COMMANDS ---

  async moveForward(durationInSeconds) {
    const mySessionId = this.simulationSessionId;
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isMoving = true;
    return new Promise((resolve) => {
      this.activeTask = {
        type: "TIMER",
        timeLeft: Number(durationInSeconds),
        resolve: resolve,
        sessionId: mySessionId,
      };
    });
  }

  async turnXDegrees(angle) {
    const mySessionId = this.simulationSessionId;
    const tractor = this.stateManager.getState("tractor");
    if (tractor) {
      tractor.goalAngle += Number(angle);
    }
    return new Promise((resolve) => {
      this.activeTask = {
        type: "TURN",
        resolve: resolve,
        sessionId: mySessionId,
      };
    });
  }

  async waitXWeeks(weeks) {
    const mySessionId = this.simulationSessionId;
    const durationInSeconds = Number(weeks) * 7.0;

    // FIX: Stop the tractor so it doesn't drive while waiting
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isMoving = false;

    this.nightFadeProgress = 0.5;
    return new Promise((resolve) => {
      this.activeTask = {
        type: "TIMER",
        timeLeft: durationInSeconds,
        resolve: resolve,
        sessionId: mySessionId,
      };
    });
  }

  toggleHarvesting(isOn) {
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isHarvestingOn = isOn;
  }

  toggleSeeding(isOn) {
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isSeedingOn = isOn;
  }

  /**
   * Switches the crop being planted by the seeder.
   * @param {CROP_TYPES} crop - The type of crop to plant
   */
  switchCropBeingPlanted(crop) {
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.cropBeingPlanted = crop;
  }

  setSpeedMultiplier(speed) {
    const weather = this.stateManager.getState("weather");
    if (weather) weather.speedMultiplier = speed;
  }

  async loadStations() {
    try {
      const response = await fetch(
        "https://mesonet.k-state.edu/rest/stationnames/",
      );
      const text = await response.text();
      const lines = text.split("\n").slice(1);
      const stationSelect = document.getElementById("station");
      if (!stationSelect) return;
      stationSelect.innerHTML = "";
      lines.forEach((line) => {
        const cols = line.split(",");
        const NAME = cols[0];
        const ABBR = cols[0];
        if (NAME && ABBR) {
          const option = document.createElement("option");
          option.value = ABBR;
          option.textContent = NAME;
          if (NAME.includes("Flickner")) option.selected = true;
          stationSelect.appendChild(option);
        }
      });
    } catch (e) {
      console.error("Error loading stations:", e);
    }
  }

  async fetchData() {
    const station = document.getElementById("station")?.value || "Flickner";
    const start = document.getElementById("start")?.value || "2021-01-01";
    const weatherMgr = this.managers.find((m) => m instanceof WeatherManager);
    if (weatherMgr)
      await weatherMgr.loadWeatherData(this.stateManager, station, start);
  }

  resetEverything() {
    this.simulationSessionId++;
    this.activeTask = null;
    this.stopMovement();
    this.initializeStates();
    this.timeStepEvent();

    // Explicitly update display on reset so Date resets instantly on screen
  }
}
