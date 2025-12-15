import { Component, Fragment, createRef } from "react";
import { inject, Variables, utils, Xml } from "blockly";
import "blockly/blocks";
import styles from "../../Styles/index.module.css";

/**
 * @classdesc Creates the Blockly area
 */
class BlocklyWorkspace extends Component {
  /**
   * Creates the ref for the blocklyDiv that's needed for the blockly init and the toolbox ref
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.blocklyDiv = createRef();
    this.toolbox = createRef();
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

  /**
   * Initializes the things needed for blockly to work correctly
   */
  initBlockly() {
    if (this.primaryWorkspace) return;

    const { initialXml, toolbox, myTheme, ...rest } = this.props;
    this.primaryWorkspace = inject(this.blocklyDiv.current, {
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
        Variables.createVariableButtonHandler(button.getTargetWorkspace());
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

  /**
   *
   * @param {string} xml Sets the xml for the blockly div
   */
  setXml(xml) {
    const xmlDom = utils.xml.textToDom(xml);
    Xml.domToWorkspace(xmlDom, this.primaryWorkspace);
  }

  render() {
    return (
      <Fragment>
        <div ref={this.blocklyDiv} className={styles.blocklyContainer} />
      </Fragment>
    );
  }
}

export default BlocklyWorkspace;
