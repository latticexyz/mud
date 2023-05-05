import { mudConfig } from "@latticexyz/world/register"

export default mudConfig({
  tables: {
    TodoItem: {
      schema: {
        completed: "bool",
        body: "string",
      },
    },
    Owned: {
      schema: {
        owner: "bytes32",
      },
    }
  },
  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
