import { describe, it } from "vitest";
import { attest } from "@ark/attest";
import { createStore } from "../createStash";
import { extend } from "./extend";

describe("extend", () => {
  it("should extend the store API", () => {
    const store = createStore();
    const actions = { additional: <T>(a: T): T => a };
    const extended = extend({ store, actions });

    attest<typeof store & typeof actions, typeof extended>();
    attest(Object.keys(extended)).equals([...Object.keys(store), "additional"]);
  });
});
