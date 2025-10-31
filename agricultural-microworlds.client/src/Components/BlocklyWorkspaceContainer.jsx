import {javascriptGenerator} from 'blockly/javascript';
import React from "react";
import BlocklyWorkspace from "./BlocklyWorkspace";
import { Block } from "./BlockTypes";

class BlocklyWorkspaceContainer extends React.Component {
  constructor(props) {
    super(props);
    this.simpleWorkspace = React.createRef();
  }

  generateCode = () => {
    var code = javascriptGenerator.workspaceToCode(
      this.simpleWorkspace.current.workspace,
    );
    console.log(code);
  };
  render() {
    return (
      <>
        <button onClick={this.generateCode}>Run</button>
        <BlocklyWorkspace
          ref={this.simpleWorkspace}
          readOnly={false}
          trashcan={true}
          media={"media/"}
          move={{
            scrollbars: true,
            drag: true,
            wheel: true,
          }}
        >
          <Block type="example" />
        </BlocklyWorkspace>
      </>
    );
  }
}

export default BlocklyWorkspaceContainer;
