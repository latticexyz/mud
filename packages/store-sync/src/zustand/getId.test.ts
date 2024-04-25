import { describe, it, expect } from "vitest";
import { getId } from "./getId";

describe("getId", () => {
  it("should convert a store event log to a unique ID", async () => {
    expect(
      getId({
        tableId: "0x74626d756473746f72650000000000005461626c657300000000000000000000",
        keyTuple: ["0x74626d756473746f72650000000000005461626c657300000000000000000000"],
      })
    ).toMatchInlineSnapshot(
      '"0x74626d756473746f72650000000000005461626c657300000000000000000000:0x74626d756473746f72650000000000005461626c657300000000000000000000"'
    );
  });
});
