import React from "react";
import "./App.css";
import BlocklyWorkspaceContainer from "./Components/BlocklyWorkspaceContainer";
import SimulationCanvasContainer from "./Components/SimulationCanvasContainer";
import styles from './index.module.css';

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className={styles.container}>
          <BlocklyWorkspaceContainer />
          <SimulationCanvasContainer />
        </div>
      </React.Fragment>
    );
  }
}
//example
//https://codesandbox.io/p/sandbox/blockly-react-sample-xylu7x?file=%2Fpublic%2Findex.html%3A15%2C46

export default App;
