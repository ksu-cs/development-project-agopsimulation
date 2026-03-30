import BitmapFieldState from "../src/BinaryArrayAbstractionMethods/BitmapFieldState";
import {
  CROP_GDDS,
  CROP_STAGES,
  CROP_TYPES,
} from "../src/States/StateClasses/CropState";

function CreateFieldState(rows, cols) {
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
  return new BitmapFieldState(rows, cols, tileKey);
}

test("Initialization creates the correct arrays and values", () => {
  const rows = 10;
  const cols = 10;
  const test = CreateFieldState(rows, cols);
  const buffer1 = new ArrayBuffer(rows * cols * 1);
  const array1 = new Uint8Array(buffer1);
  const buffer2 = new ArrayBuffer(rows * cols * 4);
  const array2 = new Float32Array(buffer2);
  const expected1 = {
    ["stage"]: {
      arr: array1,
      type: "uint8",
      size: 1,
    },
  };

  const expected2 = {
    ["currentGDD"]: {
      arr: array2,
      type: "float32",
      size: 4,
    },
  };

  expect(test.fieldProps["stage"]).not.toEqual(null);
  expect(test.fieldProps["stage"]).not.toEqual(undefined);
  expect(test.fieldProps["stage"].arr).toBeInstanceOf(Uint8Array);
  expect(test.fieldProps["stage"]).toEqual(expected1["stage"]);

  expect(test.fieldProps["currentGDD"]).not.toEqual(null);
  expect(test.fieldProps["currentGDD"]).not.toEqual(undefined);
  expect(test.fieldProps["currentGDD"].arr).toBeInstanceOf(Float32Array);
  expect(test.fieldProps["currentGDD"]).toEqual(expected2["currentGDD"]);
});

test("InitializeField correctly inputs values", () => {
  const rows = 2;
  const cols = 2;
  const test = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  test.InitializeField(startingValues);

  Object.entries(startingValues).forEach(([name, value]) => {
    for (let i = 0; i < rows * cols; i++) {
      expect(test.fieldProps[name].arr[i]).toEqual(value);
    }
  });
});

test("clone returns an exact copy", () => {
  const rows = 2;
  const cols = 2;
  const expected = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  expected.InitializeField(startingValues);

  expect(expected.clone()).toEqual(expected);
});

test("AddVariables correctly adds one variable", () => {
  const rows = 2;
  const cols = 2;
  const given = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  given.InitializeField(startingValues);

  const vars = {
    ["newVar"]: {
      size: 8,
      type: "float64",
    },
  };
  const num = given.AddVariables(vars);

  const buffer = new ArrayBuffer(rows * cols * 8);
  const array = new Float64Array(buffer);

  const expected = {
    ["newVar"]: {
      arr: array,
      type: "float64",
      size: 8,
    },
  };

  expect(num).toEqual(1);
  expect(given.fieldProps["newVar"]).not.toEqual(undefined);
  expect(given.fieldProps["newVar"]).not.toEqual(null);
  expect(given.fieldProps["newVar"].arr).toEqual(array);
  expect(given.fieldProps["newVar"].arr).toBeInstanceOf(Float64Array);
  expect(given.fieldProps["newVar"]).toEqual(expected["newVar"]);
});

test("AddVariables correctly adds multiple variables", () => {
  const rows = 2;
  const cols = 2;
  const given = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  given.InitializeField(startingValues);

  const vars = {
    ["newVar"]: {
      size: 8,
      type: "float64",
    },
    ["newVar1"]: {
      size: 4,
      type: "float32",
    },
    ["newVar2"]: {
      size: 2,
      type: "uint16",
    },
  };
  const num = given.AddVariables(vars);

  const buffer1 = new ArrayBuffer(rows * cols * 8);
  const array1 = new Float64Array(buffer1);

  const buffer2 = new ArrayBuffer(rows * cols * 4);
  const array2 = new Float32Array(buffer2);

  const buffer3 = new ArrayBuffer(rows * cols * 2);
  const array3 = new Uint16Array(buffer3);

  const expected = {
    ["newVar"]: {
      arr: array1,
      type: "float64",
      size: 8,
    },
    ["newVar1"]: {
      arr: array2,
      type: "float32",
      size: 4,
    },
    ["newVar2"]: {
      arr: array3,
      type: "uint16",
      size: 2,
    },
  };

  expect(num).toEqual(3);

  expect(given.fieldProps["newVar"]).not.toEqual(undefined);
  expect(given.fieldProps["newVar"]).not.toEqual(null);
  expect(given.fieldProps["newVar"].arr).toEqual(array1);
  expect(given.fieldProps["newVar"].arr).toBeInstanceOf(Float64Array);
  expect(given.fieldProps["newVar"]).toEqual(expected["newVar"]);

  expect(given.fieldProps["newVar1"]).not.toEqual(undefined);
  expect(given.fieldProps["newVar1"]).not.toEqual(null);
  expect(given.fieldProps["newVar1"].arr).toEqual(array2);
  expect(given.fieldProps["newVar1"].arr).toBeInstanceOf(Float32Array);
  expect(given.fieldProps["newVar1"]).toEqual(expected["newVar1"]);

  expect(given.fieldProps["newVar2"]).not.toEqual(undefined);
  expect(given.fieldProps["newVar2"]).not.toEqual(null);
  expect(given.fieldProps["newVar2"].arr).toEqual(array3);
  expect(given.fieldProps["newVar2"].arr).toBeInstanceOf(Uint16Array);
  expect(given.fieldProps["newVar2"]).toEqual(expected["newVar2"]);
});

test("setTile correctly alters the right tile", () => {
  const rows = 2;
  const cols = 2;
  const given = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  given.InitializeField(startingValues);

  startingValues["waterLevel"] = 1100;

  const result = given.setTile(0, 0, startingValues);

  expect(result).toEqual(true);
  expect(given.fieldProps["waterLevel"].arr[0]).toEqual(
    startingValues["waterLevel"],
  );
});

test("setVariable correctly alters the right tile and variable", () => {
  const rows = 2;
  const cols = 2;
  const given = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  given.InitializeField(startingValues);

  const value = 1100;

  const result = given.setVariable("waterLevel", value, 0, 0);

  expect(result).toEqual(true);
  expect(given.fieldProps["waterLevel"].arr[0]).toEqual(value);
});

test("getTileAt returns the correct tile", () => {
  const rows = 2;
  const cols = 2;
  const given = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  given.InitializeField(startingValues);

  startingValues["waterLevel"] = 1100;
  given.setVariable("waterLevel", 1100, 0, 0);

  const result = given.getTileAt(0, 0);

  expect(result).toEqual(startingValues);
});

test("getVariableAt gets the right variable at the right spot", () => {
  const rows = 2;
  const cols = 2;
  const given = CreateFieldState(rows, cols);

  const startingValues = {
    ["stage"]: CROP_STAGES.MATURE,
    ["type"]: CROP_TYPES.CORN,
    ["currentGDD"]: 0,
    ["requiredGDD"]: CROP_GDDS[CROP_TYPES.CORN],
    ["waterLevel"]: 1000,
    ["minerals"]: 1000,
  };
  given.InitializeField(startingValues);

  startingValues["waterLevel"] = 1100;
  given.setVariable("waterLevel", 1100, 0, 0);

  const result = given.GetVariableAt(0, 0, "waterLevel");

  expect(result).not.toEqual(null);
  expect(result).toEqual(startingValues["waterLevel"]);
});
