export default class WeatherState{
  constructor() {
    this.csvLines = []; // Stores the parsed CSV data
    this.startDate = null; // Stores the simulation start date

    // Time Tracking
    this.currentDayIndex = 0;
    this.timeAccumulator = 0; // Counts up to 1.0 (1 second = 1 day)
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

    s.cumulativeGDD = this.cumulativeGDD;
    s.gddToApplyThisFrame = this.gddToApplyThisFrame;
    return s;
  }
}
