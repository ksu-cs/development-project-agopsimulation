import RenderState from "./renderState";

export default class RenderStatState extends RenderState {
  constructor() {
    super({}, 0);
  }

  render(context, data) {
    const siloStorageEl = document.getElementById("siloStorageText");
    if (siloStorageEl) siloStorageEl.innerText = "Silo Storage: " + (data.siloStorage ?? 0) + " / 50000";

    const dateEl = document.getElementById("dateText");
    if (dateEl) dateEl.innerText = "Date: " + data.currentDate;

    const timeEl = document.getElementById("timeText");
    if (timeEl) {
      // Format the current time into hours, minutes, and AM/PM.
      const totalHours = 1 + Math.floor((data.currentTime / 60.0) % 12.0);
      const totalMinutes = Math.floor(data.currentTime % 60.0);

      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = totalMinutes.toString().padStart(2, "0");
      const formattedMeridiem =
        data.currentTime % (23 * 60) >= 11 * 60 ? "P.M." : "A.M.";
      timeEl.innerText = `Time: ${formattedHours}:${formattedMinutes} ${formattedMeridiem}`;
    }

    const gddEl = document.getElementById("gddText");
    if (gddEl) gddEl.innerText = "GDD: " + data.cumulativeGDD;

    const rainEl = document.getElementById("rainText");
    const r = data.rainString ?? 0;
    if (rainEl)
      rainEl.innerText = "Precipitation: " + Number(r).toFixed(2) + " mm";

    const activeVehicleEl = document.getElementById("activeVehicleText");
    if (activeVehicleEl) {
      const typeName = data.activeVehicleType === 1 ? "Seeder" : "Harvester";
      activeVehicleEl.innerText = "Active Vehicle: " + typeName;
    }

    const fuelEl = document.getElementById("fuelText");
    if (fuelEl)
      fuelEl.innerText = "Total Fuel Consumed: " + data.fuelConsumed + " G";

    const harvesterFuelEl = document.getElementById("harvesterFuelLevelText");
    if (harvesterFuelEl)
      harvesterFuelEl.innerText =
        "Harvester Fuel Level: " + data.harvesterFuelLevel + " G";

    const seederFuelEl = document.getElementById("seederFuelLevelText");
    if (seederFuelEl)
      seederFuelEl.innerText =
        "Seeder Fuel Level: " + data.seederFuelLevel + " G";

    const waterAppliedEl = document.getElementById("waterAppliedText");
    const waterApplied = data.totalWaterApplied ?? 0;
    if (waterAppliedEl)
      waterAppliedEl.innerText =
        "Irrigation Applied: " + Number(waterApplied).toFixed(3);

    const truckStorageEl = document.getElementById("truckStorageText");
    if (truckStorageEl) truckStorageEl.innerText = "Truck Storage: " + (data.truckStorage ?? 0) + " / 5000";

    const truckFuelEl = document.getElementById("truckFuelLevelText");
    if (truckFuelEl)
      truckFuelEl.innerText =
        "Truck Fuel Level: " + (data.truckFuelLevel ?? 0) + " G";
  }
}
