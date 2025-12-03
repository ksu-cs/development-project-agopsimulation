import BaseState from "./BaseState.js";

export default class WaitingState extends BaseState {
    constructor(sim, weeks) {
        super(sim);
        this.weeks = weeks;
    }

    enter() {
        console.log("Waiting for", this.weeks, "weeks");
    }

    async update() {
        console.log("Fast-forwarding", this.weeks, "weeks");
        await this.sim.fastForwardWeeks(this.weeks);
    }

    exit() {
        console.log("Finished waiting");
    }
}
