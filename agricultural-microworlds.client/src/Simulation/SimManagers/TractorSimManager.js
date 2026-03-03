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
    const oldVehicles = oldState.vehicles;
    const newVehicles = newState.vehicles;
    const newField = newState.field;
  if (newState.isGameOver) return;
    if (!oldVehicles || !newVehicles || !newField) return;

    for (let i = 0; i < newVehicles.length; i++) {
      const oldTractor = oldVehicles[i];
      const newTractor = newVehicles[i];

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
        if (this.checkVehicleCollisions(newState))
        {
          newState.isGameOver = true;
          return;
        } 

  }

  handleHarvesting(tractor, field) {
    this.applyToolAction(
      tractor,
      field,
      (tile) => {
        const crop = tile.cropState;

        if (crop.isMature()) {
          tractor.yieldScore += crop.getYieldScore();
          crop.reset();
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
  getTilesCurrentlyOver(tractor, field, offset) {
    let tilesOver = [];
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
      if (targetCrop) tilesOver.push(targetCrop, targetCrop);
    }

    return tilesOver;
  }

  /**
   * Gets all tiles that the tractor is currently over.
   * @param {any} tractor The tractor.
   * @param {any} field The crop field.
   * @param {any} actionCallback The action to take on a valid tile.
   * */
  applyToolAction(tractor, field, actionCallback, offset) {
    let tilesOver = this.getTilesCurrentlyOver(tractor, field, offset);

    for (let i = 0; i < tilesOver.length; i++) {
      if (tilesOver[i]) {
        const didChange = actionCallback(tilesOver[i][0]);

        if (didChange) {
          const totalTiles = field.length / TILE_BYTE_SIZE;
          const width = Math.sqrt(totalTiles);
          ChangeFieldTile(
            field,
            tilesOver[i][0],
            tilesOver[i][1],
            tilesOver[i][2],
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

  // --- Collision settings (tune these) ---
  SPRITE_SIZE = 64;
  COLLISION_RADIUS = 28; // slightly smaller than 32 so it feels fair

  areVehiclesColliding(a, b) {
    // Circle collision using sprite centers
    const ax = a.x + this.SPRITE_SIZE / 2;
    const ay = a.y + this.SPRITE_SIZE / 2;
    const bx = b.x + this.SPRITE_SIZE / 2;
    const by = b.y + this.SPRITE_SIZE / 2;

    const dx = ax - bx;
    const dy = ay - by;

    const r = this.COLLISION_RADIUS * 2;
    return dx * dx + dy * dy <= r * r;
  }

  checkVehicleCollisions(newState) {
    const vehicles = newState.vehicles;
    if (!vehicles || vehicles.length < 2) return false;

    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        if (this.areVehiclesColliding(vehicles[i], vehicles[j])) {
          newState.isGameOver = true;
          newState.gameOverMessage = "You crashed and failed.";

          // Optional: freeze everything immediately
          for (const v of vehicles) {
            v.isMoving = false;
            v.isHarvestingOn = false;
            v.isSeedingOn = false;
          }

          return true;
        }
      }
    }
    return false;
  }

}
