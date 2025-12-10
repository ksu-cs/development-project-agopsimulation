import SimManager from "../SimManager";
import { CROP_STAGES } from "../../States/StateClasses/CropState";

export default class CropGrowth extends SimManager {
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

    const rows = currentField.length;
    const cols = currentField[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const nextCrop = nextField[i][j];

        if (nextCrop.stage === CROP_STAGES.SEEDED) {
          nextCrop.currentGDD += gddToAdd;

          if (nextCrop.currentGDD >= nextCrop.requiredGDD) {
            nextCrop.stage = CROP_STAGES.MATURE;
            nextCrop.currentGDD = nextCrop.requiredGDD;
          }
        }
      }
    }
  }
}
