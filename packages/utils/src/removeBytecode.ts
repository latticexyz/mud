import { readdirSync, realpathSync, readFileSync, writeFileSync } from "fs";

export interface IRemoveBytecodeArguments {
  dir: string;
}

export function removeBytecode({ dir }: IRemoveBytecodeArguments) {
  for (const abiFile of readdirSync(dir)) {
    if (!abiFile.match(/.*\.json$/)) continue;
    const realpath = realpathSync(`${dir}/${abiFile}`);

    const abi = JSON.parse(readFileSync(realpath).toString("utf8"));
    delete abi["bytecode"];
    delete abi["deployedBytecode"];
    delete abi["ast"];

    writeFileSync(realpath, JSON.stringify(abi, null, 2) + "\n");
  }
}
