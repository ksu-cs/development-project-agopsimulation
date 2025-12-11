/* 
drawCanvas.js

1. Receives 'timeStepData' from engine
2. Calculates camera position for tractor
3. Draws field and tractor
4. Updates UI text

*/
export default class drawCanvas {
  constructor(canvasRef, canvasWidth, canvasHeight) {
    this.canvas = canvasRef;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // Camera State
    this.cameraX = 0;
    this.cameraY = 0;

    // Sprite setup
    this.tractorSprite = new Image();
    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();

    // Game asset constants
    this.FRAME_WIDTH = 64;
    this.FRAME_HEIGHT = 64;
    this.TILE_BASE_SIZE = 64;
    this.FIELD_SCALE = 8;

    // Field variables
    this.TILE_WIDTH = this.TILE_BASE_SIZE / this.FIELD_SCALE;
    this.TILE_HEIGHT = this.TILE_BASE_SIZE / this.FIELD_SCALE;

    this.WORLD_WIDTH_IN_SCREENS = 5;
    this.WORLD_HEIGHT_IN_SCREENS = 5;
    this.SCREEN_ROWS = Math.floor(this.canvas.height / this.TILE_HEIGHT) + 2;
    this.SCREEN_COLUMNS = Math.floor(this.canvas.width / this.TILE_WIDTH) + 2;

    this.rows = this.SCREEN_ROWS * this.WORLD_HEIGHT_IN_SCREENS;
    this.columns = this.SCREEN_COLUMNS * this.WORLD_WIDTH_IN_SCREENS;

    // Paths for the images
    this.tractorSprite.src = "./src/assets/combine-harvester.png";
    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

    this.imageLoadCount = 0;
    this.imageCount = 4;
    this.isInitialized = false;

    this.simulationState = null;
  }

  // called by event listener in SimulationControlsContainer
  handleTimeStep(simulationData) {
    this.simulationState = simulationData.detail;

    // 1. Update UI Elements
    this.updateUI();

    // 2. Calculate Camera
    this.calculateCamera();

    // 3. Draw
    this.drawFieldAndTractor();
  }

  updateUI() {
    const yieldEl = document.getElementById("scoreText");
    if (yieldEl)
      yieldEl.innerText = "Yield: " + this.simulationState.yieldScore;

    const dateEl = document.getElementById("dateText");
    if (dateEl) dateEl.innerText = "Date: " + this.simulationState.currentDate;

    const gddEl = document.getElementById("gddText");
    if (gddEl) gddEl.innerText = "GDD: " + this.simulationState.cumulativeGDD;
  }

  // Keeps tractor at the center of field
  calculateCamera() {
    const tractorX = this.simulationState.tractorWorldX + 32;
    const tractorY = this.simulationState.tractorWorldY + 32;

    let targetX = tractorX - this.canvas.width / 2;
    let targetY = tractorY - this.canvas.height / 2;

    // Clamp so it does not show edge of field
    this.cameraX = Math.max(0, targetX);
    this.cameraY = Math.max(0, targetY);
  }

  setYieldScore(score) {
    const scoreEl = document.getElementById("scoreText");
    if (scoreEl) {
      scoreEl.innerHTML = "Yield: " + score;
    }
  }

  drawFieldAndTractor() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawField();
    this.drawTractor();

    // Draw Night overlay if waiting
    if (this.simulationState.nightFadeProgress >= 0.0) this.drawNight();
  }

  drawField() {
    const fieldRows = this.simulationState.field.length;
    const fieldCols = this.simulationState.field[0].length;

    const startCol = Math.floor(this.cameraX / this.TILE_WIDTH);
    const startRow = Math.floor(this.cameraY / this.TILE_HEIGHT);

    const endRow = Math.min(fieldRows, startRow + this.SCREEN_ROWS);
    const endCol = Math.min(fieldCols, startCol + this.SCREEN_COLUMNS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue;

        let crop = this.simulationState.field[i][j];
        if (!crop) continue;

        // Determine tile image based on crop image
        let tileImage = this.dirtImage;
        switch (crop.stage) {
          case 0:
            tileImage = this.dirtImage;
            break;
          case 1:
            tileImage = this.seedImage;
            break;
          case 2:
            tileImage = this.wheatImage;
            break;
        }
        const tileWorldX = j * this.TILE_WIDTH;
        const tileWorldY = i * this.TILE_HEIGHT;

        const tileScreenX = tileWorldX - this.cameraX;
        const tileScreenY = tileWorldY - this.cameraY;

        this.ctx.drawImage(
          tileImage,
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

  drawTractor() {
    const screenX = this.simulationState.tractorWorldX - this.cameraX;
    const screenY = this.simulationState.tractorWorldY - this.cameraY;

    const normalizedAngle = ((this.simulationState.angle % 360) + 360) % 360;
    var angleInRadians = (normalizedAngle * Math.PI) / 180;

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

    // Debug info is allowed to fail silently if element is missing,
    // but usually debug is in a separate panel not removed here.
    const debugEl = document.getElementById("debug");
    if (debugEl) {
      debugEl.innerHTML =
        `World Position: (${Math.round(this.simulationState.tractorWorldX)}, ${Math.round(this.simulationState.tractorWorldY)})<br>` +
        `Camera Position: (${Math.round(this.simulationState.cameraX)}, ${Math.round(this.simulationState.cameraY)})<br>` +
        `Screen Position: (${Math.round(screenX)}, ${Math.round(screenY)})<br>` +
        `Angle: ${normalizedAngle}°<br>`;
    }
  }

  drawNight() {
    this.ctx.fillStyle = `rgba(15, 15, 75, 0.5)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Image loading helpers

  onImageLoad() {
    this.imageLoadCount++;
    if (this.imageLoadCount === this.imageCount && !this.isInitialized) {
      console.log("All images loaded!");
      this.isInitialized = true;
      this.drawFieldAndTractor();
    }
  }

  setSpriteOnLoadMethods() {
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
}
