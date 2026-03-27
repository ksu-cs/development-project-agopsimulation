import BitmapFieldState from "../BinaryArrayAbstractionMethods/BitmapFieldState";

/*
 * snap shot of simulation state at specific moment in time
 * Created by simulationEngine and sent to drawCanvas to render frame
 */
export default class timeStepData {
  constructor(
    vehicles,
    activeVehicleType,
    activeVehicleCamera,
    angle, // Tractor rotation (degrees)
    yieldScore, // Current yield score
    tractorWorldX, // Absolute X position in the world
    tractorWorldY, // Absolute Y position in the world
    nightFadeProgress, // Controls darkness overlay during wait X weeks block (0.0 to 1.0)
    field, // 2D array of CropStates (Dirt, Seed, Wheat)
    fieldWidth,
    currentDate, // Date string ("1/1/2024")
    cumulativeGDD, // Growth Degree Days string
    vehicleType,
    cumulativeRain,
    isGameOver,
    crash,
  ) {
    this.vehicles = vehicles;
    this.activeVehicleType = activeVehicleType;
    this.activeVehicleCamera = activeVehicleCamera;
    this.angle = angle;
    this.yieldScore = yieldScore;
    this.tractorWorldX = tractorWorldX;
    this.tractorWorldY = tractorWorldY;
    this.nightFadeProgress = nightFadeProgress;
    /** @type {BitmapFieldState} */
    this.field = field;
    this.fieldWidth = fieldWidth;
    this.currentDate = currentDate;
    this.cumulativeGDD = cumulativeGDD;
    this.vehicleType = vehicleType;
    this.cumulativeRain = cumulativeRain;
    this.isGameOver = isGameOver;
    this.crash = crash;
  }
}
