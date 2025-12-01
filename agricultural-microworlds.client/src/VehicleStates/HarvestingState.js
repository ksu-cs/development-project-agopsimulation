// VehicleStates/HarvestingState.js
import BaseState from "./BaseState.js";

export default class HarvestingState extends BaseState {
  enter() {
    // console.log("Entering HarvestingState", payload);
    this.sim.toggleHarvesting(true);
  }

  update() {
    //  console.log("HarvestingState updating", dt);
    return this.sim;
  }

  exit() {
    // console.log("Exiting HarvestingState");
    this.sim.toggleHarvesting(false);
  }
}
