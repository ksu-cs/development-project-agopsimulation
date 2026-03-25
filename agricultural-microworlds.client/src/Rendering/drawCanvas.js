import { CROP_STAGES, CROP_TYPES } from "../States/StateClasses/CropState";
import { VEHICLES } from "../States/StateClasses/ImplementState";
import timeStepData from "./timeStepData";

//move some constants to a separate file for multiple classes to use

/**
 * @classdesc Draws on a stored canvas, changing what is displayed based on what information is received by the handleTimeStep
 */
export default class drawCanvas {
  /**
   * @constructor Assigns parameters to varibles for the class and defines all constants
   * @param {RefObject} canvasRef A canvas html component ref to know where this class should draw to
   * @param {int} canvasWidth The width to set the canvas to
   * @param {int} canvasHeight The height to set the canvas to
   */
  constructor(canvasRef, canvasWidth, canvasHeight) {
    this.canvas = canvasRef;
    /** @type {Context} */
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // Game asset constants
    this.FRAME_WIDTH = 64;
    this.FRAME_HEIGHT = 64;
    this.TILE_BASE_SIZE = 64;
    this.FIELD_SCALE = 8;

    // Field variables
    this.TILE_WIDTH = this.TILE_BASE_SIZE / this.FIELD_SCALE;
    this.TILE_HEIGHT = this.TILE_BASE_SIZE / this.FIELD_SCALE;

    // Screen variables
    this.WORLD_WIDTH_IN_SCREENS = 5;
    this.WORLD_HEIGHT_IN_SCREENS = 5;
    this.SCREEN_ROWS = Math.floor(this.canvas.height / this.TILE_HEIGHT) + 2;
    this.SCREEN_COLUMNS = Math.floor(this.canvas.width / this.TILE_WIDTH) + 2;
    this.rows = this.SCREEN_ROWS * this.WORLD_HEIGHT_IN_SCREENS;
    this.columns = this.SCREEN_COLUMNS * this.WORLD_WIDTH_IN_SCREENS;

    /** @type {timeStepData} Holds the timeStepData to draw */
    this.simulationState = null;
  }

  /**
   * Receives and handles the event sent out by simulationEngine
   * Updates the UI elements then draws what is needed onto the canvas
   *
   * @param {timeStepData} simulationData Data needed to update what the simulation should look like
   */
  handleTimeStep(simulationData) {
    this.simulationState = simulationData.detail;

    this.renderAllModules();

    // 2. Draw
    this.drawFieldAndTractor();
  }

  renderAllModules() {
    Object.entries(this.simulationState.renderModules).forEach(([, module]) => {
      module.render(this.ctx);
      // use render data to make a ctx.drawImage call, maybe a enum var aswell to specify which ctx method/overload should be called
    });
  }

  /**
   * Calls the necessary draw methods in the correct order
   */
  drawFieldAndTractor() {
    this.ctx.fillStyle = "#4a3b2c";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawField();
    this.drawVehicles();

    // Draw Night overlay if waiting
    if (this.simulationState.nightFadeProgress >= 0.0) this.drawNight();
  }

  /**
   * Draws the field on the canvas based on the information received from the timeStep event
   */
  drawField() {
    //?? field needs cameraX/Y calculated in the vehicle module how to get??
    const fieldWidth = this.simulationState.fieldWidth;
    const fieldHeight = this.simulationState.fieldWidth;
    const cameraX = this.simulationState.cameraX;
    const cameraY = this.simulationState.cameraY;

    const startCol = Math.floor(cameraX / this.TILE_WIDTH);
    const startRow = Math.floor(cameraY / this.TILE_HEIGHT);

    const endRow = Math.min(fieldHeight, startRow + this.SCREEN_ROWS);
    const endCol = Math.min(fieldWidth, startCol + this.SCREEN_COLUMNS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue;

        const crop = this.simulationState.field.getTileAt(j, i);

        // Determine tile image based on crop image
        let tileImage = this.dirtImage;
        switch (crop["stage"]) {
          case CROP_STAGES.UNPLANTED:
            tileImage = this.dirtImage;
            break;
          case CROP_STAGES.SEEDED:
            tileImage = this.seedImage;
            break;
          case CROP_STAGES.MATURE:
            switch (crop["type"]) {
              case CROP_TYPES.WHEAT:
                tileImage = this.wheatImage;
                break;
              case CROP_TYPES.CORN:
                tileImage = this.cornImage;
                break;
              case CROP_TYPES.SOY:
                tileImage = this.soybeanImage;
                break;
              default:
                tileImage = this.wheatImage;
            }
            break;
        }
        const tileWorldX = j * this.TILE_WIDTH;
        const tileWorldY = i * this.TILE_HEIGHT;

        const tileScreenX = tileWorldX - cameraX;
        const tileScreenY = tileWorldY - cameraY;

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

  /**
   * Draws the on the canvas based on the information received from the timeStep event
   */
  drawVehicles() {
    if (!this.simulationState.vehicles) return;

    this.simulationState.vehicles.forEach((vehicle) => {
      const screenX = vehicle.x - this.simulationState.cameraX;
      const screenY = vehicle.y - this.simulationState.cameraY;

      const normalizedAngle = ((vehicle.angle % 360) + 360) % 360;
      var angleInRadians = (normalizedAngle * Math.PI) / 180;

      const sprite =
        vehicle.type === VEHICLES.SEEDER
          ? this.seederSprite
          : this.harvesterSprite;

      this.ctx.save();
      this.ctx.translate(
        screenX + this.FRAME_WIDTH / 2,
        screenY + this.FRAME_HEIGHT / 2,
      );
      this.ctx.rotate(angleInRadians);
      this.ctx.drawImage(sprite, -this.FRAME_WIDTH / 2, -this.FRAME_HEIGHT / 2);
      this.ctx.restore();
    });
  }

  /**
   * Draws a representation of Night time on the canvas.
   */
  drawNight() {
    //?? which module should this go in, new environment or weather, existing field??
    this.ctx.fillStyle = `rgba(15, 15, 75, 0.5)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
