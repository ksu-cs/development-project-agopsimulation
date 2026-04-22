import SimManager from "../SimManager";
import { CROP_STAGES, CROP_TYPES } from "../../States/StateClasses/CropState";
import BitmapFieldState from "../../BinaryArrayAbstractionMethods/BitmapFieldState";

export default class CropManager extends SimManager {
  update(deltaTime, oldState, newState) {
    if (deltaTime <= 0) return;

    const weather = oldState.weather;
    /** @type {BitmapFieldState} */
    const currentField = oldState.field;
    const nextField = newState.field;

    if (!currentField || !nextField || !weather) return;

    const gddToAdd = weather.gddToApplyThisFrame ?? 0;
    const rainToApply = weather.rainToApplyThisFrame ?? 0;

    const didAdvanceDay = gddToAdd > 0 || rainToApply > 0;
    if (!didAdvanceDay) return;

    const CROP_WATER_USE = {
      [CROP_TYPES.EMPTY]: 0.0,
      [CROP_TYPES.WHEAT]: 0.002,
      [CROP_TYPES.CORN]: 0.003,
      [CROP_TYPES.SOY]: 0.0025,
    };

    const CROP_WATER_RULES = {
      [CROP_TYPES.WHEAT]: { stressStart: 0.18 },
      [CROP_TYPES.CORN]: { stressStart: 0.2 },
      [CROP_TYPES.SOY]: { stressStart: 0.18 },
    };

    for (let i = 0; i < currentField.rows; i++) {
      for (let j = 0; j < currentField.columns; j++) {
        const fieldTile = currentField.getTileAt(j, i);

        let waterLevel = fieldTile["waterLevel"] ?? 0;
        let yieldMultiplier = fieldTile["yieldMultiplier"] ?? 1.0;
        const cropType = fieldTile["type"];

        // rain adds water
        waterLevel = Math.min(1.0, waterLevel + rainToApply * 0.001);

        // crop uses water
        const waterUse = CROP_WATER_USE[cropType] ?? 0;
        waterLevel = Math.max(0.0, waterLevel - waterUse);

        // water stress
        const rules = CROP_WATER_RULES[cropType];
        let waterStress = 0.0;

        if (rules && waterLevel < rules.stressStart) {
          waterStress = (rules.stressStart - waterLevel) / rules.stressStart;
        }

        waterStress = Math.max(0.0, Math.min(1.0, waterStress));

        // hurt yield
        yieldMultiplier = Math.max(0.0, yieldMultiplier - waterStress * 0.01);

        fieldTile["waterLevel"] = waterLevel;
        fieldTile["stress"] = waterStress;
        fieldTile["yieldMultiplier"] = yieldMultiplier;

        if (fieldTile["stage"] == CROP_STAGES.SEEDED) {
          fieldTile["currentGDD"] += gddToAdd;

          if (fieldTile["currentGDD"] >= fieldTile["requiredGDD"]) {
            fieldTile["stage"] = CROP_STAGES.MATURE;
            fieldTile["currentGDD"] = fieldTile["requiredGDD"];
          }
        }

        nextField.setTile(j, i, fieldTile);
      }
    }
  }
}
