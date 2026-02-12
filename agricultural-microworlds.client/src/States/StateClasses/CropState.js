import State from "../State";

export const CROP_STAGES = {
  UNPLANTED: 0,
  SEEDED: 1,
  MATURE: 2,
};

export const CROP_TYPES = {
  WHEAT: 0,
};

// State of crop at a snapshot
export class CropState extends State {
  constructor() {
    super();
    // Default to MATURE
    this.stage = CROP_STAGES.MATURE;
    this.type = CROP_TYPES.WHEAT;
    this.currentGDD = 0.0;
    this.requiredGDD = 1000.0; // The GDD needed to reach maturity
  }

  updateGrowth(deltaGDD) {
    if (this.stage !== CROP_STAGES.SEEDED) return;

    // Add the delta
    this.currentGDD += deltaGDD;

    // Cap at required GDD
    if (this.currentGDD >= this.requiredGDD) {
      this.currentGDD = this.requiredGDD;
      this.stage = CROP_STAGES.MATURE;
    }
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
    return true;
  }

  clone() {
    const newCrop = new CropState();
    newCrop.stage = this.stage;
    newCrop.currentGDD = this.currentGDD;
    newCrop.requiredGDD = this.requiredGDD;
    return newCrop;
  }
}
