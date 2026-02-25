import {
  CROP_STAGES,
  CROP_TYPES,
  CropState,
} from "../States/StateClasses/CropState";
import FieldTileState from "../States/StateClasses/FieldTileState";

/**
 * Changes to be made:
 * Make the Tile byte size dynamic?
 *  - Pass in byte size as a var on create blank field
 *    - Would set the first byte to be the tile byte size then the rest 0s
 *  - All accessor methods would use the dynamic tile byte size to iterate through the data
 * Questions:
 *  - Set it up to be able to add any property to the tile? Possible efficently?
 *  - Make abstraction methods a class or continue as static methods?
 *  - Ideal world, alter/add/remove FieldTileState properties and have this be able store it without having to change code anywhere else. Possible?
 */

export const TILE_BYTE_SIZE = 13;
/**
 * Field tile bit setup (current)
 * Crop type 4 types supported (2 bits)
 * Crop stage rest of crop type byte, so 2^6 = 64 stages (6 bits)
 * Current GDD 3 bytes 2^24 = 16,777,216. or ability to go to hundreds of thousands (overkill) with decimal percision of .00
 * Required GDD 3 bytes (same as current GDD)
 */

/**
 * Allocates a space in memory for the field to be placed
 * @param {int} rows the amount of rows for the field
 * @param {int} columns the amount of columns for the field
 * @returns A Uint8Array with the memory allocated and set to 0's
 */
export function CreateBlankField(rows, columns) {
  const totalArraySize = TILE_BYTE_SIZE * rows * columns;

  const buffer = new ArrayBuffer(totalArraySize);
  const field = new Uint8Array(buffer);

  return field;
}

/**
 * Sets up the data for the intial state of the field
 * @param {Uint8Array} field The memory array where the field is
 * @param {FieldTileState} initalTileState The crop state values to intialize the field to
 */
export function InitializeField(field, initialTileState) {
  for (let i = 0; i < field.length; i += TILE_BYTE_SIZE) {
    AlterEntireFieldTileUsingUintArrayIndex(field, initialTileState, i);
  }
}

/**
 * Changes a crop tile on the field to be different values
 * @param {Uint8Array} field The memory array where the field is
 * @param {FieldTileState} tileState The crop stage to change the tile to
 * @param {int} x The x value for where the tile is located at on the field
 * @param {int} y The y value for where the tile is located at on the field
 * @param {int} width The width of the field
 */
export function ChangeFieldTile(field, tileState, x, y, width) {
  let i = GetTileIndex(x, y, width);
  AlterEntireFieldTileUsingUintArrayIndex(field, tileState, i);
}

/**
 * Gets a readable form of the FieldTile state at the specified x and y coordinate
 * @param {Uint8Array} field The memory array where the field is
 * @param {int} x The x value for where the tile is located at on the field
 * @param {int} y The y value for where the tile is located at on the field
 * @param {int} width The width of the field
 * @returns A new FieldTile state object with all the information in the tile
 */
export function GetFieldTile(field, x, y, width) {
  let i = GetTileIndex(x, y, width);

  let tile = new FieldTileState();

  tile.cropState = GetCropState(field, x, y, width);

  // 2. Populate Tile Properties
  tile.waterLevel = Convert3Uint8ToFloat(
    field[i + 7],
    field[i + 8],
    field[i + 9],
  );

  tile.minerals = Convert3Uint8ToFloat(
    field[i + 10],
    field[i + 11],
    field[i + 12],
  );

  return tile;
}

/**
 * Alters all the properties in a field tile based on the given CropState
 * @param {Uint8Array} field The memory array where the field is
 * @param {FieldTileState} tileState The crop stage to change the tile to
 * @param {int} i The index int the UintArray to alter
 */
