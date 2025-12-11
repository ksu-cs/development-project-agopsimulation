export default class CropRenderer {
  constructor(ctx, field, tileWidth, tileHeight) {
    this.ctx = ctx; // Canvas 2D context
    this.field = field; // 2D array of Crop objects
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

    // Load crop images
    this.dirtImage = new Image();
    this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

    this.seedImage = new Image();
    this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";

    this.wheatImage = new Image();
    this.wheatImage.src = "./src/assets/wheat.png";
  }

  getSpriteForCrop(crop) {
    switch (crop.stage) {
      case 0:
        return this.dirtImage;
      case 1:
        return this.seedImage;
      case 2:
      case 3:
        return this.wheatImage;
      default:
        return this.dirtImage;
    }
  }

  drawField(cameraX = 0, cameraY = 0) {
    for (let y = 0; y < this.field.length; y++) {
      for (let x = 0; x < this.field[y].length; x++) {
        const crop = this.field[y][x];
        const screenX = x * this.tileWidth - cameraX;
        const screenY = y * this.tileHeight - cameraY;
        const sprite = this.getSpriteForCrop(crop);

        this.ctx.drawImage(
          sprite,
          screenX,
          screenY,
          this.tileWidth,
          this.tileHeight,
        );
      }
    }
  }
}
