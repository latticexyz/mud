import { describe, expect, it } from "vitest";
import fs from "node:fs";
import StoreAbi from "../out/StoreData.sol/StoreData.abi.json";
import { formatAbi } from "abitype";
import { protocolVersions } from "./protocolVersions";

const [, currentVersion] = fs.readFileSync(`${__dirname}/../src/version.sol`, "utf8").match(/VERSION = "(.*?)"/) ?? [];

const currentAbi = formatAbi(StoreAbi).sort((a, b) => a.localeCompare(b));

describe("Store protocol version", () => {
  it("is up to date", async () => {
    expect(currentVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(protocolVersions).toHaveProperty(currentVersion);
    await expect(currentAbi).toMatchFileSnapshot(`${__dirname}/protocol-snapshots/${currentVersion}.snap`);
  });
});