function AlterEntireFieldTileUsingUintArrayIndex(field, tileState, i) {
  const cropState = tileState.cropState;
  // Edits first byte of tile
  field[i] =
    GetBitsForCropStage(cropState.stage) | GetBitsForCropType(cropState.type);

  // Edits bytes 2-4 (Current GDD) of tile
  let currentGDDFlag = ConvertFloatToUint24(cropState.currentGDD);

  field[i + 1] = (currentGDDFlag >> 16) & 0xff;
  field[i + 2] = (currentGDDFlag >> 8) & 0xff;
  field[i + 3] = currentGDDFlag & 0xff;

  // Edits bytes 5-7 (required GDD) of tile
  let requiredGDDFlag = ConvertFloatToUint24(cropState.requiredGDD);

  field[i + 4] = (requiredGDDFlag >> 16) & 0xff;
  field[i + 5] = (requiredGDDFlag >> 8) & 0xff;
  field[i + 6] = requiredGDDFlag & 0xff;

  // Edits bytes 8-10 (water) of tile
  let waterFlag = ConvertFloatToUint24(tileState.waterLevel);
  field[i + 7] = (waterFlag >> 16) & 0xff;
  field[i + 8] = (waterFlag >> 8) & 0xff;
  field[i + 9] = waterFlag & 0xff;

  // Edits bytes 11-13 (minerals) of tile
  let mineralsFlag = ConvertFloatToUint24(tileState.minerals);
  field[i + 10] = (mineralsFlag >> 16) & 0xff;
  field[i + 11] = (mineralsFlag >> 8) & 0xff;
  field[i + 12] = mineralsFlag & 0xff;
}

/**
 * Gets a readable form of the Crop state at the specified x and y coordinate
 * @param {Uint8Array} field The memory array where the field is
 * @param {int} x The x value for where the tile is located at on the field
 * @param {int} y The y value for where the tile is located at on the field
 * @param {int} width The width of the field
 * @returns A new Crop state object with all the information in the tile
 */
export function GetCropState(field, x, y, width) {
  let i = GetTileIndex(x, y, width);

  let crop = new CropState();

  crop.type = field[i] & 0x03;
  crop.stage = (field[i] >> 2) & 0xff;

  crop.currentGDD = Convert3Uint8ToFloat(
    field[i + 1],
    field[i + 2],
    field[i + 3],
  );
  crop.requiredGDD = Convert3Uint8ToFloat(
    field[i + 4],
    field[i + 5],
    field[i + 6],
  );

  return crop;
}

/**
 * Gives the proper bit flag to alter the bits representing crop type
 * @param {CROP_TYPES} cropType What crop type the tile should be
 * @returns A bit flag representing the crop type
 */
export function GetBitsForCropType(cropType) {
  switch (cropType) {
    case CROP_TYPES.EMPTY:
      return 0x00;
    case CROP_TYPES.WHEAT:
      return 0x01;
    case CROP_TYPES.CORN:
      return 0x02;
    case CROP_TYPES.SOY:
      return 0x03;
    default:
      return GetBitsForCropType(CROP_TYPES.WHEAT);
  }
}

/**
 * Gives proper bit flag to alter the bits representing crop stage
 * @param {CROP_STAGES} cropStage What stage the crop is at
 * @returns A bit flag representing the crop stage
 */
export function GetBitsForCropStage(cropStage) {
  switch (cropStage) {
    case CROP_STAGES.UNPLANTED:
      return 0x00 << 2;
    case CROP_STAGES.SEEDED:
      return 0x01 << 2;
    case CROP_STAGES.MATURE:
      return 0x02 << 2;
    default:
      return GetBitsForCropStage(CROP_STAGES.UNPLANTED);
  }
}

/**
 * Checks to make sure float is in proper range for Uint24 and converts it. Multiplies it by 100 to keep the decimal in the uint24 to a precision of .00
 * @param {float} floatToConvert A float between 0 and 167772.154 inclusive
 * @returns A bit flag representing the passed float in Uint24 form
 */
export function ConvertFloatToUint24(floatToConvert) {
  if (floatToConvert > 167772.154 || floatToConvert < 0) return 0x000000;

  let intForConversion = Math.round(floatToConvert * 100);

  return intForConversion & 0xffffff;
}

/**
 * Convets 3 8 bit Uint's into a float
 * @param {Uint8} u8_1 Most significant byte
 * @param {Uint8} u8_2 Second most significant byte
 * @param {Uint8} u8_3 Least significant byte
 * @returns A Float that is the combination of the three Uint8's
 */
export function Convert3Uint8ToFloat(u8_1, u8_2, u8_3) {
  return ((u8_1 << 16) | (u8_2 << 8) | u8_3) / 100;
}

/**
 * Calculates the index in the 1D array from 2D array coordinates
 * @param {int} x The ZERO INDEXED x value where it should be in the array
 * @param {int} y The ZERO INDEXED y value where it should be in the array
 * @param {int} width The width of the field
 * @returns The corresponding index for the given coordinates
 */
export function GetTileIndex(x, y, width) {
  return (width * y + x) * TILE_BYTE_SIZE;
}
