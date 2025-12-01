import { CropState, CROP_STAGES } from "./CropState";
export default class simulationMethods {
  constructor(canvas) {
    // Canvas and movement code
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 500;
    this.canvas.height = 500;

    this.waitingweeksCount = 1; // global variable, set elsewhere
    this.cumulativeGDD = 0;
    this.csvLines = []; // parsed CSV data
    this.Wheatgdd = 10;
    // Tractor variables
    this.tractorWorldX = this.canvas.width / 2; // Tractor's vertical position in the entire world
    this.tractorWorldY = this.canvas.height / 2; // Tractor's horizontal position in the entire world

    this.angle = 0; // 0 degrees = facing right
    this.goalAngle = 0; // Our angle will be set to move towards this.
    this.turnSpeed = 90; //How fast the tractor can turn.
    this.weeksToWait = 0;
    this.nightFadeProgress = -1.0; // The progress for the night transition animation. Ranges from 0-1 when active.
    this.isMoving = false; // flag to indicate if the tractor is currently moving
    this.isHarvestingOn = false; // flag to indicate if harvesting mode is on
    this.isSeedingOn = false; // flag to indicate if seeding mode is on
    this.animationId = -1; // ID for the animation frame
    this.yieldScore = 0; // score for harvested crops

    // Camera Variables
    // const tractorScreenX = canvas.width / 2; // Tractor's vertical position on the screen
    // const tractorScreenY = canvas.height / 2; // Tractor's horizontal position on the screen
    // let cameraX = tractorWorldX - tractorScreenX; // Top-left corner of the camera in world coordinates
    // let cameraY = tractorWorldY - tractorScreenY; // Top-left corner of the camera in world coordinates
    this.cameraX = 0;
    this.cameraY = 0;

    // Game asset constants
    this.FRAME_WIDTH = 64; // change to sprite’s frame width
    this.FRAME_HEIGHT = 64; // change to sprite’s frame height
    this.TILE_BASE_SIZE = 64; // The original size of the field tiles
    this.FIELD_SCALE = 8; // The amount the field tiles will be scaled down by
    this.SPEED = 20; // pixels per second

    // Time variables
    this.START_WEEK = 1; // starting week
    this.GROWTH_DAYS = 1000.0; // days for crops to fully grow
    this.currentWeek = this.START_WEEK; // current week in simulation
    // let weeksPassedSincePlanting = 0; // weeks passed since last planting

    // Field variables
    this.TILE_WIDTH = this.TILE_BASE_SIZE / this.FIELD_SCALE; // Scaled width of each tile
    this.TILE_HEIGHT = this.TILE_BASE_SIZE / this.FIELD_SCALE; // Scaled height of each tile

    // Setting up the array that represents the field
    this.WORLD_WIDTH_IN_SCREENS = 5; // Number of screens wide the world is
    this.WORLD_HEIGHT_IN_SCREENS = 5; // Number of screens high the world is
    this.SCREEN_ROWS = Math.floor(this.canvas.height / this.TILE_HEIGHT) + 2; // +2 to cover edges
    this.SCREEN_COLUMNS = Math.floor(this.canvas.width / this.TILE_WIDTH) + 2; // +2 to cover edges

    this.rows = this.SCREEN_ROWS * this.WORLD_HEIGHT_IN_SCREENS; // Total number of rows in the world
    this.columns = this.SCREEN_COLUMNS * this.WORLD_WIDTH_IN_SCREENS; // Total number of columns in the world

    // World field dimensions
    this.worldPixelWidth = this.columns * this.TILE_WIDTH; // Total width of the world in pixels
    this.worldPixelHeight = this.rows * this.TILE_HEIGHT; // Total height of the world in pixels

    this.field = []; // 2D array representing the field tiles

    // --- Sprite setup ---
    this.tractorSprite = new Image();
    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();

    // Paths for the images
    this.tractorSprite.src = "./src/assets/combine-harvester.png";
    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

    // Variables to aid in image loading
    this.imageLoadCount = 0;
    this.imageCount = 4;
    this.isInitialized = false;
  }

