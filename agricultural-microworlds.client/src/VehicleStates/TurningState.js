import BaseState from "./BaseState.js";

export default class TurningState extends BaseState {
    constructor(sim, degrees) {
        super(sim);
        this.degrees = degrees;
    }

    enter() {
        console.log("Starting turn:", this.degrees, "degrees");
    }

    async update(dt) {
        console.log("Turning", this.degrees, "degrees over", dt, "seconds");
        await this.sim.turnXDegrees(this.degrees);
    }

    exit() {
        console.log("Finished turning");
    }
}
