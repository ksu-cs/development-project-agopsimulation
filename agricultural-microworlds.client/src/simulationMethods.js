export default class simulationMethods {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Global variables
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.angle = 0; // 0 degrees = facing right
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.animationId = -1;
    this.yieldScore = 0;

    this.FRAME_WIDTH = 64; // change to sprite’s frame width
    this.FRAME_HEIGHT = 64; // change to sprite’s frame height
    this.fieldScale = 4; // The amount the field tiles will be scaled down by
    this.SPEED = 50; // pixels per second

    // --- Sprite setup ---
    this.tractorSprite = new Image();
    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();
    this.imageLoadCount = 0;
    this.imageCount = 4;

    // Paths for the images
    this.tractorSprite.src = "./src/assets/combine-harvester.png";
    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

    // Setting up the array that represents the field
    this.rows =
      Math.floor(
        (this.canvas.height / this.seedImage.height) * this.fieldScale,
      ) + 1;
    this.columns =
      Math.floor((this.canvas.width / this.seedImage.width) * this.fieldScale) +
      1;
    this.field = Array.from({ length: this.rows }, () =>
      new Array(this.columns).fill(2),
    );

    this.tileWidth = this.wheatImage.width / this.fieldScale; // one tiles width (all tiles same width and height)
    this.tileHeight = this.wheatImage.height / this.fieldScale; // one tiles height (all tiles same width and height)
  }

  setSpriteOnLoadMethods() {
    // Loading methods for images
    this.tractorSprite.onload = () => {
      console.log("✅ Tractor sprite loaded!");
      this.imageLoadCount++;
      if (this.imageLoadCount === this.imageCount) {
        this.drawFieldAndTractor();
      }
    };
    this.tractorSprite.onerror = () => {
      console.error("❌ Failed to load tractor sprite!");
    };
    this.dirtImage.onload = () => {
      console.log("DirtImage loaded!");
      this.imageLoadCount++;
      if (this.imageLoadCount === this.imageCount) {
        this.drawFieldAndTractor();
      }
    };
    this.dirtImage.onerror = () => {
      console.error("failed to load DirtImage");
    };
    this.seedImage.onload = () => {
      console.log("SeedImage loaded!");
      this.imageLoadCount++;
      if (this.imageLoadCount === this.imageCount) {
        this.drawFieldAndTractor();
      }
    };
    this.seedImage.onerror = () => {
      console.error("failed to load SeedImage");
    };
    this.wheatImage.onload = () => {
      console.log("WheatImage loaded!");
      this.imageLoadCount++;
      if (this.imageLoadCount === this.imageCount) {
        this.drawFieldAndTractor();
      }
    };
    this.wheatImage.onerror = () => {
      console.error("failed to load WheatImage");
    };
  }

  // Methods for Harvesting and Seeding Blocks
  turnHarvestingOn() {
    this.isHarvestingOn = true;
    this.isSeedingOn = false;
  }
  turnHarvestingOff() {
    this.isHarvestingOn = false;
  }
  turnSeedingOn() {
    this.isSeedingOn = true;
    this.isHarvestingOn = false;
  }
  turnSeedingOff() {
    this.isSeedingOn = false;
  }

  // --- Draw the tractor sprite based on current direction ---
  drawTractor() {
    const normalizedAngle = ((this.angle % 360) + 360) % 360;
    var angleInRadians = (normalizedAngle * Math.PI) / 180;

    // tractorsprite
    this.ctx.save();
    this.ctx.translate(
      this.x + this.FRAME_WIDTH / 2,
      this.y + this.FRAME_HEIGHT / 2,
    );
    this.ctx.rotate(angleInRadians);
    this.ctx.drawImage(
      this.tractorSprite,
      -this.FRAME_WIDTH / 2,
      -this.FRAME_HEIGHT / 2,
    );
    this.ctx.restore();

    document.getElementById("debug").innerHTML = //debugging window
      `Position: (${Math.round(this.x)}, ${Math.round(this.y)})<br>` +
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
      x: this.x + this.FRAME_WIDTH / 2,
      y: this.y + this.FRAME_HEIGHT / 2,
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
          (j * this.seedImage.width) / this.fieldScale,
          (i * this.seedImage.height) / this.fieldScale,
          this.seedImage.width / this.fieldScale,
          this.seedImage.height / this.fieldScale,
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
        Math.floor(x / this.tileWidth),
        Math.floor(y / this.tileHeight),
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
        Math.floor(x / this.tileWidth),
        Math.floor(y / this.tileHeight),
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
  moveForward(duration) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
      const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);

      function animate() {
        const currentTime = Date.now();
        //const elapsed = (currentTime - startTime) / 1000;

        if (currentTime < endTime && this.isMoving) {
          // Calculate how much to move based on frame time
          const deltaTime = 1 / 60; // assuming 60fps
          this.x += moveX * deltaTime;
          this.y += moveY * deltaTime;

          this.drawFieldAndTractor();
          this.animationId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
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
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.angle = 0;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.yieldScore = 0;
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

  // Initial draw
  //if (imageLoadCount === imageCount) drawFieldAndTractor();
}
