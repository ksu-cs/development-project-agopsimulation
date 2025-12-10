export default class Tractor {
  constructor(x = 250, y = 250, speedMultiplier = 0) {
    this.Sprite = new Image();
    this.Sprite.src = "./src/assets/combine-harvester.png";

    // Position & Movement
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.goalAngle = 0;
    this.turnSpeed = 90;
    this.basespeed = 20;
    this.speedMultiplier = speedMultiplier;

    this.isMoving = false;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.implement = "";
    this.implementIsOn = false;

    //Storage / capacity
    this.fuel = 100;
    this.basket = 0;
    this.isfull = false;

    // Optional collision callback
    this.onCollision = null; // (tractor) => {}
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

  /* ------------------------------ Update Loop ------------------------------ */
  update(dt) {
    // Smooth rotation first
    this.updateRotation(dt);

    // Forward movement
    if (this.isMoving) {
      this.updateMovement(dt);
    }

    // Collision detection
    if (this.onCollision) {
      this.onCollision(this);
    }
  }

  updateMovement(dt) {
    const rad = (this.angle * Math.PI) / 180;
    this.x += Math.cos(rad) * this.speed * this.speedMultiplier * dt;
    this.y += Math.sin(rad) * this.speed * this.speedMultiplier * dt;
  }

  updateRotation(dt) {
    if (this.angle === this.goalAngle) return;

    const diff = this.goalAngle - this.angle;
    const absDiff = Math.abs(diff);

    if (absDiff < 0.01) {
      this.angle = this.goalAngle;
      return;
    }

    const rotateStep = Math.min(this.turnSpeed * dt, absDiff);
    const alpha = rotateStep / absDiff;

    this.angle = this.angle * (1 - alpha) + this.goalAngle * alpha;
  }

  /* ------------------------------ Movement Controls ------------------------------ */

  turnToward(degrees) {
    this.goalAngle = (this.goalAngle + degrees) % 360;
  }

  /* ------------------------------ Utilities ------------------------------ */

  // Rotate any point (x0, y0) around a center (centerX, centerY) by angle degrees
  static rotatePoint(x0, y0, angle, centerX, centerY) {
    const rad = angle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: centerX + (x0 * cos - y0 * sin),
      y: centerY + (x0 * sin + y0 * cos),
    };
  }

  // Example: get rotated corners for collision box (optional)
  getCorners(width, height) {
    const halfW = width / 2;
    const halfH = height / 2;
    return [
      Tractor.rotatePoint(-halfW, -halfH, this.angle, this.x, this.y),
      Tractor.rotatePoint(halfW, -halfH, this.angle, this.x, this.y),
      Tractor.rotatePoint(halfW, halfH, this.angle, this.x, this.y),
      Tractor.rotatePoint(-halfW, halfH, this.angle, this.x, this.y),
    ];
  }
}
