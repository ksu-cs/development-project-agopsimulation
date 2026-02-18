import { CropState } from "./CropState";

export default class FieldTileState {
  constructor() {
    this.cropState = new CropState();
    this.waterLevel = 1000;
    this.minerals = 1000;
  }
}

