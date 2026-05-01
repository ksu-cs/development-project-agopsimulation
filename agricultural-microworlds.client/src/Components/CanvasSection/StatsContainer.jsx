import { Component, Fragment } from "react";
import styles from "../../Styles/index.module.css";

class StatsContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        <div className={styles.statTextContainer}>
          <p className={styles.statText} id="dateText">
            Date: {this.props.dateText || "--"}
          </p>
          <p className={styles.statText} id="timeText">
            Time: {this.props.timeText || "--"}
          </p>
          <p className={styles.statText} id="gddText">
            Growth Days: {this.props.gddValue || "--"}
          </p>
          <p className={styles.statText} id="rainText">
            Precipitation: {this.props.rainValue || "--"}
          </p>
          <p className={styles.statText} id="waterAppliedText">
            Irrigation Applied: {this.props.waterAppliedValue || "--"} G
          </p>
          <p className={styles.statText} id="fuelText">
            Total Fuel Consumed: {this.props.totalFuelValue || "--"} G
          </p>
          <p className={styles.statText} id="harvesterFuelLevelText">
            Harvester Fuel Level: {this.props.harvesterFuelLevel || "--"} G
          </p>
          <p className={styles.statText} id="seederFuelLevelText">
            Seeder Fuel Level: {this.props.seederFuelLevel || "--"} G
          </p>
          <p className={styles.statText} id="truckFuelLevelText">
            Truck Fuel Level: {this.props.truckFuelLevel || "--"} G
          </p>
          <p className={styles.statText} id="truckStorageText">
            Truck Storage: {this.props.truckStorageLevel || "0"} /{" "}
            {this.props.truckStorageMax || "5000"}
          </p>
          <p className={styles.statText} id="siloStorageText">
            Silo Storage: {this.props.siloStorage || "0"} /{" "}
            {this.props.siloStorageMax || "50000"}
          </p>
        </div>
      </Fragment>
    );
  }
}

export default StatsContainer;
