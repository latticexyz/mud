import { TASK_COMPILE_SOLIDITY } from "hardhat/builtin-tasks/task-names";
import * as fs from "fs";
import * as path from "path";
import { subtask } from "hardhat/config";

subtask(TASK_COMPILE_SOLIDITY).setAction(async (_: { force: boolean; quiet: boolean }, { config }, runSuper) => {
  console.log("Symlinking forge-style libraries");
  const symlinks = [];
  const libraries = [
    ["solmate", "@rari-capital/solmate/src"],
    ["solecs", "@latticexyz/solecs/src"],
    ["std-contracts", "@latticexyz/std-contracts/src"],
    ["ds-test", "ds-test/src"],
    ["forge-std", "forge-std/src"],
    ["persona", "@latticexyz/persona/src"],
    ["base64", "base64-sol"],
    ["gsn", "@opengsn/contracts/src"],
    ["royalty-registry", "@manifoldxyz/royalty-registry-solidity/contracts"],
    ["@openzeppelin", "openzeppelin-solidity"],
    ["memmove", "memmove/src"],
  ];
  for (const [library, libraryPath] of libraries) {
    const symlinkPath = path.join(process.cwd(), library);
    console.log("Adding symlink at path: " + symlinkPath);
    if (fs.existsSync(symlinkPath)) {
      console.warn("symlink already exists!");
    } else {
      const libPath = path.join(config.paths.sources, "..", "..", "..", "..", "node_modules", libraryPath);
      fs.symlinkSync(libPath, symlinkPath, "dir");
    }
    symlinks.push(symlinkPath);
  }
  try {
    await runSuper();
  } catch (e) {
    console.error(e);
  } finally {
    for (const symlink of symlinks) {
      console.log("Removing symlink at path: " + symlink);
      fs.unlinkSync(symlink);
    }
  }
});
