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
    generator.valueToCode(
      block,
      "DURATION",
      generator.ORDER_ATOMIC,
    ) || "1";
  return `await simulationMethods.moveForward(${duration});\n`;
}; // call needs to be releative to where the code is generated?
    //simulationMethods.moveForward(duration);
