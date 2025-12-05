import { StateManager } from "../States/StateManager";

export default class Simulation {
    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContxt("2d");

        // Initialize state manager
        this.stateManager = new StateManager();
        this.initializeStates();

        // Initialize sim managers
        this.managers = [];

    }

    initializeStates() {

    }

}