import { StoreConfigShorthand, StoreConfigExpanded, FieldValue } from "@latticexyz/config";
import { TupleDatabaseClient, TupleRootTransactionApi } from "tuple-database";

export type ContractTables<Config extends StoreConfigShorthand> = StoreConfigExpanded<Config>["tables"];

export type AbiTypeToPrimitiveType<T extends FieldValue> = AbiTypeToPrimitiveTypeLookup[T];

// TODO: add mappings for remaining Solidity types
export type AbiTypeToPrimitiveTypeLookup = {
  bytes32: string;
  uint256: bigint;
} & {
  [_ in FieldValue]: unknown;
};

export type ClientTables<Config extends StoreConfigShorthand> = {
  [table in keyof ContractTables<Config>]: {
    primaryKeys: {
      [key in keyof ContractTables<Config>[table]["primaryKeys"]]: ContractTables<Config>[table]["primaryKeys"][key] extends FieldValue
        ? AbiTypeToPrimitiveType<ContractTables<Config>[table]["primaryKeys"][key]>
        : never;
    };
    schema: {
      [key in keyof ContractTables<Config>[table]["schema"]]: ContractTables<Config>[table]["schema"][key] extends FieldValue
        ? AbiTypeToPrimitiveType<ContractTables<Config>[table]["schema"][key]>
        : never;
    };
  };
};

export type DatabaseClient<Config extends StoreConfigShorthand> = {
  [table in keyof ClientTables<Config>]: {
    upsert: (
      key: ClientTables<Config>[table]["primaryKeys"],
      value: Partial<ClientTables<Config>[table]["schema"]>
    ) => TupleRootTransactionApi;
    get: (key: ClientTables<Config>[table]["primaryKeys"]) => ClientTables<Config>[table]["schema"];
    remove: (key: ClientTables<Config>[table]["primaryKeys"]) => TupleRootTransactionApi;
  };
} & {
  _tupleDatabaseClient: TupleDatabaseClient;
};
