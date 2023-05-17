import { getOutDirectory } from "@latticexyz/common/foundry";
import path from "path";
import { runTypeChain } from "typechain";

/**
 * Generate IWorld typescript bindings
 */
export async function worldtypes() {
  const cwd = process.cwd();
  const forgeOurDir = await getOutDirectory();
  const IWorldPath = path.join(process.cwd(), forgeOurDir, "IWorld.sol/IWorld.json");

  await runTypeChain({
    cwd,
    filesToProcess: [IWorldPath],
    allFiles: [IWorldPath],
    target: "ethers-v5",
  });

  console.log("Typechain generated IWorld interface");
}
