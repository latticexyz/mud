/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "mode";

/** A Row is just a list of raw bytes. */
export interface Row {
  values: Uint8Array[];
}

/** A GenericTable is a representation of a table. */
export interface GenericTable {
  cols: string[];
  rows: Row[];
  types: string[];
}

export interface QueryLayerResponse {
  tables: { [key: string]: GenericTable };
}

export interface QueryLayerResponse_TablesEntry {
  key: string;
  value: GenericTable | undefined;
}

export interface QueryLayerStateResponse {
  chainTables: { [key: string]: GenericTable };
  worldTables: { [key: string]: GenericTable };
}

export interface QueryLayerStateResponse_ChainTablesEntry {
  key: string;
  value: GenericTable | undefined;
}

export interface QueryLayerStateResponse_WorldTablesEntry {
  key: string;
  value: GenericTable | undefined;
}

export interface QueryLayerStateStreamResponse {
  inserted: QueryLayerStateResponse | undefined;
  updated: QueryLayerStateResponse | undefined;
  deleted: QueryLayerStateResponse | undefined;
}

export interface Namespace {
  chainId: string;
  worldAddress: string;
}

export interface StateRequest {
  /** Namespace. */
  namespace: Namespace | undefined;
  /**
   * Selection of world and chain tables. If left empty, all tables
   * are included.
   */
  worldTables: string[];
  chainTables: string[];
}

export interface SingleStateRequest {
  /** Namespace. */
  namespace: Namespace | undefined;
  /** Table. */
  table: string;
  /** Filters. */
  filter: Filter[];
  /** Projections. */
  project: ProjectedField[];
}

export interface FindRequest {
  from: string;
  filter: Filter[];
  project: ProjectedField[];
  /** Namespace. */
  namespace: Namespace | undefined;
  /** Options. */
  options: FindRequestOptions | undefined;
}

export interface FindAllRequest {
  tables: string[];
  /** Namespace. */
  namespace: Namespace | undefined;
  /** Options. */
  options: FindRequestOptions | undefined;
}

export interface JoinRequest {
  on: FieldPair | undefined;
  children: FindRequest[];
  /** Namespace. */
  namespace: Namespace | undefined;
}

export interface DeleteRequest {
  from: string;
  filter: Filter[];
}

export interface UpdateRequest {
  target: string;
  filter: Filter[];
  row: { [key: string]: string };
}

export interface UpdateRequest_RowEntry {
  key: string;
  value: string;
}

export interface InsertRequest {
  into: string;
  row: { [key: string]: string };
}

export interface InsertRequest_RowEntry {
  key: string;
  value: string;
}

export interface CreateRequest {
  name: string;
}

export interface FindRequestOptions {
  compressed: boolean;
  group: boolean;
  negate: boolean;
}

export interface Field {
  tableName: string;
  tableField: string;
}

export interface FieldPair {
  field1: Field | undefined;
  field2: Field | undefined;
}

export interface ProjectedField {
  field: Field | undefined;
  rename?: string | undefined;
}

export interface Filter {
  field: Field | undefined;
  operator: string;
  value: string;
  function: string;
}

function createBaseRow(): Row {
  return { values: [] };
}

