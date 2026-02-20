export const CROP_STAGES = {
  UNPLANTED: 0,
  SEEDED: 1,
  MATURE: 2,
};

export const CROP_TYPES = {
  EMPTY: 0,
  WHEAT: 1,
  CORN: 2,
  SOY: 3,
};

const CROP_GDDS = [];
CROP_GDDS[CROP_TYPES.UNPLANTED] = 0;
CROP_GDDS[CROP_TYPES.WHEAT] = 1000.0;
CROP_GDDS[CROP_TYPES.CORN] = 1300.0;
CROP_GDDS[CROP_TYPES.SOY] = 900.0;

// State of crop at a snapshot
export class CropState {
  constructor() {
    // Default to MATURE
    this.stage = CROP_STAGES.UNPLANTED;
    this.type = CROP_TYPES.EMPTY;
    this.currentGDD = 0.0;
    this.requiredGDD = 0; // The GDD needed to reach maturity
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

  /**
   * Changes the crop type and the releating properties to align with that
   * @param {CROP_TYPES} cropType the crop type to change to
   */
  changeCropType(cropType) {
    this.type = cropType;
    this.requiredGDD = CROP_GDDS[cropType];
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
    this.changeCropType(CROP_TYPES.EMPTY);
    this.stage = CROP_STAGES.UNPLANTED;
    this.currentGDD = 0.0;
  }

  /**
   * Plants the seed for this crop
   * @param {CROP_TYPES} cropType The type of crop to change the seeded value to
   */
  plant(cropType) {
    if (cropType === CROP_TYPES.EMPTY) return;
    this.stage = CROP_STAGES.SEEDED;
    this.currentGDD = 0.0;
    if (cropType != this.type) {
      this.changeCropType(cropType);
    }
  }

  clone() {
    const newCrop = new CropState();
    newCrop.stage = this.stage;
    newCrop.currentGDD = this.currentGDD;
    newCrop.requiredGDD = this.requiredGDD;
    return newCrop;
  }
}
