/*
 * A snap-shot of a single tractor within the world.
 * Used for transferring data over to the renderer.
 */
export default class tractorTimeStepData {
  constructor(
    angle, // Tractor rotation (degrees)
    tractorWorldX, // Absolute X position in the world
    tractorWorldY, // Absolute Y position in the world,
    vehicleType, // The vehicle type.
  ) {
    this.angle = angle;
    this.tractorWorldX = tractorWorldX;
    this.tractorWorldY = tractorWorldY;
    this.vehicleType = vehicleType;
  }
}
