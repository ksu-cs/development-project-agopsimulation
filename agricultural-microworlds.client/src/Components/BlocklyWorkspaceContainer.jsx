import { javascriptGenerator } from "blockly/javascript";
import React from "react";
import "./customBlockDefinitions";
import BlocklyWorkspace, { Block, Value, Shadow, Field } from "./BlockTypes";

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
          initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml"></xml>
      `}
        >
          <Block type="example" />
          <Block type="move_forward"/>
        </BlocklyWorkspace>
      </>
    );
  }
}

export default BlocklyWorkspaceContainer;