export const Row = {
  encode(message: Row, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(18).bytes(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Row {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag != 18) {
            break;
          }

          message.values.push(reader.bytes());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Row>): Row {
    return Row.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Row>): Row {
    const message = createBaseRow();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseGenericTable(): GenericTable {
  return { cols: [], rows: [], types: [] };
}

export const GenericTable = {
  encode(message: GenericTable, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.cols) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.rows) {
      Row.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.types) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenericTable {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenericTable();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.cols.push(reader.string());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.rows.push(Row.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.types.push(reader.string());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GenericTable>): GenericTable {
    return GenericTable.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GenericTable>): GenericTable {
    const message = createBaseGenericTable();
    message.cols = object.cols?.map((e) => e) || [];
    message.rows = object.rows?.map((e) => Row.fromPartial(e)) || [];
    message.types = object.types?.map((e) => e) || [];
    return message;
  },
};

function createBaseQueryLayerResponse(): QueryLayerResponse {
  return { tables: {} };
}

export const QueryLayerResponse = {
  encode(message: QueryLayerResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.tables).forEach(([key, value]) => {
      QueryLayerResponse_TablesEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          const entry1 = QueryLayerResponse_TablesEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.tables[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<QueryLayerResponse>): QueryLayerResponse {
    return QueryLayerResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryLayerResponse>): QueryLayerResponse {
    const message = createBaseQueryLayerResponse();
    message.tables = Object.entries(object.tables ?? {}).reduce<{ [key: string]: GenericTable }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = GenericTable.fromPartial(value);
        }
        return acc;
      },
      {}
    );
    return message;
  },
};

function createBaseQueryLayerResponse_TablesEntry(): QueryLayerResponse_TablesEntry {
  return { key: "", value: undefined };
}

export const QueryLayerResponse_TablesEntry = {
  encode(message: QueryLayerResponse_TablesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      GenericTable.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerResponse_TablesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponse_TablesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.value = GenericTable.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<QueryLayerResponse_TablesEntry>): QueryLayerResponse_TablesEntry {
    return QueryLayerResponse_TablesEntry.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryLayerResponse_TablesEntry>): QueryLayerResponse_TablesEntry {
    const message = createBaseQueryLayerResponse_TablesEntry();
    message.key = object.key ?? "";
    message.value =
      object.value !== undefined && object.value !== null ? GenericTable.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBaseQueryLayerStateResponse(): QueryLayerStateResponse {
  return { chainTables: {}, worldTables: {} };
}

export const QueryLayerStateResponse = {
  encode(message: QueryLayerStateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.chainTables).forEach(([key, value]) => {
      QueryLayerStateResponse_ChainTablesEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.worldTables).forEach(([key, value]) => {
      QueryLayerStateResponse_WorldTablesEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerStateResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          const entry1 = QueryLayerStateResponse_ChainTablesEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.chainTables[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          const entry2 = QueryLayerStateResponse_WorldTablesEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.worldTables[entry2.key] = entry2.value;
          }
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<QueryLayerStateResponse>): QueryLayerStateResponse {
    return QueryLayerStateResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryLayerStateResponse>): QueryLayerStateResponse {
    const message = createBaseQueryLayerStateResponse();
    message.chainTables = Object.entries(object.chainTables ?? {}).reduce<{ [key: string]: GenericTable }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = GenericTable.fromPartial(value);
        }
        return acc;
      },
      {}
    );
    message.worldTables = Object.entries(object.worldTables ?? {}).reduce<{ [key: string]: GenericTable }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = GenericTable.fromPartial(value);
        }
        return acc;
      },
      {}
    );
    return message;
  },
};

function createBaseQueryLayerStateResponse_ChainTablesEntry(): QueryLayerStateResponse_ChainTablesEntry {
  return { key: "", value: undefined };
}

