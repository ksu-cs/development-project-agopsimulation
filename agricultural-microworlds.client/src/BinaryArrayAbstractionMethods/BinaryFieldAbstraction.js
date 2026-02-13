import {
  CROP_STAGES,
  CROP_TYPES,
  CropState,
} from "../States/StateClasses/CropState";

export const TILE_BYTE_SIZE = 7;
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
 * @param {CropState} initalCropState The crop state values to intialize the field to
 */
export function InitializeField(field, initalCropState) {
  for (let i = 0; i < field.length; i += TILE_BYTE_SIZE) {
    AlterEntireFieldTileUsingUintArrayIndex(field, initalCropState, i);
  }
}

/**
 * Changes a crop tile on the field to be different values
 * @param {Uint8Array} field The memory array where the field is
 * @param {CropState} cropState The crop stage to change the tile to
 * @param {int} x The x value for where the tile is located at on the field
 * @param {int} y The y value for where the tile is located at on the field
 * @param {int} width The width of the field
 */
export function ChangeFieldTile(field, cropState, x, y, width) {
  AlterEntireFieldTileUsingUintArrayIndex(
    field,
    cropState,
    GetTileIndex(x, y, width),
  );
}

/**
 * Alters all the properties in a field tile based on the given CropState
 * @param {Uint8Array} field The memory array where the field is
 * @param {CropState} cropState The crop stage to change the tile to
 * @param {int} i The index int the UintArray to alter
 */
function AlterEntireFieldTileUsingUintArrayIndex(field, cropState, i) {
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

  let tile = new CropState();

  tile.type = field[i] & 0x03;
  tile.stage = (field[i] >> 2) & 0xff;

  tile.currentGDD = Convert3Uint8ToFloat(
    field[i + 1],
    field[i + 2],
    field[i + 3],
  );
  tile.requiredGDD = Convert3Uint8ToFloat(
    field[i + 4],
    field[i + 5],
    field[i + 6],
  );

  return tile;
}

/**
 * Gives the proper bit flag to alter the bits representing crop type
 * @param {CROP_TYPES} cropType What crop type the tile should be
 * @returns A bit flag representing the crop type
 */
export function GetBitsForCropType(cropType) {
  switch (cropType) {
    case CROP_TYPES.WHEAT:
      return 0x00;
    case CROP_TYPES.CORN:
      return 0x01;
    case CROP_TYPES.SOY:
      return 0x02;
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
