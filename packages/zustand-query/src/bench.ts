import { bench } from "@ark/attest";
import { runQuery } from "./runQuery";
import { createStore } from "./createStore";
import { defineStore } from "@latticexyz/store";
import { In } from "./queryFragments";

const config = defineStore({
  tables: {
    Position: {
      schema: { player: "address", x: "int32", y: "int32" },
      key: ["player"],
    },
  },
});
const store = createStore(config);

bench("defineStore", () => {
  createStore(
    defineStore({
      tables: {
        Position: {
          schema: { player: "address", x: "int32", y: "int32" },
          key: ["player"],
        },
      },
    }),
  );
}).types([2119, "instantiations"]);

bench("boundTable", () => {
  const table = store.getState().actions.getTable(config.tables.Position);
  table.getRecord({ key: { player: "0x" } });
}).types([2, "instantiations"]);

bench("runQuery", () => {
  const Position = store.getState().actions.getTable(config.tables.Position);
  runQuery([In(Position)]);
}).types([10, "instantiations"]);
