export const toolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Movement",
      colour: "#5b67a5",
      contents: [
        { kind: "block", type: "move_forward" },
        { kind: "block", type: "turn_left" },
        { kind: "block", type: "turn_right" },
        { kind: "block", type: "turn_left_x_degrees" },
        { kind: "block", type: "turn_right_x_degrees" },
      ],
    },
    {
      kind: "category",
      name: "Numbers",
      colour: "#5b9aa5",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_random_int" },
      ],
    },
    {
      kind: "category",
      name: "Control",
      colour: "#5b12a5",
      contents: [
        {
          kind: "block",
          type: "controls_if",
        },
        { kind: "block", type: "turn_harvesting_on" },
        { kind: "block", type: "turn_harvesting_off" },
        { kind: "block", type: "turn_seeding_on" },
        { kind: "block", type: "turn_seeding_off" },
      ],
    },
    {
      kind: "category",
      name: "Logic",
      colour: "#5b9dd5",
      contents: [{ kind: "block", type: "logic_boolean" }],
    },
    {
      kind: "category",
      name: "Loops",
      colour: "#5a1dd5",
      contents: [
        { kind: "block", type: "controls_repeat_ext" },
        { kind: "block", type: "controls_whileUntil" },
      ],
    },
  ],
};
