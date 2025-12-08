import { SimManager } from "./SimManager";
import { CROP_STAGES } from "../States/Crops/CropState";

export default class CropGrowth extends SimManager {
  update(deltaTime, oldState, newState) {
    if (deltaTime <= 0) return;

    // Get old state
    const currentField = oldState?.field || oldState?.get?.("field");

    const nextField = newState?.field || newState?.get?.("field");

    if (!currentField || !nextField) return;

    const rows = currentField.length;
    const cols = currentField[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const crop = currentField[i][j];

        if (crop.stage === CROP_STAGES.SEEDED) {
          // Logic
        }

        // Ensure the new state has a valid object (Cloning logic)
        nextField[i][j] = crop;
      }
    }
  }
}
