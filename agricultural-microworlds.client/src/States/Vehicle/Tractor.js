export default class Tractor {
  constructor(canvas) {
    this.Sprite = new Image();
    this.Sprite.src = "./src/assets/combine-harvester.png";
    this.canvas = canvas;
    this.x = 250;
    this.y = 250;
    this.angle = 0;
    this.goalAngle = 0;
    this.turnSpeed = 90;
    this.weeksToWait = 0;
    this.nightFadeProgress = -1.0;
    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.animationId = -1;
    this.yieldScore = 0;
    this.basespeed = 20;
    this.speed = 0;
    this.fuel = 100;
    this.implement = "";
    this.implementIsOn = false;
    this.basket = 0;
    this.isfull = false;
    // this.MaxCapacity = 1000;
  }

  createTractor() {
    return new Tractor();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  GetTractPosit(tractor) {
    return { x: tractor.x, y: tractor.y };
  }

  moveForward(delta) {
    const rad = (this.angle * Math.PI) / 180;
    this.x += Math.cos(rad) * this.speed * delta;
    this.y += Math.sin(rad) * this.speed * delta;
    this.handleCollisions();
  }

  startMoving() {
    this.isMoving = true;
  }

  stopMovement() {
    this.isMoving = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = -1;
    }
  }

  toggleHarvesting(isOn) {
    this.isHarvestingOn = isOn;
    if (isOn) this.isSeedingOn = false;
    this.isSeedingOn = false;
  }
  toggleSeeding(isOn) {
    this.isSeedingOn = isOn;
    if (isOn) this.isSeedingOn = true;
    this.isHarvestingOn = false;
  }

  turn(degrees) {
    this.angle = (this.angle + degrees) % 360;
  }
}
