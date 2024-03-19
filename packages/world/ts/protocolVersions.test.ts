import { describe, expect, it } from "vitest";
import fs from "node:fs";
import WorldAbi from "../out/World.sol/World.abi.json";
import { formatAbi } from "abitype";
import { protocolVersions } from "./protocolVersions";

const [, currentVersion] = fs.readFileSync(`${__dirname}/../src/version.sol`, "utf8").match(/VERSION = "(.*?)"/) ?? [];

const currentAbi = formatAbi(WorldAbi).sort((a, b) => a.localeCompare(b));

describe("World protocol version", () => {
  it("is up to date", async () => {
    expect(currentVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(protocolVersions).toHaveProperty(currentVersion);
    await expect(currentAbi).toMatchFileSnapshot(`${__dirname}/protocol-snapshots/${currentVersion}.snap`);
  });
});
