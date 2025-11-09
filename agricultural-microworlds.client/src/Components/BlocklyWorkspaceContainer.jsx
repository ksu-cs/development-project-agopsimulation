import { javascriptGenerator } from "blockly/javascript";
import React from "react";
import "./customBlockDefinitions";
import BlocklyWorkspace from "./BlocklyWorkspace";
import { toolbox, myTheme } from "./toolboxConfig";

class BlocklyWorkspaceContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  generateCode = () => {
    var code = javascriptGenerator.workspaceToCode(
      this.simpleWorkspace.current.workspace,
    );
    console.log(code);
  };
  render() {
    return (
      <React.Fragment>
        <BlocklyWorkspace
          toolbox={toolbox}
          myTheme={myTheme}
          onWorkspaceReady={this.props.onWorkspaceReady}
        />
      </React.Fragment>
    );
  }
}

export default BlocklyWorkspaceContainer;
