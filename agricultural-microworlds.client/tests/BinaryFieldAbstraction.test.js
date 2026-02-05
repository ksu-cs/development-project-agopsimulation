import { CreateBlankField, InitializeField, ChangeFieldTile, GetCropState, GetBitsForCropType, GetBitsForCropStage, ConvertFloatToUint24, Convert3Uint8ToFloat, GetTileIndex } from "../src/BinaryArrayAbstractionMethods/BinaryFieldAbstraction";
import { CROP_STAGES, CROP_TYPES } from "../src/States/StateClasses/CropState";

test('CreateBlankField returns a Uint8Array with the correct values', ()=>{
    const width = 2;
    const height = 2;
    const bytesPerTile = 7;

    const expected = new Uint8Array(width * height * bytesPerTile).fill(0);
    const given = CreateBlankField(width, height);

    expect(given).toBeInstanceOf(Uint8Array);

    expect(given).toEqual(expected);
});

test('GetBitsForCropType returns the correct flag', ()=>{
    const crop = CROP_TYPES.WHEAT;

    const given = GetBitsForCropType(crop);
    const expected = 0;

    expect(typeof given).toBe("number");
    expect(given).toEqual(expected);
});

test('GetBitsForCropStage returns correct flag', () => {
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

test('ConvertFloatToUint24 returns corrent number', () =>{
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

test('Convert3Uint8ToFloat returns correct number', () => {
    const given = [0x01, 0x07, 0xFF];

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

test('GetTileIndex returns correct number', () => {
    const given1 = GetTileIndex(0, 0, 12);
    const given2 = GetTileIndex(1, 20, 12);
    const given3 = GetTileIndex(12, 12, 12);

    const expected1 = 12 * 0 + 0;
    const expected2 = 12 * 20 + 1;
    const expected3 = 12 * 12 + 12;

    expect(given1).toEqual(expected1);
    expect(given2).toEqual(expected2);
    expect(given3).toEqual(expected3);
});

