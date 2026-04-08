import { CROP_TYPES } from "./CropState";

export const VEHICLES = {
  HARVESTER: 0,
  SEEDER: 1,
};

export const VEHICLE_FUEL_CAPACITY = {
  [VEHICLES.HARVESTER]: 300,
  [VEHICLES.SEEDER]: 200,
}

export const VEHICLE_FUEL_CONSUMPTION = {
  [VEHICLES.HARVESTER]: 12.5,
  [VEHICLES.SEEDER]: 5,
}

export default class ImplementState {
  constructor() {
    this.basespeed = 20;
    this.turnSpeed = 90; // Degrees per second

    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.goalAngle = 0;
    this.totalFuelConsumed = 0;
    this.fuelInTankUsed = 0;

    // Flags
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.cropBeingPlanted = CROP_TYPES.WHEAT;

    this.yieldScore = 0;
    this.type = VEHICLES.HARVESTER;
  }

  clone() {
    const newState = new ImplementState();
    newState.basespeed = this.basespeed;
    newState.turnSpeed = this.turnSpeed;

    newState.x = this.x;
    newState.y = this.y;
    newState.angle = this.angle;
    newState.goalAngle = this.goalAngle;
    newState.totalFuelConsumed = this.totalFuelConsumed;
    newState.fuelInTankUsed = this.fuelInTankUsed;

    newState.isMoving = this.isMoving;
    newState.isHarvestingOn = this.isHarvestingOn;

    newState.isSeedingOn = this.isSeedingOn;

    newState.cropBeingPlanted = this.cropBeingPlanted;

    newState.yieldScore = this.yieldScore;
    newState.type = this.type;
    return newState;
  }
}
