const typeMap = {
  int8: Int8Array,
  uint8: Uint8Array,
  int16: Int16Array,
  uint16: Uint16Array,
  int32: Int32Array,
  uint32: Uint32Array,
  float32: Float32Array,
  float64: Float64Array,
};

/**
 * Questions:
 *  - Keep it as a returning a dictionary or change it to return a json object??
 */

/**
 * Creates and manages a field utilizing a buffer arrays for efficient storage
 */
export default class BitmapFieldState {
  /**
   * @constructor Allocates all the needed memory space for all the buffer arrays
   * @param {int} rows The amount of rows the field should has
   * @param {int} columns The amount of columns the field should have
   * @param {Object.<string, {size: number, type: string}>} fieldTileKey A dictionary that has the property name as the key and the value size (bytes) and it's type as the value. Should be sorted by value size
   */
  constructor(rows, columns, fieldTileKey) {
    this.width = columns;
    this.length = rows * columns;
    this.key = fieldTileKey;
    /** @type {Object.<string, {arr: ArrayBuffer, type: string, size: number}>} */
    this.fieldProps = {};
    Object.entries(fieldTileKey).forEach(([name, value]) => {
      let buffer = new ArrayBuffer(value.size * this.length);

      const typeArray = typeMap[value.type.toLowerCase()];
      let field = new typeArray(buffer);

      this.fieldProps[name] = {
        arr: field,
        type: value.type,
        size: value.size,
      };
    });
  }

  /**
   * Copies the values in initialTileState to every tile in the field
   * @param {Object.<string, number>} initialTileState The crop state values to initialize the field to
   */
  InitializeField(initialTileState) {
    // goes through every buffer in the dictionary
    // going through per array first to avoid cache misses
    Object.entries(this.fieldProps).forEach(([name, variableField]) => {
      // traverses the data part of the array buffer value[0] is the amount of bytes per section
      for (let i = 0; i < this.length; i++) {
        const value = initialTileState[name];
        variableField.arr[i] = value;
      }
    });
  }

  /**
   * Adds variables to each tile in the field
   * @param {Object.<string, {size: number, type: string}>} vars A dictionary of the names of the variables to add and there starting values
   * @returns {number} The number of variables that were added
   */
  AddVariables(vars) {
    let count = 0;
    Object.entries(vars).forEach(([name, value]) => {
      let result = this.#AddVariable(name, value.size, value.type);
      if (!result) count++;
    });
    return count;
  }

  /**
   * Adds the specified variable to each tile in the field
   * @param {string} name The name of the variable to add
   * @param {number} size The size of the variable
   * @param {string} type The type of variable to add
   * @returns {boolean} true if operation was a success, false otherwise
   */
  #AddVariable(name, size, type) {
    if (this.fieldProps[name]) return false;
    for (let i = 0; i < this.length; i++) {
      let buffer = new ArrayBuffer(size * this.length);

      const typeArray = typeMap[type.toLowerCase()];
      let field = new typeArray(buffer);

      if (this.fieldProps[name]) return false;
      this.fieldProps[name] = { arr: field, type: type, size: size };
    }
  }

  /**
   * Sets the value of an entire field tile
   * @param {number} x horizontal distance from origin
   * @param {number} y vertical distance from origin
   * @param {Object.<string, number>} tileState A "dictionary" that has the variable name and the number to store
   * @returns {boolean} false if the operation failed, true if it was successful
   */
  setTile(x, y, tileState) {
    Object.entries(this.fieldProps).forEach(([name, nameBufferArray]) => {
      const value = tileState[name];
      let result = this.setVariable(name, value, x, y);
      if (!result) return false;
    });
    return true;
  }

  /**
   * Sets the value of the given variable name at the given x and y
   * @param {string} name name of the variable to change
   * @param {number} value the value to change the variable to
   * @param {number} x horizontal distance from origin
   * @param {number} y vertical distance from origin
   * @returns {boolean} false if the operation failed, true if it was successful
   */
  setVariable(name, value, x, y) {
    let nameBufferArray = this.fieldProps[name];
    if (!nameBufferArray) return false;

    let i = this.#GetTileIndex(x, y);

    nameBufferArray.arr[i] = value;
    return true;
  }

  /**
   * Gets all the values for a tile at the given x and y
   * @param {number} x horizontal distance from origin
   * @param {number} y vertical distance from origin
   * @returns {Object.<string, number>} A dictionary with the values of the tile
   */
  getTileAt(x, y) {
    /** @type {Object.<string, number}> */
    let tile = {};
    Object.entries(this.fieldProps).forEach(([name, nameBufferArray]) => {
      let result = this.GetVariableAt(x, y, name);
      if (!result) return null;
      tile[name] = result;
    });
    return tile;
  }

  /**
   * Gets the a specificed variable at a specified location
   * @param {number} x horizontal distance from origin
   * @param {number} y vertical distance from origin
   * @param {string} name the name of the variable to get
   * @returns {number?} The value of the requested variable or null if the operation failed
   */
  GetVariableAt(x, y, name) {
    let nameBufferArray = this.fieldProps[name];
    if (!nameBufferArray) return null;

    let i = this.#GetTileIndex(x, y);
    let value = nameBufferArray.arr[i];

    return value ? value : null;
  }

  /**
   * Changes field tile variable to the specified value using bit shifting operations
   * @param {number} i The index to start altering at in the array
   * @param {number} size The size of the value
   * @param {Uint8Array} arr The array to alter the values of
   * @param {number} value The value to change to
   */
  #ChangeFieldTileVar(i, size, arr, value) {
    // shift the bits of every 1 byte of the initial state value over and store it in the array
    for (let j = 0; j < size; j++) {
      arr[i + j] = (value >> ((size - j + 1) * 8)) & 0xff;
    }
  }

  /**
   * Calculates the proper index value for a ArrayBuffer
   * @param {number} x horizontal distance away from origin
   * @param {number} y vertical distance away from origin
   * @returns {number} an index that represents the x and y vars given
   */
  #GetTileIndex(x, y) {
    return this.width * y + x;
  }
}
