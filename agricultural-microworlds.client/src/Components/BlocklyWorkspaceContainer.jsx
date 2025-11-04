import { javascriptGenerator } from "blockly/javascript";
import React from "react";
import "./customBlockDefinitions";
import BlocklyWorkspace from "./BlocklyWorkspace";
import { toolbox } from "./toolboxConfig";

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
            <React.Fragment>
                <BlocklyWorkspace toolbox={toolbox} />
            </React.Fragment>
        );
    };
}

export default BlocklyWorkspaceContainer;
