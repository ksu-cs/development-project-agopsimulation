// SimulationState.js
// A lightweight container for the data + functions your Vehicle States need.
// You can expand or redirect these to your existing Simulation class.

// SimulationState.js
export default class SimulationState {
  constructor(machine) {
    this.machine = machine;

    this.isMoving = false;
    this.isHarvesting = false;
    this.isSeeding = false;
  }

  async moveForward(duration) {
    console.log("Moving forward for", duration);
    this.isMoving = true;
    await new Promise((r) => setTimeout(r, duration * 100));
    this.isMoving = false;
  }

  async turnXDegrees(degrees) {
    console.log("Turning", degrees, "degrees");
    await new Promise((r) => setTimeout(r, Math.abs(degrees) * 10));
  }

  async waitXWeeks(weeks) {
    console.log("Waiting for", weeks, "weeks");
    await new Promise((r) => setTimeout(r, weeks * 50));
  }

  toggleHarvesting(on) {
    this.isHarvesting = on;
    console.log("Harvesting:", on);
  }

  toggleSeeding(on) {
    this.isSeeding = on;
    console.log("Seeding:", on);
  }
}

export const simulation = new SimulationState(null);
