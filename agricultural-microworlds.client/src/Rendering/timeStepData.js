import BitmapFieldState from "../BinaryArrayAbstractionMethods/BitmapFieldState";
import RenderState from "./renderState";

/*
 * Snap shot of simulation state at specific moment in time
 * Created by simulationEngine and sent to drawCanvas and StatsContainer to render frame and simulation stats
 */

export default class timeStepData {
  /**
   * @param {Object.<any, RenderState>} renderModules
   */
  constructor(statData, renderModuleData) {
    /** @type {Object.<any, any>} */
    this.statData = statData;
    /**@type {Object.<any, RenderState>} */
    this.renderModuleData = renderModuleData;
  }
}
