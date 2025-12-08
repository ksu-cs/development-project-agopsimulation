export default class timeStepData {
  constructor(
    cameraX,
    cameraY,
    angle,
    yieldScore,
    tractorWorldX,
    tractorWorldY,
    nightFadeProgress,
    field,
  ) {
    this.cameraX = cameraX; // needed to draw field
    this.cameraY = cameraY; // needed to draw field
    this.angle = angle; // needed to draw tractor
    this.yieldScore = yieldScore;
    this.tractorWorldX = tractorWorldX; // needed to draw field
    this.tractorWorldY = tractorWorldY; // needed to draw field
    this.nightFadeProgress = nightFadeProgress; // needed to represent night
    this.field = field; // needed to draw field
  }
}