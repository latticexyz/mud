import { readdirSync, realpathSync, readFileSync, writeFileSync } from "fs";

export function removeBytecode(abiDir: string) {
  for (const abiFile of readdirSync(abiDir)) {
    if (!abiFile.match(/.*\.json$/)) continue;
    const realpath = realpathSync(`${abiDir}/${abiFile}`);

    const abi = JSON.parse(readFileSync(realpath).toString("utf8"));
    delete abi["bytecode"];
    delete abi["deployedBytecode"];
    delete abi["ast"];

    writeFileSync(realpath, JSON.stringify(abi, null, 2) + "\n");
  }
}
