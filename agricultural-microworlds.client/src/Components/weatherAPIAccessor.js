export default class weatherAPIAccessor {
  constructor() {
    this.waitingweeksCount = 1; // global variable, set elsewhere
    this.cumulativeGDD = 0;
    this.csvLines = []; // parsed CSV data
    this.Wheatgdd = 10;
  }

  async loadStations() {
    const response = await fetch(
      "https://mesonet.k-state.edu/rest/stationnames/",
    );
    const text = await response.text();
    const lines = text.split("\n").slice(1); // skip header
    const stationSelect = document.getElementById("station");
    stationSelect.innerHTML = ""; // clear loading option

    lines.forEach((line) => {
      const cols = line.split(",");
      const NAME = cols[0];
      const ABBR = cols[0];
      if (NAME && ABBR) {
        const option = document.createElement("option");
        option.value = ABBR; // for URL
        option.textContent = NAME; // for user display
        stationSelect.appendChild(option);
      }
    });
  }

  calculateGDDForWeek(weekIndex, daysPerWeek = 7) {
    let sum = 0;
    const startIdx = weekIndex * daysPerWeek;
    for (
      let i = startIdx;
      i < startIdx + daysPerWeek && i < this.csvLines.length;
      i++
    ) {
      const temp = parseFloat(csvLines[i][2]); // TEMP2MAVG
      sum += Math.max(0, temp - this.Wheatgdd);
    }
    return sum;
  }

  async fetchData() {
    const station = document.getElementById("station").value;
    const startInput = document.getElementById("start").value; // YYYY-MM-DD
    const startDate = new Date(startInput);

    // Make sure waitingweeksCount is a number
    const weeks = Number(this.waitingweeksCount) || 1;

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7 * weeks); // 7 days per week

    const start = startInput.replaceAll("-", "");
    const end = `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, "0")}${endDate.getDate().toString().padStart(2, "0")}`;

    const url = `https://mesonet.k-state.edu/rest/stationdata?stn=${station}&int=day&t_start=${start}000000&t_end=${end}000000&vars=TEMP2MAVG`;
    console.log("Fetching URL:", url);

    const response = await fetch(url);
    const data = await response.text();

    const lines = data.trim().split("\n");
    this.csvLines = lines.slice(1).map((line) => line.split(",")); // skip header
    this.cumulativeGDD = 0;
    currentWeek = START_WEEK; //purpose of this? values used no where else
  }
}
