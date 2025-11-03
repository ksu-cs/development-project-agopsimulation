/* eslint-disable no-unused-vars */
import * as Blockly from "blockly/core";
import "blockly/javascript";
import * as jsMethods from "../simulationMethods";

/**
 * links the function to run to the custom block being called
 */
Blockly.JavaScript["example"] = function (block) {
  return "exampleFunction()";
};
function exampleFunction() {
  console.log("proof");
}

Blockly.JavaScript["move_forward"] = function(block){
  const duration =
          Blockly.JavaScript.valueToCode(
            block,
            "DURATION",
            Blockly.JavaScript.ORDER_ATOMIC,
          ) || "1";
        return `await jsMethods.moveForward(${duration});\n`;
}

