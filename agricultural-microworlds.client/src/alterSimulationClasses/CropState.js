// src/alterSimulationClasses/CropState.js

export const CROP_TYPES = {
  NONE: 'none',
  WHEAT: 'wheat'
};

export const CROP_STAGES = {
  UNPLANTED: 0,
  SEEDED: 1,
  MATURE: 2
};

export class CropState {
  constructor(type = CROP_TYPES.WHEAT) {
    this.type = type;
    this.stage = CROP_STAGES.MATURE; // Default to mature/wheat as per your original reset logic
    this.currentGDD = 0.0;
    this.requiredGDD = 1000.0; // The threshold needed to reach maturity
  }

  // Helper to check if crop is currently growing
  isGrowing() {
    return this.stage === CROP_STAGES.SEEDED;
  }

  // Helper to check if crop is fully grown
  isMature() {
    return this.stage === CROP_STAGES.MATURE;
  }

  // Helper to reset the crop (harvesting or tilling)
  reset() {
    this.stage = CROP_STAGES.UNPLANTED;
    this.currentGDD = 0.0;
  }

  // Helper to plant seeds
  plant() {
    this.stage = CROP_STAGES.SEEDED;
    this.currentGDD = 0.0;
  }
}