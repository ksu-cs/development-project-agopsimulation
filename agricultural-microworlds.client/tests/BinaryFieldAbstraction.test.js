import {
  CreateBlankField,
  InitializeField,
  ChangeFieldTile,
  GetCropState as GetFieldTile,
  GetBitsForCropType,
  GetBitsForCropStage,
  ConvertFloatToUint24,
  Convert3Uint8ToFloat,
  GetTileIndex,
  TILE_BYTE_SIZE,
} from "../src/BinaryArrayAbstractionMethods/BinaryFieldAbstraction";
import {
  CROP_STAGES,
  CROP_TYPES,
  CropState,
} from "../src/States/StateClasses/CropState";
import FieldTileState from "../src/States/StateClasses/FieldTileState";

//import { expect, test } from "jest";

test("CreateBlankField returns a Uint8Array with the correct values", () => {
  const width = 2;
  const height = 2;

  const expected = new Uint8Array(width * height * TILE_BYTE_SIZE).fill(0);
  const given = CreateBlankField(width, height);

  expect(given).toBeInstanceOf(Uint8Array);

  expect(given).toEqual(expected);
});

test("GetBitsForCropType returns the correct flag", () => {
  const crop1 = CROP_TYPES.EMPTY;
  const crop2 = CROP_TYPES.WHEAT;
  const crop3 = CROP_TYPES.CORN;
  const crop4 = CROP_TYPES.SOY;

  const given1 = GetBitsForCropType(crop1);
  const given2 = GetBitsForCropType(crop2);
  const given3 = GetBitsForCropType(crop3);
  const given4 = GetBitsForCropType(crop4);

  const expected1 = 0;
  const expected2 = 1;
  const expected3 = 2;
  const expected4 = 3;

  expect(typeof given1).toBe("number");
  expect(typeof given2).toBe("number");
  expect(typeof given3).toBe("number");
  expect(typeof given4).toBe("number");
  expect(given1).toEqual(expected1);
  expect(given2).toEqual(expected2);
  expect(given3).toEqual(expected3);
  expect(given4).toEqual(expected4);
});

test("GetBitsForCropStage returns correct flag", () => {
  const crop1 = CROP_STAGES.UNPLANTED;
  const crop2 = CROP_STAGES.SEEDED;
  const crop3 = CROP_STAGES.MATURE;
  const crop4 = 74;

  const given1 = GetBitsForCropStage(crop1);
  const given2 = GetBitsForCropStage(crop2);
  const given3 = GetBitsForCropStage(crop3);
  const given4 = GetBitsForCropStage(crop4);

  const expected1 = 0b00000000;
  const expected2 = 0b00000100;
  const expected3 = 0b00001000;
  const expected4 = expected1;

  expect(typeof given1).toBe("number");
  expect(typeof given2).toBe("number");
  expect(typeof given3).toBe("number");
  expect(typeof given4).toBe("number");

  expect(given1).toEqual(expected1);
  expect(given2).toEqual(expected2);
  expect(given3).toEqual(expected3);
  expect(given4).toEqual(expected4);
});

test("ConvertFloatToUint24 returns corrent number", () => {
  const badFloat1 = -1;
  // max value of a Uint24/100
  const badFloat2 = 167772.155;
  // max value of a Uint24
  const badFloat3 = 16777215;

  const goodFloat1 = 100.12;
  const goodFloat2 = 100000.99;

  const badExpected1 = 0;
  const badExpected2 = 0;
  const badExpected3 = 0;

  // should correctly x100 the float to "remove the decimal"
  // then remove all non signficant remaining decimal places
  const goodExpected1 = 10012;
  const goodExpected2 = 10000099;

  expect(ConvertFloatToUint24(badFloat1)).toEqual(badExpected1);
  expect(ConvertFloatToUint24(badFloat2)).toEqual(badExpected2);
  expect(ConvertFloatToUint24(badFloat3)).toEqual(badExpected3);

  expect(ConvertFloatToUint24(goodFloat1)).toEqual(goodExpected1);
  expect(ConvertFloatToUint24(goodFloat2)).toEqual(goodExpected2);
});

test("Convert3Uint8ToFloat returns correct number", () => {
  const given = [0x01, 0x07, 0xff];

  // should take the first param and shift 16 bits over to the left
  // then the second param and shift 8 bits over to the left
  // then the last param and shift 0 bits over to the left
  //                                            first       second      third
  // so with the given the expected should be 0000 0001 | 0000 0111 | 1111 1111
  // then divide it by 100 to create the proper float number
  let expected = 0b000000010000011111111111;
  expected /= 100;

  expect(Convert3Uint8ToFloat(given[0], given[1], given[2])).toEqual(expected);
});

test("GetTileIndex returns correct number", () => {
  const given1 = GetTileIndex(0, 0, 12);
  const given2 = GetTileIndex(1, 20, 12);
  const given3 = GetTileIndex(12, 12, 12);

  const expected1 = (12 * 0 + 0) * TILE_BYTE_SIZE;
  const expected2 = (12 * 20 + 1) * TILE_BYTE_SIZE;
  const expected3 = (12 * 12 + 12) * TILE_BYTE_SIZE;

  expect(given1).toEqual(expected1);
  expect(given2).toEqual(expected2);
  expect(given3).toEqual(expected3);
});

