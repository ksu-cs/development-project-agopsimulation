export default class MovingState {
  constructor(vehicle, duration) {
    this.vehicle = vehicle;
    this.duration = duration;
  }

  async enter() {
    console.log("Entering Moving state");
    await this.vehicle.moveForward(this.duration);
  }

  async update(dt) {
     await this.vehicle.moveForward(dt); 
  }

  async exit() {
    console.log("Exiting Moving state");
  }
}
