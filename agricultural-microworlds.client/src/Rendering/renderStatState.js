import RenderState from "./renderState";

export default class RenderStatState extends RenderState {
  constructor() {
    super();
  }

  render(simulationState) {
    const yieldEl = document.getElementById("scoreText");
    if (yieldEl) yieldEl.innerText = "Yield: " + simulationState.yieldScore;

    const dateEl = document.getElementById("dateText");
    if (dateEl) dateEl.innerText = "Date: " + simulationState.currentDate;

    const gddEl = document.getElementById("gddText");
    if (gddEl) gddEl.innerText = "GDD: " + simulationState.cumulativeGDD;

    const rainEl = document.getElementById("rainText");
    const r = simulationState.cumulativeRain ?? 0;
    if (rainEl)
      rainEl.innerText = "Precipitation: " + Number(r).toFixed(2) + " mm";

    const activeVehicleEl = document.getElementById("activeVehicleText");
    if (activeVehicleEl) {
      const typeName =
        simulationState.activeVehicleType === 1 ? "Seeder" : "Harvester";
      activeVehicleEl.innerText = "Active Vehicle: " + typeName;
    }
  }
}
