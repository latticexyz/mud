import { describe, expect, it } from "vitest";
import { getWorldConsumerStorageHash } from "./getWorldConsumerStorageHash";

describe("getWorldConsumerStorageHash", () => {
  it("returns the storage hash", () => {
    expect(getWorldConsumerStorageHash("0x253eb85B3C953bFE3827CC14a151262482E7189C")).toBe(
      "0xcdb3e62b7ac1760b56fcd0ba2817b5f17160f89333ebef26a79db4b4ecab7e7f",
    );
  });
});
