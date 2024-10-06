import { describe, expect, it } from "vitest";
import fs from "node:fs";
import StoreAbi from "../out/IStore.sol/IStore.abi.json";
import { formatAbi } from "abitype";
import { protocolVersions } from "./protocolVersions";

/**
 * If these tests fail, it's because the protocol changed since the last ABI + version snapshot.
 *
 * The fix for this depends on your needs:
 *
 * - If the change was an intentional iteration of the protocol, increment the `version.sol` file according to semver.
 *   A new protocol snapshot will be created when you run this test again, which you should check into git.
 *
 * - If the protocol change is for a yet-to-be-release version (i.e. the version was bumped but packages not yet published),
 *   or if _only_ parameter/return value names changed (which do not affect calldata), then it's safe to just
 *   update the protocol snapshot for this version (`vitest -u`).
 */

const [, currentVersion] = fs.readFileSync(`${__dirname}/../src/version.sol`, "utf8").match(/VERSION = "(.*?)"/) ?? [];

const currentAbi = formatAbi(StoreAbi)
  .slice()
  .sort((a, b) => a.localeCompare(b));

describe("Store protocol version", () => {
  it("is up to date", async () => {
    expect(currentVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(protocolVersions).toHaveProperty(currentVersion);
    await expect(currentAbi).toMatchFileSnapshot(`${__dirname}/protocol-snapshots/${currentVersion}.snap`);
  });
});
