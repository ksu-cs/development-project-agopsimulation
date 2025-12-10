export default class WeatherManager {
  constructor(wheatGDD = 10) {
    this.csvLines = [];
    this.cumulativeGDD = 0;
    this.currentDayIndex = 0;
    this.Wheatgdd = wheatGDD; // base GDD threshold
  }

  async loadStations() {
    const response = await fetch(
      "https://mesonet.k-state.edu/rest/stationnames/",
    );
    const text = await response.text();
    const lines = text.split("\n").slice(1);
    const stationSelect = document.getElementById("station");
    stationSelect.innerHTML = "";

    lines.forEach((line) => {
      const cols = line.split(",");
      const NAME = cols[0];
      const ABBR = cols[0];
      if (NAME && ABBR) {
        const option = document.createElement("option");
        option.value = ABBR;
        option.textContent = NAME;
        if (NAME.includes("Flickner")) option.selected = true;
        stationSelect.appendChild(option);
      }
    });
  }

  async fetchData(station, startDateValue) {
    const [year, month, day] = startDateValue.split("-").map(Number);
    const startDate = new Date(year, month - 1, day);
    this.startDate = new Date(startDate);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 365);

    const start = startDateValue.replaceAll("-", "");
    const end = `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, "0")}${endDate.getDate().toString().padStart(2, "0")}`;

    const url = `https://mesonet.k-state.edu/rest/stationdata?stn=${station}&int=day&t_start=${start}000000&t_end=${end}000000&vars=TEMP2MAVG`;
    const response = await fetch(url);
    const data = await response.text();
    const lines = data.trim().split("\n");
    this.csvLines = lines.slice(1).map((line) => line.split(","));
    this.cumulativeGDD = 0;
    this.currentDayIndex = 0;
  }

  calculateDailyGDD() {
    if (!this.csvLines[this.currentDayIndex]) return 0;
    const temp = parseFloat(this.csvLines[this.currentDayIndex][2]);
    const dailyGDD = Math.max(0, temp - this.Wheatgdd);
    this.cumulativeGDD += dailyGDD;
    this.currentDayIndex++;
    return dailyGDD;
  }

  calculateWeeklyGDD(weekIndex, daysPerWeek = 7) {
    let sum = 0;
    const startIdx = weekIndex * daysPerWeek;
    for (
      let i = startIdx;
      i < startIdx + daysPerWeek && i < this.csvLines.length;
      i++
    ) {
      const temp = parseFloat(this.csvLines[i][2]);
      sum += Math.max(0, temp - this.Wheatgdd);
    }
    this.cumulativeGDD += sum;
    return sum;
  }
}