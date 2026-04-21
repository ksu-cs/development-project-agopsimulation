import { javascriptGenerator } from "blockly/javascript";
import { CROP_TYPES } from "../States/StateClasses/CropState";
import { VEHICLES } from "../States/StateClasses/ImplementState";

javascriptGenerator.forBlock["move_forward"] = function (block) {
  const duration = Number(block.getFieldValue("DURATION")) || 1;
  return `await simulationMethods.moveForward(${duration});\n`;
};

javascriptGenerator.forBlock["turn_left"] = function () {
  return `await simulationMethods.turnXDegrees(-90);\n`;
};

javascriptGenerator.forBlock["turn_right"] = function () {
  return `await simulationMethods.turnXDegrees(90);\n`;
};

javascriptGenerator.forBlock["turn_x_degrees"] = function (block) {
  let amount = Number(block.getFieldValue("DEGREES")) || 1;
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

javascriptGenerator.forBlock["wait_x_time"] = function (block) {
  const weeks = Number(block.getFieldValue("WEEKS")) || 1;
  const timeValue = block.getFieldValue("time_value");
  return `await simulationMethods.waitXTime(${weeks}, ${timeValue});\n`;
};

javascriptGenerator.forBlock["is_over_tile"] = function (block, generator) {
  const type = block.getFieldValue("TYPE");
  let checkResult = `simulationMethods.CheckIfPlantInFront(${type})`;
  return [checkResult, generator.ORDER_ATOMIC];
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

javascriptGenerator.forBlock["fill_vehicle_fuel_tank"] = function (block) {
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
  return `simulationMethods.fillVehicleFuelTank(${vehicle});\n`;
};

javascriptGenerator.forBlock["toggle_watering"] = function (block) {
  const toggle = block.getFieldValue("toggleType");
  const inputType = toggle == 0 ? false : true;
  return `simulationMethods.toggleWatering(${inputType});\n`;
};
