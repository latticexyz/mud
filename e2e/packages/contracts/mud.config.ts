import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Number: {
      keySchema: {
        key: "uint32",
      },
      valueSchema: {
        value: "uint32",
      },
    },
    Vector: {
      keySchema: {
        key: "uint32",
      },
      valueSchema: {
        x: "int32",
        y: "int32",
      },
    },
    NumberList: {
      keySchema: {},
      valueSchema: {
        value: "uint32[]",
      },
    },
    Multi: {
      keySchema: {
        a: "uint32",
        b: "bool",
        c: "uint256",
        d: "int120",
      },
      valueSchema: {
        num: "int256",
        value: "bool",
      },
    },
    Position: {
      keySchema: {
        zone: "bytes32",
        x: "int32",
        y: "int32",
      },
      valueSchema: {
        player: "address",
      },
    },
    StaticArray: {
      keySchema: {},
      valueSchema: "uint256[2]",
    },
    BattleResult: {
      keySchema: { battleId: "bytes32" },
      valueSchema: {
        aggressorEntity: "bytes32", //can be fleet or space rock
        aggressorDamage: "uint256", //can be fleet or space rock
        targetEntity: "bytes32", //can be fleet or space rock
        targetDamage: "uint256", //can be fleet or space rock
        winner: "bytes32",
        rock: "bytes32", // place where battle took place
        player: "bytes32", // player who initiated the battle
        targetPlayer: "bytes32", // player who was attacked
        timestamp: "uint256", // timestamp of battle
        aggressorAllies: "bytes32[]", //only fleets
        targetAllies: "bytes32[]", //only fleets
      },
      offchainOnly: true,
    },
  },
});
