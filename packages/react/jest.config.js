/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@latticexyz/recs$": "<rootDir>/../recs/src/index.ts",
  },
};
