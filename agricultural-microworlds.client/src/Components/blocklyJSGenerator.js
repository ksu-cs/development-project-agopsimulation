/* eslint-disable no-unused-vars */
import { javascriptGenerator } from "blockly/javascript";
import * as jsMethods from "../simulationMethods";

/**
 * links the function to run to the custom block being called
 */
javascriptGenerator.forBlock["example"] = function (block) {
  return "exampleFunction()";
};
function exampleFunction() {
  console.log("proof");
}

javascriptGenerator.forBlock["move_forward"] = function (block, generator) {
  const duration =
    generator.valueToCode(block, "DURATION", generator.ORDER_ATOMIC) || "1";
  return `await simulationMethods.moveForward(${duration});\n`;
};

javascriptGenerator.forBlock["turn_left"] = function () {
  return "simulationMethods.turnLeft();\n";
};

javascriptGenerator.forBlock["turn_right"] = function (block) {
  return "simulationMethods.turnRight();\n";
};

javascriptGenerator.forBlock["turn_left_x_degrees"] = function (block) {
  const amount =
    javascriptGenerator.valueToCode(
      block,
      "DEGREES",
      javascriptGenerator.ORDER_ATOMIC,
    ) || "1";
  return `await simulationMethods.TurnXLeft(${amount});\n`;
};

javascriptGenerator.forBlock["turn_right_x_degrees"] = function (block) {
  const amount =
    javascriptGenerator.valueToCode(
      block,
      "DEGREES",
      javascriptGenerator.ORDER_ATOMIC,
    ) || "1";
  return `await simulationMethods.TurnXRight(${amount});\n`;
};
javascriptGenerator.forBlock["turn_harvesting_on"] = function (block) {
  return "simulationMethods.turnHarvestingOn();\n";
};
javascriptGenerator.forBlock["turn_harvesting_off"] = function (block) {
  return "simulationMethods.turnHarvestingOff();\n";
};
javascriptGenerator.forBlock["turn_seeding_on"] = function (block) {
  return "simulationMethods.turnSeedingOn();\n";
};
javascriptGenerator.forBlock["turn_seeding_off"] = function (block) {
  return "simulationMethods.turnSeedingOff();\n";
};

javascriptGenerator.forBlock["math_number"] = function (block) {
  const number = block.getFieldValue("NUM");
  return [number, javascriptGenerator.ORDER_ATOMIC];
};
