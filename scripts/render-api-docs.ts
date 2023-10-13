/**
 * Parse raw `forge doc` output from contract packages, clean it up, and render as markdown in docs.
 */

import { execa } from "execa";
import path from "path";

const PUBLIC_APIS = [
  "store/src/StoreCore.sol",
  "store/src/IStore.sol",
  "store/src/IStoreData.sol",
  "store/src/IStoreErrors.sol",
  "store/src/IStoreEvents.sol",
  "store/src/IStoreHook.sol",
  "store/src/IStoreRead.sol",
  "store/src/IStoreRegistration.sol",
];

function getPackages() {
  return [...new Set(PUBLIC_APIS.map((path) => path.split("/")[0]))];
}

/**
 * Generate raw docs using `forge doc` in all relevant contract packages
 */
async function generateDocs() {
  const packages = getPackages();
  for (const pkg of packages) {
    const { stdout, stderr } = await execa("forge", ["doc", "--build"], {
      stdio: "pipe",
      cwd: path.join(process.cwd(), "packages", pkg),
    });
    if (stderr || stdout) {
      console.log(stderr || stdout);
    }
  }
}

await generateDocs();
