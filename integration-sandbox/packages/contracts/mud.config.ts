import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    NumberList: {
      keySchema: {},
      schema: {
        value: "uint32[]",
      },
    },
  },
});
