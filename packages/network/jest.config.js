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
    "^@latticexyz/common$": "<rootDir>/../common/src/index.ts",
    "^@latticexyz/common/chains$": "<rootDir>/../common/src/chains/index.ts",
    "^@latticexyz/common/deprecated$": "<rootDir>/../common/src/deprecated/index.ts",
    "^@latticexyz/common/utils$": "<rootDir>/../common/src/utils/index.ts",
    "^@latticexyz/recs$": "<rootDir>/../recs/src/index.ts",
    "^@latticexyz/schema-type$": "<rootDir>/../schema-type/src/typescript/index.ts",
    "^@latticexyz/schema-type/deprecated$": "<rootDir>/../schema-type/src/typescript/deprecated/index.ts",
    "^@latticexyz/services/ecs-snapshot$": "<rootDir>/../services/protobuf/ts/ecs-snapshot/ecs-snapshot.ts",
    "^@latticexyz/services/ecs-stream$": "<rootDir>/../services/protobuf/ts/ecs-stream/ecs-stream.ts",
    "^@latticexyz/services/mode$": "<rootDir>/../services/protobuf/ts/mode/mode.ts",
    "^@latticexyz/utils$": "<rootDir>/../utils/src/index.ts",
  },
};
