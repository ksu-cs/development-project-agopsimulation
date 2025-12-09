import { StateManager } from "../States/StateManager";
import { CropState, CROP_STAGES } from "../States/Crops/CropState";
import timeStepData from "./timeStepData";

import Tractor from "../States/Vehicle/Tractor";
//import MovingState from "./vehicleStates/MovingState.js";

export default class simulationEngine extends EventTarget {
  constructor(canvasWidth, canvasHeight) {
    super();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.waitingweeksCount = 1; // global variable, set elsewhere
    this.cumulativeGDD = 0;
    this.csvLines = []; // parsed CSV data
    this.Wheatgdd = 10;

    // Tractor variables
    this.tractorWorldX = this.canvasWidth / 2;
    this.tractorWorldY = this.canvasHeight / 2;

    this.angle = 0;
    this.goalAngle = 0;
    this.turnSpeed = 90;
    this.weeksToWait = 0;
    this.nightFadeProgress = -1.0;
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.animationId = -1;
    this.yieldScore = 0;

    // Camera Variables
    this.cameraX = 0;
    this.cameraY = 0;

    // Game asset constants
    this.FRAME_WIDTH = 64;
    this.FRAME_HEIGHT = 64;
    this.TILE_BASE_SIZE = 64;
    this.FIELD_SCALE = 8;
    this.SPEED = 20;

    // Time variables
    this.START_WEEK = 1;
    this.GROWTH_DAYS = 1000.0;
    this.currentWeek = this.START_WEEK;

    // Field variables
    this.TILE_WIDTH = this.TILE_BASE_SIZE / this.FIELD_SCALE;
    this.TILE_HEIGHT = this.TILE_BASE_SIZE / this.FIELD_SCALE;

    // Setting up the array that represents the field
    this.WORLD_WIDTH_IN_SCREENS = 5;
    this.WORLD_HEIGHT_IN_SCREENS = 5;
    this.SCREEN_ROWS = Math.floor(this.canvasHeight / this.TILE_HEIGHT) + 2;
    this.SCREEN_COLUMNS = Math.floor(this.canvasWidth / this.TILE_WIDTH) + 2;

    this.rows = this.SCREEN_ROWS * this.WORLD_HEIGHT_IN_SCREENS;
    this.columns = this.SCREEN_COLUMNS * this.WORLD_WIDTH_IN_SCREENS;

    // World field dimensions
    this.worldPixelWidth = this.columns * this.TILE_WIDTH;
    this.worldPixelHeight = this.rows * this.TILE_HEIGHT;

    this.currentDayIndex = 0;
    this.timeAccumulator = 0;

    this.isWaiting = false;

    // Current Speed Multiplier
    this.speedMultiplier = 1;

    this.initStateManager();
    this.initField();
  }

  timeStepEvent() {
    // TEMPORARY - creating new tractor every time step event just to get the data transfer to the drawCanvas working with new states
    const tractor = new Tractor();
    tractor.setPosition(this.tractorWorldX, this.tractorWorldY);
    tractor.angle = this.angle;

    this.dispatchEvent(
      new CustomEvent("simulationEngineCreated", {
        bubbles: true,
        detail: new timeStepData(
          this.cameraX,
          this.cameraY,
          this.yieldScore,
          this.nightFadeProgress,
          this.stateManager.getState("field"),
          tractor,
        ),
      }),
    );
  }

  initStateManager() {
    // Initialize the State Manager
    console.log(`Initalizing world: ${this.columns}x${this.rows} tiles`);
    this.stateManager = new StateManager();
  }

