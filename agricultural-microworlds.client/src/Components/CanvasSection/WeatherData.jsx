import styles from "../../Styles/index.module.css";
import { Component, Fragment } from "react";

class WeatherData extends Component {
  render() {
    return (
      <Fragment>
        <div
          className={`${styles.alignItemsCenterColumn} ${styles.weatherDataContainer}`}
        >
          <label htmlFor="station">Choose a station:</label>
          <select id="station">
            <option>Loading stations...</option>
          </select>

          <label htmlFor="start">Start date:</label>
          <input type="date" id="start" defaultValue="2024-01-01" />
        </div>
      </Fragment>
    );
  }
}

export default WeatherData;
