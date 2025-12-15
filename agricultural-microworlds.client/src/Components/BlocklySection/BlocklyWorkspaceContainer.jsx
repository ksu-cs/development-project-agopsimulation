import { javascriptGenerator } from "blockly/javascript";
import { Component, Fragment } from "react";
import "../../SetUpCustomBlocks/customBlockDefinitions";
import BlocklyWorkspace from "./BlocklyWorkspace";
import { toolbox, myTheme } from "../../SetUpCustomBlocks/toolboxConfig";

/**
 * @classdesc Creates the BlocklyWorkspace component and everything needed for it
 */
class BlocklyWorkspaceContainer extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * Changes the blocks into their code counterparts
   */
  generateCode = () => {
    var code = javascriptGenerator.workspaceToCode(
      this.simpleWorkspace.current.workspace,
    );
    console.log(code);
  };
  
  render() {
    return (
      <Fragment>
        <BlocklyWorkspace
          toolbox={toolbox}
          myTheme={myTheme}
          onWorkspaceReady={this.props.onWorkspaceReady}
        />
      </Fragment>
    );
  }
}

export default BlocklyWorkspaceContainer;
