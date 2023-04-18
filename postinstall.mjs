import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function mkdir(path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    //console.log(e);
  }
}

function mk_node_modules(mud_package) {
  mkdir(__dirname + `/packages/${mud_package}/node_modules`);
}

async function createPackageSymlink(mud_package, node_module) {
  try {
    fs.symlinkSync(
      __dirname + `/node_modules/${node_module}`,
      __dirname + `/packages/${mud_package}/node_modules/${node_module}`,
      "dir"
    );
    fs.realpathSync(__dirname + `./packages/${mud_package}/node_modules/${node_module}`);
  } catch (e) {
    // console.log(e);
  }
}

const main = async () => {
  mk_node_modules("schema-type");
  createPackageSymlink("schema-type", "ds-test");
  createPackageSymlink("schema-type", "forge-std");
  mk_node_modules("solecs");
  createPackageSymlink("solecs", "memmove");
  createPackageSymlink("solecs", "@solidstate");
  createPackageSymlink("solecs", "solmate");
  createPackageSymlink("solecs", "ds-test");
  createPackageSymlink("solecs", "forge-std");
  mk_node_modules("std-contracts");
  createPackageSymlink("std-contracts", "@solidstate");
  createPackageSymlink("std-contracts", "ds-test");
  createPackageSymlink("std-contracts", "forge-std");
  createPackageSymlink("std-contracts", "memmove");
  createPackageSymlink("std-contracts", "solmate");
  mk_node_modules("store");
  createPackageSymlink("std-contracts", "ds-test");
  createPackageSymlink("std-contracts", "forge-std");
  mk_node_modules("world");
  createPackageSymlink("std-contracts", "ds-test");
  createPackageSymlink("std-contracts", "forge-std");
};

main();
