import BaseState from "./BaseState.js";

export default class IdleState extends BaseState {
  enter() {
    console.log("Entering Idle state");
    this.sim.isMoving = false;
  }

  update() {
    // Idle does nothing
    //console.log("Idling...");
  }

  exit() {
    // console.log("Exiting Idle state");
  }
}
