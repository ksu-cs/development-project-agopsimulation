import SimManager from "../SimManager";
import {
  ChangeFieldTile,
  GetFieldTile,
  TILE_BYTE_SIZE,
} from "../../BinaryArrayAbstractionMethods/BinaryFieldAbstraction";

export default class TractorSimManager extends SimManager {
  constructor() {
    super();
    this.TILE_WIDTH = 8;
    this.TILE_HEIGHT = 8;
    this.HEADER_OFFSET = 20;
    this.HEADER_WIDTH = 64;
    this.FIELD_COLS = 300;
  }

  update(deltaTime, oldState, newState) {
    const oldTractor = oldState.tractor;
    const newTractor = newState.tractor;
    const newField = newState.field;

    if (!oldTractor || !newTractor || !newField) return;

    // Turning and Movement Logic
    const diff = newTractor.goalAngle - newTractor.angle;
    const isTurning = Math.abs(diff) > 0.1;
    let moveDistance = 0;

    if (isTurning) {
      const absDiff = Math.abs(diff);
      const turnStep = newTractor.turnSpeed * deltaTime;
      const alpha = Math.min(turnStep, absDiff) / absDiff;
      newTractor.angle =
        newTractor.angle * (1 - alpha) + newTractor.goalAngle * alpha;
      moveDistance = newTractor.basespeed * deltaTime;
    } else if (oldTractor.isMoving) {
      moveDistance = newTractor.basespeed * deltaTime;
    }

    if (moveDistance > 0) {
      const rad = (newTractor.angle * Math.PI) / 180;
      newTractor.x += Math.cos(rad) * moveDistance;
      newTractor.y += Math.sin(rad) * moveDistance;
    }

    // Interaction Logic

    // Check Harvesting
    if (oldTractor.isHarvestingOn) {
      this.handleHarvesting(newTractor, newField);
    } else if (oldTractor.isSeedingOn) {
      this.handleSeeding(newTractor, newField);
    }
  }

  handleHarvesting(tractor, field) {
    this.applyToolAction(
      tractor,
      field,
      (tile) => {
        const crop = tile.cropState;

        if (crop.isMature()) {
          crop.reset();
          tractor.yieldScore += 1;
          return true;
        } else if (crop.isGrowing()) {
          crop.reset(); // Destroy if harvesting early
          return true;
        }
      },
      this.HEADER_OFFSET,
    );
  }

  handleSeeding(tractor, field) {
    this.applyToolAction(
      tractor,
      field,
      (tile) => {
        const crop = tile.cropState;

        if (crop.isUnplanted()) {
          crop.plant(tractor.cropBeingPlanted);
          return true;
        }
      },
      -this.HEADER_OFFSET,
    );
  }

  /**
   * Gets all tiles that the tractor is currently over.
   * @param {any} tractor The tractor.
   * @param {any} field The crop field.
   * @return {Array} Returns an array of all tiles the tractor is currently over.
   */
  * getTilesCurrentlyOver(tractor, field, offset) {
    const centerX = tractor.x + 32;
    const centerY = tractor.y + 32;
    const rad = (tractor.angle * Math.PI) / 180;
    const frontX = centerX + Math.cos(rad) * offset;
    const frontY = centerY + Math.sin(rad) * offset;

    const pSin = Math.sin(rad);
    const pCos = Math.cos(rad);
    const pointsToCheck = 10;

    for (let i = 0; i < pointsToCheck; i++) {
      const t = i / (pointsToCheck - 1) - 0.5;
      const offset = t * this.HEADER_WIDTH;
      const checkX = frontX - pSin * offset;
      const checkY = frontY + pCos * offset;

      const targetCrop = this.getTileAtLocation(checkX, checkY, field);
      if (targetCrop)
        yield targetCrop;
    }
  }

  /**
   * Gets all tiles that the tractor is currently over.
   * @param {any} tractor The tractor.
   * @param {any} field The crop field.
   * @param {any} actionCallback The action to take on a valid tile.
   * */
  applyToolAction(tractor, field, actionCallback, offset) {
    for (const targetCrop of this.getTilesCurrentlyOver(tractor, field, offset)) {
      if (targetCrop) {
        const didChange = actionCallback(targetCrop[0]);

        if (didChange) {
          const totalTiles = field.length / TILE_BYTE_SIZE;
          const width = Math.sqrt(totalTiles);
          ChangeFieldTile(
            field,
            targetCrop[0],
            targetCrop[1],
            targetCrop[2],
            width,
          );
        }
      }
    }
  }

  /**
   * Gets a tile at a specific coordinate on the field
   * @param {number} x The x-coordinate.
   * @param {number} y The y-coordinate.
   * @param {any} field The crop field.
   * @returns {Array} An array of a field tile, and each of its proper coordinates.
   * */
  getTileAtLocation(x, y, field) {
    const tileX = Math.floor(x / this.TILE_WIDTH);
    const tileY = Math.floor(y / this.TILE_HEIGHT);

    // Calculate dimensions
    const totalTiles = field.length / TILE_BYTE_SIZE;
    const width = Math.sqrt(totalTiles);

    if (
      tileY >= 0 &&
      tileY < this.FIELD_COLS &&
      tileX >= 0 &&
      tileX < this.FIELD_COLS
    ) {
      const targetCrop = GetFieldTile(field, tileX, tileY, width);
      return [targetCrop, tileX, tileY];
    }

    return null;
  }
}
