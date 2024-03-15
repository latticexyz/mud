import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { WorldConfig as WorldConfigV1 } from "../types";
import { Config } from "./output";
import { configToV1 } from "./compat";

describe("configToV1", () => {
  it("should transform the broad v2 output to the broad v1 output", () => {
    attest<WorldConfigV1, configToV1<Config>>();
    attest<configToV1<Config>, WorldConfigV1>();
  });
});
