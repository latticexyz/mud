import { getOutDirectory } from "@latticexyz/common/foundry";
import path from "path";
import { runTypeChain } from "typechain";

/**
 * Generate IWorld typescript bindings
 */
export async function worldtypes() {
  const cwd = process.cwd();
  const forgeOurDir = await getOutDirectory();
  // Curtis changed this IWorldPath after we migrated to Yarn since we had a naming conflict (two IWorld.sol files)
  // const IWorldPath = path.join(process.cwd(), forgeOurDir, "IWorld.sol/IWorld.json");
  const IWorldPath = path.join(process.cwd(), forgeOurDir, "world/IWorld.sol/IWorld.json");
  console.log(cwd);
  console.log(IWorldPath);

  await runTypeChain({
    cwd,
    filesToProcess: [IWorldPath],
    allFiles: [IWorldPath],
    target: "ethers-v5",
  });

  console.log("Typechain generated IWorld interface");
}
