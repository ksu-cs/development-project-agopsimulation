export default class Tractor {
  constructor() {
    this.basespeed = 20;
    this.speed = 0;
    this.y = 0;
    this.x = 0;
    this.turnspeed = 90;
    this.fuel = 100;
    this.implement = ""
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

GetTractPosit(tractor){
  return { x: tractor.x, y: tractor.y };
}

  moveForward(delta) {
    const rad = this.angle * Math.PI / 180;
    this.x += Math.cos(rad) * this.speed * delta;
    this.y += Math.sin(rad) * this.speed * delta;
  }

  turn(degrees) {
    this.angle = (this.angle + degrees) % 360;
  }
}