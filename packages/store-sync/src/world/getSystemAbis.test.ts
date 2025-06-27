import { Address, Hex } from "viem";
import { describe, expect, it, beforeEach, beforeAll } from "vitest";
import { createTestClient, snapshotAnvilState } from "with-anvil";
import { deployMockGame } from "mock-game-contracts";
import { getSystemAbis } from "./getSystemAbis";
import { hexToResource } from "@latticexyz/common";
import { formatAbiItem } from "viem/utils";

describe("getSystemAbis", () => {
  beforeEach(snapshotAnvilState);

  let worldAddress: Address;
  beforeAll(async () => {
    worldAddress = await deployMockGame();
  });

  it("returns systems ABIs", async () => {
    const client = createTestClient();

    const systemAbis = await getSystemAbis({
      client,
      worldAddress,
    });

    const systems = Object.entries(systemAbis).map(([systemId, abi]) => {
      const { name, namespace } = hexToResource(systemId as Hex);
      return {
        systemId,
        namespace,
        name,
        abi: abi.map((item) => formatAbiItem(item)),
      };
    });

    expect(systems).toMatchInlineSnapshot(`
      [
        {
          "abi": [
            "move(int32,int32)",
          ],
          "name": "MoveSystem",
          "namespace": "",
          "systemId": "0x737900000000000000000000000000004d6f766553797374656d000000000000",
        },
        {
          "abi": [
            "grantAccess(bytes32,address)",
            "revokeAccess(bytes32,address)",
            "transferOwnership(bytes32,address)",
            "renounceOwnership(bytes32)",
          ],
          "name": "AccessManagement",
          "namespace": "",
          "systemId": "0x737900000000000000000000000000004163636573734d616e6167656d656e74",
        },
        {
          "abi": [
            "transferBalanceToNamespace(bytes32,bytes32,uint256)",
            "transferBalanceToAddress(bytes32,address,uint256)",
          ],
          "name": "BalanceTransfer",
          "namespace": "",
          "systemId": "0x7379000000000000000000000000000042616c616e63655472616e7366657200",
        },
        {
          "abi": [
            "batchCall((bytes32,bytes)[])",
            "batchCallFrom((address,bytes32,bytes)[])",
          ],
          "name": "BatchCall",
          "namespace": "",
          "systemId": "0x73790000000000000000000000000000426174636843616c6c00000000000000",
        },
        {
          "abi": [
            "installModule(address,bytes)",
            "registerTable(bytes32,bytes32,bytes32,bytes32,string[],string[])",
            "registerStoreHook(bytes32,address,uint8)",
            "unregisterStoreHook(bytes32,address)",
            "registerNamespace(bytes32)",
            "registerSystemHook(bytes32,address,uint8)",
            "unregisterSystemHook(bytes32,address)",
            "registerSystem(bytes32,address,bool)",
            "registerFunctionSelector(bytes32,string)",
            "registerRootFunctionSelector(bytes32,string,string)",
            "registerDelegation(address,bytes32,bytes)",
            "unregisterDelegation(address)",
            "registerNamespaceDelegation(bytes32,bytes32,bytes)",
            "unregisterNamespaceDelegation(bytes32)",
          ],
          "name": "Registration",
          "namespace": "",
          "systemId": "0x73790000000000000000000000000000526567697374726174696f6e00000000",
        },
        {
          "abi": [
            "callWithSignature(address,bytes32,bytes,bytes)",
          ],
          "name": "Delegation",
          "namespace": "",
          "systemId": "0x7379000000000000000000000000000044656c65676174696f6e000000000000",
        },
        {
          "abi": [
            "getResourceTag(bytes32,bytes32)",
            "setResourceTag(bytes32,bytes32,bytes)",
            "deleteResourceTag(bytes32,bytes32)",
          ],
          "name": "MetadataSystem",
          "namespace": "metadata",
          "systemId": "0x73796d657461646174610000000000004d6574616461746153797374656d0000",
        },
      ]
    `);
  });

  it("returns systems ABIs", async () => {
    const client = createTestClient();

    const systemAbis = await getSystemAbis({
      client,
      worldAddress,
      systemIds: ["0x73796d657461646174610000000000004d6574616461746153797374656d0000"],
    });

    const systems = Object.entries(systemAbis).map(([systemId, abi]) => {
      const { name, namespace } = hexToResource(systemId as Hex);
      return {
        systemId,
        namespace,
        name,
        abi: abi.map((item) => formatAbiItem(item)),
      };
    });

    expect(systems).toMatchInlineSnapshot(`
      [
        {
          "abi": [
            "getResourceTag(bytes32,bytes32)",
            "setResourceTag(bytes32,bytes32,bytes)",
            "deleteResourceTag(bytes32,bytes32)",
          ],
          "name": "MetadataSystem",
          "namespace": "metadata",
          "systemId": "0x73796d657461646174610000000000004d6574616461746153797374656d0000",
        },
      ]
    `);
  });
});
