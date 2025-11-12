import React from "react";
import "../../SetUpCustomBlocks/blocklyJSGenerator";
import SimulationControlsContainer from "./SimulationControlsContainer";
import styles from "../../Styles/index.module.css";
import CanvasContainer from "./CanvasContainer";

class SimulationCanvasContainer extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  render() {
    const { workspace } = this.props;
    return (
      <React.Fragment>
        <div
          className={`${styles.canvasSection} ${styles.alignItemsCenterColumn}`}
        >
          <CanvasContainer canvasRef={this.canvasRef} />
          <SimulationControlsContainer
            workspace={workspace}
            canvasRef={this.canvasRef}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default SimulationCanvasContainer;
