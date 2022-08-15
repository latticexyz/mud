import { TASK_COMPILE_SOLIDITY } from "hardhat/builtin-tasks/task-names";
import * as fs from "fs";
import * as path from "path";
import { subtask } from "hardhat/config";

subtask(TASK_COMPILE_SOLIDITY).setAction(async (_: { force: boolean; quiet: boolean }, { config }, runSuper) => {
  console.log("Symlinking forge-style libraries");
  const symlinks: string[] = [];
  const libraries = [
    ["solecs", "@latticexyz/solecs/src"],
    ["forge-std", "forge-std/src"],
    ["memmove", "memmove/src"],
  ];
  for (const [library, libraryPath] of libraries) {
    const symlinkPath = path.join(process.cwd(), library);
    console.log("Adding symlink at path: " + symlinkPath);
    if (fs.existsSync(symlinkPath)) {
      console.warn("symlink already exists!");
    } else {
      const libPath = path.join(config.paths.sources, "..", "..", "..", "node_modules", libraryPath);
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
