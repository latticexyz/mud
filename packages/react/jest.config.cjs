/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // jest can't handle esm imports, so we import the typescript source instead
    "^@latticexyz/utils$": "<rootDir>/../utils/src/index.ts",
    "^@latticexyz/recs$": "<rootDir>/../recs/src/index.ts",
  },
};
