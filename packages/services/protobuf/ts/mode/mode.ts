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

export interface QueryLayerResponse {
  cols: string[];
  rows: Row[];
  types: string[];
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

export interface FindRequest {
  from: string;
  filter: Filter[];
  project: ProjectedField[];
  /** Options. */
  options: FindRequestOptions | undefined;
}

export interface FindAllRequest {
  tables: string[];
  /** Options. */
  options: FindRequestOptions | undefined;
}

export interface Filter {
  field: Field | undefined;
  operator: string;
  value: string;
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

function createBaseQueryLayerResponse(): QueryLayerResponse {
  return { cols: [], rows: [], types: [] };
}

export const QueryLayerResponse = {
  encode(message: QueryLayerResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryLayerResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponse();
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

  fromPartial(object: DeepPartial<QueryLayerResponse>): QueryLayerResponse {
    const message = createBaseQueryLayerResponse();
    message.cols = object.cols?.map((e) => e) || [];
    message.rows = object.rows?.map((e) => Row.fromPartial(e)) || [];
    message.types = object.types?.map((e) => e) || [];
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

function createBaseFindRequest(): FindRequest {
  return { from: "", filter: [], project: [], options: undefined };
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
    if (message.options !== undefined) {
      FindRequestOptions.encode(message.options, writer.uint32(34).fork()).ldelim();
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
    message.options =
      object.options !== undefined && object.options !== null
        ? FindRequestOptions.fromPartial(object.options)
        : undefined;
    return message;
  },
};

function createBaseFindAllRequest(): FindAllRequest {
  return { tables: [], options: undefined };
}

export const FindAllRequest = {
  encode(message: FindAllRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.tables) {
      writer.uint32(10).string(v!);
    }
    if (message.options !== undefined) {
      FindRequestOptions.encode(message.options, writer.uint32(18).fork()).ldelim();
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
    message.options =
      object.options !== undefined && object.options !== null
        ? FindRequestOptions.fromPartial(object.options)
        : undefined;
    return message;
  },
};

function createBaseFilter(): Filter {
  return { field: undefined, operator: "", value: "" };
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
    /** FindAll endpoint. */
    findAll: {
      name: "FindAll",
      requestType: FindAllRequest,
      requestStream: false,
      responseType: QueryLayerResponse,
      responseStream: false,
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
  /** FindAll endpoint. */
  findAll(request: FindAllRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerResponse>>;
  /** Count endpoint. */
  count(request: FindRequest, context: CallContext & CallContextExt): Promise<DeepPartial<QueryLayerResponse>>;
}

export interface QueryLayerClient<CallOptionsExt = {}> {
  /** Find endpoint. */
  find(request: DeepPartial<FindRequest>, options?: CallOptions & CallOptionsExt): Promise<QueryLayerResponse>;
  /** FindAll endpoint. */
  findAll(request: DeepPartial<FindAllRequest>, options?: CallOptions & CallOptionsExt): Promise<QueryLayerResponse>;
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
