#!/usr/bin/env node
import "dotenv/config";
import {
  Hex,
  concatHex,
  createWalletClient,
  http,
  isHex,
  parseAbiParameters,
  encodeAbiParameters,
  size,
  parseEther,
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
import paymasterArtifact from "@latticexyz/paymaster/out/GenerousPaymaster.sol/GenerousPaymaster.json" assert { type: "json" };
import { getChainId } from "viem/actions";
import { writeContract } from "@latticexyz/common";

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

// TODO: rpc url flag/env var?
// TODO: foundry profile flag/env var?
const rpc = await getRpcUrl();

const client = createWalletClient({
  transport: http(rpc),
  account,
});

const chainId = await getChainId(client);

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

console.log("Contracts deployed!");

if (chainId === 31337000) {
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
    args: [paymasterAddress],
    value: parseEther("100"),
  });
  await waitForTransactions({ client, hashes: [tx] });
  console.log("Funded paymaster at:", paymasterAddress);
} else {
  console.log(`
Be sure to fund the paymaster by making a deposit in the entrypoint contract. For example:

  cast send ${entryPointAddress} "depositTo(address)" ${paymasterAddress} --value 1ether
`);
}

console.log("EntryKit prerequisites complete!\n");
process.exit(0);
