export const CROP_STAGES = {
  UNPLANTED: 0,
  SEEDED: 1,
  MATURE: 2
};

// State of crop at a snapshot
export class CropState {
  constructor() {
    // Default to MATURE
    this.stage = CROP_STAGES.MATURE; 
    this.currentGDD = 0.0;
    this.requiredGDD = 1000.0; // The GDD needed to reach maturity
  }

  isGrowing() {
    return this.stage === CROP_STAGES.SEEDED;
  }

  isMature() {
    return this.stage === CROP_STAGES.MATURE;
  }

  isUnplanted() {
    return this.stage === CROP_STAGES.UNPLANTED;
  }

  reset() {
    this.stage = CROP_STAGES.UNPLANTED;
    this.currentGDD = 0.0;
  }

  // Plant Seeds
  plant() {
    this.stage = CROP_STAGES.SEEDED;
    this.currentGDD = 0.0;
  }

  clone() {
    const newCrop = new CropState();
    newCrop.stage = this.stage;
    newCrop.currentGDD = this.currentGDD;
    newCrop.requiredGDD = this.requiredGDD;
    return newCrop;
  }



}