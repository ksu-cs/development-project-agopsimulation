import * as Blockly from "blockly/core";

export const toolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Movement",
      categorystyle: "movement_category",
      contents: [
        { kind: "block", type: "move_forward" },
        { kind: "block", type: "turn_left" },
        { kind: "block", type: "turn_right" },
        { kind: "block", type: "turn_x_degrees" },
      ],
    },
    {
      kind: "category",
      name: "Variables",
      categorystyle: "variable_category",
      // "custom": "VARIABLE",
      contents: [
        {
          kind: "button",
          text: "Create variable...",
          callbackKey: "CREATE_VARIABLE",
        },
        { kind: "block", type: "variables_get" },
        { kind: "block", type: "variables_set" },
        { kind: "block", type: "get_current_week" },
      ],
    },
    {
      kind: "category",
      name: "Numbers",
      categorystyle: "numbers_category",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_random_int" },
      ],
    },
    {
      kind: "category",
      name: "Control",
      categorystyle: "control_category",
      contents: [
        { kind: "block", type: "toggle_harvesting" },
        { kind: "block", type: "toggle_seeding" },
        { kind: "block", type: "wait_x_weeks" },
      ],
    },
    {
      kind: "category",
      name: "Logic",
      categorystyle: "logic_category",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_boolean" },
        { kind: "block", type: "is_over_tile" },
        { kind: "block", type: "custom_compare" },
      ],
    },
    {
      kind: "category",
      name: "Loops",
      categorystyle: "loops_category",
      contents: [
        { kind: "block", type: "controls_repeat_ext" },
        { kind: "block", type: "controls_whileUntil" },
      ],
    },
  ],
};

export const myTheme = Blockly.Theme.defineTheme("myTheme", {
  base: Blockly.Themes.Classic,
  categoryStyles: {
    movement_category: { colour: "300" },
    numbers_category: { colour: "230" },
    control_category: { colour: "190" },
    logic_category: { colour: "135" },
    loops_category: { colour: "60" },
    variable_category: { colour: "330" },
  },
  blockStyles: {
    // Movement Blocks
    movement_blocks: { colourPrimary: "300" },

    // Style for all blocks in the "Numbers" category
    // 'numbers_blocks': { 'colourPrimary': "300" },

    // Style for all blocks in the "Control" category
    control_blocks: { colourPrimary: "190" },

    // Style for all blocks in the "Logic" category
    logic_blocks: { colourPrimary: "135" },

    // Style for all blocks in the "Loops" category
    loop_blocks: { colourPrimary: "60" },

    // Style for all blocks in the "Numbers" category
    math_blocks: { colorPrimary: "230" },

    // Style for all blocks in the "Variables" category
    variable_blocks: { colorPrimary: "330" },
  },
  componentStyles: {},
});
