import BitmapFieldState from "../src/BinaryArrayAbstractionMethods/BitmapFieldState";

test("Initialization creates the correct arrays and values", () => {
    const tileKey = {
      ["stage"]: {
        size: 1,
        type: "uint8",
      },
      ["type"]: {
        size: 1,
        type: "uint8",
      },
      ["currentGDD"]: {
        size: 4,
        type: "float32",
      },
      ["requiredGDD"]: {
        size: 4,
        type: "float32",
      },
      ["waterLevel"]: {
        size: 4,
        type: "float32",
      },
      ["minerals"]: {
        size: 4,
        type: "float32",
      },
    };
    const rows = 10;
    const cols = 10;
    const test = new BitmapFieldState(rows, cols, tileKey);
    const buffer = new ArrayBuffer(rows * cols * 1);
    const array = new Uint8Array(buffer);
    const expect = {
        ["stage"]: {
            arr: array,
            type: "uint8",
            size: 1,
        }
    }

    expect(test.fieldProps["stage"]).not.toEqual(null);
    expect(test.fieldProps["stage"]).not.toEqual(undefined);
    expect(test.fieldProps["stage"]).toBeInstanceOf(Uint8Array);
    expect(test.fieldProps["stage"]).toEqual(expect);
});