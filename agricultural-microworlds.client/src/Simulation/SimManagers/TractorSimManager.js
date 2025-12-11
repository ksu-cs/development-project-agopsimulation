import SimManager from "../SimManager";

export default class TractorSimManager extends SimManager {
  constructor() {
    super();
    this.TILE_WIDTH = 8;
    this.TILE_HEIGHT = 8;
    this.HEADER_OFFSET = 20;
    this.HEADER_WIDTH = 64;
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
    this.applyToolAction(tractor, field, (crop) => {
      if (crop.isMature()) {
        crop.reset();
        tractor.yieldScore += 1;
      } else if (crop.isGrowing()) {
        crop.reset(); // Destroy if harvesting early
      }
    });
  }

  handleSeeding(tractor, field) {
    this.applyToolAction(tractor, field, (crop) => {
      if (crop.isUnplanted()) {
        crop.plant();
      }
    });
  }

  // Helper to avoid duplicating the geometry math
  applyToolAction(tractor, field, actionCallback) {
    const centerX = tractor.x + 32;
    const centerY = tractor.y + 32;
    const rad = (tractor.angle * Math.PI) / 180;
    const frontX = centerX + Math.cos(rad) * this.HEADER_OFFSET;
    const frontY = centerY + Math.sin(rad) * this.HEADER_OFFSET;

    const pSin = Math.sin(rad);
    const pCos = Math.cos(rad);
    const pointsToCheck = 10;

    for (let i = 0; i < pointsToCheck; i++) {
      const t = i / (pointsToCheck - 1) - 0.5;
      const offset = t * this.HEADER_WIDTH;
      const checkX = frontX - pSin * offset;
      const checkY = frontY + pCos * offset;

      this.interactWithTile(checkX, checkY, field, actionCallback);
    }
  }

  interactWithTile(x, y, field, actionCallback) {
    const tileX = Math.floor(x / this.TILE_WIDTH);
    const tileY = Math.floor(y / this.TILE_HEIGHT);

    if (
      tileY >= 0 &&
      tileY < field.length &&
      tileX >= 0 &&
      tileX < field[0].length
    ) {
      const targetCrop = field[tileY][tileX];
      actionCallback(targetCrop);
    }
  }
}
