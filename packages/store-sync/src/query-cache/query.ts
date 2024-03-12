import { ZustandStore } from "../zustand";
import { Query, QueryResult, queryToSubject } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { findSubjects } from "./findSubjects";
import { ResolvedStoreConfig, resolveStoreConfig } from "@latticexyz/store/ts/config/v2/store";
import { evaluate } from "@latticexyz/common/type-utils";

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields
//       - can only compare like types?
//       - `where` tables are in `from`

// TODO: make query smarter/config aware for shorthand
// TODO: make condition types smarter, so condition literal matches the field primitive type
// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type QueryResult<query extends Query> = readonly QueryResultSubject[];

// export async function query<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
//   store: ZustandStore<AllTables<config, extraTables>>,
//   query: Query,
// ): Promise<QueryResult<typeof query>> {
//   const records = Object.values(store.getState().records);
//   const matches = findSubjects({ records, query });

//   return matches;
// }

const config = resolveStoreConfig({
  enums: {
    TerrainType: ["None", "Ocean", "Grassland", "Desert"],
  },
  tables: {
    Position: {
      schema: {
        player: "address",
        x: "int32",
        y: "int32",
      },
      primaryKey: ["player"],
    },
    Health: {
      schema: {
        player: "address",
        health: "uint256",
      },
      primaryKey: ["player"],
    },
    Inventory: {
      schema: {
        player: "address",
        item: "uint8",
        amount: "uint32",
      },
      primaryKey: ["player", "item"],
    },
    Score: {
      schema: {
        player: "address",
        game: "uint256",
        score: "uint256",
      },
      primaryKey: ["player", "game"],
    },
    Winner: {
      schema: {
        game: "uint256",
        player: "address",
      },
      primaryKey: ["game"],
    },
    // TODO: figure out why this fails the config type below
    // Terrain: {
    //   schema: {
    //     x: "int32",
    //     y: "int32",
    //     terrainType: "TerrainType",
    //   },
    //   primaryKey: ["x", "y"],
    // },
  },
});

type subjects = queryToSubject<
  {
    from: {
      Position: ["x", "y"];
    };
  },
  typeof config
>;

// TODO: validate that all query subjects match in underlying abi types

export async function query<config extends ResolvedStoreConfig, query extends Query<config>>(
  config: config,
  query: query,
): Promise<evaluate<QueryResult<query, config>>> {
  return {} as unknown;
}

const result = await query(config, {
  from: {
    Position: ["x", "y"],
  },
});
