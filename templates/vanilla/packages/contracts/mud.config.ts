import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Counter: {
      primaryKeys: {},
      schema: "uint32",
    },
  },
});
