import "dotenv/config";
import {
  Hex,
  concatHex,
  http,
  isHex,
  parseAbiParameters,
  encodeAbiParameters,
  size,
  parseEther,
  createClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getRpcUrl } from "@latticexyz/common/foundry";
import {
  ensureContractsDeployed,
  ensureDeployer,
  getContractAddress,
  waitForTransactions,
} from "@latticexyz/common/internal";
import entryPointArtifact from "@account-abstraction/contracts/artifacts/EntryPoint.json" assert { type: "json" };
import simpleAccountFactoryArtifact from "@account-abstraction/contracts/artifacts/SimpleAccountFactory.json" assert { type: "json" };
import localPaymasterArtifact from "@latticexyz/paymaster/out/GenerousPaymaster.sol/GenerousPaymaster.json" assert { type: "json" };
import { getChainId } from "viem/actions";
import { writeContract } from "@latticexyz/common";
import { entryPoint07Address } from "viem/account-abstraction";

// TODO: parse env with arktype (to avoid zod dep) and throw when absent

const privateKey = process.env.PRIVATE_KEY;
if (!isHex(privateKey)) {
  // TODO: detect anvil and automatically put this env var where it needs to go?
  throw new Error(
    `Missing \`PRIVATE_KEY\` environment variable. If you're using Anvil, run

  echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env

to use a prefunded Anvil account.`,
  );
}
const account = privateKeyToAccount(privateKey);
const rpcUrl = await getRpcUrl();

const client = createClient({ account, transport: http(rpcUrl) });

const chainId = await getChainId(client);

console.log("Deploying to chain", chainId, "from", account.address, "via", rpcUrl);

// TODO: deployer address flag/env var?
const deployerAddress = await ensureDeployer(client);

// https://github.com/eth-infinitism/account-abstraction/blob/b3bae63bd9bc0ed394dfca8668008213127adb62/hardhat.config.ts#L11
const entryPointSalt = "0x90d8084deab30c2a37c45e8d47f49f2f7965183cb6990a98943ef94940681de3";
const entryPointAddress = getContractAddress({
  deployerAddress,
  bytecode: entryPointArtifact.bytecode as Hex,
  salt: entryPointSalt,
});
if (entryPointAddress !== entryPoint07Address) {
  throw new Error(
    `Unexpected EntryPoint v0.7 address\n\n  Expected: ${entryPoint07Address}\nActual: ${entryPointAddress}`,
  );
}

// Deploy entrypoint first, because following deploys need to be able to call it.
await ensureContractsDeployed({
  client,
  deployerAddress,
  contracts: [
    {
      bytecode: entryPointArtifact.bytecode as Hex,
      salt: entryPointSalt,
      deployedBytecodeSize: size(entryPointArtifact.deployedBytecode as Hex),
      debugLabel: "EntryPoint v0.7",
    },
  ],
});

await ensureContractsDeployed({
  client,
  deployerAddress,
  contracts: [
    {
      bytecode: concatHex([
        simpleAccountFactoryArtifact.bytecode as Hex,
        encodeAbiParameters(parseAbiParameters("address"), [entryPointAddress]),
      ]),
      deployedBytecodeSize: size(simpleAccountFactoryArtifact.deployedBytecode as Hex),
      debugLabel: "SimpleAccountFactory",
    },
  ],
});

if (chainId === 31337) {
  const localPaymasterBytecode = concatHex([
    localPaymasterArtifact.bytecode.object as Hex,
    encodeAbiParameters(parseAbiParameters("address"), [entryPointAddress]),
  ]);
  const localPaymasterAddress = getContractAddress({ deployerAddress, bytecode: localPaymasterBytecode });

  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: [
      {
        bytecode: localPaymasterBytecode,
        deployedBytecodeSize: size(localPaymasterArtifact.deployedBytecode.object as Hex),
        debugLabel: "GenerousPaymaster",
      },
    ],
  });

  const tx = await writeContract(client, {
    chain: null,
    address: entryPointAddress,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "depositTo",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    functionName: "depositTo",
    args: [localPaymasterAddress],
    value: parseEther("100"),
  });
  await waitForTransactions({ client, hashes: [tx] });
  console.log("\nFunded local paymaster at:", localPaymasterAddress, "\n");
}

console.log("\nEntryKit contracts are ready!\n");
process.exit(0);
