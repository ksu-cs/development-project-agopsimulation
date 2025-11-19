import { javascriptGenerator } from "blockly/javascript";

// If window.loopTrap hits 0, it throws an error to break the freeze.
javascriptGenerator.INFINITE_LOOP_TRAP = 'if (--window.loopTrap < 0) throw "Infinite loop.";\n';

javascriptGenerator.forBlock["example"] = function (block) {
  return "// Example block\n";
};

javascriptGenerator.forBlock["move_forward"] = function (block, generator) {
  const duration =
    generator.valueToCode(block, "DURATION", generator.ORDER_ATOMIC) || "1";
  // NO await. This just adds to the queue.
  return `simulation.queueMove(${duration});\n`;
};

javascriptGenerator.forBlock["turn_left"] = function () {
  return `simulation.queueTurn(-90);\n`;
};

javascriptGenerator.forBlock["turn_right"] = function (block) {
  return `simulation.queueTurn(90);\n`;
};

javascriptGenerator.forBlock["turn_x_degrees"] = function (block, generator) {
  let amount =
    generator.valueToCode(block, "DEGREES", generator.ORDER_NONE) || "1";
  const direction = block.getFieldValue("DIRECTION");
  if (direction == 0) amount *= -1;
  return `simulation.queueTurn(${amount});\n`;
};


javascriptGenerator.forBlock["toggle_harvesting"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  // This is immediate, not queued
  return `simulation.queueToggleHarvesting(${inputType});\n`;
};

javascriptGenerator.forBlock["toggle_seeding"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulation.queueToggleSeeding(${inputType});\n`;
};

javascriptGenerator.forBlock["wait_x_weeks"] = function (block, generator) {
  const weeks =
    generator.valueToCode(block, "WEEKS", generator.ORDER_ATOMIC) || "1";
  return `simulation.queueWait(${weeks});\n`;
};

// --- These logic/getter blocks are now slightly different ---

javascriptGenerator.forBlock["is_over_tile"] = function (block, generator) {
  const type = block.getFieldValue("TYPE");
  // This needs to check the simulation state *right now*
  let checkResult = `simulation.CheckIfPlantInFront(${type})`;
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

javascriptGenerator.forBlock["get_current_week"] = function (block, generator) {
  // This needs to get the *current* state
  return ["simulation.getState().currentWeek", generator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["variables_get"] = function (block, generator) {
  // Variable getter.
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  return [varName, generator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["variables_set"] = function (block, generator) {
  // Variable setter.
  const argument0 =
    generator.valueToCode(block, "VALUE", generator.ORDER_ASSIGNMENT) || "0";
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  return varName + " = " + argument0 + ";\n";
};

javascriptGenerator.forBlock["on_run"] = function (block, generator) {
  const statements_code = generator.statementToCode(block, "STACK");
  return statements_code;
};

javascriptGenerator.forBlock["on_week_x"] = function (block, generator) {
  const statements_code = generator.statementToCode(block, "STACK");
  return statements_code; 
};
javascriptGenerator.forBlock["start_program"] = function () {
  return `\n`;
};