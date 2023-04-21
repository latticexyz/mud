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

async function removePackageSymlink(mud_package, node_module) {
  try {
    fs.unlinkSync(__dirname + `./packages/${mud_package}/node_modules/${node_module}`);
  } catch (e) {
    // console.log(e);
  }
}

const main = async () => {
  mk_node_modules("schema-type");
  removePackageSymlink("schema-type", "ds-test");
  removePackageSymlink("schema-type", "forge-std");
  mk_node_modules("solecs");
  removePackageSymlink("solecs", "memmove");
  removePackageSymlink("solecs", "@solidstate");
  removePackageSymlink("solecs", "solmate");
  removePackageSymlink("solecs", "ds-test");
  removePackageSymlink("solecs", "forge-std");
  mk_node_modules("std-contracts");
  removePackageSymlink("std-contracts", "@solidstate");
  removePackageSymlink("std-contracts", "ds-test");
  removePackageSymlink("std-contracts", "forge-std");
  removePackageSymlink("std-contracts", "memmove");
  removePackageSymlink("std-contracts", "solmate");
  mk_node_modules("store");
  removePackageSymlink("std-contracts", "ds-test");
  removePackageSymlink("std-contracts", "forge-std");
  mk_node_modules("world");
  removePackageSymlink("std-contracts", "ds-test");
  removePackageSymlink("std-contracts", "forge-std");
};

main();
