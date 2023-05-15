import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    NumberList: {
      primaryKeys: {},
      schema: {
        value: "uint32[]",
      },
    },
  },
});
