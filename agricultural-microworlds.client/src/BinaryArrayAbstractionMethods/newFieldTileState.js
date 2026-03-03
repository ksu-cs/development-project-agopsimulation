import FieldTileState from "../States/StateClasses/FieldTileState";

/**
 * Creates and manages a field utilizing a buffer arrays for efficient storage
 */
export default class BitmapFieldState {
    /**
     * @constructor Allocates all the needed memory space for all the buffer arrays
     * @param {int} rows The amount of rows the field should has 
     * @param {int} columns The amount of columns the field should have
     * @param {Object.<varName: string, {size: number, type: string}>} fieldTileKey A dictionary that has the property name as the key and the value size (bytes) and it's type as the value. Should be sorted by value size
     */
    constructor(rows, columns, fieldTileKey){
        this.width = columns;
        this.key = fieldTileKey;
        this.fieldProps = {};
        Object.entries(fieldTileKey).forEach(([name, value]) => {
            let buffer = new ArrayBuffer((value.size * rows * columns) + 1);
            let field = new Uint8Array(buffer);
            // since max size of a the value size is 255
            if(!(value.size < 1 || value.size > 255)) field[0] = value.size;
            this.fieldProps[name] = field;
        });
    }

    /**
     * Copies the values in initialTileState to every tile in the field
     * @param {FieldTileState} initialTileState The crop state values to initialize the field to
     */
    InitializeField(initialTileState){
        // goes through every buffer in the dictionary
        this.fieldProps.forEach(([name, array]) => {
            // traverses the data part of the array buffer value[0] is the amount of bytes per section
            for(let i = 1; i < array.length; i+=array[0]){
                this.#ChangeFieldTileVar(i, array[0], array, /* value to change to */);
            }
        });
    }

    /**
     * Sets the value of the given variable name at the given x and y
     * @param {string} name name of the variable to change
     * @param {any} value the value to change the variable to
     * @param {number} x horizontal distance from origin
     * @param {number} y vertical distance from origin
     */
    set(name, value, x, y){
        let nameBufferArray = this.fieldProps[name];
        let size = nameBufferArray[0];
        let i = this.#GetTileIndex(x, y, size);
        this.#ChangeFieldTileVar(i, size, nameBufferArray, value);
    }

    /**
     * Changes field tile variable to the 
     * @param {*} i The index to start altering at in the array
     * @param {*} size The size of the value
     * @param {*} arr The array to alter the values of
     * @param {any} value 
     */
    #ChangeFieldTileVar(i, size, arr, value){
        // shift the bits of every 1 byte of the initial state value over and store it in the array
        for(let j = 0; j < size; j++){
            arr[i + j] = (value >> ((size - j + 1) * 8)) & 0xff;
        }
    }



    /**
     * Calculates the proper index value for a ArrayBuffer
     * @param {number} x horizontal distance away from origin
     * @param {number} y vertical distance away from origin
     * @param {number} byteSize the amount of bytes the variable is
     * @returns an index that represents the x and y vars given
     */
    #GetTileIndex(x, y, byteSize){
        return (this.width * y + x) * byteSize;
    }
}