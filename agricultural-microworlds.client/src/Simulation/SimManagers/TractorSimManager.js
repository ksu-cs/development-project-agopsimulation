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

    // --- 1. HANDLE TURNING & MOVEMENT ---

    // Check if we need to turn
    // We compare against a small epsilon (0.1) to stop jitters
    const diff = newTractor.goalAngle - newTractor.angle;
    const isTurning = Math.abs(diff) > 0.1;

    let moveDistance = 0;

    if (isTurning) {
      // Turning Math ported from simulationMethods.js
      const absDiff = Math.abs(diff);
      const turnStep = newTractor.turnSpeed * deltaTime;

      // Alpha is the percentage of the turn we complete this frame (0.0 to 1.0)
      const alpha = Math.min(turnStep, absDiff) / absDiff;

      // Linear Interpolation
      newTractor.angle =
        newTractor.angle * (1 - alpha) + newTractor.goalAngle * alpha;

      // Force movement while turning to create an arc
      moveDistance = newTractor.basespeed * deltaTime;
    } else if (oldTractor.isMoving) {
      // Standard forward movement
      moveDistance = newTractor.basespeed * deltaTime;
    }

    // Apply Velocity
    if (moveDistance > 0) {
      const rad = (newTractor.angle * Math.PI) / 180;
      newTractor.x += Math.cos(rad) * moveDistance;
      newTractor.y += Math.sin(rad) * moveDistance;
    }

    // --- 2. HARVESTING LOGIC ---
    // Check collisions if harvesting is on OR if we are just moving/turning
    // (We check bounds in handleHarvesting)
    if (oldTractor.isHarvestingOn) {
      this.handleHarvesting(newTractor, newField);
    }
  }

  handleHarvesting(tractor, field) {
    // 1. Calculate Tractor Center
    const centerX = tractor.x + 32;
    const centerY = tractor.y + 32;

    // 2. Calculate "Front Center" (The middle of the header)
    const rad = (tractor.angle * Math.PI) / 180;
    const frontX = centerX + Math.cos(rad) * this.HEADER_OFFSET;
    const frontY = centerY + Math.sin(rad) * this.HEADER_OFFSET;

    // 3. Scan a line perpendicular to the angle (The Header Bar)
    const pSin = Math.sin(rad);
    const pCos = Math.cos(rad);

    const pointsToCheck = 10;

    for (let i = 0; i < pointsToCheck; i++) {
      const t = i / (pointsToCheck - 1) - 0.5;
      const offset = t * this.HEADER_WIDTH;

      const checkX = frontX - pSin * offset;
      const checkY = frontY + pCos * offset;

      this.interactWithTile(checkX, checkY, tractor, field);
    }
  }

  interactWithTile(x, y, tractor, field) {
    const tileX = Math.floor(x / this.TILE_WIDTH);
    const tileY = Math.floor(y / this.TILE_HEIGHT);

    if (
      tileY >= 0 &&
      tileY < field.length &&
      tileX >= 0 &&
      tileX < field[0].length
    ) {
      const targetCrop = field[tileY][tileX];
      if (targetCrop.isMature()) {
        targetCrop.reset();
        tractor.yieldScore += 1;
      }
    }
  }
}
