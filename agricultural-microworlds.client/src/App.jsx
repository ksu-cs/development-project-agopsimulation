import { Component, Fragment, createRef } from "react";
import "./App.css";
import BlocklyWorkspaceContainer from "./Components/BlocklySection/BlocklyWorkspaceContainer";
import SimulationCanvasContainer from "./Components/CanvasSection/SimulationCanvasContainer";
import styles from "./Styles/index.module.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.simpleWorkspace = createRef();
    this.state = { workspace: null };
  }
  setWorkspace = (workspace) => {
    this.setState({ workspace });
  };

  render() {
    const { workspace } = this.state;
    return (
      <Fragment>
        <div className={styles.container}>
          <BlocklyWorkspaceContainer
            simpleWorkspace={this.simpleWorkspace}
            onWorkspaceReady={this.setWorkspace}
          />
          <SimulationCanvasContainer workspace={workspace} />
        </div>
      </Fragment>
    );
  }
}
//example
//https://codesandbox.io/p/sandbox/blockly-react-sample-xylu7x?file=%2Fpublic%2Findex.html%3A15%2C46

export default App;
