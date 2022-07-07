import map from "../assets/ecs-map.json";
import { setupContracts } from "./setupContracts";
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { BigNumber, BytesLike } from "ethers";
import { keccak256 as keccak256Bytes, toUtf8Bytes } from "ethers/lib/utils";
import { callWithRetry, sleep } from "@latticexyz/utils";
import { TxQueue } from "@latticexyz/network";
import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
import { World } from "ri-contracts/types/ethers-contracts/World";

export function keccak256(data: string) {
  return keccak256Bytes(toUtf8Bytes(data));
}

interface ECSEvent {
  component: number; // index into component array passed into bulk function, NOT component ID
  entity: number; // index into entity array passed into bulk function, NOT entity ID
  value: BytesLike;
}

const stateUploadCount = 400;
const gasLimit = 95_000_000;
const sleepTime = 950;
let txCount = 1;

async function bulkUploadMap() {
  const { txQueue } = await setupContracts();

  const components: BigNumber[] = [];
  const entities: BigNumber[] = [];
  const state: ECSEvent[] = [];

  let uploadEntityIndex = -1;

  for (let stateIndex = 0; stateIndex < map.state.length; stateIndex++) {
    const { componentIndex, entityIndex, unencodedValue } = map.state[stateIndex];
    const component = map.components[componentIndex];
    const componentId = BigNumber.from(keccak256(component.unhashedId));
    let uploadComponentIndex = components.findIndex((obj) => obj._hex === componentId._hex);
    if (uploadComponentIndex === -1) {
      uploadComponentIndex = components.push(componentId) - 1;
    }

    // we assume that states are sorted by entity index, they can only ascend or stay the same
    // and since entities must be unique, we only add new ones when the index increments
    if (entityIndex > uploadEntityIndex) {
      uploadEntityIndex = entities.push(BigNumber.from(entityIndex)) - 1;
    }

    state.push({
      component: uploadComponentIndex,
      entity: uploadEntityIndex,
      value: abi.encode(component.encoding, unencodedValue),
    });

    if (state.length === stateUploadCount) {
      await bulkUpload(txQueue, components, entities, state);
    }
  }

  // if the total state count doesnt divide evenly by stateUploadCount then handle the leftovers
  if (state.length > 0) await bulkUpload(txQueue, components, entities, state);

  console.log("done");
}

async function bulkUpload(
  txQueue: TxQueue<{ Game: CombinedFacets; World: World }>,
  components: Array<BigNumber>,
  entities: Array<BigNumber>,
  state: Array<ECSEvent>
) {
  let tx: any;
  try {
    tx = callWithRetry(txQueue.Game.bulkSetState, [components, entities, state, { gasLimit: gasLimit }], 10);
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
