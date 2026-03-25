import { CROP_STAGES, CROP_TYPES } from "../States/StateClasses/CropState";
import { TILE_BASE_SIZE, TILE_HEIGHT, TILE_WIDTH } from "./renderingConstants";
import RenderState from "./renderState";

const IMAGE_KEYS = {
  DIRT: "dirt",
  SEED: "seed",
  WHEAT: "wheat",
  CORN: "corn",
  SOY: "soy",
};

export default class RenderFieldState extends RenderState {
  constructor() {
    const paths = {
      [IMAGE_KEYS.DIRT]: "./src/assets/T2D_Dirt_Placeholder.png",
      [IMAGE_KEYS.SEED]: "./src/assets/T2D_Planted_Placeholder.png",
      [IMAGE_KEYS.WHEAT]: "./src/assets/wheat.png",
      [IMAGE_KEYS.CORN]: "./src/assets/corn.png",
      [IMAGE_KEYS.SOY]: "./src/assets/soybean.png",
    };
    super(paths, paths.length);
  }
  render(context, simulationState) {
    context.fillStyle = "#4a3b2c";
    context.fillRect(
      0,
      0,
      simulationState.canvasWidth,
      simulationState.canvasHeight,
    );

    const fieldWidth = simulationState.fieldWidth;
    const fieldHeight = simulationState.fieldWidth;
    const cameraX = simulationState.cameraX;
    const cameraY = simulationState.cameraY;

    const startCol = Math.floor(cameraX / TILE_WIDTH);
    const startRow = Math.floor(cameraY / TILE_HEIGHT);

    const SCREEN_ROWS =
      Math.floor(simulationState.canvasWidth / TILE_HEIGHT) + 2;
    const SCREEN_COLUMNS =
      Math.floor(simulationState.canvasHeight / TILE_WIDTH) + 2;

    const endRow = Math.min(fieldHeight, startRow + SCREEN_ROWS);
    const endCol = Math.min(fieldWidth, startCol + SCREEN_COLUMNS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue;

        const crop = simulationState.field.getTileAt(j, i);

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
        const tileWorldX = j * TILE_WIDTH;
        const tileWorldY = i * TILE_HEIGHT;

        const tileScreenX = tileWorldX - cameraX;
        const tileScreenY = tileWorldY - cameraY;

        context.drawImage(
          tileImage,
          0,
          0,
          TILE_BASE_SIZE,
          TILE_BASE_SIZE,
          Math.floor(tileScreenX),
          Math.floor(tileScreenY),
          TILE_WIDTH,
          TILE_HEIGHT,
        );
      }
    }
  }
}
