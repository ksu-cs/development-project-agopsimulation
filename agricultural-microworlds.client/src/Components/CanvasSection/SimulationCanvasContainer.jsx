import { Component, Fragment, createRef } from "react";
import "../../SetUpCustomBlocks/blocklyJSGenerator";
import SimulationControlsContainer from "./SimulationControlsContainer";
import styles from "../../Styles/index.module.css";
import CanvasContainer from "./CanvasContainer";

class SimulationCanvasContainer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();
  }

  render() {
    const { workspace } = this.props;
    return (
      <Fragment>
        <div
          className={`${styles.canvasSection} ${styles.alignItemsCenterColumn}`}
        >
          <CanvasContainer canvasRef={this.canvasRef} />
          <SimulationControlsContainer
            workspace={workspace}
            canvasRef={this.canvasRef}
          />
        </div>
      </Fragment>
    );
  }
}

export default SimulationCanvasContainer;
