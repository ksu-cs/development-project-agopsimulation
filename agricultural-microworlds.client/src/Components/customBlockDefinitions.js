import * as Blockly from "blockly/core";

var example = {
  type: "turn_harvesting_off", //type name that is used in blockly system
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
  type: "math_number",
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
