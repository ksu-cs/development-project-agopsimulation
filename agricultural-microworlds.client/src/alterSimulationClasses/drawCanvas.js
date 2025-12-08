export default class drawCanvas {
  constructor(canvasRef, canvasWidth, canvasHeight) {
    this.canvas = canvasRef;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // --- Sprite setup ---
    this.tractorSprite = new Image();
    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();

    // Game asset constants
    this.FRAME_WIDTH = 64; // change to sprite’s frame width
    this.FRAME_HEIGHT = 64; // change to sprite’s frame height
    this.TILE_BASE_SIZE = 64; // The original size of the field tiles
    this.FIELD_SCALE = 8; // The amount the field tiles will be scaled down by

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

    // Paths for the images
    this.tractorSprite.src = "./src/assets/combine-harvester.png";
    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

    // Variables to aid in image loading
    this.imageLoadCount = 0;
    this.imageCount = 4;
    this.isInitialized = false;

    this.simulationState = null;
  }

  handleTimeStep(simulationData) {
    this.simulationState = simulationData.detail;
    this.setYieldScore(this.simulationState.yieldScore);
    this.drawFieldAndTractor();
  }

  setYieldScore(score) {
    document.getElementById("scoreText").innerHTML = "Yield: " + score;
  }

  drawFieldAndTractor() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawField();
    this.drawTractor();
    if (this.simulationState.nightFadeProgress >= 0.0) this.drawNight();
  }

  drawField() {
    // draw the entire field using camera coordinates
    const startCol = Math.floor(this.simulationState.cameraX / this.TILE_WIDTH);
    const endCol = Math.min(this.columns, startCol + this.SCREEN_COLUMNS);
    const startRow = Math.floor(
      this.simulationState.cameraY / this.TILE_HEIGHT,
    );
    const endRow = Math.min(this.rows, startRow + this.SCREEN_ROWS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue; // skip negative indices
        let crop = this.simulationState.field[i][j];
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

        const tileScreenX = tileWorldX - this.simulationState.cameraX;
        const tileScreenY = tileWorldY - this.simulationState.cameraY;

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
    const screenX =
      this.simulationState.tractorWorldX - this.simulationState.cameraX;
    const screenY =
      this.simulationState.tractorWorldY - this.simulationState.cameraY;

    const normalizedAngle = ((this.simulationState.angle % 360) + 360) % 360;
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
      `World Position: (${Math.round(this.simulationState.tractorWorldX)}, ${Math.round(this.simulationState.tractorWorldY)})<br>` +
      `Camera Position: (${Math.round(this.simulationState.cameraX)}, ${Math.round(this.simulationState.cameraY)})<br>` +
      `Screen Position: (${Math.round(screenX)}, ${Math.round(screenY)})<br>` +
      `Angle: ${normalizedAngle}°<br>`;
  }

  DrawNight() {
    if (this.isWaiting) {
      this.ctx.fillStyle = `rgba(15, 15, 75, 0.5)`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Image loading
  onImageLoad() {
    this.imageLoadCount++;
    if (this.imageLoadCount === this.imageCount && !this.isInitialized) {
      console.log("All images loaded!");
      this.isInitialized = true;
      this.drawFieldAndTractor();
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
}
