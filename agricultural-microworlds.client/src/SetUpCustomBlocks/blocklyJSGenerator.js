import { javascriptGenerator } from "blockly/javascript";
import { CROP_TYPES } from "../States/StateClasses/CropState";
import { VEHICLES } from "../States/StateClasses/ImplementState";

/**
 * Sends a message to move the current worker forward.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["move_forward"] = function (block) {
  const duration = Number(block.getFieldValue("DURATION")) || 1;
  return `await simulationMethods.moveForward(${duration});\n`;
};

/**
 * Sends a message to turn the current worker 90 degrees left.
 */
javascriptGenerator.forBlock["turn_left"] = function () {
  return `await simulationMethods.turnXDegrees(-90);\n`;
};

/**
 * Sends a message to turn the current worker 90 degrees right.
 */
javascriptGenerator.forBlock["turn_right"] = function () {
  return `await simulationMethods.turnXDegrees(90);\n`;
};

/**
 * Sends a message to turn the current worker any number of degrees left or right.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["turn_x_degrees"] = function (block) {
  let amount = Number(block.getFieldValue("DEGREES")) || 1;
  const direction = block.getFieldValue("DIRECTION");

  if (direction == 0) {
    amount = `(-1 * (${amount}))`;
  }

  return `await simulationMethods.turnXDegrees(${amount});\n`;
};

/**
 * Sends a message to toggle harvesting for harvester workers.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["toggle_harvesting"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulationMethods.toggleHarvesting(${inputType});\n`;
};

/**
 * Sends a message to toggle seeding for seeder workers.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["toggle_seeding"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulationMethods.toggleSeeding(${inputType});\n`;
};

/**
 * Sends a message to have the current worker wait x amount of in-simulation time.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["wait_x_time"] = function (block) {
  const weeks = Number(block.getFieldValue("WEEKS")) || 1;
  const timeValue = block.getFieldValue("time_value");
  return `await simulationMethods.waitXTime(${weeks}, ${timeValue});\n`;
};

/**
 * Requests a check for if the current worker is over a specific tile.
 * @param {any} block The block calling this function.
 * @param {any} generator The JavaScript generator, used for code generation.
 */
javascriptGenerator.forBlock["is_over_tile"] = function (block, generator) {
  const type = block.getFieldValue("TYPE");
  let checkResult = `await simulationMethods.CheckIfPlantInFront(${type})`;
  return [checkResult, generator.ORDER_ATOMIC];
};

/**
 * Returns the value of this block's inputted number.
 * @param {any} block The block calling this function.
 * @param {any} generator The JavaScript generator, used for code generation.
 */
javascriptGenerator.forBlock["math_number"] = function (block, generator) {
  const number = block.getFieldValue("NUM");
  return [number, generator.ORDER_ATOMIC];
};

/**
 * Compares two different values to see if they are equal.
 * @param {any} block The block calling this function.
 * @param {any} generator The JavaScript generator, used for code generation.
 */
javascriptGenerator.forBlock["custom_compare"] = function (block, generator) {
  const value_a =
    generator.valueToCode(block, "A", generator.ORDER_ATOMIC) || "0";
  const value_b =
    generator.valueToCode(block, "B", generator.ORDER_ATOMIC) || "0";
  const code = `${value_a} == ${value_b}`;
  return [code, generator.ORDER_EQUALITY];
};

/**
 * Requests the value of the current week of the simulation.
 * @param {any} generator The JavaScript generator, used for code generation.
 */
javascriptGenerator.forBlock["get_current_week"] = function (generator) {
  return ["simulationMethods.currentWeek", generator.ORDER_ATOMIC];
};

/**
 * Handles the start of a program. Empty, but connects to subsequent blocks.
 */
javascriptGenerator.forBlock["start_program"] = function () {
  return `\n`;
};

/**
 * Handles the event of a block function being called. Empty, but connects to subsequent blocks.
 */
javascriptGenerator.forBlock["function_event"] = function () {
  return `\n`;
};

/**
 * Searches through the current workspace, and generates the code from all events with a matching identifier.
 * Allows infinite recursion, but cuts off once the error is reached.
 * @param {any} block The block calling this function.
 * @param {any} generator The JavaScript generator, used for code generation.
 */
javascriptGenerator.forBlock["function_call"] = function (block, generator) {
  if (block.workspace) {
    const functionName = String(block.getFieldValue("FUNCTIONNAME")) || "";
    const allBlocks = block.workspace.getAllBlocks(false);
    let code = "";

    if (allBlocks.length > 0) {
      allBlocks.forEach((eventBlock) => {
        if (eventBlock && eventBlock.type == "function_event") {
          const eventName =
            String(eventBlock.getFieldValue("FUNCTIONNAME")) || "";
          if (eventName == functionName) {
            try {
              code += generator.blockToCode(eventBlock);
            } catch (error) {
              console.warn("Error while generating function call: " + error); // NOTE: Should attempt to make return nothing at top-level!
              return `\n`;
            }
          }
        }
      });
    }

    //console.log(code);
    return code;
  }

  return `\n`;
};

/**
 * Changes the simulation's current vehicle type.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["change_vehicle"] = function (block) {
  const toggle = block.getFieldValue("toggleVehicle");
  var vehicle;
  switch (toggle) {
    case "0":
      vehicle = VEHICLES.HARVESTER;
      break;
    case "1":
      vehicle = VEHICLES.SEEDER;
      break;
    default:
      vehicle = VEHICLES.HARVESTER;
      break;
  }
  return `simulationMethods.setMainVehicleType(${vehicle});\n`;
};

/**
 * For seeder workers, requests a switch of the current crop being planted.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["switch_crop_being_planted"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  var crop;
  switch (toggle) {
    case "0":
      crop = CROP_TYPES.WHEAT;
      break;
    case "1":
      crop = CROP_TYPES.CORN;
      break;
    case "2":
      crop = CROP_TYPES.SOY;
      break;
    default:
      crop = CROP_TYPES.WHEAT;
  }
  return `simulationMethods.switchCropBeingPlanted(${crop});\n`;
};

/**
 * For the current worker, requests to refuel its current fuel tank.
 */
javascriptGenerator.forBlock["fill_vehicle_fuel_tank"] = function () {
  return `simulationMethods.fillVehicleFuelTank();\n`;
};

/**
 * For seeder workers, toggles on watering for crops.
 * @param {any} block The block calling this function.
 */
javascriptGenerator.forBlock["toggle_watering"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulationMethods.toggleWatering(${inputType});\n`;
};