test("InitializeField alters field correctly", () => {
  const width = 2;
  const height = 2;
  const byteFieldSize = width * height * TILE_BYTE_SIZE;
  let initialFieldTileState = new FieldTileState();
  initialFieldTileState.cropState.changeCropType(CROP_TYPES.WHEAT);
  initialFieldTileState.cropState.stage = CROP_STAGES.MATURE;
  let field = CreateBlankField(width, height);
  InitializeField(field, initialFieldTileState);

  let expected = new Uint8Array(byteFieldSize);

  // every 7 bytes should have first byte for crop stage and type
  // next 3 bytes for currentGDD, and last 3 bytes for requiredGDD
  // So with the current base CropState in the initializer:
  // byte 1 = 000010 00 (separated to show separation of the two in this byte, stage infront(6bits), and type in back(2bits))
  // byte 2-4 = 0000 0000 0000 0000 0000 0000 (separated every 4 bits for readability not to show separation)
  // byte 5-7 = 0000 0001 1000 0110 1010 0000 (separated every 4 bits for readability not to show separation)
  for (let i = 0; i < byteFieldSize; i += TILE_BYTE_SIZE) {
    // byte 1
    expected[i] = 0b00001001;

    // byte 2-4
    expected[i + 1] = 0b00000000;
    expected[i + 2] = 0b00000000;
    expected[i + 3] = 0b00000000;

    // byte 5-7
    expected[i + 4] = 0b00000001;
    expected[i + 5] = 0b10000110;
    expected[i + 6] = 0b10100000;

    // byte 8-10
    expected[i + 7] = 0b00000001;
    expected[i + 8] = 0b10000110;
    expected[i + 9] = 0b10100000;

    // byte 11-13
    expected[i + 10] = 0b00000001;
    expected[i + 11] = 0b10000110;
    expected[i + 12] = 0b10100000;
  }

  expect(field).toEqual(expected);
});

test("ChangeFieldTile correctly alters, THE CORRECT Tile", () => {
  const width = 12;
  const height = 12;
  const byteFieldSize = width * height * TILE_BYTE_SIZE;
  let initialFieldTileState = new FieldTileState();
  let field = CreateBlankField(width, height);
  InitializeField(field, initialFieldTileState);

  let newFieldTile = new FieldTileState();
  newFieldTile.cropState.type = CROP_TYPES.CORN;
  newFieldTile.cropState.currentGDD = 20;

  ChangeFieldTile(field, newFieldTile, 5, 5, 12);
  // currentGDD will be stored as 2000 after going through the Uint24 conversion process
  // type will be corn so the last 2 bits of the first byte in the tile should be 01, and the stage should be MATURE so the first 6 bits would be 0000 10
  // So the first byte will be 0000 1001
  // It would change bytes 3-4 in a tile section
  // Changing it to 0000 0111 1101 0000 = 2000
  // The index of the altered crop tile would be 5 * 12 + 5 = 65 * TILE_BYTE_SIZE = 845

  let expectedIndex = 845;

  let expectedValue = 20;

  for (let i = 0; i < byteFieldSize; i += TILE_BYTE_SIZE) {
    if (
      field[i + 2] == 0b00000111 &&
      field[i + 3] == 0b11010000 &&
      field[i] == 0b00001001
    ) {
      expect(i).toEqual(expectedIndex);
      break;
    }
  }

  expect(
    Convert3Uint8ToFloat(
      field[expectedIndex + 1],
      field[expectedIndex + 2],
      field[expectedIndex + 3],
    ),
  ).toEqual(expectedValue);
});

test("GetFieldTile correctly grabs the correct Tile", () => {
  const width = 12;
  const height = 12;
  let initialFieldTile = new FieldTileState();
  let field = CreateBlankField(width, height);
  InitializeField(field, initialFieldTile);

  let expectedIntial = GetFieldTile(field, 5, 5, width);

  expect(expectedIntial).toBeInstanceOf(CropState);

  const alterCropX = 5;
  const alterCropY = 4;
  const alterCropIndex = (width * alterCropY + alterCropX) * TILE_BYTE_SIZE;

  // changed stage to be seeded
  field[alterCropIndex] = 0b00000100;

  // changed currentGDD to 20.00
  field[alterCropIndex + 2] = 0b00000111;
  field[alterCropIndex + 3] = 0b11010000;

  // changed requiredGDD to 0000 0001 1000 0111 0000 0100 = 1001.00
  field[alterCropIndex + 4] = 0b00000001;
  field[alterCropIndex + 5] = 0b10000111;
  field[alterCropIndex + 6] = 0b00000100;

  let expectedCropState = new CropState();
  expectedCropState.stage = CROP_STAGES.SEEDED;
  expectedCropState.currentGDD = 20;
  expectedCropState.requiredGDD = 1001;

  let givenCropState = GetFieldTile(field, alterCropX, alterCropY, width);

  expect(givenCropState.stage).toEqual(expectedCropState.stage);
  expect(givenCropState.type).toEqual(expectedCropState.type);
  expect(givenCropState.currentGDD).toEqual(expectedCropState.currentGDD);
  expect(givenCropState.requiredGDD).toEqual(expectedCropState.requiredGDD);
});
