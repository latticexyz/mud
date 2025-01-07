import { Address, Chain, Client, Transport, sliceHex } from "viem";
import { getBytecode } from "viem/actions";
import deployment from "./create2/deployment.json";
import { debug } from "./debug";

const deployer = `0x${deployment.address}` as const;

export async function getDeployer(client: Client<Transport, Chain | undefined>): Promise<Address | undefined> {
  const bytecode = await getBytecode(client, { address: deployer });
  if (bytecode) {
    debug("found CREATE2 deployer at", deployer);
    // check if deployed bytecode is the same as the expected bytecode (minus 14-bytes creation code prefix)
    if (bytecode !== sliceHex(`0x${deployment.creationCode}`, 14)) {
      console.warn(
        `\n  ⚠️ Bytecode for deployer at ${deployer} did not match the expected CREATE2 bytecode. You may have unexpected results.\n`,
      );
    }
    return deployer;
  }
}
