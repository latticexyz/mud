import {
  Account,
  Address,
  Chain,
  Client,
  Hex,
  Transport,
  concatHex,
  encodeFunctionData,
  formatEther,
  size,
  zeroHash,
} from "viem";
import { readPlan } from "./readPlan";
import { resourceToHex, resourceToLabel, writeContract } from "@latticexyz/common";
import { StoreLog } from "@latticexyz/store";
import { encodeSystemCall, worldCallAbi } from "@latticexyz/world/internal";
import batchStoreConfig from "@latticexyz/world-module-batchstore/mud.config";
import { waitForTransactionReceipt } from "viem/actions";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { mudTables } from "@latticexyz/store-sync";
import { PlanStep } from "./common";
import chalk from "chalk";

type StoreRecord = Extract<StoreLog, { eventName: "Store_SetRecord" }>["args"];

export async function executeMirrorPlan({
  planFilename,
  to: { client, world: worldAddress },
}: {
  planFilename: string;
  to: { client: Client<Transport, Chain | undefined, Account>; world: Address };
}) {
  console.log("summarizing execution plan");
  const summary: {
    [key in PlanStep["step"]]?: { count: number };
  } = {};

  for await (const step of readPlan(planFilename)) {
    summary[step.step] ??= { count: 0 };
    summary[step.step]!.count += 1;
  }

  // TODO: read through the plan, dry run and estimate gas + count txs so we can show progress bar
  // TODO: show summary of plan execution and prompt to continue
  console.log("summary", summary);

  const worldDeploy = await getWorldDeploy(client, worldAddress);
  console.log("found world deploy at", worldDeploy.address);

  const recordBatcher = (() => {
    const batchSize = 50;
    const records: StoreRecord[] = [];
    const status = {
      submitted: 0,
      confirmed: 0,
      gasUsed: 0,
      calldataSent: 0,
      timePerRecord: Infinity,
    };

    // assumes records are added in order by table ID
    async function add(record: StoreRecord) {
      const hashes: Hex[] = [];
      if (records[0] && records[0].tableId !== record.tableId) {
        hashes.push(...(await flush()));
      }
      records.push(record);
      if (records.length >= batchSize) {
        hashes.push(...(await flush()));
      }
      return hashes;
    }

    async function flush() {
      return [await onBatch(records.splice(0, records.length))];
    }

    async function onBatch(batch: StoreRecord[]) {
      const args = encodeSystemCall({
        systemId: batchStoreConfig.systems.BatchStoreSystem.systemId,
        abi: batchStoreSystemAbi,
        functionName: "_setTableRecords",
        args: [batch[0].tableId, batch],
      });
      const calldataSize = size(
        encodeFunctionData({
          abi: worldCallAbi,
          functionName: "call",
          args,
        }),
      );
      const start = Date.now();
      const hash = await writeContract(client, {
        chain: client.chain ?? null,
        address: worldDeploy.address,
        abi: worldCallAbi,
        functionName: "call",
        args,
      });
      const elapsed = (Date.now() - start) / batch.length;
      status.timePerRecord = status.timePerRecord === Infinity ? elapsed : status.timePerRecord * 0.95 + elapsed * 0.05;
      status.submitted += batch.length;
      status.calldataSent += calldataSize;

      const estimatedCalldata = Math.ceil((status.calldataSent / status.submitted) * summary.setRecord!.count);
      const estimatedTime = (status.timePerRecord * (summary.setRecord!.count - status.submitted)) / 1000 / 60 / 60;

      const progress = status.submitted / summary.setRecord!.count;
      const progressBarSize = 60;
      const progressBarFilled = Math.floor(progress * progressBarSize);

      console.log(
        `Records submitted: ${status.submitted.toLocaleString()} / ${summary.setRecord!.count.toLocaleString()}
Calldata sent: ${status.calldataSent.toLocaleString()} / ~${estimatedCalldata.toLocaleString()}

${chalk.green("▮".repeat(progressBarFilled))}${chalk.gray("▯".repeat(progressBarSize - progressBarFilled))} ${(progress * 100).toFixed(1)}%
${" ".repeat(progressBarFilled)}~${estimatedTime.toFixed(1)} hours
`,
      );

      waitForTransactionReceipt(client, { hash }).then((receipt) => {
        if (receipt.status === "reverted") {
          console.error("Could not submit records", batch, receipt);
          return;
        }

        status.confirmed += batch.length;
        status.gasUsed += Number(receipt.gasUsed);

        const estimatedGas = Math.ceil((status.gasUsed / status.confirmed) * summary.setRecord!.count);
        console.log(
          `Records confirmed: ${status.confirmed.toLocaleString()} / ${summary.setRecord!.count.toLocaleString()}
Gas used: ${status.gasUsed.toLocaleString()} / ~${estimatedGas.toLocaleString()}
Estimated L2 cost at 100k wei: ${parseFloat(formatEther(BigInt(estimatedGas) * 100_000n)).toFixed(3)} ETH
`,
        );
      });

      return hash;
    }

    return { add, flush };
  })();

  for await (const step of readPlan(planFilename)) {
    await (async () => {
      if (step.step === "mirror") {
        console.log("mirroring data from", step.worldAddress, "on chain", step.chainId);
        return;
      }

      if (step.step === "deploySystem") {
        console.log("deploying system", resourceToLabel(step.system));
        return;
      }

      if (step.step === "setRecord") {
        // update the root namespace owner last, so we don't muck with permissions while writing
        if (
          step.record.tableId === mudTables.NamespaceOwner.tableId &&
          concatHex(step.record.keyTuple) === resourceToHex({ type: "namespace", namespace: "", name: "" })
        ) {
          // TODO: add this to the end
          return;
        }

        await recordBatcher.add({
          ...step.record,
          // indexer returns 0x00 for zero-length encodedLengths
          // TODO: fix indexer response
          encodedLengths: step.record.encodedLengths === "0x00" ? zeroHash : step.record.encodedLengths,
        });
        return;
      }
      if (step.step === "end:setRecords") {
        await recordBatcher.flush();
        return;
      }
    })();
  }

  console.log("all done!");
}

const batchStoreSystemAbi = [
  {
    type: "function",
    name: "_deleteTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuples",
        type: "bytes32[][]",
        internalType: "bytes32[][]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_setTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "records",
        type: "tuple[]",
        internalType: "struct TableRecord[]",
        components: [
          {
            name: "keyTuple",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
          {
            name: "staticData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "encodedLengths",
            type: "bytes32",
            internalType: "EncodedLengths",
          },
          {
            name: "dynamicData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deleteTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuples",
        type: "bytes32[][]",
        internalType: "bytes32[][]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuples",
        type: "bytes32[][]",
        internalType: "bytes32[][]",
      },
    ],
    outputs: [
      {
        name: "records",
        type: "tuple[]",
        internalType: "struct TableRecord[]",
        components: [
          {
            name: "keyTuple",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
          {
            name: "staticData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "encodedLengths",
            type: "bytes32",
            internalType: "EncodedLengths",
          },
          {
            name: "dynamicData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "records",
        type: "tuple[]",
        internalType: "struct TableRecord[]",
        components: [
          {
            name: "keyTuple",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
          {
            name: "staticData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "encodedLengths",
            type: "bytes32",
            internalType: "EncodedLengths",
          },
          {
            name: "dynamicData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    name: "Slice_OutOfBounds",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "start",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "World_AccessDenied",
    inputs: [
      {
        name: "resource",
        type: "string",
        internalType: "string",
      },
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as const;
