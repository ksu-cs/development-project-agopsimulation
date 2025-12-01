import FiniteStateManager from "./FiniteStateManager.js";
import MovingState from "./vehicleStates/MovingState.js";
import HarvestingState from "./vehicleStates/HarvestingState.js";
import IdleState from "./vehicleStates/IdleState.js";
import TurningState from "./vehicleStates/TurningState.js";
import WaitingState from "./vehicleStates/WaitingState.js";


class Vehicle {
  constructor() {
    this.isMoving = false;
    this.fsm = new FiniteStateManager(this);
  }

// moveForward function that moves over time
async moveForward(duration) {
  this.isMoving = true; // FSM already sets this on entering MovingState

  return new Promise((resolve) => {
    let simulationTimeElapsed = 0;
    const simulationDuration = duration;
    let lastFrameTime = Date.now();

    const moveX = this.SPEED * Math.cos((this.angle * Math.PI) / 180);
    const moveY = this.SPEED * Math.sin((this.angle * Math.PI) / 180);

    const animate = () => {
      const now = Date.now();
      const realDeltaMs = now - lastFrameTime;
      lastFrameTime = now;

      // Convert real time to simulation time
      const simDelta = (realDeltaMs / 1000) * this.speedMultiplier;
      simulationTimeElapsed += simDelta;

      if (simulationTimeElapsed < simulationDuration && this.isMoving) {
        // Move tractor
        this.tractorWorldX += moveX * simDelta;
        this.tractorWorldY += moveY * simDelta;

        this.updateTime(simDelta);
        this.updateCamera();
        this.drawFieldAndTractor();

        this.animationId = requestAnimationFrame(animate);
      } else {
        this.isMoving = false; // FSM can now exit MovingState
        resolve();
      }
    };

    animate();
  });
}

}
