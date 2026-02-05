import { CreateBlankField, InitializeField, ChangeFieldTile, GetCropState } from "../src/BinaryArrayAbstractionMethods/BinaryFieldAbstraction";
import { CROP_STAGES, CROP_TYPES } from "../src/States/StateClasses/CropState";

test('CreateBlankField returns a Uint8Array', () =>{
    expect(CreateBlankField(1, 1)).toBeInstanceOf(Uint8Array);
});
test('CreateBlankField returns an array with the correct values', ()=>{const width = 2;
    const height = 2;
    const bytesPerTile = 7;
    const expected = new Uint8Array(width * height * bytesPerTile).fill(0);

    expect(CreateBlankField(width, height)).toEqual(expected);
});