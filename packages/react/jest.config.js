/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    // fix TS build issues
    "^(..?/.*).js$": "$1",
  },
  testEnvironment: "node",
};
