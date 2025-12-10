export default class Tractor {
  constructor(x = 250, y = 250, speedMultiplier = 0) {
    this.Sprite = new Image();
    this.Sprite.src = "./src/assets/combine-harvester.png";
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.turnSpeed = 90;
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.animationId = -1;
    this.basespeed = 20;
    this.speedMultiplier = speedMultiplier;
    this.fuel = 100;
    this.implement = "";
    this.implementIsOn = false;
    this.basket = 0;
    this.isfull = false;
    // this.MaxCapacity = 1000;
  }

  addToPosition(dX, dY) {
    this.x += dX;
    this.y += dY;
  }

  getTractorPosition() {
    return { x: this.x, y: this.y };
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  getTractorAngle() {
    return this.angle;
  }

  setTractorAngle(angle) {
    this.angle = angle;
  }

  setSpeedMultiplyer(mult) {
    this.speedMultiplier = mult;
  }

  getTractorMovementState() {
    return this.isMoving;
  }

  setTractorMovementState(isMoving) {
    this.isMoving = isMoving;
  }

  startMoving() {
    this.isMoving = true;
  }

  stopMovement() {
    this.isMoving = false;
  }

  getTractorHarvestingState() {
    return this.isHarvestingOn;
  }

  toggleHarvesting(isOn) {
    this.isHarvestingOn = isOn;
    if (isOn) this.isSeedingOn = false;
  }

  getTractorSeedingState() {
    return this.isSeedingOn;
  }

  toggleSeeding(isOn) {
    this.isSeedingOn = isOn;
    if (isOn) this.isHarvestingOn = false;
  }

  turn(degrees) {
    this.angle = (this.angle + degrees) % 360;
  }
}
