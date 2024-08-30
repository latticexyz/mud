import { describe, it } from "vitest";
import { attest } from "@ark/attest";
import { createStash } from "../createStash";
import { extend } from "./extend";

describe("extend", () => {
  it("should extend the stash API", () => {
    const stash = createStash();
    const actions = { additional: <T>(a: T): T => a };
    const extended = extend({ stash: stash, actions });

    attest<typeof stash & typeof actions, typeof extended>();
    attest(Object.keys(extended)).equals([...Object.keys(stash), "additional"]);
  });

  it("should allow overriding existing keys", () => {
    const stash = createStash();
    const actions = { deleteKey: () => true };
    const extended = extend({ stash: stash, actions });
    attest<(typeof extended)["deleteKey"], (typeof actions)["deleteKey"]>();
  });
});
