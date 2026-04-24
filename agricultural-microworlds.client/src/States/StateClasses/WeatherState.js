export default class WeatherState {
  constructor() {
    this.csvLines = []; // Stores the parsed CSV data
    this.startDate = null; // Stores the simulation start date

    // Time Tracking
    this.currentDayIndex = 0;
    this.timeAccumulator = 480; // Counts up to 24.0 * 60 (1 second = 1 minute)
    this.speedMultiplier = 1; // Controls simulation speed

    // GDD Tracking
    this.cumulativeGDD = 0;

    this.gddToApplyThisFrame = 0;
  }

  clone() {
    const s = new WeatherState();
    s.csvLines = this.csvLines;
    s.startDate = this.startDate ? new Date(this.startDate) : null;

    s.currentDayIndex = this.currentDayIndex;
    s.timeAccumulator = this.timeAccumulator;
    s.speedMultiplier = this.speedMultiplier;
    s.isWaiting = this.isWaiting;

    s.cumulativeGDD = this.cumulativeGDD;
    s.gddToApplyThisFrame = this.gddToApplyThisFrame;
    return s;
  }

  /**
   * Gets the current speed multiplier
   * @returns {number} The speed multi at which the game should run at.
   */
  getSpeedMultiplier() {
    return this.speedMultiplier;
  }
}
