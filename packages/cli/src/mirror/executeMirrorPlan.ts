import { Account, Address, Chain, Client, Hex, Transport, concatHex, withCache } from "viem";
import { readPlan } from "./readPlan";
import { hexToResource, resourceToHex, resourceToLabel, spliceHex } from "@latticexyz/common";
import { StoreLog } from "@latticexyz/store";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { mudTables } from "@latticexyz/store-sync";
import { createRecordHandler } from "./createRecordHandler";
import { wait } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { DeployedBytecode, PlanStep } from "./common";
import { ensureContract, ensureDeployer, getContractAddress, waitForTransactions } from "@latticexyz/common/internal";

export type StoreRecord = Extract<StoreLog, { eventName: "Store_SetRecord" }>["args"];

export async function executeMirrorPlan({
  planFilename,
  to: { client, world: worldAddress, block: deployBlock },
  batchSize,
}: {
  planFilename: string;
  to: { client: Client<Transport, Chain | undefined, Account>; world: Address; block?: bigint };
  batchSize: number;
}) {
  let totalSystems = 0;
  let totalRecords = 0;

  for await (const step of readPlan(planFilename)) {
    if (step.step === "deploySystem" || step.step === "deployHook") {
      totalSystems += 1;
    }
    if (step.step === "setRecord") {
      totalRecords += 1;
    }
  }

  console.log(`- deploying ${totalSystems.toLocaleString()} systems`);
  console.log(`- setting ${totalRecords.toLocaleString()} records`);
  console.log();

  // TODO: prompt to continue
  await wait(5_000);

  const worldDeploy = await getWorldDeploy(client, worldAddress, deployBlock);
  debug("found world deploy at", worldDeploy.address);

  // TODO: lift into CLI to allow overriding?
  const deployerAddress = await ensureDeployer(client);
  debug("deploying systems via", deployerAddress);

  const deploySystemSteps: Extract<PlanStep, { step: "deploySystem" }>[] = [];
  const deployHookSteps: Extract<PlanStep, { step: "deployHook" }>[] = [];
  for await (const step of readPlan(planFilename)) {
    if (step.step === "deploySystem") {
      deploySystemSteps.push(step);
    } else if (step.step === "deployHook") {
      deployHookSteps.push(step);
    }
  }

  async function deploy(bytecode: DeployedBytecode) {
    let initCode = bytecode.initCode;
    for (const lib of bytecode.libraries) {
      debug("deploying referenced library");
      initCode = spliceHex(initCode, lib.offset, 20, await deploy(lib.reference));
    }
    const address = getContractAddress({
      deployerAddress,
      bytecode: initCode,
    });

    await withCache(
      async () => {
        const result = await ensureContract({ client, deployerAddress, bytecode: initCode });
        return waitForTransactions({ client, hashes: result.txHash, debugLabel: "contract deploy" });
      },
      { cacheKey: `deploy:${address}` },
    );

    return address;
  }

  const systems = await Promise.all(
    deploySystemSteps.map(async (step) => {
      debug(`deploying ${resourceToLabel(step.system)} system`);
      const address = await deploy(step.bytecode);
      return {
        system: step.system,
        address,
        previousAddress: step.bytecode.address,
      };
    }),
  );

  const hooks = await Promise.all(
    deployHookSteps.map(async (step) => {
      debug(`deploying system hook at source address ${step.hookAddress}`);
      const address = await deploy(step.bytecode);
      return {
        address,
        previousAddress: step.hookAddress,
      };
    }),
  );

  const addressReplacements = new Map<string, { value: string; debugLabel: string }>(
    systems.map(
      (system) =>
        [
          system.previousAddress.toLowerCase().replace(/^0x/, ""),
          {
            value: system.address.toLowerCase().replace(/^0x/, ""),
            debugLabel: `${resourceToLabel(system.system)} system address`,
          },
        ] as const,
    ),
  );
  for (const hook of hooks) {
    addressReplacements.set(hook.previousAddress.toLowerCase().replace(/^0x/, ""), {
      value: hook.address.toLowerCase().replace(/^0x/, ""),
      debugLabel: `system hook address`,
    });
  }

  const addressReplacementsPattern =
    addressReplacements.size > 0 ? new RegExp(Array.from(addressReplacements.keys()).join("|"), "ig") : undefined;

  function replaceSystems(data: Hex, debugLabel: string): Hex {
    if (!addressReplacementsPattern) return data;
    return data.replaceAll(addressReplacementsPattern, (match) => {
      const replacement = addressReplacements.get(match);
      // this should never happen, this is here just in case I messed up the logic
      if (!replacement) throw new Error(`No replacement for match: ${match}`);

      debug("replacing", replacement.debugLabel, "in", debugLabel, `(0x${match} => 0x${replacement.value})`);
      return replacement.value;
    }) as never;
  }

  console.log(`deployed ${(systems.length + hooks.length).toLocaleString()} systems/hooks`);

  const recordHandler = createRecordHandler({
    client,
    worldAddress: worldDeploy.address,
    totalRecords,
    batchSize,
  });
  const deferredRecords: StoreRecord[] = [];

  for await (const step of readPlan(planFilename)) {
    await (async () => {
      if (step.step !== "setRecord") return;

      // Update system addresses if found in record
      const tableLabel = resourceToLabel(hexToResource(step.record.tableId));
      step.record.keyTuple = step.record.keyTuple.map((key) => replaceSystems(key, `key of ${tableLabel}`));
      step.record.staticData = replaceSystems(step.record.staticData, `static data of ${tableLabel}`);
      step.record.dynamicData = replaceSystems(step.record.dynamicData, `dynamic data of ${tableLabel}`);

      // Defer updating root namespace owner so we can set all records
      // before reverting it to the original owner.
      // This allows mirroring any world, not just ones you own.
      if (
        step.record.tableId === mudTables.NamespaceOwner.tableId &&
        concatHex(step.record.keyTuple) === resourceToHex({ type: "namespace", namespace: "", name: "" })
      ) {
        deferredRecords.push(step.record);
        return;
      }

      await recordHandler.set(step.record);
      return;
    })();
  }

  for (const record of deferredRecords) {
    await recordHandler.set(record);
  }
  await recordHandler.finalize();

  console.log("all done!");
}
