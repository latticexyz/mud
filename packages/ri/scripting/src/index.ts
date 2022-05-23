/* eslint-disable no-constant-condition */
import { awaitValue, keccak256, PromiseValue, random, sleep } from "@mudkit/utils";
import { setupContracts } from "./setupContracts";
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

type Context = PromiseValue<ReturnType<typeof main>>;
const GAS = 107;

export async function main() {
  const { txQueue, provider: computedProvider, signer: computedSigner } = await setupContracts();
  const provider = await awaitValue(computedProvider);
  const signer = await awaitValue(computedSigner);
  const pendingNonces = await getPendingNonces(provider, signer);
  console.log("Pending nonces", pendingNonces);

  const Position = await txQueue.World.getComponent(keccak256("ember.component.positionComponent"));
  const EntityType = await txQueue.World.getComponent(keccak256("ember.component.entityTypeComponent"));

  const context = { txQueue, components: { Position, EntityType }, provider, signer, pendingNonces };

  // Send tx fast
  const promises: Promise<unknown>[] = [];
  const numEntities = 400;

  async function step(i: number) {
    if (i < numEntities) await spawnAtRandomPosition(i, context);
    else await setRandomPosition(i % numEntities, context);
  }

  let i = 0;
  while (true) {
    console.log("Iteration", i);
    // try {
    //   await step(i);
    // } catch (e) {
    //   console.warn(e);
    // }
    promises.push(step(i));
    i++;
    await sleep(2);
  }

  console.log("Waiting for promises");
  await Promise.all(promises);
  console.log("Done");
  return context;
}

async function getPendingNonces(provider: JsonRpcProvider, signer: Signer): Promise<Set<number>> {
  const pendingTx = await provider.send("txpool_content", []);
  return new Set(Object.keys(pendingTx?.queued[await signer.getAddress()] || {}).map((key) => parseInt(key)));
}

async function setPosition(
  entity: number,
  pos: { x: number; y: number },
  { txQueue, components: { Position } }: Context
) {
  await txQueue.Ember.addComponentToEntityExternally(
    entity,
    Position,
    abi.encode(["uint256", "uint256"], [pos.x, pos.y]),
    { gasPrice: GAS, gasLimit: 250000 }
  );
}

async function setEntityType(entity: number, entityType: number, { txQueue, components: { EntityType } }: Context) {
  await txQueue.Ember.addComponentToEntityExternally(entity, EntityType, abi.encode(["uint256"], [entityType]), {
    gasPrice: GAS,
    gasLimit: 250000,
  });
}

async function setRandomPosition(entity: number, context: Context) {
  const x = random(0, 40);
  const y = random(0, 40);
  await setPosition(entity, { x, y }, context);
}

async function spawnAtRandomPosition(entity: number, context: Context) {
  await Promise.all([setRandomPosition(entity, context), setEntityType(entity, 0, context)]);
}

main().then(() => {
  process.exit();
});
