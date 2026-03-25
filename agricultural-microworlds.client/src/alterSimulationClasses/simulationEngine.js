import { StateManager } from "../States/StateManager";
import {
  CROP_GDDS,
  CROP_STAGES,
  CROP_TYPES,
} from "../States/StateClasses/CropState";
import ImplementState, {
  VEHICLES,
} from "../States/StateClasses/ImplementState";
import WeatherState from "../States/StateClasses/WeatherState";
import timeStepData from "./timeStepData";
import WeatherManager from "../Simulation/SimManagers/WeatherSimManager";
import CropManager from "../Simulation/SimManagers/CropSimManager";
import TractorManager from "../Simulation/SimManagers/TractorSimManager";
import BitmapFieldState from "../BinaryArrayAbstractionMethods/BitmapFieldState";

/**
 * @classdesc Maintains the official Simulation State, runs the game loop, coordinates simulation managers, and connects asynchronous Blockly commands with the loop.
 */
export default class simulationEngine extends EventTarget {
  /**
   * @constructor Defines and instances all constants, managers, and variables for the engine.
   */
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
    this.simulationSessionId = 0;

    // Active Task System to sync Logic with Physics
    this.activeTask = null;

    this.harvesterWorker = new Worker("WorkerHarvester.js");
    this.seederWorker = new Worker("WorkerSeeder.js");
  }

  /**
   * Returns a manager instance of a specific type.
   * @param {type} type The type of manager to search for.
   */
  getManager(type) {
    return this.managers.find((m) => m instanceof type);
  }

  /**
   * Initializes all simulation states of the weather, tractor, and field.
   */
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

    // This block of code is SUPPOSED to not do anything... whenever I comment it out, it breaks.
    const tractor = new ImplementState();
    tractor.x = -150;
    tractor.y = (this.ROWS * this.TILE_SIZE) / 2;
    this.stateManager.initState("tractor", tractor);

    // 2. Setup vehicles
    const harvester = new ImplementState();
    harvester.type = VEHICLES.HARVESTER;
    harvester.x = -150;
    harvester.y = (this.ROWS * this.TILE_SIZE) / 2 - 50;

    const seeder = new ImplementState();
    seeder.type = VEHICLES.SEEDER;
    seeder.x = -150;
    seeder.y = (this.ROWS * this.TILE_SIZE) / 2 + 50;

    // 3. Setup field
    /** @type {Object.<string, {size: number, type: string}>} */
    const tileState = {
      ["stage"]: {
        size: 1,
        type: "uint8",
      },
      ["type"]: {
        size: 1,
        type: "uint8",
      },
      ["currentGDD"]: {
        size: 4,
        type: "float32",
      },
      ["requiredGDD"]: {
        size: 4,
        type: "float32",
      },
      ["waterLevel"]: {
        size: 4,
        type: "float32",
      },
      ["minerals"]: {
        size: 4,
        type: "float32",
      },
    };
    const field = new BitmapFieldState(this.ROWS, this.COLS, tileState);

    /** @type {Object.<string, number>} */
    const startingValues = {
      ["stage"]: CROP_STAGES.MATURE,
      ["type"]: CROP_TYPES.CORN,
      ["currentGDD"]: 0,
      ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
      ["waterLevel"]: 1000,
      ["minerals"]: 1000,
    };
    field.InitializeField(startingValues);

    this.stateManager.initState("field", field);
    this.stateManager.initState("vehicles", [harvester, seeder]);

    const existingCamera = this.stateManager.getState("activeVehicleCamera");

    this.stateManager.initState("activeVehicleType", VEHICLES.HARVESTER);
    this.stateManager.initState(
      "activeVehicleCamera",
      existingCamera !== undefined ? existingCamera : VEHICLES.HARVESTER,
    );
  }

  /**
   * Begins running the simulation, calling the first loop.
   */
  startMoving() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.loop();
    }
  }

  /**
   * Stops all active tick-based actions within the simulation.
   */
  stopMovement() {
    this.isRunning = false;
    this.simulationSessionId++;
    this.activeTask = null;
    cancelAnimationFrame(this.animationId);
    this.timeStepEvent();
  }

  /**
   * The main game loop.
   * Calculates all simulation time, clones the simulation states, runs managers and active tasks, and updates the visuals accordingly.
   * @param {number} timestamp The current timestamp of the game, used to calculate delta time.
   */
  loop(timestamp) {
    if (!this.isRunning) return;

    if (!timestamp) timestamp = performance.now();
    const realDeltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    const oldStates = this.stateManager.states;
    const nextStates = {};

    // 1. Calculate Simulated Time
    const weather = oldStates.weather;
    const speedMult = weather ? weather.getSpeedMultiplier() : 1;
    const safeRealDelta = Math.min(realDeltaTime, 0.1);
    const simDeltaTime = safeRealDelta * speedMult;

    // 2. Clone States
    for (const key in oldStates) {
      if (oldStates[key] && typeof oldStates[key].clone === "function") {
        nextStates[key] = oldStates[key].clone();
      } else if (key === "field") {
        nextStates[key] = oldStates[key].slice();
      } else if (key === "vehicles") {
        nextStates[key] = oldStates[key].map((v) => v.clone());
      } else {
        nextStates[key] = oldStates[key];
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
            if (nextStates.vehicles)
              nextStates.vehicles.forEach((v) => (v.isMoving = false));

            this.resolveActiveTask();
          }
        } else if (this.activeTask.type === "TURN") {
          const activeType = this.stateManager.getState("activeVehicleType");
          const v = nextStates.vehicles?.find((v) => v.type == activeType);
          if (v) {
            const diff = Math.abs(v.goalAngle - v.angle);
            if (diff < 0.5) {
              v.angle = v.goalAngle;
              this.resolveActiveTask();
            }
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

  /**
   * Resolves the currently active task, if possible.
   */
  resolveActiveTask() {
    if (this.activeTask && this.activeTask.resolve) {
      const resolve = this.activeTask.resolve;
      const type = this.activeTask.type;
      this.activeTask = null;

      if (type === "TIMER") {
        const vehicles = this.stateManager.getState("vehicles");
        if (vehicles) vehicles.forEach((v) => (v.isMoving = false));

        const weather = this.stateManager.getState("weather");
        if (weather) weather.isWaiting = false;
      }

      resolve();
    }
  }

  /**
   * Dispatches an event to obtain a timestamp of the current simulation and its states.
   */
  timeStepEvent() {
    const tractor = this.stateManager.getState("tractor");
    const field = this.stateManager.getState("field");
    const weather = this.stateManager.getState("weather");

    const vehicles = this.stateManager.getState("vehicles");
    const activeVehicleType = this.stateManager.getState("activeVehicleType");
    const activeVehicleCamera = this.stateManager.getState(
      "activeVehicleCamera",
    );

    if (!tractor || !field || !weather) return;

    // Handle case where startDate is null (initial load before Fetch)
    let dateString = "Not Started";
    if (weather.startDate) {
      const dateObj = new Date(weather.startDate);
      dateObj.setDate(weather.startDate.getDate() + weather.currentDayIndex);
      dateString = dateObj.toLocaleDateString();
    }

    // Calculate strings
    const gddString = weather.cumulativeGDD.toFixed(2);

    // pick the rain source from WeatherState
    const rainValue =
      weather.cumulativeRain ??
      weather.cumulativePrecip ??
      weather.cumulativePrecipitation ??
      0;
    const rainString = Number(rainValue).toFixed(2);

    const ts = new timeStepData(
      vehicles,
      activeVehicleType,
      activeVehicleCamera,
      tractor.angle,
      tractor.yieldScore,
      tractor.x,
      tractor.y,
      weather.timeAccumulator,
      field,
      this.COLS,
      dateString,
      gddString,
      tractor.type || "tractor",
      rainString,
    );

    //default back to tractor
    ts.vehicleType = tractor.type || "tractor";

    this.dispatchEvent(
      new CustomEvent("simulationEngineCreated", {
        bubbles: true,
        detail: ts,
      }),
    );
  }
  // --- ASYNC COMMANDS ---

  /**
   * Begins moving the tractor for a set amount of time.
   * @param {number} durationInSeconds The length of time the tractor should be moving for.
   * @returns {Promise} Returns a new Promise to handle tractor movement.
   */
  async moveForward(durationInSeconds) {
    const mySessionId = this.simulationSessionId;
    const vehicle = this.getActiveVehicle();
    if (vehicle) vehicle.isMoving = true;
    return new Promise((resolve) => {
      this.activeTask = {
        type: "TIMER",
        timeLeft: Number(durationInSeconds),
        resolve: resolve,
        sessionId: mySessionId,
      };
    });
  }

  /**
   * Tells the tractor to turn a set amount of degrees over time.
   * @param {number} angle The amount, in degrees, that the tractor should turn.
   * @returns {Promise} Returns a new Promise to handle tractor turning.
   */
  async turnXDegrees(angle) {
    const mySessionId = this.simulationSessionId;
    const vehicle = this.getActiveVehicle();
    if (vehicle) {
      vehicle.goalAngle += Number(angle);
    }
    return new Promise((resolve) => {
      this.activeTask = {
        type: "TURN",
        resolve: resolve,
        sessionId: mySessionId,
      };
    });
  }

  /**
   * Halts all tractor movement, waiting for a set amount of in-simulation weeks to pass.
   * @param {number} weeks How many weeks the tractor should wait for.
   * @returns {Promise} Returns a new Promise to wait a certain amount of time.
   */
  async waitXWeeks(weeks) {
    const mySessionId = this.simulationSessionId;
    const durationInSeconds = Number(weeks) * 24.0 * 7.0;

    const vehicles = this.stateManager.getState("vehicles");
    if (vehicles) vehicles.forEach((v) => (v.isMoving = false));

    const weather = this.stateManager.getState("weather");
    if (weather) weather.isWaiting = true;

    return new Promise((resolve) => {
      this.activeTask = {
        type: "TIMER",
        timeLeft: durationInSeconds,
        resolve: resolve,
        sessionId: mySessionId,
      };
    });
  }

  /**
   * Toggles harvesting for the tractor on or off.
   * @param {boolean} isOn Whether or not harvesting should be enabled.
   */
  toggleHarvesting(isOn) {
    const vehicle = this.getActiveVehicle();
    if (vehicle && vehicle.type === VEHICLES.HARVESTER) {
      vehicle.isHarvestingOn = isOn;
      if (isOn) vehicle.isSeedingOn = false;
    }
    this.harvesterWorker.postMessage(isOn);
  }

  /**
   * Toggles seeding for the tractor on or off.
   * @param {boolean} isOn Whether or not seeding should be enabled.
   */
  toggleSeeding(isOn) {
    const vehicle = this.getActiveVehicle();
    if (vehicle && vehicle.type === VEHICLES.SEEDER) {
      vehicle.isSeedingOn = isOn;
      if (isOn) vehicle.isHarvestingOn = false;
    }
    this.seederWorker.postMessage(isOn);
  }

  /**
   * Switches the crop being planted by the seeder.
   * @param {CROP_TYPES} crop - The type of crop to plant
   */
  switchCropBeingPlanted(crop) {
    const vehicle = this.getActiveVehicle();
    if (vehicle) vehicle.cropBeingPlanted = crop;
  }

  /**
   * Sets the speed multiplier for the simulation's weather manager.
   * @param {number} speed The speed multiplier for the weather.
   */
  setSpeedMultiplier(speed) {
    const weather = this.stateManager.getState("weather");
    if (weather) weather.speedMultiplier = speed;
  }

  /**
   * Checks if a tile in front of the tractor contains a certain type of tile.
   * @param {any} type The type of tile to search for.
   * @returns {boolean} Whether or not a tile was found in front of the tractor.
   */
  CheckIfPlantInFront(type) {
    const vehicle = this.getActiveVehicle();
    if (!vehicle) return false;

    const field = this.stateManager.getState("field");
    const tractorManager = this.getManager(TractorManager);

    for (const targetCrop of tractorManager.getTilesCurrentlyOver(
      vehicle,
      field,
      tractorManager.HEADER_OFFSET,
    )) {
      if (targetCrop[0] && targetCrop[0].stage == type) {
        return true;
      }
    }

    return false;
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
  }

  setMainVehicleType(type) {
    this.stateManager.commitState("activeVehicleType", type);

    this.timeStepEvent();
  }

  setMainVehicleCamera(type) {
    this.stateManager.commitState("activeVehicleCamera", type);

    this.timeStepEvent();
  }

  // Helper to get vehicle object that matches user selected vehicle
  getActiveVehicle() {
    const vehicles = this.stateManager.getState("vehicles");
    const activeVehicleType = this.stateManager.getState("activeVehicleType");
    if (!vehicles) return null;
    return vehicles.find((v) => v.type == activeVehicleType);
  }
}
