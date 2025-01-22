import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "app",
  userTypes: {
    Entity: { type: "bytes32", filePath: "./src/Entity.sol" },
  },
  enums: {
    Direction: ["North", "East", "South", "West"],
  },
  tables: {
    // singletons
    EntityCount: { schema: { count: "uint256" }, key: [] },
    // components
    Owner: { id: "Entity", owner: "address" },
    Position: { id: "Entity", x: "int32", y: "int32" },
  },
  modules: [
    {
      artifactPath:
        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
      root: true,
    },
  ],
});
