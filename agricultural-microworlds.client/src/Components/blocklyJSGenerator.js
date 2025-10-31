/* eslint-disable no-unused-vars */
import * as Blockly from "blockly/core";
import "blockly/javascript";

/**
 * links the function to run to the custom block being called
 */
Blockly.JavaScript["example"] = function (block) {
  return "exampleFunction()";
};
function exampleFunction() {
  console.log("proof");
}