export const QueryLayerStateResponse_ChainTablesEntry = {
  encode(message: QueryLayerStateResponse_ChainTablesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      GenericTable.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerStateResponse_ChainTablesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerStateResponse_ChainTablesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.value = GenericTable.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<QueryLayerStateResponse_ChainTablesEntry>): QueryLayerStateResponse_ChainTablesEntry {
    return QueryLayerStateResponse_ChainTablesEntry.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryLayerStateResponse_ChainTablesEntry>): QueryLayerStateResponse_ChainTablesEntry {
    const message = createBaseQueryLayerStateResponse_ChainTablesEntry();
    message.key = object.key ?? "";
    message.value =
      object.value !== undefined && object.value !== null ? GenericTable.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBaseQueryLayerStateResponse_WorldTablesEntry(): QueryLayerStateResponse_WorldTablesEntry {
  return { key: "", value: undefined };
}

export const QueryLayerStateResponse_WorldTablesEntry = {
  encode(message: QueryLayerStateResponse_WorldTablesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      GenericTable.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerStateResponse_WorldTablesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerStateResponse_WorldTablesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.value = GenericTable.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<QueryLayerStateResponse_WorldTablesEntry>): QueryLayerStateResponse_WorldTablesEntry {
    return QueryLayerStateResponse_WorldTablesEntry.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryLayerStateResponse_WorldTablesEntry>): QueryLayerStateResponse_WorldTablesEntry {
    const message = createBaseQueryLayerStateResponse_WorldTablesEntry();
    message.key = object.key ?? "";
    message.value =
      object.value !== undefined && object.value !== null ? GenericTable.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBaseQueryLayerStateStreamResponse(): QueryLayerStateStreamResponse {
  return { inserted: undefined, updated: undefined, deleted: undefined };
}

export const QueryLayerStateStreamResponse = {
  encode(message: QueryLayerStateStreamResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.inserted !== undefined) {
      QueryLayerStateResponse.encode(message.inserted, writer.uint32(10).fork()).ldelim();
    }
    if (message.updated !== undefined) {
      QueryLayerStateResponse.encode(message.updated, writer.uint32(18).fork()).ldelim();
    }
    if (message.deleted !== undefined) {
      QueryLayerStateResponse.encode(message.deleted, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerStateStreamResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerStateStreamResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.inserted = QueryLayerStateResponse.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.updated = QueryLayerStateResponse.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.deleted = QueryLayerStateResponse.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<QueryLayerStateStreamResponse>): QueryLayerStateStreamResponse {
    return QueryLayerStateStreamResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryLayerStateStreamResponse>): QueryLayerStateStreamResponse {
    const message = createBaseQueryLayerStateStreamResponse();
    message.inserted =
      object.inserted !== undefined && object.inserted !== null
        ? QueryLayerStateResponse.fromPartial(object.inserted)
        : undefined;
    message.updated =
      object.updated !== undefined && object.updated !== null
        ? QueryLayerStateResponse.fromPartial(object.updated)
        : undefined;
    message.deleted =
      object.deleted !== undefined && object.deleted !== null
        ? QueryLayerStateResponse.fromPartial(object.deleted)
        : undefined;
    return message;
  },
};

function createBaseNamespace(): Namespace {
  return { chainId: "", worldAddress: "" };
}

export const Namespace = {
  encode(message: Namespace, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    if (message.worldAddress !== "") {
      writer.uint32(18).string(message.worldAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Namespace {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNamespace();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.worldAddress = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Namespace>): Namespace {
    return Namespace.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Namespace>): Namespace {
    const message = createBaseNamespace();
    message.chainId = object.chainId ?? "";
    message.worldAddress = object.worldAddress ?? "";
    return message;
  },
};

function createBaseStateRequest(): StateRequest {
  return { namespace: undefined, worldTables: [], chainTables: [] };
}

export const StateRequest = {
  encode(message: StateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.namespace !== undefined) {
      Namespace.encode(message.namespace, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.worldTables) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.chainTables) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.namespace = Namespace.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.worldTables.push(reader.string());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.chainTables.push(reader.string());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<StateRequest>): StateRequest {
    return StateRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<StateRequest>): StateRequest {
    const message = createBaseStateRequest();
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? Namespace.fromPartial(object.namespace) : undefined;
    message.worldTables = object.worldTables?.map((e) => e) || [];
    message.chainTables = object.chainTables?.map((e) => e) || [];
    return message;
  },
};

function createBaseSingleStateRequest(): SingleStateRequest {
  return { namespace: undefined, table: "", filter: [], project: [] };
}

export const SingleStateRequest = {
  encode(message: SingleStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.namespace !== undefined) {
      Namespace.encode(message.namespace, writer.uint32(10).fork()).ldelim();
    }
    if (message.table !== "") {
      writer.uint32(18).string(message.table);
    }
    for (const v of message.filter) {
      Filter.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.project) {
      ProjectedField.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SingleStateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSingleStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.namespace = Namespace.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.table = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.filter.push(Filter.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.project.push(ProjectedField.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SingleStateRequest>): SingleStateRequest {
    return SingleStateRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<SingleStateRequest>): SingleStateRequest {
    const message = createBaseSingleStateRequest();
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? Namespace.fromPartial(object.namespace) : undefined;
    message.table = object.table ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    message.project = object.project?.map((e) => ProjectedField.fromPartial(e)) || [];
    return message;
  },
};

function createBaseFindRequest(): FindRequest {
  return { from: "", filter: [], project: [], namespace: undefined, options: undefined };
}

export const FindRequest = {
  encode(message: FindRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    for (const v of message.filter) {
      Filter.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.project) {
      ProjectedField.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.namespace !== undefined) {
      Namespace.encode(message.namespace, writer.uint32(34).fork()).ldelim();
    }
    if (message.options !== undefined) {
      FindRequestOptions.encode(message.options, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FindRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.filter.push(Filter.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.project.push(ProjectedField.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.namespace = Namespace.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.options = FindRequestOptions.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FindRequest>): FindRequest {
    return FindRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<FindRequest>): FindRequest {
    const message = createBaseFindRequest();
    message.from = object.from ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    message.project = object.project?.map((e) => ProjectedField.fromPartial(e)) || [];
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? Namespace.fromPartial(object.namespace) : undefined;
    message.options =
      object.options !== undefined && object.options !== null
        ? FindRequestOptions.fromPartial(object.options)
        : undefined;
    return message;
  },
};

function createBaseFindAllRequest(): FindAllRequest {
  return { tables: [], namespace: undefined, options: undefined };
}

export const FindAllRequest = {
  encode(message: FindAllRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.tables) {
      writer.uint32(10).string(v!);
    }
    if (message.namespace !== undefined) {
      Namespace.encode(message.namespace, writer.uint32(18).fork()).ldelim();
    }
    if (message.options !== undefined) {
      FindRequestOptions.encode(message.options, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FindAllRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindAllRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.tables.push(reader.string());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.namespace = Namespace.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.options = FindRequestOptions.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FindAllRequest>): FindAllRequest {
    return FindAllRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<FindAllRequest>): FindAllRequest {
    const message = createBaseFindAllRequest();
    message.tables = object.tables?.map((e) => e) || [];
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? Namespace.fromPartial(object.namespace) : undefined;
    message.options =
      object.options !== undefined && object.options !== null
        ? FindRequestOptions.fromPartial(object.options)
        : undefined;
    return message;
  },
};

function createBaseJoinRequest(): JoinRequest {
  return { on: undefined, children: [], namespace: undefined };
}

export const JoinRequest = {
  encode(message: JoinRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.on !== undefined) {
      FieldPair.encode(message.on, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.children) {
      FindRequest.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.namespace !== undefined) {
      Namespace.encode(message.namespace, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): JoinRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJoinRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.on = FieldPair.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.children.push(FindRequest.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.namespace = Namespace.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<JoinRequest>): JoinRequest {
    return JoinRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<JoinRequest>): JoinRequest {
    const message = createBaseJoinRequest();
    message.on = object.on !== undefined && object.on !== null ? FieldPair.fromPartial(object.on) : undefined;
    message.children = object.children?.map((e) => FindRequest.fromPartial(e)) || [];
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? Namespace.fromPartial(object.namespace) : undefined;
    return message;
  },
};

function createBaseDeleteRequest(): DeleteRequest {
  return { from: "", filter: [] };
}

export const DeleteRequest = {
  encode(message: DeleteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    for (const v of message.filter) {
      Filter.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.filter.push(Filter.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<DeleteRequest>): DeleteRequest {
    return DeleteRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<DeleteRequest>): DeleteRequest {
    const message = createBaseDeleteRequest();
    message.from = object.from ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUpdateRequest(): UpdateRequest {
  return { target: "", filter: [], row: {} };
}

export const UpdateRequest = {
  encode(message: UpdateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.target !== "") {
      writer.uint32(10).string(message.target);
    }
    for (const v of message.filter) {
      Filter.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    Object.entries(message.row).forEach(([key, value]) => {
      UpdateRequest_RowEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.target = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.filter.push(Filter.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          const entry3 = UpdateRequest_RowEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.row[entry3.key] = entry3.value;
          }
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateRequest>): UpdateRequest {
    return UpdateRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<UpdateRequest>): UpdateRequest {
    const message = createBaseUpdateRequest();
    message.target = object.target ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    message.row = Object.entries(object.row ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseUpdateRequest_RowEntry(): UpdateRequest_RowEntry {
  return { key: "", value: "" };
}

export const UpdateRequest_RowEntry = {
  encode(message: UpdateRequest_RowEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateRequest_RowEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequest_RowEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateRequest_RowEntry>): UpdateRequest_RowEntry {
    return UpdateRequest_RowEntry.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<UpdateRequest_RowEntry>): UpdateRequest_RowEntry {
    const message = createBaseUpdateRequest_RowEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseInsertRequest(): InsertRequest {
  return { into: "", row: {} };
}

export const InsertRequest = {
  encode(message: InsertRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.into !== "") {
      writer.uint32(10).string(message.into);
    }
    Object.entries(message.row).forEach(([key, value]) => {
      InsertRequest_RowEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InsertRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.into = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          const entry3 = InsertRequest_RowEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.row[entry3.key] = entry3.value;
          }
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<InsertRequest>): InsertRequest {
    return InsertRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<InsertRequest>): InsertRequest {
    const message = createBaseInsertRequest();
    message.into = object.into ?? "";
    message.row = Object.entries(object.row ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseInsertRequest_RowEntry(): InsertRequest_RowEntry {
  return { key: "", value: "" };
}

export const InsertRequest_RowEntry = {
  encode(message: InsertRequest_RowEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InsertRequest_RowEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertRequest_RowEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<InsertRequest_RowEntry>): InsertRequest_RowEntry {
    return InsertRequest_RowEntry.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<InsertRequest_RowEntry>): InsertRequest_RowEntry {
    const message = createBaseInsertRequest_RowEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseCreateRequest(): CreateRequest {
  return { name: "" };
}

export const CreateRequest = {
  encode(message: CreateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CreateRequest>): CreateRequest {
    return CreateRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CreateRequest>): CreateRequest {
    const message = createBaseCreateRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseFindRequestOptions(): FindRequestOptions {
  return { compressed: false, group: false, negate: false };
}

export const FindRequestOptions = {
  encode(message: FindRequestOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.compressed === true) {
      writer.uint32(8).bool(message.compressed);
    }
    if (message.group === true) {
      writer.uint32(16).bool(message.group);
    }
    if (message.negate === true) {
      writer.uint32(24).bool(message.negate);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FindRequestOptions {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindRequestOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.compressed = reader.bool();
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.group = reader.bool();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.negate = reader.bool();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FindRequestOptions>): FindRequestOptions {
    return FindRequestOptions.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<FindRequestOptions>): FindRequestOptions {
    const message = createBaseFindRequestOptions();
    message.compressed = object.compressed ?? false;
    message.group = object.group ?? false;
    message.negate = object.negate ?? false;
    return message;
  },
};

function createBaseField(): Field {
  return { tableName: "", tableField: "" };
}

export const Field = {
  encode(message: Field, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tableName !== "") {
      writer.uint32(10).string(message.tableName);
    }
    if (message.tableField !== "") {
      writer.uint32(18).string(message.tableField);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Field {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseField();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.tableName = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.tableField = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Field>): Field {
    return Field.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Field>): Field {
    const message = createBaseField();
    message.tableName = object.tableName ?? "";
    message.tableField = object.tableField ?? "";
    return message;
  },
};

function createBaseFieldPair(): FieldPair {
  return { field1: undefined, field2: undefined };
}

export const FieldPair = {
  encode(message: FieldPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.field1 !== undefined) {
      Field.encode(message.field1, writer.uint32(10).fork()).ldelim();
    }
    if (message.field2 !== undefined) {
      Field.encode(message.field2, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FieldPair {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFieldPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.field1 = Field.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.field2 = Field.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FieldPair>): FieldPair {
    return FieldPair.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<FieldPair>): FieldPair {
    const message = createBaseFieldPair();
    message.field1 =
      object.field1 !== undefined && object.field1 !== null ? Field.fromPartial(object.field1) : undefined;
    message.field2 =
      object.field2 !== undefined && object.field2 !== null ? Field.fromPartial(object.field2) : undefined;
    return message;
  },
};

function createBaseProjectedField(): ProjectedField {
  return { field: undefined, rename: undefined };
}

export const ProjectedField = {
  encode(message: ProjectedField, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.field !== undefined) {
      Field.encode(message.field, writer.uint32(10).fork()).ldelim();
    }
    if (message.rename !== undefined) {
      writer.uint32(18).string(message.rename);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectedField {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectedField();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.field = Field.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.rename = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ProjectedField>): ProjectedField {
    return ProjectedField.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ProjectedField>): ProjectedField {
    const message = createBaseProjectedField();
    message.field = object.field !== undefined && object.field !== null ? Field.fromPartial(object.field) : undefined;
    message.rename = object.rename ?? undefined;
    return message;
  },
};

function createBaseFilter(): Filter {
  return { field: undefined, operator: "", value: "", function: "" };
}

export const Filter = {
  encode(message: Filter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.field !== undefined) {
      Field.encode(message.field, writer.uint32(10).fork()).ldelim();
    }
    if (message.operator !== "") {
      writer.uint32(18).string(message.operator);
    }
    if (message.value !== "") {
      writer.uint32(26).string(message.value);
    }
    if (message.function !== "") {
      writer.uint32(34).string(message.function);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Filter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.field = Field.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.operator = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.value = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.function = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Filter>): Filter {
    return Filter.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Filter>): Filter {
    const message = createBaseFilter();
    message.field = object.field !== undefined && object.field !== null ? Field.fromPartial(object.field) : undefined;
    message.operator = object.operator ?? "";
    message.value = object.value ?? "";
    message.function = object.function ?? "";
    return message;
  },
};

export type QueryLayerDefinition = typeof QueryLayerDefinition;
export const QueryLayerDefinition = {
  name: "QueryLayer",
  fullName: "mode.QueryLayer",
  methods: {
    /** Get state endpoint. */
    getState: {
      name: "GetState",
      requestType: StateRequest,
      requestStream: false,
      responseType: QueryLayerStateResponse,
      responseStream: false,
      options: {},
    },
    /** Stream state endpoint. */
    streamState: {
      name: "StreamState",
      requestType: StateRequest,
      requestStream: false,
      responseType: QueryLayerStateStreamResponse,
      responseStream: true,
      options: {},
    },
    /** Get state from single table endpoint. */
    single__GetState: {
      name: "Single__GetState",
      requestType: SingleStateRequest,
      requestStream: false,
      responseType: QueryLayerStateResponse,
      responseStream: false,
      options: {},
    },
    /** Stream state from single table endpoint. */
    single__StreamState: {
      name: "Single__StreamState",
      requestType: SingleStateRequest,
      requestStream: false,
      responseType: QueryLayerStateStreamResponse,
      responseStream: true,
      options: {},
    },
  },
} as const;

export interface QueryLayerServiceImplementation<CallContextExt = {}> {
  /** Get state endpoint. */
  getState(request: StateRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerStateResponse>>;
  /** Stream state endpoint. */
  streamState(
    request: StateRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<QueryLayerStateStreamResponse>>;
  /** Get state from single table endpoint. */
  single__GetState(
    request: SingleStateRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<QueryLayerStateResponse>>;
  /** Stream state from single table endpoint. */
  single__StreamState(
    request: SingleStateRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<QueryLayerStateStreamResponse>>;
}

export interface QueryLayerClient<CallOptionsExt = {}> {
  /** Get state endpoint. */
  getState(
    request: DeepPartial<StateRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<QueryLayerStateResponse>;
  /** Stream state endpoint. */
  streamState(
    request: DeepPartial<StateRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<QueryLayerStateStreamResponse>;
  /** Get state from single table endpoint. */
  single__GetState(
    request: DeepPartial<SingleStateRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<QueryLayerStateResponse>;
  /** Stream state from single table endpoint. */
  single__StreamState(
    request: DeepPartial<SingleStateRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<QueryLayerStateStreamResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
