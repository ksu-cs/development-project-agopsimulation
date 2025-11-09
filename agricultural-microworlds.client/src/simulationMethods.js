export default class simulationMethods {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 500;
    this.canvas.height = 500;

    // Global variables
    this.tractorWorldX = this.canvas.width / 2; // Tractor's vertical position in the entire world
    this.tractorWorldY = this.canvas.height / 2; // Tractor's horizontal position in the entire world
    this.angle = 0; // 0 degrees = facing right
    this.goalAngle = 0; // Our angle will be set to move towards this.
    this.turnSpeed = 90; // How fast the tractor can turn.
    this.weeksToWait = 0;
    this.nightFadeProgress = -1.0; // The progress for the night transition animation. Ranges from 0-1 when active.
    this.isMoving = false; // flag to indicate if the tractor is currently moving
    this.isHarvestingOn = false; // flag to indicate if harvesting mode is on
    this.isSeedingOn = false; // flag to indicate if seeding mode is on
    this.animationId = -1; // ID for the animation frame
    this.yieldScore = 0; // score for harvested crops

    // Game asset constants
    this.FRAME_WIDTH = 64; // change to sprite’s frame width
    this.FRAME_HEIGHT = 64; // change to sprite’s frame height
    this.TILE_BASE_SIZE = 64; // The original size of the field tiles
    this.FIELD_SCALE = 8; // The amount the field tiles will be scaled down by
    this.SPEED = 20; // pixels per second

    // Camera Variables
    // const tractorScreenX = canvas.width / 2; // Tractor's vertical position on the screen
    // const tractorScreenY = canvas.height / 2; // Tractor's horizontal position on the screen
    // let cameraX = tractorWorldX - tractorScreenX; // Top-left corner of the camera in world coordinates
    // let cameraY = tractorWorldY - tractorScreenY; // Top-left corner of the camera in world coordinates
    this.cameraX = 0;
    this.cameraY = 0;

    // Time variables
    this.START_WEEK = 1; // starting week
    this.GROWTH_DAYS = 1000.0; // days for crops to fully grow
    this.currentWeek = START_WEEK; // current week in simulation

    // Field variables
    this.TILE_WIDTH = TILE_BASE_SIZE / FIELD_SCALE; // Scaled width of each tile
    this.TILE_HEIGHT = TILE_BASE_SIZE / FIELD_SCALE; // Scaled height of each tile

    this.SCREEN_ROWS = Math.floor(canvas.height / TILE_HEIGHT) + 2; // +2 to cover edges
    this.SCREEN_COLUMNS = Math.floor(canvas.width / TILE_WIDTH) + 2; // +2 to cover this.

    this.rows = SCREEN_ROWS * WORLD_HEIGHT_IN_SCREENS; // Total number of rows in the world
    this.columns = SCREEN_COLUMNS * WORLD_WIDTH_IN_SCREENS; // Total number of columns in the world

    // World field dimensions
    this.worldPixelWidth = columns * TILE_WIDTH; // Total width of the world in pixels
    this.worldPixelHeight = rows * TILE_HEIGHT; // Total height of the world in pixels

    this.field = [];

    // --- Sprite setup ---
    this.tractorSprite = new Image();
    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();
    this.imageLoadCount = 0;
    this.imageCount = 4;
    this.isInitialized = false;

    // Paths for the images
    this.tractorSprite.src = "./src/assets/combine-harvester.png";
    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";
  }

  setSpriteOnLoadMethods() {
    // Loading methods for images
    tractorSprite.onload = () => {
      console.log("Tractor sprite loaded!");
      onImageLoad();
    };
    tractorSprite.onerror = () => {
      console.error("Failed to load tractor sprite!");
    };
    dirtImage.onload = () => {
      console.log("DirtImage loaded!");
      onImageLoad();
    };
    dirtImage.onerror = () => {
      console.error("failed to load DirtImage");
    };
    seedImage.onload = () => {
      console.log("SeedImage loaded!");
      onImageLoad();
    };
    seedImage.onerror = () => {
      console.error("failed to load SeedImage");
    };
    wheatImage.onload = () => {
      console.log("WheatImage loaded!");
      onImageLoad();
    };
    wheatImage.onerror = () => {
      console.error("failed to load WheatImage");
    };
  }

  // Image loading
  onImageLoad() {
    this.imageLoadCount++;
    if (this.imageLoadCount === this.imageCount && !this.isInitialized) {
      console.log("All images loaded!");
      this.isInitialized = true;

      // Initialize the field array
      console.log(`Initalizing world: ${this.columns}x${this.rows} tiles`);
      this.field = Array.from({ length: this.rows }, () =>
        Array.from({ length: columns }, () => {
          state: 2;
          growth: 0.0;
        }),
      );

      // Set initial position and draw
      resetPosition();
    }
  }

  // Setting up the array that represents the field
  initializeField() {
    this.rows =
      Math.floor(
        (this.canvas.height / this.seedImage.height) * this.FIELD_SCALE,
      ) + 1;
    this.columns =
      Math.floor(
        (this.canvas.width / this.seedImage.width) * this.FIELD_SCALE,
      ) + 1;
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

  async waitXWeeks(weeks) {
    // needs fixed, some vars in weatherApiAccessor.js
    this.waitingweeksCount = weeks; // Fixed variable name
    return new Promise((resolve) => {
      let weeksToProcess = weeks;

      if (weeksToProcess > 0) {
        this.nightFadeProgress = 0.0;
      } else {
        resolve();
        return;
      }

      let waitingTime = 0.2;

      function UpdateNight() {
        const delta = 1 / 60; // assuming 60fps

        if (this.nightFadeProgress > 0.5 && waitingTime > 0) {
          waitingTime -= delta;
          if (waitingTime <= 0) {
            // A week has passed - calculate GDD for this week
            const weekIndex = this.currentWeek - 1; // Convert to 0-based index

            // Calculate GDD for this week
            let weekGDD = 0;
            const startIdx = weekIndex * 7;
            for (
              let i = startIdx;
              i < startIdx + 7 && i < this.csvLines.length;
              i++
            ) {
              if (csvLines[i] && csvLines[i][2]) {
                const temp = parseFloat(csvLines[i][2]);
                if (!isNaN(temp)) {
                  weekGDD += Math.max(0, temp - Wheatgdd);
                }
              }
            }

            cumulativeGDD += weekGDD;

            // Update week counter and grow crops
            currentWeek++;
            growCrops(weekGDD);

            // Update HTML displays
            document.getElementById("weekText").textContent =
              `Week ${currentWeek - 1}`;
            document.getElementById("gddText").textContent =
              `GDD: ${cumulativeGDD.toFixed(2)}`;

            weeksToProcess--;
            if (weeksToProcess > 0) waitingTime = 0.2;
          }
        } else {
          const fadeSpeed = waitingTime > 0 ? 1.0 : 2.0;
          nightFadeProgress = Math.min(
            nightFadeProgress + delta * fadeSpeed,
            1.0,
          );
        }

        if (weeksToProcess > 0 || nightFadeProgress < 1.0) {
          drawFieldAndTractor();
          animationId = requestAnimationFrame(UpdateNight);
        } else {
          nightFadeProgress = -1;
          drawFieldAndTractor();
          resolve();
        }
      }
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
      rotatePoint(topLeft.x, topLeft.y, angle, center.x, center.y), //topLeft
      rotatePoint(topRight.x, topRight.y, angle, center.x, center.y), //topRight
      rotatePoint(bottomRight.x, bottomRight.y, angle, center.x, center.y), // bottomRight
      rotatePoint(bottomLeft.x, bottomLeft.y, angle, center.x, center.y), // bottomLeft
    ];

    const frontSide = [corners[1], corners[2]]; // right side of image when angle = 0
    return detectWhatTilesAreHit(
      frontSide[0].x,
      frontSide[0].y,
      frontSide[1].x,
      frontSide[1].y,
      type,
    );
  }

  // --- Draw the tractor sprite based on current direction ---
  drawTractor() {
    const normalizedAngle = ((this.angle % 360) + 360) % 360;
    var angleInRadians = (normalizedAngle * Math.PI) / 180;

    // tractorsprite
    this.ctx.save();
    this.ctx.translate(
      this.tractorWorldX + this.FRAME_WIDTH / 2,
      this.tractorWorldY + this.FRAME_HEIGHT / 2,
    );
    this.ctx.rotate(angleInRadians);
    this.ctx.drawImage(
      this.tractorSprite,
      -this.FRAME_WIDTH / 2,
      -this.FRAME_HEIGHT / 2,
    );
    this.ctx.restore();

    document.getElementById("debug").innerHTML = //debugging window
      `Position: (${Math.round(this.tractorWorldX)}, ${Math.round(this.tractorWorldY)})<br>` +
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
    );

    // draw the entire field
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let dirtOrWheat = this.dirtImage;
        switch (this.field[i][j]) {
          case 0:
            dirtOrWheat = this.dirtImage;
            break;
          case 1:
            dirtOrWheat = this.seedImage;
            break;
          case 2:
            dirtOrWheat = this.wheatImage;
            break;
        }
        this.ctx.drawImage(
          dirtOrWheat,
          0,
          0,
          this.seedImage.width,
          this.seedImage.height,
          (j * this.seedImage.width) / this.FIELD_SCALE,
          (i * this.seedImage.height) / this.FIELD_SCALE,
          this.seedImage.width / this.FIELD_SCALE,
          this.seedImage.height / this.FIELD_SCALE,
        );
      }
    }
  }

  // Detects and changes which tiles are in the line from point0, to point1 for a gentle slope
  detectGentleSlope(x0, y0, x1, y1) {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;

    let yi = 1;

    if (deltaY < 0) {
      yi = -1;
      deltaY = -deltaY;
    }
    let D = 2 * deltaY - deltaX;
    let y = y0;

    for (let x = x0; x < x1; x++) {
      this.changeTile(
        Math.floor(x / this.TILE_WIDTH),
        Math.floor(y / this.TILE_HEIGHT),
      );
      if (D > 0) {
        y = y + yi;
        D = D + 2 * (deltaY - deltaX);
      } else D = D + 2 * deltaY;
    }
  }

  // Detects and changes which tiles are in the line from point0, to point1 for a steep slope
  detectSteepSlope(x0, y0, x1, y1) {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;

    let xi = 1;

    if (deltaX < 0) {
      xi = -1;
      deltaX = -deltaX;
    }
    let D = 2 * deltaX - deltaY;
    let x = x0;

    for (let y = y0; y < y1; y++) {
      this.changeTile(
        Math.floor(x / this.TILE_WIDTH),
        Math.floor(y / this.TILE_HEIGHT),
      );
      if (D > 0) {
        x = x + xi;
        D = D + 2 * (deltaX - deltaY);
      } else D = D + 2 * deltaX;
    }
  }

  // Changes the tile at field[y][x] to the apropriate value based on the current mode of the vehicle
  changeTile(x, y) {
    if (x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
      if (this.isHarvestingOn) {
        if (this.field[y][x] === 2) {
          this.field[y][x] = 0;
          this.yieldScore++;
        } else if (this.field[y][x] === 1) {
          this.field[y][x] = 0;
        }
      } else if (this.isSeedingOn) {
        if (this.field[y][x] === 0) {
          this.field[y][x] = 1;
          this.yieldScore++;
        }
      }
    }
  }

  // Detects wether the slope from point0 to point1 is steep or gentle then calls the appropriate method to detect tiles in that line
  detectWhatTilesAreHit(x0, y0, x1, y1) {
    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
      if (x0 > x1) this.detectGentleSlope(x1, y1, x0, y0);
      else this.detectGentleSlope(x0, y0, x1, y1);
    } else {
      if (y0 > y1) this.detectSteepSlope(x1, y1, x0, y0);
      else this.detectSteepSlope(x0, y0, x1, y1);
    }
  }

  // Resets the field to be the value of the Wheat tile
  resetField() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.field[i][j] = 2;
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
  }

  getDirectionName(angle) {
    const normalizedAngle = ((angle % 360) + 450) % 360;
    if (normalizedAngle === 0) return "Right →";
    if (normalizedAngle === 90) return "Down ↓";
    if (normalizedAngle === 180) return "Left ←";
    if (normalizedAngle === 270) return "Up ↑";
    return `${normalizedAngle}°`;
  }

  // moveForward function that moves over time
  async moveForward(duration) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
      const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);
      const animate = () => {
        const currentTime = Date.now();
        //const elapsed = (currentTime - startTime) / 1000;

        //console.log(this.isMoving);
        if (currentTime < endTime && this.isMoving) {
          // Calculate how much to move based on frame time
          const deltaTime = 1 / 60; // assuming 60fps
          this.tractorWorldX += moveX * deltaTime;
          this.tractorWorldY += moveY * deltaTime;

          this.drawFieldAndTractor();
          this.animationId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  }

  turnLeft() {
    this.angle -= 90;
    this.drawFieldAndTractor();
  }

  turnRight() {
    this.angle += 90;
    this.drawFieldAndTractor();
  }

  TurnXLeft(amount) {
    this.angle -= amount;
    this.drawFieldAndTractor();
  }

  TurnXRight(amount) {
    this.angle += amount;
    this.drawFieldAndTractor();
  }

  resetPosition() {
    this.tractorWorldX = this.canvas.width / 2;
    this.tractorWorldY = this.canvas.height / 2;
    this.angle = 0;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.yieldScore = 0;
    this.resetField();
    this.drawFieldAndTractor();
  }

  startMoving() {
    this.isMoving = true;
  }

  stopMovement() {
    this.isMoving = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = -1;
    }
  }
}
