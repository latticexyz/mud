import { mudConfig } from "@latticexyz/world/register";

import { resolveTableId } from "@latticexyz/config";

export default mudConfig({
  enums: {
    BuildingType: [
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
    ],
  },
  systems: {
    IncrementSystem: {
      name: "increment",
      openAccess: true,
    },
  },
  excludeSystems: [
    // Until namespace overrides, this system must be manually deployed in PostDeploy
    "ChatNamespacedSystem",
  ],
  tables: {
    CounterTable: {
      keySchema: {},
      valueSchema: {
        value: "uint32",
      },
      storeArgument: true,
    },
    MessageTable: {
      keySchema: {},
      valueSchema: {
        value: "string",
      },
      offchainOnly: true,
    },
    Inventory: {
      keySchema: {
        owner: "address",
        item: "uint32",
        itemVariant: "uint32",
      },
      valueSchema: { amount: "uint32" },
    },
    Buildings: {
      keySchema: { building: "BuildingType", isTeamRight: "bool" },
      dataStruct: true,
      valueSchema: {
        totalResourcesStaked: "uint256[5]",
      },
    },
    PlayerDonated: {
      valueSchema: {
        player: "address",
        isTeamRight: "bool",
        building: "BuildingType",
        resources: "uint256[5]",
      },
      offchainOnly: true,
    },
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("Inventory")],
    },
  ],
});
