export default class timeStepData {
  constructor(
    cameraX,
    cameraY,
    // angle,
    yieldScore,
    // tractorWorldX,
    // tractorWorldY,
    nightFadeProgress,
    field,
    tractor,
  ) {
    this.cameraX = cameraX;
    this.cameraY = cameraY;
    // this.angle = angle;
    this.yieldScore = yieldScore;
    // this.tractorWorldX = tractorWorldX;
    // this.tractorWorldY = tractorWorldY;
    this.nightFadeProgress = nightFadeProgress;
    this.field = field;
    this.tractor = tractor;
  }
}
