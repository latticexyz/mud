import { describe, expect, it } from "vitest";
import IWorldFactoryAbi from "../out/IWorldFactory.sol/IWorldFactory.abi.json";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json";
import { helloWorldEvent, worldDeployedEvent } from "./worldEvents";
import { parseAbiItem, AbiEvent } from "abitype";

function normalizeAbiEvent(event: AbiEvent) {
  return {
    type: event.type,
    name: event.name,
    inputs: event.inputs.map((input) => ({
      type: input.type,
      name: input.name,
      ...(input.indexed ? { indexed: true } : null),
    })),
  } as const;
}

describe("WorldFactory events", () => {
  it("should match the ABI", () => {
    const forgeAbiItem = IWorldFactoryAbi.find(
      (item) => item.type === "event" && item.name === "WorldDeployed"
    ) as AbiEvent;
    expect(normalizeAbiEvent(parseAbiItem(worldDeployedEvent))).toMatchObject(normalizeAbiEvent(forgeAbiItem));
  });
});

describe("World events", () => {
  it("should match the ABI", () => {
    const forgeAbiItem = IBaseWorldAbi.find((item) => item.type === "event" && item.name === "HelloWorld") as AbiEvent;
    expect(normalizeAbiEvent(parseAbiItem(helloWorldEvent))).toMatchObject(normalizeAbiEvent(forgeAbiItem));
  });
});
