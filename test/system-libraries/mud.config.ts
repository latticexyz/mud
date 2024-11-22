import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespaces: {
    a: {
      tables: {
        Value: {
          schema: {
            value: "uint256",
          },
          key: [],
        },
        AddressValue: {
          schema: {
            value: "address",
          },
          key: [],
        },
      },
    },

    b: {},
  },
  codegen: {
    generateSystemLibraries: true,
  },
  modules: [
    {
      artifactPath: "@latticexyz/world-modules/out/StandardDelegationsModule.sol/StandardDelegationsModule.json",
      root: true,
      args: [],
    },
  ],
});
