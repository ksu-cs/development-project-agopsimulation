import RenderDayCycleState from "./renderDayCycleState";
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
    this.ctx = this.canvas.getContext("2d");

    /** @type {timeStepData} Holds the timeStepData to draw */
    this.simulationState = null;

    this.renderModules = {
      [RENDER_MODULE_KEYS.FIELD]: new RenderFieldState(),
      [RENDER_MODULE_KEYS.IMPLEMENTS]: new RenderImplementState(),
      [RENDER_MODULE_KEYS.STATS]: new RenderStatState(),
      [RENDER_MODULE_KEYS.WEATHER]: new RenderWeatherState(),
      [RENDER_MODULE_KEYS.DAY_CYCLE]: new RenderDayCycleState(),
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

    // 4. Scene Colorize
    this.drawTimeColorize();
  }

  renderAllModules() {
    Object.entries(this.simulationState.renderModuleData).forEach(
      ([key, data]) => {
        console.log(this.renderModules[key]);
        this.renderModules[key].render(this.ctx, data);
      },
    );
  }
}
