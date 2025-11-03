import React from "react";
import * as Blockly from "blockly";
import "blockly/blocks";
import styles from '../index.module.css';

class BlocklyWorkspace extends React.Component {
  constructor(props) {
    super(props);
    this.blocklyDiv = React.createRef();
    this.toolbox = React.createRef();
  }

  componentDidMount() {
    // eslint-disable-next-line no-unused-vars
    const { initialXml, children, ...rest } = this.props;
    this.primaryWorkspace = Blockly.inject(this.blocklyDiv.current, {
      toolbox: this.toolbox.current,
      ...rest,
    });

    if (initialXml) {
      this.setXml(initialXml);
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
    const { children } = this.props;

    return (
      <React.Fragment>
        <div ref={this.blocklyDiv} className={styles.blocklyDivContainer}>
          <xml
            xmlns="https://developers.google.com/blockly/xml"
            is="blockly"
            style={{ display: "none" }}
            ref={this.toolbox}
          >
            {children}
          </xml>
        </div>
      </React.Fragment>
    );
  }
}

export default BlocklyWorkspace;
