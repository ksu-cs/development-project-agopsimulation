import SimManager from "../SimManager";
import BitmapFieldState from "../../BinaryArrayAbstractionMethods/BitmapFieldState";
import {
  getYieldScore,
  isGrowing,
  isMature,
  isUnplanted,
  plant,
  reset,
} from "../../States/StateClasses/CropState";
import { VEHICLES } from "../../States/StateClasses/ImplementState";

export default class TractorSimManager extends SimManager {
  constructor() {
    super();
    this.TILE_WIDTH = 8;
    this.TILE_HEIGHT = 8;
    this.HEADER_OFFSET = 20;
    this.HEADER_WIDTH = 64;
    this.FIELD_COLS = 300;
    this.cameraX = 0;
    this.cameraY = 0;
    this.activeVehicleCamera = VEHICLES.HARVESTER;
  }

  update(deltaTime, oldState, newState) {
    const oldVehicles = oldState.vehicles;
    const newVehicles = newState.vehicles;
    const newField = newState.field;

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
  }

  handleHarvesting(tractor, field) {
    this.applyToolAction(
      tractor,
      field,
      (tile) => {
        if (isMature(tile)) {
          tractor.yieldScore += getYieldScore(tile);
          reset(tile);
          return true;
        } else if (isGrowing(tile)) {
          reset(tile);
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
        if (isUnplanted(tile)) {
          plant(tractor.cropBeingPlanted, tile);
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
   * @return {any} Returns an array of all tiles the tractor is currently over.
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
   * @param {BitmapFieldState} field The crop field.
   * @param {any} actionCallback The action to take on a valid tile.
   * */
  applyToolAction(tractor, field, actionCallback, offset) {
    let tilesOver = this.getTilesCurrentlyOver(tractor, field, offset);

    for (let i = 0; i < tilesOver.length; i++) {
      if (tilesOver[i]) {
        const didChange = actionCallback(tilesOver[i][0]);

        if (didChange) {
          field.setTile(tilesOver[i][1], tilesOver[i][2], tilesOver[i][0]);
        }
      }
    }
  }

  /**
   * Gets a tile at a specific coordinate on the field
   * @param {number} x The x-coordinate.
   * @param {number} y The y-coordinate.
   * @param {BitmapFieldState} field The crop field.
   * @returns {[targetCrop: Object.<string, number>, tileX: number, tileY: number]} An array of a field tile, and each of its proper coordinates.
   * */
  getTileAtLocation(x, y, field) {
    const tileX = Math.floor(x / this.TILE_WIDTH);
    const tileY = Math.floor(y / this.TILE_HEIGHT);

    if (
      tileY >= 0 &&
      tileY < this.FIELD_COLS &&
      tileX >= 0 &&
      tileX < this.FIELD_COLS
    ) {
      const targetCrop = field.getTileAt(tileX, tileY);
      return [targetCrop, tileX, tileY];
    }

    return null;
  }

  /**
   * Calculates the camera coordinates for the active implement based on the information in that implement state
   * @param {ImplementState} implement The active implement that the camera is tracking
   * @param {number} fieldWidth The width of the field
   * @param {number} canvasWidth The width of the canvas
   * @param {number} canvasHeight The height of the canvas
   */
  updateCameraCoordinates(implement, fieldWidth, canvasWidth, canvasHeight){
    if (!implement) return;

    const tractorX = implement.x + 32;
    const tractorY = implement.y + 32;

    let targetX = tractorX - canvasWidth / 2;
    let targetY = tractorY - canvasHeight / 2;

    const maxCameraX = fieldWidth * this.TILE_WIDTH - canvasWidth;
    const maxCameraY = fieldWidth * this.TILE_WIDTH - canvasHeight;

    targetX = Math.min(targetX, maxCameraX);
    targetY = Math.min(targetY, maxCameraY);

    this.cameraX = Math.max(-150, targetX);
    this.cameraY = Math.max(0, targetY);
  }
}
