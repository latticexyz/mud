import map from "../assets/ecs-map.json";
import { setupContracts } from "./setupContracts";
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { BigNumber, BytesLike } from "ethers";
import { callWithRetry, sleep } from "@latticexyz/utils";
import { keccak256 } from "./utils";

interface ECSEvent {
  component: number; // index into component array passed into bulk function, NOT component ID
  entity: number; // index into entity array passed into bulk function, NOT entity ID
  value: BytesLike;
}

const stateUploadCount = 20;
const gasLimit = 30_000_000;
const sleepTime = 950;
let txCount = 1;

async function bulkUploadMap() {
  const { systems } = await setupContracts();

  const components: BigNumber[] = [];
  const entities: BigNumber[] = [];
  const state: ECSEvent[] = [];

  let uploadEntityIndex = -1;

  for (let stateIndex = 0; stateIndex < map.state.length; stateIndex++) {
    const { componentIndex, entityIndex, unencodedValue } = map.state[stateIndex];
    const component = map.components[componentIndex];
    const componentId =
      component.unhashedId.length === 0 ? BigNumber.from(0) : BigNumber.from(keccak256(component.unhashedId));
    let uploadComponentIndex = components.findIndex((obj) => obj._hex === componentId._hex);
    if (uploadComponentIndex === -1) {
      uploadComponentIndex = components.push(componentId) - 1;
    }

    // we assume that states are sorted by entity index, they can only ascend or stay the same
    // and since entities must be unique, we only add new ones when the index increments
    if (entityIndex > uploadEntityIndex) {
      uploadEntityIndex = entities.push(BigNumber.from(entityIndex)) - 1;
    }
    const value =
      typeof unencodedValue === "string"
        ? abi.encode(["uint256"], [keccak256(unencodedValue)])
        : abi.encode(component.encoding, unencodedValue);
    state.push({
      component: uploadComponentIndex,
      entity: uploadEntityIndex,
      value,
    });

    if (state.length === stateUploadCount) {
      await bulkUpload(systems, components, entities, state);
    }
  }

  // if the total state count doesnt divide evenly by stateUploadCount then handle the leftovers
  if (state.length > 0) await bulkUpload(systems, components, entities, state);

  console.log("done");
}

async function bulkUpload(
  systems: Awaited<ReturnType<typeof setupContracts>>["systems"],
  components: Array<BigNumber>,
  entities: Array<BigNumber>,
  state: Array<ECSEvent>
) {
  let tx: any;
  console.log(components, entities, state);
  try {
    tx = callWithRetry(
      systems["ember.system.bulkSetStateSystem"].executeTyped,
      [components, entities, state, { gasLimit: gasLimit }],
      10
    );
    await sleep(sleepTime);
    console.log(`Send tx: ${txCount++} (${(await tx).hash})`);
  } catch (e) {
    console.log(`TRANSACTION FAILED: ${(await tx).hash}`);
  }
  components.splice(0);
  entities.splice(0);
  state.splice(0);
}

bulkUploadMap();
