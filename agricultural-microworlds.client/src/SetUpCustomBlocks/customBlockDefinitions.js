import { Blocks } from "blockly/core";

//#region examples
var example = {
  type: "example", //type name that is used in blockly system
  message0: "turn harvesting off", // message on the block
  previousStatement: null,
  nextStatement: null,
  colour: 210, // color of block
  tooltip: "Turns harvesting on tractor off", // tip that comes up when hovering on block
};
Blocks["example"] = {
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
Blocks["args_example"] = {
  init: function () {
    this.jsonInit(argsExapmle);
    this.setStyle("loop_blocks");
  },
};
//#endregion

//#region custom
var moveForward = {
  type: "move_forward",
  message0: "move forward for %1 minute",
  args0: [
    {
      type: "field_number",
      name: "DURATION",
      value: 1,
      min: 0,
      precision: 0.1,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "movement_blocks",
  tooltip: "Move forward for specified minutes",
};
Blocks["move_forward"] = {
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
Blocks["turn_left"] = {
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
Blocks["turn_right"] = {
  init: function () {
    this.jsonInit(turnRight);
  },
};

var turnXDegrees = {
  type: "turn_x_degrees",
  message0: "Turn %1 degrees %2",
  args0: [
    {
      type: "field_number",
      name: "DEGREES",
      value: 90,
      min: 0,
      precision: 0.1,
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
Blocks["turn_x_degrees"] = {
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
Blocks["math_number"] = {
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
Blocks["toggle_harvesting"] = {
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
Blocks["toggle_seeding"] = {
  init: function () {
    this.jsonInit(toggleSeeding);
  },
};

var waitXTime = {
  type: "wait_x_time",
  message0: "wait %1 %2",
  args0: [
    {
      type: "field_number",
      name: "WEEKS",
      value: 1,
      min: 0,
      precision: 0.1,
    },
    {
      type: "field_dropdown",
      name: "time_value",
      options: [
        ["Minutes", "0"],
        ["Hours", "1"],
        ["Days", "2"],
        ["Weeks", "3"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Wait for a certain number of weeks",
};
Blocks["wait_x_time"] = {
  init: function () {
    this.jsonInit(waitXTime);
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
Blocks["is_over_tile"] = {
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
Blocks["custom_compare"] = {
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
Blocks["get_current_week"] = {
  init: function () {
    this.jsonInit(getCurrentWeek);
  },
};

var onStartProgram = {
  type: "start_program",
  message0: "On Begin",
  nextStatement: null,
  style: "event_blocks",
  tooltip: "Is called when the program begins.",
};
Blocks["start_program"] = {
  init: function () {
    this.jsonInit(onStartProgram);
  },
};

var switchCropBeingPlanted = {
  type: "switch_crop_being_planted",
  message0: "Switch crop being planted to %1",
  args0: [
    {
      type: "field_dropdown",
      name: "toggleType",
      options: [
        ["Wheat", "0"],
        ["Corn", "1"],
        ["Soybean", "2"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Switch the crop that is being planted when seeding is turned on",
};
Blocks["switch_crop_being_planted"] = {
  init: function () {
    this.jsonInit(switchCropBeingPlanted);
  },
};

var changeVehicle = {
  type: "change_vehicle",
  message0: "Swaps the vehicle to %1",
  args0: [
    {
      type: "field_dropdown",
      name: "toggleVehicle",
      options: [
        ["Harvester", "0"],
        ["Seeder", "1"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Switch the vehicle being controlled",
};
Blocks["change_vehicle"] = {
  init: function () {
    this.jsonInit(changeVehicle);
  },
};

var fillVehicleFuelTank = {
  type: "fill_vehicle_fuel_tank",
  message0: "Fill %1 fuel tank",
  args0: [
    {
      type: "field_dropdown",
      name: "toggleVehicle",
      options: [
        ["Harvester", "0"],
        ["Seeder", "1"],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: "control_blocks",
  tooltip: "Fills the fuel tank of the specified vehicle back to full",
};
Blocks["fill_vehicle_fuel_tank"] = {
  init: function () {
    this.jsonInit(fillVehicleFuelTank);
  },
};
//#endregion
