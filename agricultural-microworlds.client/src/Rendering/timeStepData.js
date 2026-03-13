import BitmapFieldState from "../BinaryArrayAbstractionMethods/BitmapFieldState";
import RenderState from "./renderState";

/*
 * Snap shot of simulation state at specific moment in time
 * Created by simulationEngine and sent to drawCanvas to render frame
 */

export default class timeStepData {
  /**
   * All the data need to render a timestep in the simulation
   * @param {*} vehicles 
   * @param {*} activeVehicleType 
   * @param {*} cameraX 
   * @param {*} cameraY 
   * @param {*} angle 
   * @param {*} yieldScore 
   * @param {*} tractorWorldX 
   * @param {*} tractorWorldY 
   * @param {*} nightFadeProgress 
   * @param {*} field 
   * @param {*} fieldWidth 
   * @param {*} currentDate 
   * @param {*} cumulativeGDD 
   * @param {*} vehicleType 
   * @param {*} cumulativeRain 
   * @param {Object.<any, RenderState>} renderModules
   */
  constructor(
    vehicles,
    activeVehicleType,
    cameraX,
    cameraY,
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
    renderModules,
  ) {
    this.vehicles = vehicles;
    this.activeVehicleType = activeVehicleType;
    this.cameraX = cameraX;
    this.cameraY = cameraY;
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
    /**@type {Object.<any, RenderState>} */
    this.renderModules = renderModules;
  }
}
/**
 * Change Plan:
 * Make this so it passes a prestored object in each of the managers it needs things from, then iterate through a given list of those objects to render things correctly
 * Grouping:
 *  - Vehicles: vehicles, active vehicle type, active vehicle camera, angle
 *  - Stats: yieldScore, currentDate, cumulativeGDD, vehicleType, cumulativeRain
 *  - field: field, fieldWidth
 */
