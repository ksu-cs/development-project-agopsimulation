import { javascriptGenerator } from "blockly/javascript";

javascriptGenerator.forBlock["move_forward"] = function (block, generator) {
  const duration =
    generator.valueToCode(block, "DURATION", generator.ORDER_ATOMIC) || "1";
  return `await simulationMethods.moveForward(${duration});\n`;
};

javascriptGenerator.forBlock["turn_left"] = function () {
  return `await simulationMethods.turnXDegrees(-90);\n`;
};

javascriptGenerator.forBlock["turn_right"] = function () {
  return `await simulationMethods.turnXDegrees(90);\n`;
};

javascriptGenerator.forBlock["turn_x_degrees"] = function (block, generator) {
  let amount =
    generator.valueToCode(block, "DEGREES", generator.ORDER_NONE) || "1";
  const direction = block.getFieldValue("DIRECTION");

  if (direction == 0) {
    amount = `(-1 * (${amount}))`;
  }

  return `await simulationMethods.turnXDegrees(${amount});\n`;
};

javascriptGenerator.forBlock["toggle_harvesting"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulationMethods.toggleHarvesting(${inputType});\n`;
};

javascriptGenerator.forBlock["toggle_seeding"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulationMethods.toggleSeeding(${inputType});\n`;
};

javascriptGenerator.forBlock["wait_x_weeks"] = function (block, generator) {
  const weeks =
    generator.valueToCode(block, "WEEKS", generator.ORDER_ATOMIC) || "1";
  return `await simulationMethods.fastForwardWeeks(${weeks});\n`;
};

javascriptGenerator.forBlock["is_over_tile"] = function (block, generator) {
  const type = block.getFieldValue("TYPE");
  let checkResult = `simulationMethods.CheckIfPlantInFront(${type})`;
  return [checkResult, generator.ORDER_RELATIONAL];
};

javascriptGenerator.forBlock["math_number"] = function (block, generator) {
  const number = block.getFieldValue("NUM");
  return [number, generator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["custom_compare"] = function (block, generator) {
  const value_a =
    generator.valueToCode(block, "A", generator.ORDER_ATOMIC) || "0";
  const value_b =
    generator.valueToCode(block, "B", generator.ORDER_ATOMIC) || "0";
  const code = `${value_a} == ${value_b}`;
  return [code, generator.ORDER_EQUALITY];
};

javascriptGenerator.forBlock["get_current_week"] = function (generator) {
  return ["simulationMethods.currentWeek", generator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["start_program"] = function () {
  return `\n`;
};
