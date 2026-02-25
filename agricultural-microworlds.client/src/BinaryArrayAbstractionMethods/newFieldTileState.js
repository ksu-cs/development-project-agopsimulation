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
            let buffer = new ArrayBuffer(value.size * rows * columns);
            let field = new Uint8Array(buffer);
            this.fieldProps[name] = field;
        });
    }

    /**
     * Copies the values in initialTileState to every tile in the field
     * @param {FieldTileState} initialTileState The crop state values to initialize the field to
     */
    InitializeField(initialTileState){
        
    }
}