import SimManager from "../SimManager";
import { CROP_STAGES } from "../../States/StateClasses/CropState";
import { ChangeFieldTile, GetCropState, TILE_BYTE_SIZE } from "/workspaces/development-project-agopsimulation/agricultural-microworlds.client/src/BinaryArrayAbstractionMethods/BinaryFieldAbstraction.js";

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
        const cropObj = GetCropState(currentField, j, i, cols);

        if (cropObj.stage == CROP_STAGES.SEEDED) {
          cropObj.currentGDD += gddToAdd;

          if (cropObj.currentGDD >= cropObj.requiredGDD) {
            cropObj.stage = CROP_STAGES.MATURE;
            cropObj.currentGDD = cropObj.requiredGDD;
          }

          ChangeFieldTile(nextField, cropObj, j, i, cols);

        }
      }
    }
  }
}
