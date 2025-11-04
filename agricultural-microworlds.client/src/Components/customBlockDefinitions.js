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

var turnLeft = {
    type: "turn_left",
    message0: "turn left",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turn the tractor left",
};
Blockly.Blocks["turn_left"] = {
    init: function () {
        this.jsonInit(turnLeft);
    }
};

var turnRight = {
    type: "turn_right",
    message0: "turn right",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turn the tractor right",
};
Blockly.Blocks["turn_right"] = {
    init: function () {
        this.jsonInit(turnRight);
    }
};

var turnLeftXDegrees = {
    type: "turn_left_x_degrees",
    message0: "Turn %1 degrees left",
    args0: [
        {
            type: "input_value",
            name: "DEGREES",
            check: "Number",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turn the tractor a certain amount of degrees left",
};
Blockly.Blocks["turn_left_x_degrees"] = {
    init: function () {
        this.jsonInit(turnLeftXDegrees);
    }
};

var turnRightXDegrees = {
    type: "turn_right_x_degrees",
    message0: "Turn %1 degrees right",
    args0: [
        {
            type: "input_value",
            name: "DEGREES",
            check: "Number",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turn the tractor a certain amount of degrees right",
};
Blockly.Blocks["turn_right_x_degrees"] = {
    init: function () {
        this.jsonInit(turnRightXDegrees);
    }
};

var mathNumber = {
    type: "math_number",
    message0: "%1",
    args0: [
        {
            type: "field_number",
            name: "NUM",
            value: 1,
        },
    ],
    output: "Number",
    colour: 230,
};
Blockly.Blocks["math_number"] = {
    init: function () {
        this.jsonInit(mathNumber);
    }
};

var turnHarvestingOn = {
    type: "turn_harvesting_on",
    message0: "turn harvesting on",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turns harvesting on tractor on",
};
Blockly.Blocks["turn_harvesting_on"] = {
    init: function () {
        this.jsonInit(turnHarvestingOn);
    }
};

var turnHarvestingOff = {
    type: "turn_harvesting_off",
    message0: "turn harvesting off",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turns harvesting on tractor off",
};
Blockly.Blocks["turn_harvesting_off"] = {
    init: function () {
        this.jsonInit(turnHarvestingOff);
    }
};

var turnSeedingOn = {
    type: "turn_seeding_on",
    message0: "turn seeding on",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turns seeding on tractor on",
};
Blockly.Blocks["turn_seeding_on"] = {
    init: function () {
        this.jsonInit(turnSeedingOn);
    }
};

var turnSeedingOff = {
    type: "turn_seeding_off",
    message0: "turn seeding off",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "Turns seeding on tractor off",
};
Blockly.Blocks["turn_seeding_off"] = {
    init: function () {
        this.jsonInit(turnSeedingOff);
    }
};

//#endregion