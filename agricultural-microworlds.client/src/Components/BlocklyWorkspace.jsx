import React from "react";
import * as Blockly from "blockly";
import "blockly/blocks";
import styles from "../index.module.css";

class BlocklyWorkspace extends React.Component {
  constructor(props) {
    super(props);
    this.blocklyDiv = React.createRef();
    this.toolbox = React.createRef();
  }

  componentDidMount() {
    this.initBlockly();
    this.props.onWorkspaceReady(this.primaryWorkspace);
  }

  componentDidUpdate(prevProps) {
    if (this.props.toolbox !== prevProps.toolbox) {
      this.disposeWorkspace();
      this.initBlockly();
    }
  }

  componentWillUnmount() {
    this.disposeWorkspace();
  }

  initBlockly() {
    if (this.primaryWorkspace) return;

    const { initialXml, toolbox, myTheme, ...rest } = this.props;
    this.primaryWorkspace = Blockly.inject(this.blocklyDiv.current, {
      toolbox: toolbox,
      trashcan: true,
      theme: myTheme,
      renderer: "zelos",
      rendererOptionis: {
        keyboardNavigation: true,
      },
      ...rest,
    });

    this.primaryWorkspace.registerButtonCallback(
      "CREATE_VARIABLE",
      function (button) {
        Blockly.Variables.createVariableButtonHandler(
          button.getTargetWorkspace(),
        );
      },
    );

    if (initialXml) {
      this.setXml(initialXml);
    }
  }

  disposeWorkspace() {
    if (this.primaryWorkspace) {
      this.primaryWorkspace.dispose();
      this.primaryWorkspace = null;
    }
  }

  get workspace() {
    return this.primaryWorkspace;
  }

  setXml(xml) {
    const xmlDom = Blockly.utils.xml.textToDom(xml);
    Blockly.Xml.domToWorkspace(xmlDom, this.primaryWorkspace);
  }

  render() {
    return (
      <React.Fragment>
        <div ref={this.blocklyDiv} className={styles.blocklyContainer} />
      </React.Fragment>
    );
  }
}

export default BlocklyWorkspace;
