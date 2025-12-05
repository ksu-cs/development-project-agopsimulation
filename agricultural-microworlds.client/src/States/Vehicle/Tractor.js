export default class Tractor {
  constructor() {
    this.basespeed = 20;
    this.speed = 0;
    this.y = 0;
    this.x = 0;
    this.turnspeed = 90;
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

  turn(degrees) {
    this.angle = (this.angle + degrees) % 360;
  }

  CheckIfPlantInFront(type) {
    const topLeft = { x: -this.FRAME_WIDTH / 2, y: -this.FRAME_HEIGHT / 2 };
    const topRight = { x: this.FRAME_WIDTH / 2, y: -this.FRAME_HEIGHT / 2 };
    const bottomRight = { x: this.FRAME_WIDTH / 2, y: this.FRAME_HEIGHT / 2 };
    const bottomLeft = { x: -this.FRAME_WIDTH / 2, y: this.FRAME_HEIGHT / 2 };
    const center = {
      x: this.tractorWorldX + this.FRAME_WIDTH / 2,
      y: this.tractorWorldY + this.FRAME_HEIGHT / 2,
    };

    const corners = [
      this.rotatePoint(topLeft.x, topLeft.y, this.angle, center.x, center.y), //topLeft
      this.rotatePoint(topRight.x, topRight.y, this.angle, center.x, center.y), //topRight
      this.rotatePoint(
        bottomRight.x,
        bottomRight.y,
        this.angle,
        center.x,
        center.y,
      ), // bottomRight
      this.rotatePoint(
        bottomLeft.x,
        bottomLeft.y,
        this.angle,
        center.x,
        center.y,
      ), // bottomLeft
    ];

    const frontSide = [corners[1], corners[2]]; // right side of image when angle = 0
    return this.detectWhatTilesAreHit(
      frontSide[0].x,
      frontSide[0].y,
      frontSide[1].x,
      frontSide[1].y,
      type,
    );
  }
  handleCollisions() {
    this.CheckIfPlantInFront(-1);
  }
}
