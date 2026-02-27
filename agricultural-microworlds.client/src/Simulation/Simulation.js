import { StateManager } from "../States/StateManager";
import WeatherManager from "../Simulation/SimManagers/WeatherSimManager";
import CropManager from "../Simulation/SimManagers/CropSimManager";
import TractorManager from "../Simulation/SimManagers/TractorSimManager";
import ImplementState from "../States/StateClasses/ImplementState";
import WeatherState from "../States/StateClasses/WeatherState";
import { CropState } from "../States/StateClasses/CropState";

export default class Simulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Internal Resolution
    this.canvas.width = 500;
    this.canvas.height = 500;

    this.stateManager = new StateManager();

    // Constants
    this.TILE_SIZE = 8;
    // Massive field to ensure we don't run out of space easily
    this.ROWS = 300;
    this.COLS = 300;

    this.initializeStates();

    this.managers = [
      new WeatherManager(),
      new CropManager(),
      new TractorManager(),
    ];

    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();

    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

    this.vehicleSprites = {
      tractor: new Image(),
      inverted: new Image(),
    };

    this.vehicleSprites.tractor.src = "./src/assets/combine-harvester.png";
    this.vehicleSprites.inverted.src =
      "./src/assets/combine-harvester-inverted.png";
    this.setSpriteOnLoadMethods();

    this.lastFrameTime = 0;
    this.animationId = -1;
    this.isRunning = false;

    this.cameraX = 0;
    this.cameraY = 0;

    // Initial Draw
    setTimeout(() => {
      this.updateCamera();
      this.draw();
    }, 100);
  }
  initializeStates() {
    this.stateManager.initState("weather", new WeatherState());

    // Vehicles array
    const mkVehicle = (id, x, y, type = "tractor") => {
      const v = new ImplementState();
      v.id = id;
      v.type = type;

      v.x = x;
      v.y = y;

      // Defaults you already rely on:
      v.isMoving = false;
      v.isHarvestingOn = false;
      v.isSeedingOn = false;

      // Optional per-vehicle behavior tuning:
      // v.basespeed = ...
      // v.turnSpeed = ...

      return v;
    };

    const cx = (this.COLS * this.TILE_SIZE) / 2;
    const cy = (this.ROWS * this.TILE_SIZE) / 2;

    const vehicles = [
      mkVehicle("v1", cx, cy, "tractor"),
      // Example second vehicle
      mkVehicle("v2", cx + 80, cy + 40, "inverted"),
    ];

    this.stateManager.initState("vehicles", vehicles);
    this.stateManager.initState("activeVehicleId", "v1");
    this.stateManager.initState("tractor", vehicles[0]); // backwards compatible

    const field = Array.from({ length: this.ROWS }, () =>
      Array.from({ length: this.COLS }, () => new CropState()),
    );
    this.stateManager.initState("field", field);
  }

  setSpriteOnLoadMethods() {
    const redraw = () => {
      this.updateCamera();
      this.draw();
    };
    Object.values(this.vehicleSprites).forEach((img) => (img.onload = redraw));
    this.wheatImage.onload = redraw;
    this.seedImage.onload = redraw;
    this.dirtImage.onload = redraw;
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
    if (weatherMgr) {
      await weatherMgr.loadWeatherData(this.stateManager, station, start);
    }
  }

  resetEverything() {
    this.stopMovement();
    this.initializeStates();
    this.updateCamera();
    this.draw();
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
    cancelAnimationFrame(this.animationId);
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    if (!timestamp) timestamp = performance.now();
    const deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    const oldStates = this.stateManager.states;
    const nextStates = {};

    for (const key in oldStates) {
      if (oldStates[key] && typeof oldStates[key].clone === "function") {
        nextStates[key] = oldStates[key].clone();
      } else if (key === "field") {
        nextStates[key] = oldStates[key].map((row) =>
          row.map((c) => c.clone()),
        );
      } else if (key === "vehicles") {
        // Each vehicle is a ImplementState (has clone())
        nextStates[key] = oldStates[key].map((v) =>
          v && typeof v.clone === "function" ? v.clone() : structuredClone(v),
        );
      } else {
        // primitives like activeVehicleId
        nextStates[key] = oldStates[key];
      }
    }

    for (const sm of this.managers) {
      sm.update(deltaTime, oldStates, nextStates);
    }

    for (const key in nextStates) {
      this.stateManager.commitState(key, nextStates[key]);
    }

    this.updateCamera();
    this.draw();

    this.animationId = requestAnimationFrame(this.loop.bind(this));
  }

  updateCamera() {
    const vehicles = this.stateManager.getState("vehicles");
    const activeId = this.stateManager.getState("activeVehicleId");

    if (!vehicles || vehicles.length === 0) return;

    const v = activeId ? vehicles.find((x) => x.id === activeId) : vehicles[0];
    if (!v) return;

    const centerX = v.x + 32;
    const centerY = v.y + 32;

    let targetCameraX = centerX - this.canvas.width / 2;
    let targetCameraY = centerY - this.canvas.height / 2;

    const worldPixelWidth = this.COLS * this.TILE_SIZE;
    const worldPixelHeight = this.ROWS * this.TILE_SIZE;

    const maxCameraX = worldPixelWidth - this.canvas.width;
    const maxCameraY = worldPixelHeight - this.canvas.height;

    this.cameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));
    this.cameraY = Math.max(0, Math.min(targetCameraY, maxCameraY));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const field = this.stateManager.getState("field");
    const vehicles = this.stateManager.getState("vehicles");

    if (field) this.drawField(field);
    if (vehicles) this.drawVehicles(vehicles);
  }

  drawField(field) {
    // Only draw visible tiles (Optimization)
    const startCol = Math.floor(this.cameraX / this.TILE_SIZE);
    const endCol = Math.min(
      this.COLS,
      startCol + Math.ceil(this.canvas.width / this.TILE_SIZE) + 1,
    );
    const startRow = Math.floor(this.cameraY / this.TILE_SIZE);
    const endRow = Math.min(
      this.ROWS,
      startRow + Math.ceil(this.canvas.height / this.TILE_SIZE) + 1,
    );

    const safeStartCol = Math.max(0, startCol);
    const safeStartRow = Math.max(0, startRow);

    for (let y = safeStartRow; y < endRow; y++) {
      for (let x = safeStartCol; x < endCol; x++) {
        if (!field[y] || !field[y][x]) continue;

        const crop = field[y][x];
        let img = this.dirtImage;

        if (crop.isMature()) img = this.wheatImage;
        else if (crop.isGrowing()) img = this.seedImage;

        this.ctx.drawImage(
          img,
          Math.floor(x * this.TILE_SIZE - this.cameraX),
          Math.floor(y * this.TILE_SIZE - this.cameraY),
          this.TILE_SIZE,
          this.TILE_SIZE,
        );
      }
    }
  }

  drawVehicles(vehicles) {
    for (const v of vehicles) this.drawVehicle(v);
  }

  drawVehicle(v) {
    this.ctx.save();

    const screenX = v.x - this.cameraX;
    const screenY = v.y - this.cameraY;

    const centerX = screenX + 32;
    const centerY = screenY + 32;

    const sprite = this.vehicleSprites[v.type] || this.vehicleSprites.tractor;

    this.ctx.translate(centerX, centerY);
    this.ctx.rotate((v.angle * Math.PI) / 180);
    this.ctx.drawImage(sprite, -32, -32, 64, 64);
    this.ctx.restore();
  }

  getVehicles() {
    return this.stateManager.getState("vehicles") || [];
  }

  getVehicleById(id) {
    return this.getVehicles().find((v) => v.id === id);
  }

  setActiveVehicle(id) {
    // only set if it exists
    const exists = this.getVehicleById(id);
    if (exists) this.stateManager.commitState("activeVehicleId", id);
  }

  spawnVehicle(type, id, x, y) {
    // prevent duplicates
    const vehicles = this.getVehicles();
    if (vehicles.some((v) => v.id === id)) return;

    const v = new ImplementState();
    v.id = id;
    v.type = type;

    v.x = x;
    v.y = y;

    // defaults
    v.isMoving = false;
    v.isHarvestingOn = false;
    v.isSeedingOn = false;

    v.angle = v.angle ?? 0;
    v.goalAngle = v.goalAngle ?? 0;

    // Add it and commit
    const newVehicles = [...vehicles, v];
    this.stateManager.commitState("vehicles", newVehicles);

    // optional: auto select the newly spawned vehicle
    this.stateManager.commitState("activeVehicleId", id);
  }

  setMainVehicleType(type) {
    const vehicles = this.stateManager.getState("vehicles");
    if (!vehicles || vehicles.length === 0) return;

    vehicles[0].type = type;
  }

  // --- API ---

  async moveForward(durationInSeconds) {
    return new Promise((resolve) => {
      const tractor = this.getActiveVehicle();
      if (tractor) tractor.isMoving = true;

      const speedMult =
        this.stateManager.getState("weather")?.speedMultiplier || 1;

      setTimeout(
        () => {
          const currentTractor = this.stateManager.getState("tractor");
          if (currentTractor) currentTractor.isMoving = false;
          resolve();
        },
        (durationInSeconds * 1000) / speedMult,
      );
    });
  }

  async turnXDegrees(angle) {
    const tractor = this.stateManager.getState("tractor");
    if (tractor) {
      // Set the goal, and let the TractorSimManager handle the smooth interpolation
      tractor.goalAngle += angle;
    }

    // Return a promise that resolves when the turn is actually complete
    return new Promise((resolve) => {
      const checkTurn = () => {
        const currentTractor = this.stateManager.getState("tractor");
        if (!currentTractor) {
          resolve();
          return;
        }

        // Check if we are "close enough" (0.1 diff)
        const diff = Math.abs(currentTractor.goalAngle - currentTractor.angle);
        if (diff < 0.2) {
          // Snap to exact to be clean
          currentTractor.angle = currentTractor.goalAngle;
          resolve();
        } else {
          requestAnimationFrame(checkTurn);
        }
      };
      checkTurn();
    });
  }

  toggleHarvesting(isOn) {
    const tractor = this.stateManager.getState("tractor");
    if (tractor) tractor.isHarvestingOn = isOn;
  }
}
