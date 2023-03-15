/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  roots: ["src"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // fix TS build issues
    "^(..?/.*).js$": "$1",
  },
};
