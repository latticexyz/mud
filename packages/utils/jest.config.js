/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // jest can't handle esm imports, so we import the typescript source instead
    "^@latticexyz/common$": "<rootDir>/../common/src/index.ts",
  },
};
