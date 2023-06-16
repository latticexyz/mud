/* eslint-disable no-undef */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["tests"],
  moduleNameMapper: {
    // jest can't handle esm imports, so we import the typescript source instead
    "^@latticexyz/utils$": "<rootDir>/../utils/src/index.ts",
  },
};
