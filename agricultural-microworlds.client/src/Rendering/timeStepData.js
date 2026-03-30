import BitmapFieldState from "../BinaryArrayAbstractionMethods/BitmapFieldState";
import RenderState from "./renderState";

/*
 * Snap shot of simulation state at specific moment in time
 * Created by simulationEngine and sent to drawCanvas to render frame
 */

export default class timeStepData {
  /**
   * @param {*} cumulativeRain
   * @param {Object.<any, RenderState>} renderModules
   */
  constructor(cumulativeRain, renderModuleData) {
    this.cumulativeRain = cumulativeRain;
    /**@type {Object.<any, RenderState>} */
    this.renderModuleData = renderModuleData;
  }
}
