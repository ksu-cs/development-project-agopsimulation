import {Component, Fragment, createRef} from "react";
import {inject, Variables, utils, Xml} from "blockly";
import "blockly/blocks";
import styles from "../../Styles/index.module.css";

class BlocklyWorkspace extends Component {
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
        Variables.createVariableButtonHandler(
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