  async loadStations() {
    // invalid Dom property 'for' did you mean 'htmlFor' error
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
        stationSelect.appendChild(option);
      }
    });
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
    console.log("fetching data")
    const station = document.getElementById("station").value;
    const startInput = document.getElementById("start").value; // YYYY-MM-DD
    const startDate = new Date(startInput);

    // Make sure waitingweeksCount is a number
    const weeks = Number(this.waitingweeksCount) || 1;

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7 * weeks); // 7 days per week

    const start = startInput.replaceAll("-", "");
    const end = `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, "0")}${endDate.getDate().toString().padStart(2, "0")}`;

    const url = `https://mesonet.k-state.edu/rest/stationdata?stn=${station}&int=day&t_start=${start}000000&t_end=${end}000000&vars=TEMP2MAVG`;
    console.log("Fetching URL:", url);

    const response = await fetch(url);
    const data = await response.text();

    const lines = data.trim().split("\n");
    this.csvLines = lines.slice(1).map((line) => line.split(",")); // skip header
    this.cumulativeGDD = 0;
    this.currentWeek = this.START_WEEK;
  }

  // Image loading
  onImageLoad() {
    this.imageLoadCount++;
    if (this.imageLoadCount === this.imageCount && !this.isInitialized) {
      console.log("All images loaded!");
      this.isInitialized = true;

      // Initialize the field array
      console.log(`Initalizing world: ${this.columns}x${this.rows} tiles`);
      // this.field = Array.from({ length: this.rows }, () =>
      //   Array.from({ length: this.columns }, () => {
      //     // eslint-disable-next-line no-unused-labels
      //     state: 2;
      //     // eslint-disable-next-line no-unused-labels
      //     growth: 0.0;
      //   }),
      // );
      this.field = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.columns }, () => new CropState())
      );

      // Set initial position and draw
      this.resetPosition();
    }
  }

  setSpriteOnLoadMethods() {
    // Loading methods for images
    this.tractorSprite.onload = () => {
      console.log("✅ Tractor sprite loaded!");
      this.onImageLoad();
    };
    this.tractorSprite.onerror = () => {
      console.error("❌ Failed to load tractor sprite!");
    };
    this.dirtImage.onload = () => {
      console.log("DirtImage loaded!");
      this.onImageLoad();
    };
    this.dirtImage.onerror = () => {
      console.error("failed to load DirtImage");
    };
    this.seedImage.onload = () => {
      console.log("SeedImage loaded!");
      this.onImageLoad();
    };
    this.seedImage.onerror = () => {
      console.error("failed to load SeedImage");
    };
    this.wheatImage.onload = () => {
      console.log("WheatImage loaded!");
      this.onImageLoad();
    };
    this.wheatImage.onerror = () => {
      console.error("failed to load WheatImage");
    };
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

            // Update HTML displays
            document.getElementById("weekText").textContent =
              `Week ${this.currentWeek > 0 ? this.currentWeek - 2 : 0}`;
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
          this.drawFieldAndTractor();
          this.animationId = requestAnimationFrame(UpdateNight);
        } else {
          this.nightFadeProgress = -1;
          this.drawFieldAndTractor();
          resolve();
        }
      };
      UpdateNight();
    });
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let crop = this.field[i][j];
        // Pass the state object to the update logic
        this.updateCrop(crop, dailyGDD);
      }
    }
    this.drawFieldAndTractor();
  }

  // --- Draw the tractor sprite based on current direction ---
  drawTractor() {
    const screenX = this.tractorWorldX - this.cameraX;
    const screenY = this.tractorWorldY - this.cameraY;

    const normalizedAngle = ((this.angle % 360) + 360) % 360;
    var angleInRadians = (normalizedAngle * Math.PI) / 180;

    // tractorsprite
    this.ctx.save();
    this.ctx.translate(
      screenX + this.FRAME_WIDTH / 2,
      screenY + this.FRAME_HEIGHT / 2,
    );
    this.ctx.rotate(angleInRadians);
    this.ctx.drawImage(
      this.tractorSprite,
      -this.FRAME_WIDTH / 2,
      -this.FRAME_HEIGHT / 2,
    );
    this.ctx.restore();

    document.getElementById("debug").innerHTML = //debugging window
      `World Position: (${Math.round(this.tractorWorldX)}, ${Math.round(this.tractorWorldY)})<br>` +
      `Camera Position: (${Math.round(this.cameraX)}, ${Math.round(this.cameraY)})<br>` +
      `Screen Position: (${Math.round(screenX)}, ${Math.round(screenY)})<br>` +
      `Angle: ${normalizedAngle}°<br>` +
      `Direction: ${this.getDirectionName(this.angle)}<br>` +
      `Moving: ${this.isMoving ? "Yes" : "No"} <br>`;
  }

  // Draws the field onto the canvas
  drawField() {
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

    this.detectWhatTilesAreHit(
      frontSide[0].x,
      frontSide[0].y,
      frontSide[1].x,
      frontSide[1].y,
      -1,
    );

    // draw the entire field using camera coordinates

    const startCol = Math.floor(this.cameraX / this.TILE_WIDTH);
    const endCol = Math.min(this.columns, startCol + this.SCREEN_COLUMNS);
    const startRow = Math.floor(this.cameraY / this.TILE_HEIGHT);
    const endRow = Math.min(this.rows, startRow + this.SCREEN_ROWS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue; // skip negative indices

        let dirtOrWheat = this.dirtImage;
        switch (this.field[i][j].stage) {
          case CROP_STAGES.UNPLANTED: // 0
            dirtOrWheat = this.dirtImage;
            break;
          case CROP_STAGES.SEEDED: // 1
            dirtOrWheat = this.seedImage;
            break;
          case CROP_STAGES.MATURE: // 2
            dirtOrWheat = this.wheatImage;
            break;
        }
        const tileWorldX = j * this.TILE_WIDTH;
        const tileWorldY = i * this.TILE_HEIGHT;

        const tileScreenX = tileWorldX - this.cameraX;
        const tileScreenY = tileWorldY - this.cameraY;

        this.ctx.drawImage(
          dirtOrWheat,
          0,
          0,
          this.TILE_BASE_SIZE,
          this.TILE_BASE_SIZE,
          Math.floor(tileScreenX),
          Math.floor(tileScreenY),
          this.TILE_WIDTH,
          this.TILE_HEIGHT,
        );
      }
    }
  }

  DrawNight() {
    let alpha =
      0.75 * Math.min(1.2 * Math.sin(this.nightFadeProgress * Math.PI), 1.0);
    this.ctx.fillStyle = `rgba(15, 15, 75, ${alpha})`; // Set fill color to a transparent blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw the overlay
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
          ? this.field[tileY][tileX]
          : null;
      hasChecked =
        hasChecked ||
        checkTiles < 0 ||
        (tile != null && tile.state == checkTiles);
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
          ? this.field[tileY][tileX]
          : null;
      hasChecked =
        hasChecked ||
        checkTiles < 0 ||
        (tile != null && tile.state == checkTiles);
    }

    return hasChecked;
  }

  // Changes the tile at field[y][x] to the apropriate value based on the current mode of the vehicle
  changeTile(x, y) {
    if (x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
      let crop = this.field[y][x];

      if (this.isHarvestingOn) {
        // Using the helper methods from CropState
        if (crop.isMature()) {
          crop.reset(); // Sets stage to UNPLANTED (0)
          this.yieldScore++;
        } else if (crop.isGrowing()) {
          crop.reset(); // Destroy crop if harvesting while growing
        }
      } else if (this.isSeedingOn) {
        if (crop.stage === CROP_STAGES.UNPLANTED) {
          crop.plant(); // Sets stage to SEEDED (1)
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.field[i][j] = new CropState();
      }
    }
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
  drawFieldAndTractor() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    document.getElementById("scoreText").innerHTML =
      "Yield: " + this.yieldScore;
    this.drawField();
    this.drawTractor();

    if (this.nightFadeProgress >= 0.0) this.DrawNight();
  }
  // Updates camera position based on tractor position
  updateCamera() {
    // Calculate the tractor's center point
    let tractorCenterX = this.tractorWorldX + this.FRAME_WIDTH / 2;
    let tractorCenterY = this.tractorWorldY + this.FRAME_HEIGHT / 2;

    // Aim the camera so the tractor's center is at the screen's center
    let targetCameraX = tractorCenterX - this.canvas.width / 2;
    let targetCameraY = tractorCenterY - this.canvas.height / 2;

    const maxCameraX = this.worldPixelWidth - this.canvas.width;
    const maxCameraY = this.worldPixelHeight - this.canvas.height;

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

  // moveForward function that moves over time
  moveForward(duration) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
      const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);

      const animate = () => {
        const currentTime = Date.now();

        if (currentTime < endTime && this.isMoving) {
          // Calculate how much to move based on frame time
          const deltaTime = 1 / 60; // assuming 60fps

          this.tractorWorldX += moveX * deltaTime;
          this.tractorWorldY += moveY * deltaTime;

          this.updateCamera();

          this.drawFieldAndTractor();
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
      const turn = () => {
        const delta = 1 / 60; // assuming 60fps

        if (this.angle != this.goalAngle) {
          // For the actual turning.
          var difference = this.goalAngle - this.angle;
          var absDiff = Math.abs(difference);
          var alpha = Math.min(this.turnSpeed * delta, absDiff) / absDiff;
          this.angle = this.angle * (1 - alpha) + this.goalAngle * alpha;

          // // Move the tractor while turning, to look more natural.
          const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
          const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);
          this.tractorWorldX += moveX * delta;
          this.tractorWorldY += moveY * delta;

          this.updateCamera();

          this.drawFieldAndTractor();
          this.animationId = requestAnimationFrame(turn);
        } else {
          resolve();
        }
      };
      turn();
    });
  }

  resetPosition() {
    if (!this.isInitialized) return;

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
    this.drawFieldAndTractor();
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
    document.getElementById("weekText").innerHTML = `Week ${this.currentWeek}`;
    document.getElementById("gddText").textContent = `GDD: ${0.0}`;
  }

  startMoving() {
    this.isMoving = true;
  }

  // New method to handle logic for a SINGLE crop state
  updateCrop(cropState, dailyGDD) {
    if (cropState.isGrowing()) {
      cropState.currentGDD += dailyGDD;
      
      // Check if it has reached the threshold
      if (cropState.currentGDD >= cropState.requiredGDD) {
        cropState.stage = CROP_STAGES.MATURE; // Became Wheat
        cropState.currentGDD = cropState.requiredGDD; // Cap it
      }
    }
  }

}