  initField() {
    // Create the Initial Field State
    const initialField = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => new CropState()),
    );

    // Register it with the manager under the key "field"
    this.stateManager.initState("field", initialField);
  }

  async loadStations() {
    const response = await fetch(
      "https://mesonet.k-state.edu/rest/stationnames/",
    );
    const text = await response.text();
    const lines = text.split("\n").slice(1); // skip header
    const stationSelect = document.getElementById("station");
    stationSelect.innerHTML = ""; // clear loading option

    lines.forEach((line) => {
      const cols = line.split(",");
      const NAME = cols[0];
      const ABBR = cols[0];
      if (NAME && ABBR) {
        const option = document.createElement("option");
        option.value = ABBR; // for URL
        option.textContent = NAME; // for user display

        if (NAME.includes("Flickner")) {
          option.selected = true;
        }

        stationSelect.appendChild(option);
      }
    });
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
  }

  calculateGDDForWeek(weekIndex, daysPerWeek = 7) {
    let sum = 0;
    const startIdx = weekIndex * daysPerWeek;
    for (
      let i = startIdx;
      i < startIdx + daysPerWeek && i < this.csvLines.length;
      i++
    ) {
      const temp = parseFloat(this.csvLines[i][2]); // TEMP2MAVG
      sum += Math.max(0, temp - this.Wheatgdd);
    }
    return sum;
  }

  async fetchData() {
    console.log("fetching data");
    const station = document.getElementById("station").value;
    const startInputElement = document.getElementById("start");
    const startDateValue = startInputElement.value;

    const [year, month, day] = startDateValue.split("-").map(Number);
    const startDate = new Date(year, month - 1, day);

    this.startDate = new Date(startDate);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 365);

    const start = startDateValue.replaceAll("-", "");
    const end = `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, "0")}${endDate.getDate().toString().padStart(2, "0")}`;

    const url = `https://mesonet.k-state.edu/rest/stationdata?stn=${station}&int=day&t_start=${start}000000&t_end=${end}000000&vars=TEMP2MAVG`;
    console.log("Fetching URL:", url);

    const response = await fetch(url);
    const data = await response.text();

    const lines = data.trim().split("\n");
    this.csvLines = lines.slice(1).map((line) => line.split(","));

    this.cumulativeGDD = 0;
    this.currentWeek = this.START_WEEK;
    this.currentDayIndex = 0;
    this.timeAccumulator = 0;

    this.updateDateDisplay();
  }

  // Methods for Harvesting and Seeding Blocks
  toggleHarvesting(isOn) {
    this.isHarvestingOn = isOn;
    if (isOn) this.isSeedingOn = false;
  }

  toggleSeeding(isOn) {
    this.isSeedingOn = isOn;
    if (isOn) this.isHarvestingOn = false;
  }

  // Method for Wait X Weeks Block
  async waitXWeeks(weeks) {
    this.waitingweeksCount = weeks; // Fixed variable name
    await this.fetchData();
    return new Promise((resolve) => {
      let weeksToProcess = weeks;

      if (weeksToProcess > 0) {
        this.nightFadeProgress = 0.0;
      } else {
        resolve();
        return;
      }

      let waitingTime = 0.2;

      const UpdateNight = () => {
        const delta = 1 / 60; // assuming 60fps

        if (this.nightFadeProgress > 0.5 && waitingTime > 0) {
          waitingTime -= delta;
          if (waitingTime <= 0) {
            // A week has passed - calculate GDD for this week
            const weekIndex = this.currentWeek; // Convert to 0-based index

            // Calculate GDD for this week
            let weekGDD = 0;
            const startIdx = (weekIndex - 1) * 7;
            for (
              let i = startIdx;
              i < startIdx + 7 && i < this.csvLines.length;
              i++
            ) {
              if (this.csvLines[i] && this.csvLines[i][2]) {
                const temp = parseFloat(this.csvLines[i][2]);
                if (!isNaN(temp)) {
                  weekGDD += Math.max(0, temp - this.Wheatgdd);
                }
              }
            }

            this.cumulativeGDD += weekGDD;

            // Update week counter and grow crops
            this.currentWeek++;
            this.growCrops(weekGDD);

            document.getElementById("gddText").textContent =
              `GDD: ${this.cumulativeGDD.toFixed(2)}`;

            weeksToProcess--;
            if (weeksToProcess > -1) waitingTime = 0.2;
          }
        } else {
          const fadeSpeed = waitingTime > 0 ? 1.0 : 2.0;
          this.nightFadeProgress = Math.min(
            this.nightFadeProgress + delta * fadeSpeed,
            1.0,
          );
        }

        if (weeksToProcess > 0 || this.nightFadeProgress < 1.0) {
          this.sendOutNewTimeStepDataToDraw();
          this.animationId = requestAnimationFrame(UpdateNight);
        } else {
          this.nightFadeProgress = -1;
          this.sendOutNewTimeStepDataToDraw();
          resolve();
        }
      };
      UpdateNight();
    });
  }

  formatDisplayDate(dateObj) {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  updateTime(deltaTime) {
    this.timeAccumulator += deltaTime;

    // If 1 second has passed
    if (this.timeAccumulator >= 1.0) {
      this.advanceDay();
      this.timeAccumulator -= 1.0;
    }
  }

  advanceDay() {
    if (!this.csvLines || this.csvLines.length === 0) {
      console.warn("No CSV data loaded - cannot advance day");
      return;
    }

    if (this.currentDayIndex >= this.csvLines.length) {
      console.warn("Reached end of CSV data");
      return;
    }

    const dayData = this.csvLines[this.currentDayIndex];
    const temp = parseFloat(dayData[2]);

    // Calculate GDD
    const dailyGDD = Math.max(0, temp - this.Wheatgdd);
    this.cumulativeGDD += dailyGDD;

    // Update crops with GDD
    this.growCrops(dailyGDD);

    // Increment day
    this.currentDayIndex++;

    // Update date display
    this.updateDateDisplay();

    // Update GDD display
    const gddLabel = document.getElementById("gddText");
    if (gddLabel) {
      gddLabel.textContent = `GDD: ${this.cumulativeGDD.toFixed(2)}`;
    }
  }

  async fastForwardWeeks(weeks) {
    const totalDays = Number(weeks) * 7;
    const baseMSperDay = 200;

    this.isWaiting = true;
    this.sendOutNewTimeStepDataToDraw();

    for (let i = 0; i < totalDays; i++) {
      // Check if stop was pressed
      if (!this.isMoving) {
        break;
      }

      // Check if we've reached the end of data
      if (this.currentDayIndex >= this.csvLines.length) {
        console.warn("Reached end of CSV data during fast forward");
        break;
      }

      // Wait before advancing (makes it visible)
      const msPerDay = baseMSperDay / this.speedMultiplier;
      await new Promise((resolve) => setTimeout(resolve, msPerDay));

      // Advance the day
      this.advanceDay();
      this.sendOutNewTimeStepDataToDraw();
    }

    this.isWaiting = false;
    this.sendOutNewTimeStepDataToDraw();
  }

  CheckIfPlantInFront(type) {
    const topLeft = { x: -this.FRAME_WIDTH / 2, y: -this.FRAME_HEIGHT / 2 };
    const topRight = { x: this.FRAME_WIDTH / 2, y: -this.FRAME_HEIGHT / 2 };
    const bottomRight = { x: this.FRAME_WIDTH / 2, y: this.FRAME_HEIGHT / 2 };
    const bottomLeft = { x: -this.FRAME_WIDTH / 2, y: this.FRAME_HEIGHT / 2 };
    const center = {
      x: this.tractorWorldX + this.FRAME_WIDTH / 2,
      y: this.tractorWorldY + this.FRAME_HEIGHT / 2,
    };

    const corners = [
      this.rotatePoint(topLeft.x, topLeft.y, this.angle, center.x, center.y), //topLeft
      this.rotatePoint(topRight.x, topRight.y, this.angle, center.x, center.y), //topRight
      this.rotatePoint(
        bottomRight.x,
        bottomRight.y,
        this.angle,
        center.x,
        center.y,
      ), // bottomRight
      this.rotatePoint(
        bottomLeft.x,
        bottomLeft.y,
        this.angle,
        center.x,
        center.y,
      ), // bottomLeft
    ];

    const frontSide = [corners[1], corners[2]]; // right side of image when angle = 0
    return this.detectWhatTilesAreHit(
      frontSide[0].x,
      frontSide[0].y,
      frontSide[1].x,
      frontSide[1].y,
      type,
    );
  }

  growCrops(dailyGDD) {
    const oldField = this.stateManager.getState("field");

    let newField = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => null),
    );

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        // Get the specific crop from the old state
        const oldCrop = oldField[i][j];

        // Create the new crop by cloning the old one
        const newCrop = oldCrop.clone();

        // Apply Logic to the NEW crop
        this.updateCrop(newCrop, dailyGDD);

        // Store in the new array
        newField[i][j] = newCrop;
      }
    }

    // Pass the NEW state to the frontend
    this.sendOutNewTimeStepDataToDraw(newField);

    // Store the New State as the Old State in the manager
    this.stateManager.commitState("field", newField);
  }

  // Update logic helper
  updateCrop(crop, dailyGDD) {
    if (crop.isGrowing()) {
      crop.currentGDD += dailyGDD;
      if (crop.currentGDD >= crop.requiredGDD) {
        crop.stage = CROP_STAGES.MATURE;
        crop.currentGDD = crop.requiredGDD;
      }
    }
  }

  // Detects and changes which tiles are in the line from point0, to point1 for a gentle slope
  detectGentleSlope(x0, y0, x1, y1, checkTiles = -1) {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;

    let yi = 1;

    if (deltaY < 0) {
      yi = -1;
      deltaY = -deltaY;
    }
    let D = 2 * deltaY - deltaX;
    let y = y0;
    let hasChecked = false;
    let tile = null;

    // GET THE FIELD FROM MANAGER
    const field = this.stateManager.getState("field");

    for (let x = x0; x < x1; x++) {
      const tileX = Math.floor(x / this.TILE_WIDTH);
      const tileY = Math.floor(y / this.TILE_HEIGHT);
      if (checkTiles < 0) this.changeTile(tileX, tileY);
      if (D > 0) {
        y = y + yi;
        D = D + 2 * (deltaY - deltaX);
      } else D = D + 2 * deltaY;

      tile =
        tileX >= 0 && tileX < this.columns && tileY >= 0 && tileY < this.rows
          ? field[tileY][tileX]
          : null;
      hasChecked =
        hasChecked ||
        checkTiles < 0 ||
        (tile != null && tile.stage == checkTiles);
    }

    return hasChecked;
  }

  // Detects and changes which tiles are in the line from point0, to point1 for a steep slope
  detectSteepSlope(x0, y0, x1, y1, checkTiles = -1) {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;

    let xi = 1;

    if (deltaX < 0) {
      xi = -1;
      deltaX = -deltaX;
    }
    let D = 2 * deltaX - deltaY;
    let x = x0;
    let hasChecked = false;
    let tile = null;

    // GET THE FIELD FROM MANAGER
    const field = this.stateManager.getState("field");

    for (let y = y0; y < y1; y++) {
      const tileX = Math.floor(x / this.TILE_WIDTH);
      const tileY = Math.floor(y / this.TILE_HEIGHT);
      if (checkTiles < 0) this.changeTile(tileX, tileY);
      if (D > 0) {
        x = x + xi;
        D = D + 2 * (deltaX - deltaY);
      } else D = D + 2 * deltaX;

      tile =
        tileX >= 0 && tileX < this.columns && tileY >= 0 && tileY < this.rows
          ? field[tileY][tileX]
          : null;
      hasChecked =
        hasChecked ||
        checkTiles < 0 ||
        (tile != null && tile.stage == checkTiles);
    }

    return hasChecked;
  }

  // Changes the tile at field[y][x] to the apropriate value based on the current mode of the vehicle
  changeTile(x, y) {
    if (x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
      // GET THE FIELD FROM MANAGER
      let field = this.stateManager.getState("field");
      let crop = field[y][x];

      if (this.isHarvestingOn) {
        // Use helper methods
        if (crop.isMature()) {
          crop.reset(); // Sets stage to 0
          this.yieldScore++;
        } else if (crop.isGrowing()) {
          crop.reset(); // Destroy crop if harvesting while growing
        }
      } else if (this.isSeedingOn) {
        if (crop.isUnplanted()) {
          crop.plant(); // Sets stage to 1
          this.yieldScore++;
        }
      }
    }
  }
  // Detects wether the slope from point0 to point1 is steep or gentle then calls the appropriate method to detect tiles in that line
  detectWhatTilesAreHit(x0, y0, x1, y1, checkTiles = -1) {
    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
      if (x0 > x1) return this.detectGentleSlope(x1, y1, x0, y0, checkTiles);
      else return this.detectGentleSlope(x0, y0, x1, y1, checkTiles);
    } else {
      if (y0 > y1) return this.detectSteepSlope(x1, y1, x0, y0, checkTiles);
      else return this.detectSteepSlope(x0, y0, x1, y1, checkTiles);
    }
  }

  // Resets the field to be the value of the Wheat tile
  resetField() {
    // Create a fresh grid of new CropStates
    const newField = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => new CropState()),
    );

    // Commit this new grid to the State Manager using the key "field"
    this.stateManager.commitState("field", newField);
  }

  // Rotates x and y coordinates to a new location based on the an angle and the center of rotation
  rotatePoint(x0, y0, angle, centerX, centerY) {
    const angleInRadians = angle * (Math.PI / 180);
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);
    var newX = centerX + (x0 * cos - y0 * sin);
    var newY = centerY + (x0 * sin + y0 * cos);
    return { x: newX, y: newY };
  }

  // Draws the field then the tractor
  sendOutNewTimeStepDataToDraw() {
    this.timeStepEvent();
  }

  // Updates camera position based on tractor position
  updateCamera() {
    // Calculate the tractor's center point
    let tractorCenterX = this.tractorWorldX + this.FRAME_WIDTH / 2;
    let tractorCenterY = this.tractorWorldY + this.FRAME_HEIGHT / 2;

    // Aim the camera so the tractor's center is at the screen's center
    let targetCameraX = tractorCenterX - this.canvasWidth / 2;
    let targetCameraY = tractorCenterY - this.canvasHeight / 2;

    const maxCameraX = this.worldPixelWidth - this.canvasWidth;
    const maxCameraY = this.worldPixelHeight - this.canvasHeight;

    this.cameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));
    this.cameraY = Math.max(0, Math.min(targetCameraY, maxCameraY));
  }

  getDirectionName(angle) {
    const normalizedAngle = (((angle % 360) + 450) % 360) - 90;
    if (normalizedAngle === 0) return "Right →";
    if (normalizedAngle === 90) return "Down ↓";
    if (normalizedAngle === 180) return "Left ←";
    if (normalizedAngle === 270) return "Up ↑";
    return `${normalizedAngle}°`;
  }

  // Helper function to trigger collision detection for harvesting/seeding
  handleCollisions() {
    this.CheckIfPlantInFront(-1);
  }

  // moveForward function that moves over time --make into wrapper that calls vehicle.moveforward
  moveForward(duration) {
    return new Promise((resolve) => {
      // Track simulation time
      let simulationTimeElapsed = 0;
      const simulationDuration = duration;

      let lastFrameTime = Date.now();

      const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
      const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);

      const animate = () => {
        const now = Date.now();
        const realDeltaMs = now - lastFrameTime;
        lastFrameTime = now;

        // Convert real time to simulation time using speedMultiplier
        const simDelta = (realDeltaMs / 1000) * this.speedMultiplier;
        simulationTimeElapsed += simDelta;

        if (simulationTimeElapsed < simulationDuration && this.isMoving) {
          // 1. Move based on simulation delta
          this.tractorWorldX += moveX * simDelta;
          this.tractorWorldY += moveY * simDelta;

          // 2. CHECK COLLISIONS NOW (before Time/Growth happens)
          this.handleCollisions();

          // 3. Update time (which might trigger growth and new states)
          this.updateTime(simDelta);

          // 4. Draw
          this.updateCamera();
          this.sendOutNewTimeStepDataToDraw();
          this.animationId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  turnXDegrees(amount) {
    this.goalAngle += amount;
    return this.OnNewGoalRotation();
  }

  OnNewGoalRotation() {
    return new Promise((resolve) => {
      let lastFrameTime = Date.now();

      const turn = () => {
        const now = Date.now();
        const realDeltaMs = now - lastFrameTime;
        lastFrameTime = now;

        // Convert real time to simulation time
        const simDelta = (realDeltaMs / 1000) * this.speedMultiplier;

        if (this.angle != this.goalAngle) {
          var difference = this.goalAngle - this.angle;
          var absDiff = Math.abs(difference);
          var alpha = Math.min(this.turnSpeed * simDelta, absDiff) / absDiff;
          this.angle = this.angle * (1 - alpha) + this.goalAngle * alpha;

          const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
          const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);
          this.tractorWorldX += moveX * simDelta;
          this.tractorWorldY += moveY * simDelta;

          // Check collisions while turning
          this.handleCollisions();

          this.updateCamera();
          this.sendOutNewTimeStepDataToDraw();
          this.animationId = requestAnimationFrame(turn);
        } else {
          resolve();
        }
      };
      turn();
    });
  }

  resetPosition() {
    this.tractorWorldX = (this.columns * this.TILE_WIDTH) / 2;
    this.tractorWorldY = (this.rows * this.TILE_HEIGHT) / 2;
    this.angle = 0;

    this.updateCamera();

    this.goalAngle = 0;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.isTractorOn = false;
    this.yieldScore = 0;
    this.nightFadeProgress = -1.0;
    this.resetField();
    this.sendOutNewTimeStepDataToDraw();
  }

  stopMovement() {
    this.isMoving = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = -1;
    }
  }

  resetEverything() {
    this.stopMovement();
    this.resetPosition();
    this.waitingweeksCount = 0;
    this.currentWeek = 0;
    this.currentDayIndex = 0;
    this.timeAccumulator = 0;
    this.updateDateDisplay();

    document.getElementById("gddText").textContent = `GDD: 0.00`;
    this.sendOutNewTimeStepDataToDraw();
  }

  startMoving() {
    this.isMoving = true;
  }

  // updates date at the top
  updateDateDisplay() {
    const dateLabel = document.getElementById("dateText");
    if (!dateLabel) return;

    if (this.startDate) {
      const currentDate = new Date(this.startDate);
      currentDate.setDate(this.startDate.getDate() + this.currentDayIndex);
      dateLabel.textContent = `Date: ${this.formatDisplayDate(currentDate)}`;
    } else {
      dateLabel.textContent = `Date: --`;
    }
  }
}
