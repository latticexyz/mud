import { bench } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { createStash } from "./createStash";
import { In } from "./queryFragments";

const config = defineStore({
  tables: {
    Position: {
      schema: { player: "address", x: "int32", y: "int32" },
      key: ["player"],
    },
  },
});
const stash = createStash(config);

bench("createStash", () => {
  createStash(
    defineStore({
      tables: {
        Position: {
          schema: { player: "address", x: "int32", y: "int32" },
          key: ["player"],
        },
      },
    }),
  );
}).types([1690, "instantiations"]);

bench("boundTable", () => {
  const table = stash.getTable({ table: config.tables.Position });
  table.getRecord({ key: { player: "0x" } });
}).types([108, "instantiations"]);

bench("runQuery", () => {
  const { Position } = config.tables;
  stash.runQuery({ query: [In(Position)] });
}).types([95, "instantiations"]);

const filledStore = createStash(config);
const numItems = 10_000;
for (let i = 0; i < numItems; i++) {
  filledStore.setRecord({
    table: config.tables.Position,
    key: { player: `0x${i}` },
    value: { x: i, y: i },
  });
}
bench("setRecord", () => {
  filledStore.setRecord({
    table: config.tables.Position,
    key: { player: `0x0` },
    value: { x: 1, y: 1 },
  });
}).mark({ mean: [1.2, "us"], median: [1, "us"] });

bench("10x setRecord", () => {
  for (let i = 0; i < 10; i++) {
    filledStore.setRecord({
      table: config.tables.Position,
      key: { player: `0x${i}` },
      value: { x: i + 1, y: i + 1 },
    });
  }
}).mark({ mean: [13, "us"], median: [12, "us"] });
