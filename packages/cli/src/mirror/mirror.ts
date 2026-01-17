import path from "node:path";
import fs from "node:fs";
import { Account, Address, Chain, Client, Transport } from "viem";
import { createMirrorPlan } from "./createMirrorPlan";
import { executeMirrorPlan } from "./executeMirrorPlan";
import { readPlan } from "./readPlan";
import { DeployedBytecode } from "./common";

// TODO: attempt to create world the same way as it was originally created, thus preserving world address
// TODO: set up table to track migrated records with original metadata (block number/timestamp) and for lazy migrations

export async function mirror({
  rootDir,
  from,
  to,
  planFile,
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

  let stepCount = 0;
  let systemCount = 0;
  let recordCount = 0;
  let deploymentTxCount = 0;

  function countDeployments(bytecode: DeployedBytecode): number {
    let count = 1;
    for (const lib of bytecode.libraries) {
      count += countDeployments(lib.reference);
    }
    return count;
  }

  for await (const step of readPlan(planFilename)) {
    stepCount++;
    if (step.step === "deploySystem") {
      systemCount++;
      deploymentTxCount += countDeployments(step.bytecode);
    } else if (step.step === "setRecord") {
      recordCount++;
    }
  }

  const batchSize = 250;
  const estimatedRecordTxs = Math.ceil(recordCount / batchSize);
  const estimatedTotalTxs = deploymentTxCount + estimatedRecordTxs;

  console.log(`plan has ${stepCount.toLocaleString()} steps`);
  console.log(
    `  - ${systemCount.toLocaleString()} systems (${deploymentTxCount.toLocaleString()} txs including libraries)`,
  );
  console.log(
    `  - ${recordCount.toLocaleString()} records (~${estimatedRecordTxs.toLocaleString()} txs in batches of ${batchSize})`,
  );
  console.log(`  - estimated total: ~${estimatedTotalTxs.toLocaleString()} txs`);

  console.log("executing plan at", path.relative(rootDir, planFilename));
  await executeMirrorPlan({ planFilename, to });
}
