export default class TractorRenderer {
  constructor(ctx, sprite, frameWidth, frameHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
  }

  draw(tractor, cameraX, cameraY) {
    // Convert world → screen
    const screenX = tractor.x - cameraX;
    const screenY = tractor.y - cameraY;

    const angleRad = (tractor.angle * Math.PI) / 180;

    this.ctx.save();

    // Move to tractor center before rotating
    this.ctx.translate(
      screenX + this.frameWidth / 2,
      screenY + this.frameHeight / 2,
    );

    // Rotate canvas
    this.ctx.rotate(angleRad);

    // Draw the sprite centered
    this.ctx.drawImage(
      this.sprite,
      -this.frameWidth / 2,
      -this.frameHeight / 2,
      this.frameWidth,
      this.frameHeight,
    );

    this.ctx.restore();
  }
}
//Performance tip: If rendering many tractors, consider precomputing the rotated image in an offscreen canvas
//(optional, only if you notice lag).
