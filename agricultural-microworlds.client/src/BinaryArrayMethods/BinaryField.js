/**
 * Allocates a space in memory for the field to be placed
 * @param {*} rows the amount of rows for the field
 * @param {*} columns the amount of columns for the field
 * @returns A Uint16Array with the memory allocated and set to 0's
 */
function CreateBlankField(rows, columns){
    const tileSize = 16;
    const intSize = 16;
    const sectionsPerTile = tileSize/intSize;
    const totalArraySize = sectionsPerTile * rows * columns;

    const buffer = new ArrayBuffer(totalArraySize);
    const field = new Uint16Array(buffer);

    return field;
}

/**
 * Sets up the data for the intial state of the field
 * @param {Uint16Array} field The memory array where the field is
 * @param {int} cropType What type of crop is to be intialized into the array
 * @param {int} cropStage What state that crop is in currently
 * @param {float} currentGDD The level of growth degree days for the inital plant
 * @param {float} requiredGDD The level of growth degree days for full growth
 */
function InitializeField(field, cropType, cropStage, currentGDD, requiredGDD){
    
    for(int i = 0; i < length; i++){
        field[i] |= 0x00000000000000FF;//sets first 2 byte num to be 3 to be changed
    }
}