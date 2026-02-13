import State from "../State";

export default class SeederState extends State {
  /**
   * Creates a new SeederState, and initializes all default properties.
   */
  constructor() {
    super();

    this.turnSpeed = 45; // Degrees per second
    this.angle = 0;
    this.isSeedingOn = false;
  }

  /**
   * Clones all properties from this SeederState into a newly created one.
   */
  clone() {
    const newState = new SeederState();

    newState.turnSpeed = this.turnSpeed;
    newState.angle = this.angle;
    newState.isSeedingOn = this.isSeedingOn;

    return newState;
  }
}