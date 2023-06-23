import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Number: {
      keySchema: {
        key: "uint32",
      },
      schema: {
        value: "uint32",
      },
    },
  },
});
