import { TASK_COMPILE_SOLIDITY } from "hardhat/builtin-tasks/task-names";
import * as fs from "fs";
import * as path from "path";
import { subtask } from "hardhat/config";

// TODO: fix

subtask(TASK_COMPILE_SOLIDITY).setAction(
  async (
    { force, quiet }: { force: boolean; quiet: boolean },
    { artifacts, config, run, hardhatArguments },
    runSuper
  ) => {
    console.log("Symlinking forge-style libraries");
    const symlinks = [];
    const libraries = [
      ["solmate", "solmate/src"],
      ["solecs", "solecs/src"],
      ["ds-test", "ds-test/src"],
      ["forge-std", "forge-std/src"],
      ["persona", "persona/src"],
      ["base64", "persona/lib/base64"],
      ["gsn", "persona/lib/gsn/packages/contracts/src"],
      ["royalty-registry", "persona/lib/royalty-registry-solidity/contracts"],
      ["@openzeppelin", "persona/lib/openzeppelin-contracts"],
    ];
    for (const [library, libraryPath] of libraries) {
      const symlinkPath = path.join(process.cwd(), library);
      console.log("Adding symlink at path: " + symlinkPath);
      if (fs.existsSync(symlinkPath)) {
        console.warn("symlink already exists!");
      } else {
        const libPath = path.join(config.paths.sources, "..", "lib", libraryPath);
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
  }
);
