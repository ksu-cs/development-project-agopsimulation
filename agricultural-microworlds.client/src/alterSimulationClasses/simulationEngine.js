import { StateManager } from "../States/StateManager";
import { CropState } from "../States/StateClasses/CropState";
import TractorState from "../States/StateClasses/TractorState";
import WeatherState from "../States/StateClasses/WeatherState";
import timeStepData from "./timeStepData";
import WeatherManager from "../Simulation/SimManagers/WeatherSimManager";
import CropManager from "../Simulation/SimManagers/CropSimManager";
import TractorManager from "../Simulation/SimManagers/TractorSimManager";

const Tractor1 = new Tractor();

export default class simulationEngine extends EventTarget {
  constructor(canvasWidth, canvasHeight) {
    super();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

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

    this.managers = [
      new WeatherManager(),
      new CropManager(),
      new TractorManager(),
    ];

    this.initializeStates();

    this.lastFrameTime = 0;
    this.animationId = -1;
    this.isRunning = false;
    this.cameraX = 0;
    this.cameraY = 0;
    this.nightFadeProgress = -1.0;
    this.simulationSessionId = 0;

    // Active Task System to sync Logic with Physics
    this.activeTask = null; 
  }

  initializeStates() {
    const weatherState = new WeatherState();

    if (this.managers) {
        const weatherMgr = this.managers.find(m => m instanceof WeatherManager);
        if (weatherMgr && typeof weatherMgr.applyCacheToState === 'function') {
            weatherMgr.applyCacheToState(weatherState);
        }
    }

    this.stateManager.initState("weather", weatherState);

    const tractor = new TractorState();
    tractor.x = (this.COLS * this.TILE_SIZE) / 2;
    tractor.y = (this.ROWS * this.TILE_SIZE) / 2;
    this.stateManager.initState("tractor", tractor);

    const field = Array.from({ length: this.ROWS }, () =>
      Array.from({ length: this.COLS }, () => new CropState())
    );
    this.stateManager.initState("field", field);
  }

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
    cancelAnimationFrame(this.animationId);
  }

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
        nextStates[key] = oldStates[key].map((row) => row.map((c) => c.clone()));
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
            if (this.activeTask.type === 'TIMER') {
                this.activeTask.timeLeft -= simDeltaTime; 
                if (this.activeTask.timeLeft <= 0) {
                    this.resolveActiveTask();
                }
            } else if (this.activeTask.type === 'TURN') {
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
    this.updateCamera();
    this.updateDateDisplay(); 
    this.timeStepEvent(); 

    this.animationId = requestAnimationFrame(this.loop.bind(this));
  }

  resolveActiveTask() {
      if (this.activeTask && this.activeTask.resolve) {
          const resolve = this.activeTask.resolve;
          const type = this.activeTask.type;
          this.activeTask = null; 

          if (type === 'TIMER') {
             const t = this.stateManager.getState("tractor");
             if (t) t.isMoving = false;
             this.nightFadeProgress = -1.0; 
          }

          resolve();
      }
  }

  timeStepEvent() {
    const tractor = this.stateManager.getState("tractor");
    const field = this.stateManager.getState("field");
    if(!tractor || !field) return;

    this.dispatchEvent(
      new CustomEvent("simulationEngineCreated", {
        bubbles: true,
        detail: new timeStepData(
          this.cameraX,
          this.cameraY,
          tractor.angle,
          tractor.yieldScore,
          tractor.x, 
          tractor.y, 
          this.nightFadeProgress,
          field
        ),
      })
    );
  }

  updateCamera() {
    const tractor = this.stateManager.getState("tractor");
    if (!tractor) return;
    const tractorCenterX = tractor.x + 32;
    const tractorCenterY = tractor.y + 32;
    let targetCameraX = tractorCenterX - this.canvasWidth / 2;
    let targetCameraY = tractorCenterY - this.canvasHeight / 2;
    const maxCameraX = this.worldPixelWidth - this.canvasWidth;
    const maxCameraY = this.worldPixelHeight - this.canvasHeight;
    this.cameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));
    this.cameraY = Math.max(0, Math.min(targetCameraY, maxCameraY));
  }

  // --- ASYNC COMMANDS ---

  async moveForward(durationInSeconds) {
    const mySessionId = this.simulationSessionId;
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isMoving = true;
    return new Promise((resolve) => {
        this.activeTask = {
            type: 'TIMER',
            timeLeft: Number(durationInSeconds), 
            resolve: resolve,
            sessionId: mySessionId
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
            type: 'TURN',
            resolve: resolve,
            sessionId: mySessionId
        };
    });
  }

  async waitXWeeks(weeks) {
      const mySessionId = this.simulationSessionId;
      const durationInSeconds = Number(weeks) * 7.0; 
      this.nightFadeProgress = 0.5; 
      return new Promise((resolve) => {
          this.activeTask = {
              type: 'TIMER',
              timeLeft: durationInSeconds,
              resolve: resolve,
              sessionId: mySessionId
          };
      });
  }

  // --- UTILS ---

  toggleHarvesting(isOn) {
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isHarvestingOn = isOn;
  }
  
  toggleSeeding(isOn) {
      const tractor = this.stateManager.getState("tractor");
      if(tractor) tractor.isSeedingOn = isOn;
  }

  setSpeedMultiplier(speed) {
      const weather = this.stateManager.getState("weather");
      if(weather) weather.speedMultiplier = speed;
  }

  CheckIfPlantInFront(type) {
    const tractor = this.stateManager.getState("tractor");
    const field = this.stateManager.getState("field");
    if(!tractor || !field) return false;

    const centerX = tractor.x + this.FRAME_WIDTH / 2;
    const centerY = tractor.y + this.FRAME_HEIGHT / 2;
    const rad = tractor.angle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const topLeftX = -this.FRAME_WIDTH / 2;
    const topLeftY = -this.FRAME_HEIGHT / 2;
    const topRightX = this.FRAME_WIDTH / 2;
    const topRightY = -this.FRAME_HEIGHT / 2;

    const p1 = {
        x: centerX + (topLeftX * cos - topLeftY * sin),
        y: centerY + (topLeftX * sin + topLeftY * cos)
    };
    const p2 = {
        x: centerX + (topRightX * cos - topRightY * sin),
        y: centerY + (topRightX * sin + topRightY * cos)
    };

    return this.detectWhatTilesAreHit(p1.x, p1.y, p2.x, p2.y, type, field);
  }

  detectWhatTilesAreHit(x0, y0, x1, y1, checkTiles, field) {
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    const tileX = Math.floor(midX / this.TILE_WIDTH);
    const tileY = Math.floor(midY / this.TILE_HEIGHT);

    if(tileY >= 0 && tileY < this.ROWS && tileX >= 0 && tileX < this.COLS) {
        const crop = field[tileY][tileX];
        return crop.stage == checkTiles;
    }
    return false;
  }

  async loadStations() {
    try {
        const response = await fetch("https://mesonet.k-state.edu/rest/stationnames/");
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
      } catch (e) { console.error("Error loading stations:", e); }
  }

  async fetchData() {
    const station = document.getElementById("station")?.value || "Flickner";
    const start = document.getElementById("start")?.value || "2021-01-01";
    const weatherMgr = this.managers.find(m => m instanceof WeatherManager);
    if(weatherMgr) await weatherMgr.loadWeatherData(this.stateManager, station, start);
    this.updateDateDisplay();
  }

  updateDateDisplay() {
     const weather = this.stateManager.getState("weather");
     if(!weather || !weather.startDate) return;
     
     const currentDate = new Date(weather.startDate);
     currentDate.setDate(weather.startDate.getDate() + weather.currentDayIndex);
     
     // FIX: Restored DOM updates safely
     const dateLabel = document.getElementById("dateText");
     if(dateLabel) {
         dateLabel.textContent = `Date: ${currentDate.toLocaleDateString()}`;
     }
     
     const gddLabel = document.getElementById("gddText");
     if(gddLabel) {
         gddLabel.textContent = `GDD: ${weather.cumulativeGDD.toFixed(2)}`;
     }
  }

  resetEverything() {
    this.simulationSessionId++;
    this.activeTask = null;
    this.stopMovement();
    this.initializeStates();
    this.updateCamera();
    this.timeStepEvent();
    
    // Explicitly update display on reset so Date resets instantly on screen
    this.updateDateDisplay();
  }
}