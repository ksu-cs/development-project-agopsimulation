import React from "react";

class WeatherData extends React.Component {
  render() {
    return (
      <React.Fragment>
        <label htmlFor="station">Choose a station:</label>
        <select id="station">
          <option>Loading stations...</option>
        </select>

        <label htmlFor="start">Start date:</label>
        <input type="date" id="start" />

        <pre id="output"></pre>
      </React.Fragment>
    );
  }
}

export default WeatherData;
