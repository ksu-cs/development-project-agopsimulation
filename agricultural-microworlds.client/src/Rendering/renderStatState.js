import RenderState from "./renderState";

export default class RenderStatState extends RenderState {
  constructor() {
    super({}, 0);
  }

  render(context, data) {
    const yieldEl = document.getElementById("scoreText");
    if (yieldEl) yieldEl.innerText = "Yield: " + data.yieldScore;

    const dateEl = document.getElementById("dateText");
    if (dateEl) dateEl.innerText = "Date: " + data.currentDate;

    const timeEl = document.getElementById("timeText");
    if (timeEl) {
      // Format the current time into hours, minutes, and AM/PM.
      const totalHours = 1 + Math.floor(data.currentTime % 12.0);
      const totalMinutes = Math.floor(60 * (data.currentTime % 1.0));

      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = totalMinutes.toString().padStart(2, "0");
      const formattedMeridiem =
        data.currentTime % 23.0 >= 11.0 ? "P.M." : "A.M.";
      timeEl.innerText = `Time: ${formattedHours}:${formattedMinutes} ${formattedMeridiem}`;
    }

    const gddEl = document.getElementById("gddText");
    if (gddEl) gddEl.innerText = "GDD: " + data.cumulativeGDD;

    const rainEl = document.getElementById("rainText");
    const r = data.cumulativeRain ?? 0;
    if (rainEl)
      rainEl.innerText = "Precipitation: " + Number(r).toFixed(2) + " mm";

    const activeVehicleEl = document.getElementById("activeVehicleText");
    if (activeVehicleEl) {
      const typeName = data.activeVehicleType === 1 ? "Seeder" : "Harvester";
      activeVehicleEl.innerText = "Active Vehicle: " + typeName;
    }

    const fuelEl = document.getElementById("fuelText");
    if (fuelEl) fuelEl.innerText = "Total Fuel Consumed: " + data.fuelConsumed + " G";

    const harvesterFuelEl = document.getElementById("harvesterFuelLevelText");
    if (harvesterFuelEl) harvesterFuelEl.innerText = "Harvester Fuel Level: " + data.harvesterFuelLevel + " G";

    const seederFuelEl = document.getElementById("seederFuelLevelText");
    if (seederFuelEl) seederFuelEl.innerText = "Seeder Fuel Level: " + data.seederFuelLevel + " G";
  }
}
