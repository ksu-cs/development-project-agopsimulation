import SimManager from "../SimManager";
import { CROP_STAGES } from "../../States/StateClasses/CropState";
import BitmapFieldState from "../../BinaryArrayAbstractionMethods/BitmapFieldState";

export default class CropManager extends SimManager {
  update(deltaTime, oldState, newState) {
    if (deltaTime <= 0) return;

    const weather = oldState.weather;
    /** @type {BitmapFieldState} */
    const currentField = oldState.field;
    const nextField = newState.field;

    if (!currentField || !nextField || !weather) return;

    const gddToAdd = weather.gddToApplyThisFrame;

    if (gddToAdd <= 0) {
      return;
    }

    for (let i = 0; i < currentField.rows; i++) {
      for (let j = 0; j < currentField.columns; j++) {
        /** @type {BitmapFieldState} */
        const fieldTile = currentField.getTileAt(j, i);

        if (fieldTile["stage"] == CROP_STAGES.SEEDED) {
          fieldTile["currentGDD"] += gddToAdd;

          if (fieldTile["currentGDD"] >= fieldTile["requiredGDD"]) {
            fieldTile["stage"] = CROP_STAGES.MATURE;
            fieldTile["currentGDD"] = fieldTile["requiredGDD"];
          }

          currentField.setTile(j, i, fieldTile);
        }
      }
    }
  }
}
