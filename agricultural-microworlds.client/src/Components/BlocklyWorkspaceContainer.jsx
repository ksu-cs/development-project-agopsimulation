import {javascriptGenerator} from 'blockly/javascript';
import React from "react";
import './customBlockDefinitions';
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
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="0" y="0"></block>
</xml>
      `}>
                <Block type="example" />
                <Block type="controls_ifelse" />
                <Block type="logic_compare" />
                <Block type="logic_operation" />
                <Block type="controls_repeat_ext">
                    <Value name="TIMES">
                        <Shadow type="math_number">
                            <Field name="NUM">10</Field>
                        </Shadow>
                    </Value>
                </Block>
                <Block type="logic_operation" />
            </BlocklyWorkspace>
            <button onClick={this.generateCode} style={{backgroundColor:"Green"}}>Run</button>
      </>
    );
  }
}

export default BlocklyWorkspaceContainer;
