#!/usr/bin/env node
import "dotenv/config";
import { Hex, concatHex, createWalletClient, http, isHex, parseAbiParameters, encodeAbiParameters, size } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { ensureContractsDeployed, ensureDeployer, getContractAddress } from "@latticexyz/common/internal";
import entryPointArtifact from "@account-abstraction/contracts/artifacts/EntryPoint.json" assert { type: "json" };
import simpleAccountFactoryArtifact from "@account-abstraction/contracts/artifacts/SimpleAccountFactory.json" assert { type: "json" };
import paymasterArtifact from "@latticexyz/paymaster/out/GenerousPaymaster.sol/GenerousPaymaster.json" assert { type: "json" };

// TODO: parse env with arktype (to avoid zod dep) and throw when absent

const privateKey = process.env.PRIVATE_KEY;
if (!isHex(privateKey)) {
  // TODO: detect anvil and automatically put this env var where it needs to go?
  throw new Error(
    `Missing \`PRIVATE_KEY\` environment variable. If you're using Anvil, use

  echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env

in your contracts directory to use a default Anvil account.`,
  );
}
const account = privateKeyToAccount(privateKey);

// TODO: rpc url flag/env var?
// TODO: foundry profile flag/env var?
const rpc = await getRpcUrl();

const client = createWalletClient({
  transport: http(rpc),
  account,
});

// TODO: deployer address flag/env var?
const deployerAddress = await ensureDeployer(client);

const entryPointAddress = getContractAddress({ deployerAddress, bytecode: entryPointArtifact.bytecode as Hex });
const paymasterBytecode = concatHex([
  paymasterArtifact.bytecode.object as Hex,
  encodeAbiParameters(parseAbiParameters("address"), [entryPointAddress]),
]);
const paymasterAddress = getContractAddress({ deployerAddress, bytecode: paymasterBytecode });

// TODO: figure out how to deploy these so that we end up with the expected addresses of entrypoint and simple account factory

await ensureContractsDeployed({
  client,
  deployerAddress,
  contracts: [
    {
      bytecode: entryPointArtifact.bytecode as Hex,
      deployedBytecodeSize: size(entryPointArtifact.deployedBytecode as Hex),
      debugLabel: "EntryPoint v0.7",
    },
    {
      bytecode: concatHex([
        simpleAccountFactoryArtifact.bytecode as Hex,
        encodeAbiParameters(parseAbiParameters("address"), [entryPointAddress]),
      ]),
      deployedBytecodeSize: size(simpleAccountFactoryArtifact.deployedBytecode as Hex),
      debugLabel: "SimpleAccountFactory",
    },
    {
      bytecode: paymasterBytecode,
      deployedBytecodeSize: size(paymasterArtifact.deployedBytecode.object as Hex),
      debugLabel: "GenerousPaymaster",
    },
  ],
});

console.log("\nEntryKit prerequisites are deployed!\n");

// TODO: fund paymaster
console.log("TODO: fund paymaster at", paymasterAddress);

process.exit(0);
