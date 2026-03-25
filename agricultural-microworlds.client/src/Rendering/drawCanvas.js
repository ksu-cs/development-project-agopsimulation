import { CROP_STAGES, CROP_TYPES } from "../States/StateClasses/CropState";
import { VEHICLES } from "../States/StateClasses/ImplementState";
import RenderDebugState from "./renderDebugState";
import RenderFieldState from "./renderFieldState";
import RenderImplementState from "./renderImplementState";
import { RENDER_MODULE_KEYS } from "./renderingConstants";
import RenderStatState from "./renderStatState";
import RenderWeatherState from "./renderWeatherState";
import timeStepData from "./timeStepData";

//move some constants to a separate file for multiple classes to use

/**
 * @classdesc Draws on a stored canvas, changing what is displayed based on what information is received by the handleTimeStep
 */
export default class drawCanvas {
  /**
   * @constructor Assigns parameters to varibles for the class and defines all constants
   * @param {RefObject} canvasRef A canvas html component ref to know where this class should draw to
   * @param {int} canvasWidth The width to set the canvas to
   * @param {int} canvasHeight The height to set the canvas to
   */
  constructor(canvasRef) {
    this.canvas = canvasRef;
    /** @type {Context} */
    this.ctx = this.canvas.getContext("2d");

    /** @type {timeStepData} Holds the timeStepData to draw */
    this.simulationState = null;

    this.renderModules = {
      [RENDER_MODULE_KEYS.FIELD]: new RenderFieldState(),
      [RENDER_MODULE_KEYS.IMPLEMENTS]: new RenderImplementState(),
      [RENDER_MODULE_KEYS.STATS]: new RenderStatState(),
      [RENDER_MODULE_KEYS.WEATHER]: new RenderWeatherState(),
      [RENDER_MODULE_KEYS.DEBUG]: new RenderDebugState(),
    };
  }

  /**
   * Receives and handles the event sent out by simulationEngine
   * Updates the UI elements then draws what is needed onto the canvas
   *
   * @param {timeStepData} simulationData Data needed to update what the simulation should look like
   */
  handleTimeStep(simulationData) {
    this.simulationState = simulationData.detail;

    this.renderAllModules();

    // 2. Draw
    this.drawFieldAndTractor();
  }

  renderAllModules() {
    Object.entries(this.simulationState.renderModuleData).forEach(
      ([key, data]) => {
        this.renderModules[key].render(this.ctx, data);
      },
    );
  }

  /**
   * Calls the necessary draw methods in the correct order
   */
  drawFieldAndTractor() {
    // Draw Night overlay if waiting
    if (this.simulationState.nightFadeProgress >= 0.0) this.drawNight();
  }

  /**
   * Draws a representation of Night time on the canvas.
   */
  drawNight() {
    //?? which module should this go in, new environment or weather, existing field??
    this.ctx.fillStyle = `rgba(15, 15, 75, 0.5)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
