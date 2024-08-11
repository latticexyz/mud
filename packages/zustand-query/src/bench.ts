import { bench } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { createStore } from "./createStore";
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
  const table = store.getTable({ table: config.tables.Position });
  table.getRecord({ key: { player: "0x" } });
}).types([2, "instantiations"]);

bench("runQuery", () => {
  const { Position } = config.tables;
  store.runQuery({ query: [In(Position)] });
}).types([10, "instantiations"]);

const filledStore = createStore(config);
const numItems = 10_000;
for (let i = 0; i < numItems; i++) {
  filledStore.setRecord({
    table: config.tables.Position,
    key: { player: `0x${i}` },
    record: { x: i, y: i },
  });
}
bench("setRecord", () => {
  filledStore.setRecord({
    table: config.tables.Position,
    key: { player: `0x0` },
    record: { x: 1, y: 1 },
  });
}).mark({ mean: [1340, "us"], median: [1400, "us"] });

bench("10x setRecord", () => {
  for (let i = 0; i < 10; i++) {
    filledStore.setRecord({
      table: config.tables.Position,
      key: { player: `0x${i}` },
      record: { x: i + 1, y: i + 1 },
    });
  }
}).mark({ mean: [13400, "us"], median: [13400, "us"] });
