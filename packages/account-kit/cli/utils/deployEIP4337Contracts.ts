import { deployLocal } from "./deployLocal";
import { Hex, concatHex, toHex } from "viem";
import EntryPointAbi from "@account-abstraction/contracts/artifacts/EntryPoint.json" assert { type: "json" };
import SimpleAccountFactoryAbi from "@account-abstraction/contracts/artifacts/SimpleAccountFactory.json" assert { type: "json" };
import PimlicoEntryPointSimulationsV1Abi from "./PimlicoEntryPointSimulationsV1.json" assert { type: "json" };
import PimlicoEntryPointSimulationsV2Abi from "./PimlicoEntryPointSimulationsV2.json" assert { type: "json" };

type ExpectedContract = {
  address: Hex;
  bytecode: Hex;
  salt: Hex;
  args?: Hex;
};

export const contracts: Record<string, ExpectedContract> = {
  EntryPoint: {
    address: "0x0000000071727de22e5e9d8baf0edac6f37da032",
    bytecode: EntryPointAbi.bytecode as Hex,
    salt: "0x90d8084deab30c2a37c45e8d47f49f2f7965183cb6990a98943ef94940681de3",
  },
  PimlicoEntryPointSimulationsV1: {
    address: "0xe629eB112f891a341Cd2B66b2376ba68e7011241",
    bytecode: PimlicoEntryPointSimulationsV1Abi.bytecode as Hex,
    salt: toHex(0, { size: 32 }),
  },
  PimlicoEntryPointSimulationsV2: {
    address: "0x729da8e46e44a5191fdfb19062d91d05380c6fd5",
    bytecode: PimlicoEntryPointSimulationsV2Abi.bytecode as Hex,
    salt: toHex(0, { size: 32 }),
  },
  SimpleAccountFactory: {
    address: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    bytecode: SimpleAccountFactoryAbi.bytecode as Hex,
    salt: toHex(0, { size: 32 }),
    args: "0x0000000000000000000000000000000071727de22e5e9d8baf0edac6f37da032",
  },
};

export async function deployEIP4337Contracts() {
  for (const [name, { address, bytecode, salt, args }] of Object.entries(contracts)) {
    console.log("Deploying", name, "to", address);
    const deploymentCode = concatHex([salt, bytecode, args ?? "0x"]);
    await deployLocal(deploymentCode, address);
  }
}
