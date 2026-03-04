/**
 * @readonly
 * @enum {number}
 */
export const CROP_STAGES = {
  UNPLANTED: 0,
  SEEDED: 1,
  MATURE: 2,
};

/**
 * @readonly
 * @enum {number}
 */
export const CROP_TYPES = {
  EMPTY: 0,
  WHEAT: 1,
  CORN: 2,
  SOY: 3,
};

/** @type {Record<CROP_TYPES, number>} */
export const CROP_GDDS = {
  [CROP_TYPES.UNPLANTED]: 0,
  [CROP_TYPES.WHEAT]: 1000.0,
  [CROP_TYPES.CORN]: 1300.0,
  [CROP_TYPES.SOY]: 900.0,
};

/** @type {Record<CROP_TYPES, number>} */
const CROP_YIELDSCORES = {
  [CROP_TYPES.UNPLANTED]: 0,
  [CROP_TYPES.WHEAT]: 1,
  [CROP_TYPES.CORN]: 3,
  [CROP_TYPES.SOY]: 2,
};

/**
 * An object that represents what the default crop state should be
 */
export const DEFAULT_CROP_STATE = {
  ["stage"]: CROP_STAGES.UNPLANTED,
  ["type"]: CROP_TYPES.EMPTY,
  ["currentGDD"]: 0.0,
  ["requiredGDD"]: 0.0,
  ["minerals"]: 1000,
  ["waterLevel"]: 1000,
};

/**
 * Updates the currentGDD of a field tile
 * @param {number} deltaGDD
 * @param {Object.<string, number>} tile the tile to update
 */
export function updateGrowth(deltaGDD, tile) {
  if (tile["stage"] !== CROP_STAGES.SEEDED) return;

  tile["currentGDD"] += deltaGDD;

  if (tile["currentGDD"] >= tile["requiredGDD"]) {
    tile["currentGDD"] = tile["requiredGDD"];
    tile["stage"] = CROP_STAGES.MATURE;
  }
}

/**
 * Changes the crop type and the releating properties to align with that
 * @param {CROP_TYPES} cropType the crop type to change to
 * @param {Object.<string, number>} tile the tile being altered
 */
export function changeCropType(cropType, tile) {
  tile["type"] = cropType;
  tile["requiredGDD"] = CROP_GDDS[cropType];
}

/**
 * Gets a crop's yield score.
 * @param {Object.<string, number>} tile the tile to get the yield score from
 * @returns {number} The crop's yield score.
 */
export function getYieldScore(tile) {
  if (!isMature()) return 0;
  return CROP_YIELDSCORES[tile["type"]];
}

/**
 * Tells whether the plant in a tile is currently growing or not
 * @param {Object.<string, number>} tile the tile to check
 * @returns {boolean} a representation of whether it is in a growing stage
 */
export function isGrowing(tile) {
  return tile["stage"] === CROP_STAGES.SEEDED;
}

/**
 * Tells whether the plant in a tile is fully grown or not
 * @param {Object.<string, number>} tile the tile to check
 * @returns {boolean} a representation of whether it is in a growing stage
 */
export function isMature(tile) {
  return tile["stage"] === CROP_STAGES.MATURE;
}

/**
 * Tells whether the plant in a tile is unplanted or not
 * @param {Object.<string, number>} tile the tile to check
 * @returns {boolean} a representation of whether it is in a growing stage
 */
export function isUnplanted(tile) {
  return tile["stage"] === CROP_STAGES.UNPLANTED;
}

/**
 * Resets the tile to a default version
 * @param {Object.<string, number>} tile the tile to alter
 */
export function reset(tile) {
  changeCropType(CROP_TYPES.EMPTY, tile);
  tile["stage"] = CROP_STAGES.UNPLANTED;
  tile["currentGDD"] = 0.0;
}

/**
 * Plants the seed for this crop
 * @param {CROP_TYPES} cropType The type of crop to change the seeded value to
 * @param {Object.<string, number>} tile the tile to alter
 */
export function plant(cropType, tile) {
  if (cropType === CROP_TYPES.EMPTY) return;
  tile["stage"] = CROP_STAGES.SEEDED;
  tile["currentGDD"] = 0.0;
  if (cropType != tile["type"]) {
    changeCropType(cropType);
  }
}

/**
 * Clones every property in the tile and gives back the clone
 * @param {Object.<string, number>} tile the tile to clone
 * @returns {Object.<string, number>} a clone of the given tile
 */
export function clone(tile) {
  let newCrop = {};
  Object.entries(tile).forEach(([name, value]) => {
    newCrop.name = value;
  });
  return newCrop;
}
