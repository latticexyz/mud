/* eslint-disable no-constant-condition */
import { awaitValue, keccak256, random, sleep } from "@latticexyz/utils";
import { setupContracts } from "./setupContracts";
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { BigNumber, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

type Context = Awaited<ReturnType<typeof main>>;
const GAS = 100;

export async function main() {
  const { systems, provider: computedProvider, signer: computedSigner, contracts } = await setupContracts();
  const provider = await awaitValue(computedProvider);
  const signer = await awaitValue(computedSigner);
  // const pendingNonces = await getPendingNonces(provider, signer);
  // console.log("Pending nonces", pendingNonces);

  const Position = await contracts.get().World.getComponent(keccak256("mudwar.component.Position"));
  const EntityType = await contracts.get().World.getComponent(keccak256("mudwar.component.EntityType"));

  const context = { systems, components: { Position, EntityType }, provider, signer };

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
  { systems, components: { Position } }: Context
) {
  await systems["mudwar.system.componentDev"].ExecuteTyped(
    BigNumber.from(entity),
    Position,
    abi.encode(["int32", "int32"], [pos.x, pos.y]),
    { gasPrice: GAS, gasLimit: 2500000 }
  );
}

async function setEntityType(entity: number, entityType: number, { systems, components: { EntityType } }: Context) {
  await systems["mudwar.system.componentDev"].ExecuteTyped(
    BigNumber.from(entity),
    EntityType,
    abi.encode(["uint32"], [entityType]),
    { gasPrice: GAS, gasLimit: 2500000 }
  );
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
