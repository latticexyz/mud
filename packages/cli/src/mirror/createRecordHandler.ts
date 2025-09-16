import {
  Account,
  Address,
  Chain,
  Client,
  Hex,
  Transport,
  decodeFunctionResult,
  encodeAbiParameters,
  formatEther,
  zeroHash,
} from "viem";
import { writeContract } from "@latticexyz/common";
import { encodeSystemCall, worldCallAbi } from "@latticexyz/world/internal";
import batchStoreConfig from "@latticexyz/world-module-batchstore/mud.config";
import { readContract, waitForTransactionReceipt } from "viem/actions";
import chalk from "chalk";
import { StoreRecord } from "./executeMirrorPlan";
import { debug } from "./debug";

export function createRecordHandler({
  client,
  worldAddress,
  totalRecords,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldAddress: Address;
  totalRecords: number;
}) {
  const batchSize = 250;
  const records: StoreRecord[] = [];
  const status = {
    submitted: 0,
    confirmed: 0,
    gasUsed: 0,
    calldataSent: 0,
    timePerRecord: Infinity,
  };

  async function flush() {
    const hash = await onBatch(records.splice(0, records.length));
    return hash ? [hash] : [];
  }

  // assumes records are added in order by table ID
  async function set(record: StoreRecord) {
    const hashes: Hex[] = [];
    if (records[0] && records[0].tableId !== record.tableId) {
      hashes.push(...(await flush()));
    }
    records.push({
      ...record,
      // indexer returns 0x00 for zero-length encodedLengths
      // TODO: fix indexer response
      encodedLengths: record.encodedLengths === "0x00" ? zeroHash : record.encodedLengths,
    });
    if (records.length >= batchSize) {
      hashes.push(...(await flush()));
    }
    return hashes;
  }

  async function finalize() {
    return await flush();
  }

  async function onBatch(batch: StoreRecord[]) {
    const start = Date.now();
    const hash = await setRecords(batch);
    const elapsedPerRecord = (Date.now() - start) / batch.length;

    status.timePerRecord =
      status.timePerRecord === Infinity ? elapsedPerRecord : status.timePerRecord * 0.95 + elapsedPerRecord * 0.05;
    status.submitted += batch.length;

    const estimatedTime = (status.timePerRecord * (totalRecords - status.submitted)) / 1000 / 60 / 60;
    const progress = status.submitted / totalRecords;
    const progressBarSize = 60;
    const progressBarFilled = Math.floor(progress * progressBarSize);

    console.log(
      `Records submitted: ${status.submitted.toLocaleString()} / ${totalRecords.toLocaleString()}

${chalk.green("▮".repeat(progressBarFilled))}${chalk.gray("▯".repeat(progressBarSize - progressBarFilled))} ${(progress * 100).toFixed(1)}%
${" ".repeat(progressBarFilled)}~${estimatedTime.toFixed(1)} hours
`,
    );

    if (hash) {
      waitForTransactionReceipt(client, { hash }).then((receipt) => {
        if (receipt.status === "reverted") {
          console.error("Could not submit records", batch, receipt);
          return;
        }

        status.confirmed += batch.length;
        status.gasUsed += Number(receipt.gasUsed);

        const estimatedGas = Math.ceil((status.gasUsed / status.confirmed) * totalRecords);
        console.log(
          `Records confirmed: ${status.confirmed.toLocaleString()} / ${totalRecords.toLocaleString()}
Gas used: ${status.gasUsed.toLocaleString()} / ~${estimatedGas.toLocaleString()} (${receipt.gasUsed.toLocaleString()} used last batch)
Estimated L2 cost at 100k wei: ${parseFloat(formatEther(BigInt(estimatedGas) * 100000n)).toFixed(3)} ETH
`,
        );
      });
    }

    return hash;
  }

  async function setRecords(records: StoreRecord[]) {
    const existingRecords = decodeFunctionResult({
      abi: batchStoreSystemAbi,
      functionName: "getTableRecords",
      data: await readContract(client, {
        address: worldAddress,
        abi: worldCallAbi,
        functionName: "call",
        args: encodeSystemCall({
          systemId: batchStoreConfig.systems.BatchStoreSystem.systemId,
          abi: batchStoreSystemAbi,
          functionName: "getTableRecords",
          args: [records[0].tableId, records.map((record) => record.keyTuple)],
        }),
      }),
    });

    const changedRecords = records.filter((record, i) => {
      const recordEncoded = encodeAbiParameters(tableRecordAbi, [record]);
      const existingRecordEncoded = encodeAbiParameters(tableRecordAbi, [existingRecords[i]]);
      if (recordEncoded === existingRecordEncoded) return false;
      // console.log("record changed in", record.tableId);
      // console.log("  ", recordEncoded);
      // console.log("  ", existingRecordEncoded);
      return true;
    });
    if (!changedRecords.length) {
      return;
    }

    const args = encodeSystemCall({
      systemId: batchStoreConfig.systems.BatchStoreSystem.systemId,
      abi: batchStoreSystemAbi,
      functionName: "_setTableRecords",
      args: [changedRecords[0].tableId, changedRecords],
    });
    const hash = await writeContract(client, {
      chain: client.chain ?? null,
      address: worldAddress,
      abi: worldCallAbi,
      functionName: "call",
      args,
    });
    debug("set", changedRecords.length, "records", `(tx: ${hash})`);
    return hash;
  }

  return { set, finalize };
}

const tableRecordAbi = [
  {
    name: "record",
    type: "tuple",
    internalType: "struct TableRecord",
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
] as const;

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
