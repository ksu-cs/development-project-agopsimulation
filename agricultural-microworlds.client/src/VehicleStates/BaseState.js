// BaseState.js

import { simulation } from "../SimulationState.js";

export default class BaseState {
  constructor(sim = simulation) {
    // reference to the SimulationState instance
    this.sim = sim;
  }

  // called when entering this state
  enter(payload) {
    // optional payload, default is undefined
    return payload;
  }

  // called on each update/tick
  update(dt) {
    // dt is the delta time (optional)
    return dt;

    //can do change then return this.sim
    //return this.sim;
  }

  // called when exiting this state
  exit() {
    // cleanup or reset logic
  }
}
