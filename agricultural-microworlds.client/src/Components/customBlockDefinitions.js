import * as Blockly from "blockly/core";

//#region examples
var example = {
  type: "example", //type name that is used in blockly system
  message0: "turn harvesting off", // message on the block
  previousStatement: null,
  nextStatement: null,
  colour: 210, // color of block
  tooltip: "Turns harvesting on tractor off", // tip that comes up when hovering on block
};
Blockly.Blocks["example"] = {
  init: function () {
    this.jsonInit(example);
    this.setStyle("loop_blocks"); // this part optional can set style yourself in the json array like colour: 210 above
  },
};

var argsExapmle = {
  type: "argsExample",
  message0: "%1",
  args0: [
    {
      type: "field_number",
      /**
       * having args as react components is possible
       * check http://codesandbox.io/p/sandbox/blockly-react-sample-xylu7x?file=%2Fsrc%2Fblocks%2Fcustomblocks.js%3A38%2C6
       * for example
       */
      name: "NUM",
      value: 1,
    },
  ],
  output: "Number",
  colour: 230,
};
Blockly.Blocks["args_example"] = {
  init: function () {
    this.jsonInit(argsExapmle);
    this.setStyle("loop_blocks");
  },
};
//#endregion

//#region movement
var moveForward = {
  type: "move_forward",
  message0: "move forward for %1 seconds",
  args0: [
    {
      type: "input_value",
      name: "DURATION",
      check: "Number",
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 160,
  tooltip: "Move forward for specified seconds",
};
Blockly.Blocks["move_forward"] = {
  init: function () {
    this.jsonInit(moveForward);
    },
};
//#endregion