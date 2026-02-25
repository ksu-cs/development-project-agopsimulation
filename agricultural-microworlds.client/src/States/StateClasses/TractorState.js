import { CROP_TYPES } from "./CropState";

export const VEHICLES = {
  HARVESTER: 0,
  SEEDER: 1,
};

export default class TractorState {
  /**
   * Initializes a new TractorState.
   * @param {number} inX The tractor's x position.
   * @param {number} inY The tractor's y position.
   */
  constructor(inX, inY) {
    this.basespeed = 20;
    this.turnSpeed = 90; // Degrees per second

    this.x = inX;
    this.y = inY;
    this.angle = 0;
    this.goalAngle = 0;

    // Flags
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.cropBeingPlanted = CROP_TYPES.WHEAT;

    this.yieldScore = 0;
    this.type = VEHICLES.HARVESTER;
  }

  clone() {
    const newState = new TractorState();
    newState.basespeed = this.basespeed;
    newState.turnSpeed = this.turnSpeed;

    newState.x = this.x;
    newState.y = this.y;
    newState.angle = this.angle;
    newState.goalAngle = this.goalAngle;

    newState.isMoving = this.isMoving;
    newState.isHarvestingOn = this.isHarvestingOn;

    newState.isSeedingOn = this.isSeedingOn;

    newState.cropBeingPlanted = this.cropBeingPlanted;

    newState.yieldScore = this.yieldScore;
    newState.type = this.type;
    return newState;
  }
}
