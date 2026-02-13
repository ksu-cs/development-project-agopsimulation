import State from "../State";

/**
 * A state that stores data for the moving tractor traveling around the fields.
 */
export default class TractorState extends State {
  /**
   * Creates a new TractorState, and initializes all default properties.
   */
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

    this.yieldScore = 0;
  }

  /**
   * Clones all properties from this TractorState into a newly created one.
   */
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

    // FIXED: This was missing, causing seeding to stop after 1 frame
    newState.isSeedingOn = this.isSeedingOn;

    newState.yieldScore = this.yieldScore;
    return newState;
  }
}
