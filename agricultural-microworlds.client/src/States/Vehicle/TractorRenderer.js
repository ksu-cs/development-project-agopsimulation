export default class TractorRenderer {
  constructor(ctx, sprite, frameWidth, frameHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
  }

  draw(tractor, cameraX, cameraY) {
    const screenX = tractor.x - cameraX;
    const screenY = tractor.y - cameraY;

    const normalizedAngle = ((tractor.angle % 360) + 360) % 360;
    var angleInRadians = (normalizedAngle * Math.PI) / 180;

    // tractorsprite
    this.ctx.save();
    this.ctx.translate(
      screenX + this.frameWidth / 2,
      screenY + this.frameHeight / 2,
    );
    this.ctx.rotate(angleInRadians);
    // Draw the sprite centered
    this.ctx.drawImage(
      this.sprite,
      -this.frameWidth / 2,
      -this.frameHeight / 2,
      this.frameWidth,
      this.frameHeight,
    );
    this.ctx.restore();

    document.getElementById("debug").innerHTML = //debugging window
      `World Position: (${Math.round(tractor.x)}, ${Math.round(tractor.y)})<br>` +
      `Camera Position: (${Math.round(cameraX)}, ${Math.round(cameraY)})<br>` +
      `Screen Position: (${Math.round(screenX)}, ${Math.round(screenY)})<br>` +
      `Angle: ${normalizedAngle}°<br>`;
  }
}
