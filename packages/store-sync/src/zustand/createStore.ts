import { SchemaToPrimitives, Table, Tables } from "@latticexyz/store";
import { StoreApi, UseBoundStore, create } from "zustand";
import { RawRecord, TableRecord } from "./common";
import { Hex } from "viem";
import { encodeKey } from "@latticexyz/protocol-parser";
import { flattenSchema } from "../flattenSchema";
import { getId } from "./getId";
import { SyncStep } from "../SyncStep";
import { Entity } from "@latticexyz/recs";
import { decodeEntity } from "./decodeEntity";

type TableRecords<table extends Table> = {
  readonly [id: string]: TableRecord<table>;
};

// TODO: split this into distinct stores and combine (https://docs.pmnd.rs/zustand/guides/typescript#slices-pattern)?

export type ZustandState<tables extends Tables> = {
  readonly syncProgress: {
    readonly step: SyncStep;
    readonly message: string;
    readonly percentage: number;
    readonly latestBlockNumber: bigint;
    readonly lastBlockNumberProcessed: bigint;
  };
  /** Tables derived from table registration store events */
  readonly tables: {
    readonly [tableId: Hex]: Table;
  };
  /** Raw records (bytes) derived from store events */
  readonly rawRecords: {
    readonly [id: string]: RawRecord;
  };
  /** Decoded table records derived from raw records */
  readonly records: {
    readonly [id: string]: TableRecord<tables[keyof tables]>;
  };
  readonly getRecords: <table extends Table>(table: table) => TableRecords<table>;
  readonly getRecord: <table extends Table>(
    table: table,
    key: SchemaToPrimitives<table["keySchema"]>
  ) => TableRecord<table> | undefined;
  readonly getValue: <table extends Table>(
    table: table,
    key: SchemaToPrimitives<table["keySchema"]>
  ) => TableRecord<table>["value"] | undefined;
  readonly hasComponent: <table extends Table>(table: table, entity: Entity) => boolean;
  readonly getComponentValue: <table extends Table>(
    table: table,
    entity: Entity
  ) => TableRecord<table>["value"] | undefined;
  readonly getComponentValueStrict: <table extends Table>(table: table, entity: Entity) => TableRecord<table>["value"];
};

export type ZustandStore<tables extends Tables> = UseBoundStore<StoreApi<ZustandState<tables>>>;

export type CreateStoreOptions<tables extends Tables> = {
  tables: tables;
};

export function createStore<tables extends Tables>(opts: CreateStoreOptions<tables>): ZustandStore<tables> {
  return create<ZustandState<tables>>((set, get) => {
    /**
     * Check whether a table contains a value for a given entity.
     *
     * @param table to check whether it has a value for the given entity.
     * @param entity {@link Entity} to check whether it has a value in the given component.
     * @returns true if the component contains a value for the given entity, else false.
     */
    function hasComponent<table extends Table>(table: table, entity: Entity): boolean {
      const key = decodeEntity(table.keySchema, entity);
      const keyTuple = encodeKey(flattenSchema(table.keySchema), key);
      const id = getId({ tableId: table.tableId, keyTuple });
      const value = get().records[id];
      if (value) {
        return true;
      }
      return false;
    }

    /**
     * Get the value of a given entity in the given table.
     * Returns undefined if no value or only a partial value is found.
     *
     * @param table to get the value from for the given entity.
     * @param entity {@link Entity} to get the value for from the given table.
     * @returns Value of the given entity in the given table or undefined if no value exists.
     */
    function getComponentValue<table extends Table>(
      table: table,
      entity: Entity
    ): TableRecord<table>["value"] | undefined {
      const key = decodeEntity(table.keySchema, entity);
      return get().getRecord(table, key)?.value;
    }

    /**
     * Get the value of a given entity in the given table.
     * Throws an error if no value exists for the given entity in the given table.
     *
     * @param table to get the value from for the given entity.
     * @param entity {@link Entity} of the entity to get the value for from the given table.
     * @returns Value of the given entity in the given table.
     *
     * @remarks
     * Throws an error if no value exists in the table for the given entity.
     */
    function getComponentValueStrict<table extends Table>(table: table, entity: Entity): TableRecord<table>["value"] {
      const value = getComponentValue(table, entity);
      if (!value) throw new Error(`No value for table ${table.name} on entity ${entity}`);
      return value;
    }

    return {
      syncProgress: {
        step: SyncStep.INITIALIZE,
        message: "Connecting",
        percentage: 0,
        latestBlockNumber: 0n,
        lastBlockNumberProcessed: 0n,
      },
      tables: Object.fromEntries(Object.entries(opts.tables).map(([, table]) => [table.tableId, table])),
      rawRecords: {},
      records: {},
      getRecords: <table extends Table>(table: table): TableRecords<table> => {
        const records = get().records;
        return Object.fromEntries(
          Object.entries(records).filter(([id, record]) => record.table.tableId === table.tableId)
        ) as unknown as TableRecords<table>;
      },
      getRecord: <table extends Table>(
        table: table,
        key: SchemaToPrimitives<table["keySchema"]>
      ): TableRecord<table> | undefined => {
        const keyTuple = encodeKey(flattenSchema(table.keySchema), key);
        const id = getId({ tableId: table.tableId, keyTuple });
        return get().records[id] as unknown as TableRecord<table> | undefined;
      },
      getValue: <table extends Table>(
        table: table,
        key: SchemaToPrimitives<table["keySchema"]>
      ): TableRecord<table>["value"] | undefined => {
        return get().getRecord(table, key)?.value;
      },
      hasComponent,
      getComponentValue,
      getComponentValueStrict,
    };
  });
}
