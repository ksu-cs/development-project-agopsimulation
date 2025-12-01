// src/alterSimulationClasses/CropState.js

export const CROP_STAGES = {
  UNPLANTED: 0,
  SEEDED: 1,
  MATURE: 2
};

export class CropState {
  constructor() {
    // Default to MATURE
    this.stage = CROP_STAGES.MATURE; 
    this.currentGDD = 0.0;
    this.requiredGDD = 1000.0; // The threshold needed to reach maturity
  }

  // Helper: Is the crop currently growing?
  isGrowing() {
    return this.stage === CROP_STAGES.SEEDED;
  }

  // Helper: Is the crop ready for harvest?
  isMature() {
    return this.stage === CROP_STAGES.MATURE;
  }

  // Helper: Is the tile empty dirt?
  isUnplanted() {
    return this.stage === CROP_STAGES.UNPLANTED;
  }

  // Action: Harvest or Destroy
  reset() {
    this.stage = CROP_STAGES.UNPLANTED;
    this.currentGDD = 0.0;
  }

  // Action: Plant Seeds
  plant() {
    this.stage = CROP_STAGES.SEEDED;
    this.currentGDD = 0.0;
  }
}