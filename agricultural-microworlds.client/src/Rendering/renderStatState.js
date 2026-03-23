import RenderState from "./renderState";

export default class RenderStatState extends RenderState {
  constructor(
    yieldScore,
    currentDate,
    cumulativeGDD,
    cumulativeRain,
    activeVehicleType,
  ) {
    super();
    this.yieldScore = yieldScore;
    this.currentDate = currentDate;
    this.cumulativeGDD = cumulativeGDD;
    this.cumulativeRain = cumulativeRain;
    this.activeVehicleType = activeVehicleType;
  }

  render() {
    const yieldEl = document.getElementById("scoreText");
    if (yieldEl) yieldEl.innerText = "Yield: " + this.yieldScore;

    const dateEl = document.getElementById("dateText");
    if (dateEl) dateEl.innerText = "Date: " + this.currentDate;

    const gddEl = document.getElementById("gddText");
    if (gddEl) gddEl.innerText = "GDD: " + this.cumulativeGDD;

    const rainEl = document.getElementById("rainText");
    const r = this.cumulativeRain ?? 0;
    if (rainEl)
      rainEl.innerText = "Precipitation: " + Number(r).toFixed(2) + " mm";

    const activeVehicleEl = document.getElementById("activeVehicleText");
    if (activeVehicleEl) {
      const typeName = this.activeVehicleType === 1 ? "Seeder" : "Harvester";
      activeVehicleEl.innerText = "Active Vehicle: " + typeName;
    }
  }
}
