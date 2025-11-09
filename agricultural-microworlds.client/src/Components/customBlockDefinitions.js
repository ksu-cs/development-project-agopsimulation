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

//#region custom
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
  style: "movement_blocks",
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
  style: "movement_blocks",
  tooltip: "Turn the tractor left",
};
Blockly.Blocks["turn_left"] = {
  init: function () {
    this.jsonInit(turnLeft);
  },
};

var turnRight = {
  type: "turn_right",
  message0: "turn right",
  previousStatement: null,
  nextStatement: null,
  style: "movement_blocks",
  tooltip: "Turn the tractor right",
};
Blockly.Blocks["turn_right"] = {
  init: function () {
    this.jsonInit(turnRight);
  },
};

var turnXDegrees = {
  type: "turn_x_degrees",
  message0: "Turn %1 degrees %2",
  args0: [
    {
      type: "input_value",
      name: "DEGREES",
      check: "Number",
    },
    {
      type: "field_dropdown",
      name: "DIRECTION",
      options: [
        ["left", "0"],
        ["right", "1"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "movement_blocks",
  tooltip: "Turn the tractor a certain amount of degrees left",
};
Blockly.Blocks["turn_x_degrees"] = {
  init: function () {
    this.jsonInit(turnXDegrees);
  },
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
  style: "math_blocks",
};
Blockly.Blocks["math_number"] = {
  init: function () {
    this.jsonInit(mathNumber);
  },
};

var toggleHarvesting = {
  type: "toggle_harvesting",
  message0: "turn harvesting %1",
  args0: [
    {
      type: "field_dropdown",
      name: "toggleType",
      options: [
        ["ON", "1"],
        ["OFF", "0"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Turns harvesting on tractor on or off",
};
Blockly.Blocks["toggle_harvesting"] = {
  init: function () {
    this.jsonInit(toggleHarvesting);
  },
};

var toggleSeeding = {
  type: "toggle_seeding",
  message0: "turn seeding %1",
  args0: [
    {
      type: "field_dropdown",
      name: "toggleType",
      options: [
        ["ON", "1"],
        ["OFF", "0"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Turns seeding on tractor on or off",
};
Blockly.Blocks["toggle_seeding"] = {
  init: function () {
    this.jsonInit(toggleSeeding);
  },
};

var waitXWeeks = {
  type: "wait_x_weeks",
  message0: "wait %1 weeks",
  args0: [
    {
      type: "input_value",
      name: "WEEKS",
      check: "Number",
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Wait for a certain number of weeks",
};
Blockly.Blocks["wait_x_weeks"] = {
  init: function () {
    this.jsonInit(waitXWeeks);
  },
};

var isOverTile = {
  type: "is_over_tile",
  message0: "is over %1 tile",
  args0: [
    {
      type: "field_dropdown",
      name: "TYPE",
      options: [
        ["Unplanted", "0"],
        ["Seeded", "1"],
        ["Grown", "2"],
      ],
    },
  ],
  output: "Boolean",
  style: "logic_blocks",
  tooltip: "Checks if a planted tile is in front of the tractor.",
};
Blockly.Blocks["is_over_tile"] = {
  init: function () {
    this.jsonInit(isOverTile);
  },
};

var customCompare = {
  type: "custom_compare",
  message0: "%1 = %2",
  args0: [
    {
      type: "input_value",
      name: "A",
      check: "Number",
    },
    {
      type: "input_value",
      name: "B",
      check: "Number",
    },
  ],
  output: "Boolean",
  style: "logic_blocks",
  tooltip: "Comparison block",
  inputsInline: true,
};
Blockly.Blocks["custom_compare"] = {
  init: function () {
    this.jsonInit(customCompare);
  },
};

var getCurrentWeek = {
  type: "get_current_week",
  message0: "Current Week",
  output: "Number",
  style: "variable_blocks",
  tooltip: "Gets the current week number from the simulation.",
};
Blockly.Blocks["get_current_week"] = {
  init: function () {
    this.jsonInit(getCurrentWeek);
  },
};
//#endregion
