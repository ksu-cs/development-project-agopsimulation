// src/assets/weather.js
//import to index

export async function fetchKansasDegreeDays({
  station = "ASHL",
  base = 50,
  start = "2025-04-01",
  end = "2025-10-31",
}) {
  const url = `https://mesonet.k-state.edu/rest/degreedays/?station=${station}&base=${base}&start=${start}&end=${end}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch from Kansas Mesonet");

  const data = await res.json();
  return data;
}


const weatherData = [
  { LOCATION: "Manhattan", TEMP2MMIN: 10.4, TEMP2MMAX: 11.57 },
  { LOCATION: "Manhattan", TEMP2MMIN: 10.71, TEMP2MMAX: 12.42 },
  { LOCATION: "Manhattan", TEMP2MMIN: 10.16, TEMP2MMAX: 12.74 },
  { LOCATION: "Manhattan", TEMP2MMIN: 8.8, TEMP2MMAX: 12.38 }
];

export default weatherData;

export function calculateGDD(data = weatherData, baseTemp = 10) {
  const avgTemp = data.reduce(
    (sum, d) => sum + (d.TEMP2MMIN + d.TEMP2MMAX) / 2,
    0
  ) / data.length;
  return avgTemp - baseTemp;
}

export function isGDD(data = weatherData, baseTemp = 10) {
  return calculateGDD(data, baseTemp) > 0 ? true : false;
}
