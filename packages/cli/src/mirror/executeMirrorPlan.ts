import { Account, Address, Chain, Client, Transport, concatHex } from "viem";
import { readPlan } from "./readPlan";
import { resourceToHex, resourceToLabel } from "@latticexyz/common";
import { StoreLog } from "@latticexyz/store";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { mudTables } from "@latticexyz/store-sync";
import { createRecordHandler } from "./createRecordHandler";
import { wait } from "@latticexyz/common/utils";

export type StoreRecord = Extract<StoreLog, { eventName: "Store_SetRecord" }>["args"];

export async function executeMirrorPlan({
  planFilename,
  to: { client, world: worldAddress },
}: {
  planFilename: string;
  to: { client: Client<Transport, Chain | undefined, Account>; world: Address };
}) {
  let totalSystems = 0;
  let totalRecords = 0;

  for await (const step of readPlan(planFilename)) {
    if (step.step === "deploySystem") {
      totalSystems += 1;
      console.log(step);
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

  const worldDeploy = await getWorldDeploy(client, worldAddress);
  console.log("found world deploy at", worldDeploy.address);

  for await (const step of readPlan(planFilename)) {
    await (async () => {
      if (step.step !== "deploySystem") return;

      console.log("deploying system", resourceToLabel(step.system));
      // TODO:
      return;
    })();
  }

  const recordHandler = createRecordHandler({
    client,
    worldAddress: worldDeploy.address,
    totalRecords,
  });
  const deferredRecords: StoreRecord[] = [];

  for await (const step of readPlan(planFilename)) {
    await (async () => {
      if (step.step !== "setRecord") return;

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
