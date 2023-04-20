/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  roots: ["src"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleNameMapper: {
    // fix TS build issues
    "^(..?/.*).js$": "$1",
    // jest can't handle esm imports, so we import the typescript source instead
    "^@latticexyz/schema-type$": "<rootDir>/../schema-type/src/typescript/index.ts",
  },
};
