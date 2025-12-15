import { Component, Fragment, createRef } from "react";
import "../../SetUpCustomBlocks/blocklyJSGenerator";
import SimulationControlsContainer from "./SimulationControlsContainer";
import styles from "../../Styles/index.module.css";
import CanvasContainer from "./CanvasContainer";

/**
 * @classdesc Creates the canvas and simulation controls Components
 */
class SimulationCanvasContainer extends Component {
  /**
   * Creates a ref to pass down the both the canvas and the simulation controls
   * @param {*} props 
   */
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
