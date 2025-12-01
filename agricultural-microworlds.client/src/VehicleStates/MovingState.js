import BaseState from "./BaseState.js";

export default class MovingState extends BaseState {
    enter() {
        console.log("Entering Moving state");
        this.sim.isMoving = true;
    }

    async update(dt) {
        console.log("Moving for", dt, "seconds");
        await this.sim.moveForward(dt);
    }

    exit() {
        console.log("Exiting Moving state");
        this.sim.isMoving = false;
    }
}
