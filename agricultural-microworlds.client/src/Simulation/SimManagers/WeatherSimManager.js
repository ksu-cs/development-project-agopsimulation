import SimManager from "../SimManager";

export default class WeatherManager extends SimManager {
  constructor() {
    super();
    this.WHEAT_BASE_TEMP = 10;
  }

  /**
   * Helper to load data (Call this from your UI "Run" button before starting Sim)
   * This modifies the Initial State directly.
   */
  async loadWeatherData(stateManager, stationId, startDateString) {
    // Logic adapted from fetchData()
    const [year, month, day] = startDateString.split("-").map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 365);

    const startFmt = startDateString.replaceAll("-", "");
    const endFmt = `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, "0")}${endDate.getDate().toString().padStart(2, "0")}`;

    const url = `https://mesonet.k-state.edu/rest/stationdata?stn=${stationId}&int=day&t_start=${startFmt}000000&t_end=${endFmt}000000&vars=TEMP2MAVG`;

    try {
      const response = await fetch(url);
      const data = await response.text();
      const lines = data.trim().split("\n");
      const parsedCsv = lines.slice(1).map((line) => line.split(","));

      // Update the State
      const weatherState = stateManager.getState("weather");
      weatherState.csvLines = parsedCsv;
      weatherState.startDate = startDate;
      weatherState.currentDayIndex = 0;
      weatherState.cumulativeGDD = 0;

      console.log(`Weather Loaded: ${parsedCsv.length} days.`);
    } catch (e) {
      console.error("Failed to load weather data", e);
    }
  }

  update(deltaTime, oldState, newState) {
    // Get State
    const oldWeather = oldState.weather;
    const newWeather = newState.weather;

    // Reset GDD trigger
    newWeather.gddToApplyThisFrame = 0;

    if (!oldWeather.csvLines || oldWeather.csvLines.length === 0) return;

    // Advance Time
    // Add time based on speed multiplier
    newWeather.timeAccumulator += deltaTime * oldWeather.speedMultiplier;

    // Check for Day Switch (Every 1.0 accumulated units = 1 Day)
    if (newWeather.timeAccumulator >= 1.0) {
      newWeather.timeAccumulator -= 1.0; // Keep the remainder
      this.advanceDay(oldWeather, newWeather);
    }
  }

  advanceDay(oldWeather, newWeather) {
    // Bounds check
    if (oldWeather.currentDayIndex >= oldWeather.csvLines.length) return;

    // Get Temp from CSV
    const dayData = oldWeather.csvLines[oldWeather.currentDayIndex];
    const temp = parseFloat(dayData[2]);

    // Calculate GDD
    const dailyGDD = Math.max(0, temp - this.WHEAT_BASE_TEMP);

    // Update New State
    newWeather.cumulativeGDD = oldWeather.cumulativeGDD + dailyGDD;
    newWeather.currentDayIndex = oldWeather.currentDayIndex + 1;

    // Signal CropManager to grow this frame
    newWeather.gddToApplyThisFrame = dailyGDD;
  }
}
