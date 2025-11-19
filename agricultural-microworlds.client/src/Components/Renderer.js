// This is the new "View". It only draws.
// It loads all assets and has all canvas/ctx logic.
export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 500;
    this.canvas.height = 500;

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;

    // Game asset constants
    this.FRAME_WIDTH = 64;
    this.FRAME_HEIGHT = 64;
    this.TILE_BASE_SIZE = 64;
    this.FIELD_SCALE = 8;
    this.TILE_WIDTH = this.TILE_BASE_SIZE / this.FIELD_SCALE;
    this.TILE_HEIGHT = this.TILE_BASE_SIZE / this.FIELD_SCALE;

    this.SCREEN_COLUMNS = Math.floor(this.canvas.width / this.TILE_WIDTH) + 2;
    this.SCREEN_ROWS = Math.floor(this.canvas.height / this.TILE_HEIGHT) + 2;

    // Sprites
    this.tractorSprite = new Image();
    this.wheatImage = new Image();
    this.seedImage = new Image();
    this.dirtImage = new Image();
    
    // Asset paths from original file
    this.tractorSprite.src = "./src/assets/combine-harvester.png";
    this.wheatImage.src = "./src/assets/wheat.png";
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";
    
    this.isInitialized = false;
  }

  // Helper to wait for all images to load
  loadAssets() {
    const images = [
      this.tractorSprite,
      this.wheatImage,
      this.seedImage,
      this.dirtImage,
    ];
    let loadCount = 0;

    return new Promise((resolve) => {
      images.forEach((img) => {
        if (img.complete) {
            loadCount++;
        } else {
            img.onload = () => {
                loadCount++;
                if (loadCount === images.length) {
                    this.isInitialized = true;
                    resolve();
                }
            };
            img.onerror = () => {
                console.error("Failed to load an image!");
                resolve(); // Resolve anyway
            };
        }
      });
      if (loadCount === images.length) {
          this.isInitialized = true;
          resolve();
      }
    });
  }

  // --- Main Render Function ---
  // This is called by the game loop in the React component
  // It takes the *current state* from the simulation as an argument
  render(state) {
    if (!this.isInitialized) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update camera first
    this.updateCamera(state);

    // Draw field
    this.drawField(state);
    
    // Draw tractor
    this.drawTractor(state);

    // Draw night overlay
    if (state.nightFadeProgress >= 0.0) {
      this.DrawNight(state);
    }

    this.updateDebugPanel(state);
  }

  // --- All Drawing Methods (Moved from simulationMethods.js) ---
  // Note how they all take 'state' as an argument now

  updateDebugPanel(state) {
    const debugDiv = document.getElementById("debug");
    if (!debugDiv) return;

    const { 
      stackLength, 
      stackIndex, 
      currentCommand, 
      isFinished, 
      tractorWorldX, 
      tractorWorldY, 
      angle 
    } = state;

    let commandInfo = "---";
    if (isFinished) {
      commandInfo = "Finished";
    } else if (currentCommand) {
      commandInfo = `Type: ${currentCommand.type} <br>
                     Elapsed: ${(currentCommand.elapsed || 0).toFixed(2)}s`;
      if (currentCommand.type === 'WAIT') {
        commandInfo += `<br>Weeks Left: ${currentCommand.weeksRemaining}`;
      }
    } else {
      commandInfo = "Waiting...";
    }

    const direction = this.getDirectionName(angle);
    const normalizedAngle = (((angle % 360) + 450) % 360) - 90;

    debugDiv.innerHTML =
      `<b>--- Simulation State ---</b> <br>
       Commands: ${stackIndex} / ${stackLength} <br>
       Current: ${commandInfo} <br><br>
       <b>--- Tractor State ---</b> <br>
       World Position: (${Math.round(tractorWorldX)}, ${Math.round(tractorWorldY)})<br>
       Angle: ${normalizedAngle}° (${direction})
      `;
  }

  updateCamera(state) {
    let tractorCenterX = state.tractorWorldX + this.FRAME_WIDTH / 2;
    let tractorCenterY = state.tractorWorldY + this.FRAME_HEIGHT / 2;

    let targetCameraX = tractorCenterX - this.canvas.width / 2;
    let targetCameraY = tractorCenterY - this.canvas.height / 2;

    const maxCameraX = state.worldPixelWidth - this.canvas.width;
    const maxCameraY = state.worldPixelHeight - this.canvas.height;

    this.cameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));
    this.cameraY = Math.max(0, Math.min(targetCameraY, maxCameraY));
  }

  drawTractor(state) {
    const screenX = state.tractorWorldX - this.cameraX;
    const screenY = state.tractorWorldY - this.cameraY;

    const normalizedAngle = ((state.angle % 360) + 360) % 360;
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
    
    // // Update debug info
    // const direction = this.getDirectionName(state.angle);
    // document.getElementById("debug").innerHTML =
    //   `World Position: (${Math.round(state.tractorWorldX)}, ${Math.round(state.tractorWorldY)})<br>` +
    //   `Camera Position: (${Math.round(this.cameraX)}, ${Math.round(this.cameraY)})<br>` +
    //   `Screen Position: (${Math.round(screenX)}, ${Math.round(screenY)})<br>` +
    //   `Angle: ${normalizedAngle}°<br>` +
    //   `Direction: ${direction}<br>`;
  }

  drawField(state) {
    // const SCREEN_COLUMNS = Math.floor(this.canvas.width / this.TILE_WIDTH) + 2;
    // const SCREEN_ROWS = Math.floor(this.canvas.height / this.TILE_HEIGHT) + 2;

    const startCol = Math.floor(this.cameraX / this.TILE_WIDTH);
    const endCol = Math.min(state.columns, startCol + this.SCREEN_COLUMNS);
    const startRow = Math.floor(this.cameraY / this.TILE_HEIGHT);
    const endRow = Math.min(state.rows, startRow + this.SCREEN_ROWS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue;

        let tileImage;
        switch (state.field[i][j].state) {
          case 0:
            tileImage = this.dirtImage;
            break;
          case 1:
            tileImage = this.seedImage;
            break;
          case 2:
            tileImage = this.wheatImage;
            break;
          default:
            tileImage = this.dirtImage;
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

  DrawNight(state) {
    let alpha = 0.75 * state.nightFadeProgress;
    this.ctx.fillStyle = `rgba(15, 15, 75, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getDirectionName(angle) {
    const normalizedAngle = (((angle % 360) + 450) % 360) - 90;
    if (normalizedAngle === 0) return "Right →";
    if (normalizedAngle === 90) return "Down ↓";
    if (normalizedAngle === 180) return "Left ←";
    if (normalizedAngle === 270) return "Up ↑";
    return `${normalizedAngle}°`;
  }
}