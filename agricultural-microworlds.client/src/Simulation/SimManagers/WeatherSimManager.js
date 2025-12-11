import SimManager from "../SimManager";

export default class WeatherManager extends SimManager {
  constructor() {
    super();
    this.WHEAT_BASE_TEMP = 10;
    this.weatherDataCache = null;
  }

  async loadWeatherData(stateManager, stationId, startDateString) {
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

      this.weatherDataCache = {
        csvLines: parsedCsv,
        startDate: startDate,
      };

      const weatherState = stateManager.getState("weather");
      if (weatherState) {
        this.applyCacheToState(weatherState);
      }

      console.log(`Weather Loaded: ${parsedCsv.length} days.`);
    } catch (e) {
      console.error("Failed to load weather data", e);
    }
  }

  applyCacheToState(weatherState) {
    if (!this.weatherDataCache) return;

    weatherState.csvLines = this.weatherDataCache.csvLines;
    weatherState.startDate = new Date(this.weatherDataCache.startDate);
    
    weatherState.currentDayIndex = 0;
    weatherState.cumulativeGDD = 0;
    weatherState.gddToApplyThisFrame = 0;
    
    weatherState.timeAccumulator = 0.0;
    
    if (!weatherState.speedMultiplier) weatherState.speedMultiplier = 1;
  }

  update(deltaTime, oldState, newState) {
    const oldWeather = oldState.weather;
    const newWeather = newState.weather;

    newWeather.gddToApplyThisFrame = 0;

    if (!oldWeather.csvLines || oldWeather.csvLines.length === 0) return;

    // deltaTime is already simulated time (scaled by speed)
    newWeather.timeAccumulator += deltaTime;

    if (newWeather.timeAccumulator >= 1.0) {
      newWeather.timeAccumulator -= 1.0; 
      this.advanceDay(oldWeather, newWeather);
    }
  }

  advanceDay(oldWeather, newWeather) {
    if (oldWeather.currentDayIndex >= oldWeather.csvLines.length) return;

    const dayData = oldWeather.csvLines[oldWeather.currentDayIndex];
    const temp = parseFloat(dayData[2]);
    const dailyGDD = Math.max(0, temp - this.WHEAT_BASE_TEMP);

    newWeather.cumulativeGDD = oldWeather.cumulativeGDD + dailyGDD;
    newWeather.currentDayIndex = oldWeather.currentDayIndex + 1;
    newWeather.gddToApplyThisFrame = dailyGDD;
  }
}