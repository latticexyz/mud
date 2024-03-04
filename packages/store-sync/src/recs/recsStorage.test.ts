/* eslint-disable max-len */
import { describe, expect, it } from "vitest";
import { recsStorage } from "./recsStorage";
import { createWorld, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "../common";
import { singletonEntity } from "./singletonEntity";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { resolveConfig, storeEventsAbi } from "@latticexyz/store";
import { decodeValueArgs } from "@latticexyz/protocol-parser";
import { flattenSchema } from "../flattenSchema";

const tables = resolveConfig(mudConfig).tables;

// TODO: make test-data a proper package and export this
const blocks = groupLogsByBlockNumber(
  worldRpcLogs.map((log) => {
    const { eventName, args } = decodeEventLog({
      abi: storeEventsAbi,
      data: log.data as Hex,
      topics: log.topics as [Hex, ...Hex[]],
      strict: true,
    });
    return formatLog(log as any as RpcLog, { args, eventName: eventName as string }) as StoreEventsLog;
  }),
);

describe("recsStorage", () => {
  it("creates components", async () => {
    const world = createWorld();
    const { components } = recsStorage({ world, tables });
    expect(components.NumberList.id).toMatchInlineSnapshot(
      '"0x746200000000000000000000000000004e756d6265724c697374000000000000"',
    );
  });

  it("sets component values from logs", async () => {
    const world = createWorld();
    const { storageAdapter, components } = recsStorage({ world, tables });

    for (const block of blocks) {
      await storageAdapter(block);
    }

    expect(Array.from(getComponentEntities(components.NumberList))).toMatchInlineSnapshot(`
      [
        "0x",
      ]
    `);

    expect(getComponentValue(components.NumberList, singletonEntity)).toMatchInlineSnapshot(`
      {
        "__dynamicData": "0x000001a400000045",
        "__encodedLengths": "0x0000000000000000000000000000000000000000000000000800000000000008",
        "__staticData": undefined,
        "value": [
          420,
          69,
        ],
      }
    `);

    expect(
      [...getComponentEntities(components.NumberList)].map((entity) =>
        getComponentValue(components.NumberList, entity),
      ),
    ).toMatchInlineSnapshot(`
    [
      {
        "__dynamicData": "0x000001a400000045",
        "__encodedLengths": "0x0000000000000000000000000000000000000000000000000800000000000008",
        "__staticData": undefined,
        "value": [
          420,
          69,
        ],
      },
    ]
  `);
  });

  it("failing test case", () => {
    const valueSchema = {
      aggressorEntity: {
        type: "bytes32",
        internalType: "bytes32",
      },
      aggressorDamage: {
        type: "uint256",
        internalType: "uint256",
      },
      targetEntity: {
        type: "bytes32",
        internalType: "bytes32",
      },
      targetDamage: {
        type: "uint256",
        internalType: "uint256",
      },
      winner: {
        type: "bytes32",
        internalType: "bytes32",
      },
      rock: {
        type: "bytes32",
        internalType: "bytes32",
      },
      player: {
        type: "bytes32",
        internalType: "bytes32",
      },
      targetPlayer: {
        type: "bytes32",
        internalType: "bytes32",
      },
      timestamp: {
        type: "uint256",
        internalType: "uint256",
      },
      aggressorAllies: {
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      targetAllies: {
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    };

    const args = {
      tableId: "0x6f740000000000000000000000000000426174746c65526573756c7400000000",
      keyTuple: ["0x94a20d7cecba2a0266a9f899622dd00d801b15bd7640739b3f708d7429cd4506"],
      staticData:
        "0x0000000000000000000000007dd96aa0f6696245c8552a2d724ead6c7fd53bd9000000000000000000000000c2f7cc4036725ab3f8fc43902bdfaf8227fe15e4000000000000000000000000c2f7cc4036725ab3f8fc43902bdfaf8227fe15e49ab7b2f70269ecf8ec6acfe5fd7a5da9f2def87a1cb1b02d1f57438b2403139900000000000000000000000000000000000000000000000000000000000426800000000000000000000000000000000000000000000000000000000065e1fc8c",
      encodedLengths: "0x0000000000000000010000000001000000000100000000010000000000000400",
      dynamicData:
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c2000000000000000000000000000000000000000000000000000000000000014f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc000000000000000000000000000000000000000000000000000000000000014400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    };

    const value = decodeValueArgs(flattenSchema(valueSchema), args);

    console.log(value);
  });
});
