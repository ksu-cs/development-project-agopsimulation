/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  // Only list TS here if you want TS treated as ESM by Jest
  extensionsToTreatAsEsm: [".ts", ".tsx"],

  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
};
