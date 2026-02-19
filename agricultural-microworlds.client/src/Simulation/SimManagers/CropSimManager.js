import SimManager from "../SimManager";
import { CROP_STAGES } from "../../States/StateClasses/CropState";
import {
  ChangeFieldTile,
  GetCropState,
  GetFieldTile,
  TILE_BYTE_SIZE,
} from "../../BinaryArrayAbstractionMethods/BinaryFieldAbstraction";

export default class CropManager extends SimManager {
  update(deltaTime, oldState, newState) {
    if (deltaTime <= 0) return;

    const weather = oldState.weather;
    const currentField = oldState.field;
    const nextField = newState.field;

    if (!currentField || !nextField || !weather) return;

    const gddToAdd = weather.gddToApplyThisFrame;

    if (gddToAdd <= 0) {
      return;
    }

    const totalBytes = currentField.length;
    const totalTiles = totalBytes / TILE_BYTE_SIZE;
    const width = Math.sqrt(totalTiles);

    const rows = width;
    const cols = width;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const fieldTile = GetFieldTile(currentField, j, i, cols);
        const cropObj = fieldTile.cropState;

        if (cropObj.stage == CROP_STAGES.SEEDED) {
          cropObj.currentGDD += gddToAdd;

          if (cropObj.currentGDD >= cropObj.requiredGDD) {
            cropObj.stage = CROP_STAGES.MATURE;
            cropObj.currentGDD = cropObj.requiredGDD;
          }

          fieldTile.cropState = cropObj;

          ChangeFieldTile(nextField, fieldTile, j, i, cols);
        }
      }
    }
  }
}
