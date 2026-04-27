import { CROP_STAGES, CROP_TYPES } from "../States/StateClasses/CropState";
import { TILE_BASE_SIZE, TILE_HEIGHT, TILE_WIDTH } from "./renderingConstants";
import RenderState from "./renderState";
import dirtImage from "@/assets/T2D_Dirt_Placeholder.png";
import seedImage from "@/assets/T2D_Planted_Placeholder.png";
import wheatImage from "@/assets/wheat.png";
import cornImage from "@/assets/corn.png";
import soyImage from "@/assets/soybean.png";

const IMAGE_KEYS = {
  DIRT: "dirt",
  SEED: "seed",
  WHEAT: "wheat",
  CORN: "corn",
  SOY: "soy",
};

// Scale of one field tile is roughly 3.5 ft x 3.5 ft based on the average harvester being 28 ft long and the in game harvester being 8 tiles long.

export default class RenderFieldState extends RenderState {
  constructor() {
    const paths = {
      [IMAGE_KEYS.DIRT]: dirtImage,
      [IMAGE_KEYS.SEED]: seedImage,
      [IMAGE_KEYS.WHEAT]: wheatImage,
      [IMAGE_KEYS.CORN]: cornImage,
      [IMAGE_KEYS.SOY]: soyImage,
    };
    super(paths, paths.length);
  }

  render(context, data) {
    context.fillStyle = "#4a3b2c";
    context.fillRect(0, 0, data.canvasWidth, data.canvasHeight);

    const fieldWidth = data.fieldWidth;
    const fieldHeight = data.fieldWidth;
    const cameraX = data.cameraX;
    const cameraY = data.cameraY;

    const startCol = Math.floor(cameraX / TILE_WIDTH);
    const startRow = Math.floor(cameraY / TILE_HEIGHT);

    const SCREEN_ROWS = Math.floor(data.canvasWidth / TILE_HEIGHT) + 2;
    const SCREEN_COLUMNS = Math.floor(data.canvasHeight / TILE_WIDTH) + 2;

    const endRow = Math.min(fieldHeight, startRow + SCREEN_ROWS);
    const endCol = Math.min(fieldWidth, startCol + SCREEN_COLUMNS);

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i < 0 || j < 0) continue;

        const crop = data.field.getTileAt(j, i);

        // Determine tile image based on crop image
        let tileImage = this.images[IMAGE_KEYS.DIRT];
        switch (crop["stage"]) {
          case CROP_STAGES.UNPLANTED:
            tileImage = this.images[IMAGE_KEYS.DIRT];
            break;
          case CROP_STAGES.SEEDED:
            tileImage = this.images[IMAGE_KEYS.SEED];
            break;
          case CROP_STAGES.MATURE:
            switch (crop["type"]) {
              case CROP_TYPES.WHEAT:
                tileImage = this.images[IMAGE_KEYS.WHEAT];
                break;
              case CROP_TYPES.CORN:
                tileImage = this.images[IMAGE_KEYS.CORN];
                break;
              case CROP_TYPES.SOY:
                tileImage = this.images[IMAGE_KEYS.SOY];
                break;
              default:
                tileImage = this.images[IMAGE_KEYS.WHEAT];
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
