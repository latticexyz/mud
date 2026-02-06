import path from "node:path";
import fs from "node:fs";
import { Account, Address, Chain, Client, Transport, encodeAbiParameters, Hex, zeroHash } from "viem";
import { createMirrorPlan } from "./createMirrorPlan";
import { executeMirrorPlan } from "./executeMirrorPlan";
import { readPlan } from "./readPlan";
import { DeployedBytecode, PlanStep } from "./common";
import { LibZip } from "solady";

// TODO: attempt to create world the same way as it was originally created, thus preserving world address
// TODO: set up table to track migrated records with original metadata (block number/timestamp) and for lazy migrations

export async function mirror({
  rootDir,
  from,
  to,
  planFile,
  batchSize,
}: {
  rootDir: string;
  from: {
    client: Client;
    indexer: string;
    world: Address;
    block?: bigint;
    blockscout: string;
  };
  to: {
    client: Client<Transport, Chain | undefined, Account>;
    world: Address;
    block?: bigint;
  };
  planFile?: string;
  batchSize?: number;
}) {
  // TODO: check for world balance, warn
  // TODO: deploy world
  //

  // TODO: fetch data from indexer
  // TODO: check each system for state/balance, warn
  //
  // TODO: set records for each table
  //
  // TODO: deploy each system via original bytecode
  // TODO: update system addresses as necessary (should this be done as part of setting records?)
  //

  let planFilename: string;

  if (planFile) {
    planFilename = path.isAbsolute(planFile) ? planFile : path.join(rootDir, planFile);
    if (!fs.existsSync(planFilename)) {
      throw new Error(`Plan file not found: ${planFilename}`);
    }
    console.log("using existing plan at", path.relative(rootDir, planFilename));
  } else {
    console.log("creating plan");
    planFilename = await createMirrorPlan({ rootDir, from });
    console.log("plan created at", path.relative(rootDir, planFilename));
  }

  const tableRecordsAbiItem = {
    type: "tuple[]",
    internalType: "struct TableRecord[]",
    components: [
      { name: "keyTuple", type: "bytes32[]", internalType: "bytes32[]" },
      { name: "staticData", type: "bytes", internalType: "bytes" },
      { name: "encodedLengths", type: "bytes32", internalType: "EncodedLengths" },
      { name: "dynamicData", type: "bytes", internalType: "bytes" },
    ],
  } as const;

  let stepCount = 0;
  let systemCount = 0;
  let recordCount = 0;
  let deploymentTxCount = 0;
  let totalCalldata = 0;

  const allRecords: Extract<PlanStep, { step: "setRecord" }>["record"][] = [];

  function countDeployments(bytecode: DeployedBytecode): number {
    let count = 1;
    for (const lib of bytecode.libraries) {
      count += countDeployments(lib.reference);
    }
    return count;
  }

  function sumInitCodeSize(bytecode: DeployedBytecode): number {
    let size = (bytecode.initCode.length - 2) / 2;
    for (const lib of bytecode.libraries) {
      size += sumInitCodeSize(lib.reference);
    }
    return size;
  }

  function getRecordSize(record: {
    tableId: string;
    keyTuple: readonly string[];
    staticData: string;
    encodedLengths: string;
    dynamicData: string;
  }): number {
    let size = 32;
    size += 32 + record.keyTuple.length * 32;
    size += 32 + (record.staticData.length - 2) / 2;
    size += 32;
    size += 32 + (record.dynamicData.length - 2) / 2;
    return size;
  }

  console.log("loading all records from plan...");
  for await (const step of readPlan(planFilename)) {
    stepCount++;
    if (step.step === "deploySystem") {
      systemCount++;
      deploymentTxCount += countDeployments(step.bytecode);
      totalCalldata += sumInitCodeSize(step.bytecode);
    } else if (step.step === "setRecord") {
      recordCount++;
      totalCalldata += getRecordSize(step.record);
      allRecords.push(step.record);
    }
  }

  function estimateBatchGas(records: Extract<PlanStep, { step: "setRecord" }>["record"][]): number {
    const normalizedRecords = records.map((record) => ({
      ...record,
      encodedLengths: record.encodedLengths === "0x00" ? zeroHash : record.encodedLengths,
    }));
    const calldata = encodeAbiParameters(
      [{ type: "bytes32" }, tableRecordsAbiItem],
      [records[0].tableId, normalizedRecords],
    );
    const compressed = LibZip.flzCompress(calldata) as Hex;
    const compressedSize = (compressed.length - 2) / 2;

    const decompressionGas = compressedSize * 10;
    const storageGas = records.length * 22000;
    const overheadGas = 50000;

    return decompressionGas + storageGas + overheadGas;
  }

  console.log("calculating optimal batch size based on actual compression...");
  const targetGasLimit = 50_000_000;
  let optimalBatchSize = 250;

  const recordsByTable = new Map<string, Extract<PlanStep, { step: "setRecord" }>["record"][]>();
  for (const record of allRecords) {
    const tableRecords = recordsByTable.get(record.tableId) ?? [];
    tableRecords.push(record);
    recordsByTable.set(record.tableId, tableRecords);
  }

  const largestTable = Array.from(recordsByTable.values()).reduce(
    (max, curr) => (curr.length > max.length ? curr : max),
    [],
  );

  if (largestTable.length >= 100) {
    for (let size = 100; size <= 500; size += 50) {
      if (size > largestTable.length) break;
      const batch = largestTable.slice(0, size);
      const estimatedGas = estimateBatchGas(batch);
      console.log(`  batch size ${size}: ${estimatedGas.toLocaleString()} gas`);
      if (estimatedGas > targetGasLimit) {
        optimalBatchSize = size - 50;
        break;
      }
      optimalBatchSize = size;
    }
    console.log(`optimal batch size: ${optimalBatchSize}`);
  }

  const estimatedRecordTxs = Math.ceil(recordCount / (batchSize ?? optimalBatchSize));
  const estimatedTotalTxs = deploymentTxCount + estimatedRecordTxs;
  const calldataGB = totalCalldata / (1024 * 1024 * 1024);

  const blockTimeSeconds = 2;
  const estimatedTimeSeconds = estimatedTotalTxs * blockTimeSeconds;
  const estimatedTimeHours = estimatedTimeSeconds / 3600;
  const estimatedTimeDays = estimatedTimeHours / 24;

  console.log(`plan has ${stepCount.toLocaleString()} steps`);
  console.log(
    `  - ${systemCount.toLocaleString()} systems (${deploymentTxCount.toLocaleString()} txs including libraries)`,
  );
  console.log(
    `  - ${recordCount.toLocaleString()} records (~${estimatedRecordTxs.toLocaleString()} txs in batches of ${batchSize ?? optimalBatchSize})`,
  );
  console.log(`  - estimated total: ~${estimatedTotalTxs.toLocaleString()} txs`);
  console.log(`  - estimated calldata: ${calldataGB.toFixed(2)} GB`);
  console.log(
    `  - estimated time (@ ${blockTimeSeconds}s/tx): ${estimatedTimeDays >= 1 ? `${estimatedTimeDays.toFixed(1)} days` : `${estimatedTimeHours.toFixed(1)} hours`}`,
  );

  if (planFile) {
    console.log("executing plan at", path.relative(rootDir, planFilename));
    await executeMirrorPlan({ planFilename, to, batchSize });
  }
}
