import State from "../State";
import { CROP_TYPES } from "./CropState";

export default class TractorState extends State {
  constructor() {
    super();

    this.basespeed = 20;
    this.turnSpeed = 90; // Degrees per second

    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.goalAngle = 0;

    // Flags
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.cropBeingPlanted = CROP_TYPES.WHEAT;

    this.yieldScore = 0;
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
    return newState;
  }
}
