/* eslint-disable */
import { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "mode";

export interface UncompressedRow {
  source: string;
  entityId: string;
  value: Uint8Array;
}

export interface CompressedRow {
  sourceIdx: number;
  entityIdIdx: number;
  value: Uint8Array;
}

export interface Row {
  values: Uint8Array[];
}

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

export interface QueryLayerResponseUncompressed {
  rows: UncompressedRow[];
}

export interface QueryLayerResponseCompressed {
  rows: CompressedRow[];
  rowSources: string[];
  rowEntities: string[];
}

export interface FindRequestOptions {
  compressed: boolean;
  group: boolean;
  negate: boolean;
}

export interface Namespace {
  chainId: string;
  worldAddress: string;
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

export interface Filter {
  field: Field | undefined;
  operator: string;
  value: string;
  function: string;
}

export interface FieldPair {
  field1: Field | undefined;
  field2: Field | undefined;
}

export interface Field {
  tableName: string;
  tableField: string;
}

export interface ProjectedField {
  field: Field | undefined;
  rename?: string | undefined;
}

function createBaseUncompressedRow(): UncompressedRow {
  return { source: "", entityId: "", value: new Uint8Array() };
}

export const UncompressedRow = {
  encode(message: UncompressedRow, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source !== "") {
      writer.uint32(10).string(message.source);
    }
    if (message.entityId !== "") {
      writer.uint32(18).string(message.entityId);
    }
    if (message.value.length !== 0) {
      writer.uint32(26).bytes(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UncompressedRow {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUncompressedRow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.source = reader.string();
          break;
        case 2:
          message.entityId = reader.string();
          break;
        case 3:
          message.value = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<UncompressedRow>): UncompressedRow {
    const message = createBaseUncompressedRow();
    message.source = object.source ?? "";
    message.entityId = object.entityId ?? "";
    message.value = object.value ?? new Uint8Array();
    return message;
  },
};

function createBaseCompressedRow(): CompressedRow {
  return { sourceIdx: 0, entityIdIdx: 0, value: new Uint8Array() };
}

export const CompressedRow = {
  encode(message: CompressedRow, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sourceIdx !== 0) {
      writer.uint32(8).uint32(message.sourceIdx);
    }
    if (message.entityIdIdx !== 0) {
      writer.uint32(16).uint32(message.entityIdIdx);
    }
    if (message.value.length !== 0) {
      writer.uint32(26).bytes(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompressedRow {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompressedRow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sourceIdx = reader.uint32();
          break;
        case 2:
          message.entityIdIdx = reader.uint32();
          break;
        case 3:
          message.value = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<CompressedRow>): CompressedRow {
    const message = createBaseCompressedRow();
    message.sourceIdx = object.sourceIdx ?? 0;
    message.entityIdIdx = object.entityIdIdx ?? 0;
    message.value = object.value ?? new Uint8Array();
    return message;
  },
};

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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.values.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenericTable();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cols.push(reader.string());
          break;
        case 2:
          message.rows.push(Row.decode(reader, reader.uint32()));
          break;
        case 3:
          message.types.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = QueryLayerResponse_TablesEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.tables[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponse_TablesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = GenericTable.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<QueryLayerResponse_TablesEntry>): QueryLayerResponse_TablesEntry {
    const message = createBaseQueryLayerResponse_TablesEntry();
    message.key = object.key ?? "";
    message.value =
      object.value !== undefined && object.value !== null ? GenericTable.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBaseQueryLayerResponseUncompressed(): QueryLayerResponseUncompressed {
  return { rows: [] };
}

export const QueryLayerResponseUncompressed = {
  encode(message: QueryLayerResponseUncompressed, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.rows) {
      UncompressedRow.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerResponseUncompressed {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponseUncompressed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rows.push(UncompressedRow.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<QueryLayerResponseUncompressed>): QueryLayerResponseUncompressed {
    const message = createBaseQueryLayerResponseUncompressed();
    message.rows = object.rows?.map((e) => UncompressedRow.fromPartial(e)) || [];
    return message;
  },
};

function createBaseQueryLayerResponseCompressed(): QueryLayerResponseCompressed {
  return { rows: [], rowSources: [], rowEntities: [] };
}

export const QueryLayerResponseCompressed = {
  encode(message: QueryLayerResponseCompressed, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.rows) {
      CompressedRow.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.rowSources) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.rowEntities) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerResponseCompressed {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponseCompressed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rows.push(CompressedRow.decode(reader, reader.uint32()));
          break;
        case 2:
          message.rowSources.push(reader.string());
          break;
        case 3:
          message.rowEntities.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<QueryLayerResponseCompressed>): QueryLayerResponseCompressed {
    const message = createBaseQueryLayerResponseCompressed();
    message.rows = object.rows?.map((e) => CompressedRow.fromPartial(e)) || [];
    message.rowSources = object.rowSources?.map((e) => e) || [];
    message.rowEntities = object.rowEntities?.map((e) => e) || [];
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindRequestOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.compressed = reader.bool();
          break;
        case 2:
          message.group = reader.bool();
          break;
        case 3:
          message.negate = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<FindRequestOptions>): FindRequestOptions {
    const message = createBaseFindRequestOptions();
    message.compressed = object.compressed ?? false;
    message.group = object.group ?? false;
    message.negate = object.negate ?? false;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNamespace();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.worldAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<Namespace>): Namespace {
    const message = createBaseNamespace();
    message.chainId = object.chainId ?? "";
    message.worldAddress = object.worldAddress ?? "";
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.filter.push(Filter.decode(reader, reader.uint32()));
          break;
        case 3:
          message.project.push(ProjectedField.decode(reader, reader.uint32()));
          break;
        case 4:
          message.namespace = Namespace.decode(reader, reader.uint32());
          break;
        case 5:
          message.options = FindRequestOptions.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindAllRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tables.push(reader.string());
          break;
        case 2:
          message.namespace = Namespace.decode(reader, reader.uint32());
          break;
        case 3:
          message.options = FindRequestOptions.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJoinRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.on = FieldPair.decode(reader, reader.uint32());
          break;
        case 2:
          message.children.push(FindRequest.decode(reader, reader.uint32()));
          break;
        case 3:
          message.namespace = Namespace.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.filter.push(Filter.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.target = reader.string();
          break;
        case 2:
          message.filter.push(Filter.decode(reader, reader.uint32()));
          break;
        case 3:
          const entry3 = UpdateRequest_RowEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.row[entry3.key] = entry3.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequest_RowEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.into = reader.string();
          break;
        case 3:
          const entry3 = InsertRequest_RowEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.row[entry3.key] = entry3.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInsertRequest_RowEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<CreateRequest>): CreateRequest {
    const message = createBaseCreateRequest();
    message.name = object.name ?? "";
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.field = Field.decode(reader, reader.uint32());
          break;
        case 2:
          message.operator = reader.string();
          break;
        case 3:
          message.value = reader.string();
          break;
        case 4:
          message.function = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFieldPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.field1 = Field.decode(reader, reader.uint32());
          break;
        case 2:
          message.field2 = Field.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseField();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tableName = reader.string();
          break;
        case 2:
          message.tableField = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<Field>): Field {
    const message = createBaseField();
    message.tableName = object.tableName ?? "";
    message.tableField = object.tableField ?? "";
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectedField();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.field = Field.decode(reader, reader.uint32());
          break;
        case 2:
          message.rename = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<ProjectedField>): ProjectedField {
    const message = createBaseProjectedField();
    message.field = object.field !== undefined && object.field !== null ? Field.fromPartial(object.field) : undefined;
    message.rename = object.rename ?? undefined;
    return message;
  },
};

export type QueryLayerDefinition = typeof QueryLayerDefinition;
export const QueryLayerDefinition = {
  name: "QueryLayer",
  fullName: "mode.QueryLayer",
  methods: {
    /** Find endpoint. */
    find: {
      name: "Find",
      requestType: FindRequest,
      requestStream: false,
      responseType: QueryLayerResponse,
      responseStream: false,
      options: {},
    },
    /** Join endpoint. */
    join: {
      name: "Join",
      requestType: JoinRequest,
      requestStream: false,
      responseType: QueryLayerResponse,
      responseStream: false,
      options: {},
    },
    /** FindAll endpoint. */
    findAll: {
      name: "FindAll",
      requestType: FindAllRequest,
      requestStream: false,
      responseType: QueryLayerResponse,
      responseStream: false,
      options: {},
    },
    /** StreamAll endpoint. */
    streamAll: {
      name: "StreamAll",
      requestType: FindAllRequest,
      requestStream: false,
      responseType: QueryLayerResponse,
      responseStream: true,
      options: {},
    },
    /** Count endpoint. */
    count: {
      name: "Count",
      requestType: FindRequest,
      requestStream: false,
      responseType: QueryLayerResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface QueryLayerServiceImplementation<CallContextExt = {}> {
  /** Find endpoint. */
  find(request: FindRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerResponse>>;
  /** Join endpoint. */
  join(request: JoinRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerResponse>>;
  /** FindAll endpoint. */
  findAll(request: FindAllRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerResponse>>;
  /** StreamAll endpoint. */
  streamAll(
    request: FindAllRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<QueryLayerResponse>>;
  /** Count endpoint. */
  count(request: FindRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerResponse>>;
}

export interface QueryLayerClient<CallOptionsExt = {}> {
  /** Find endpoint. */
  find(request: DeepPartial<FindRequest>, options?: CallOptions & CallOptionsExt): Promise<QueryLayerResponse>;
  /** Join endpoint. */
  join(request: DeepPartial<JoinRequest>, options?: CallOptions & CallOptionsExt): Promise<QueryLayerResponse>;
  /** FindAll endpoint. */
  findAll(request: DeepPartial<FindAllRequest>, options?: CallOptions & CallOptionsExt): Promise<QueryLayerResponse>;
  /** StreamAll endpoint. */
  streamAll(
    request: DeepPartial<FindAllRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<QueryLayerResponse>;
  /** Count endpoint. */
  count(request: DeepPartial<FindRequest>, options?: CallOptions & CallOptionsExt): Promise<QueryLayerResponse>;
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
