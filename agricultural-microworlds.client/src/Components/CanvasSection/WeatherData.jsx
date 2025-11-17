import {Component, Fragment} from "react";

class WeatherData extends Component {
  render() {
    return (
      <Fragment>
        <label htmlFor="station">Choose a station:</label>
        <select id="station">
          <option>Loading stations...</option>
        </select>

        <label htmlFor="start">Start date:</label>
        <input type="date" id="start" />

        <pre id="output"></pre>
      </Fragment>
    );
  }
}

export default WeatherData;
