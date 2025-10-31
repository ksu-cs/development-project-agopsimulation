import React from "react";

class BlocklyWorkspace extends React.Component {
  constructor(props) {
    super(props);
    this.blocklyDiv = React.createRef();
    this.toolbox = React.createRef();
  }

  render() {
    const children = this.props;

    return (
      <>
        <div ref={this.blocklyDiv} id="blocklydiv" />
        <xml
          xmlns="https://developers.google.com/blockly/xml"
          is="blockly"
          style={{ display: "none" }}
          ref={this.toolbox}
        >
          {children}
        </xml>
      </>
    );
  }
}

export default BlocklyWorkspace;
