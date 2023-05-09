import { TupleDatabaseClient, TupleRootTransactionApi } from "tuple-database";
import { MUDCoreUserConfig } from "@latticexyz/config";
import { ExpandMUDUserConfig } from "@latticexyz/store/register";
import { AbiType } from "@latticexyz/schema-type";

export type AbiTypeToPrimitiveType<T extends AbiType> = AbiTypeToPrimitiveTypeLookup[T];

// TODO: add mappings for remaining Solidity types
export type AbiTypeToPrimitiveTypeLookup = {
  bytes32: string;
  uint256: bigint;
} & {
  [_ in AbiType]: unknown;
};

export type ExpandedConfig = ExpandMUDUserConfig<any>;

export type DatabaseClient<Config extends ExpandedConfig> = {
  [table in keyof Config["tables"]]: {
    set: (
      key: Config["tables"][table]["primaryKeys"],
      value: Partial<Config["tables"][table]["schema"]>
    ) => TupleRootTransactionApi;
    get: (key: Config["tables"][table]["primaryKeys"]) => Config["tables"][table]["schema"];
    remove: (key: Config["tables"][table]["primaryKeys"]) => TupleRootTransactionApi;
  };
} & {
  _tupleDatabaseClient: TupleDatabaseClient;
};

const testConfig = {
  tables: {
    TestTable: { schema: "uint256" },
  },
} as const satisfies MUDCoreUserConfig;

const expandedConfig: ExpandMUDUserConfig<typeof testConfig> = {} as any;

const client: DatabaseClient<typeof expandedConfig> = {} as any;

const value = client.TestTable.get({ key: "bytes32" });
client.TestTable.set({ key: "bytes32" }, { value: "uint256" });
client.TestTable.remove({ key: "bytes32" });
