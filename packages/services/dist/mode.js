// protobuf/ts/mode/mode.ts
import _m0 from "protobufjs/minimal.js";
var protobufPackage = "mode";
function createBaseRow() {
  return { values: [] };
}
var Row = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.values) {
      writer.uint32(18).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Row.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRow();
    message.values = object.values?.map((e) => e) || [];
    return message;
  }
};
function createBaseGenericTable() {
  return { cols: [], rows: [], types: [] };
}
var GenericTable = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.cols) {
      writer.uint32(10).string(v);
    }
    for (const v of message.rows) {
      Row.encode(v, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.types) {
      writer.uint32(26).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return GenericTable.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGenericTable();
    message.cols = object.cols?.map((e) => e) || [];
    message.rows = object.rows?.map((e) => Row.fromPartial(e)) || [];
    message.types = object.types?.map((e) => e) || [];
    return message;
  }
};
function createBaseQueryLayerResponse() {
  return { tables: {} };
}
var QueryLayerResponse = {
  encode(message, writer = _m0.Writer.create()) {
    Object.entries(message.tables).forEach(([key, value]) => {
      QueryLayerResponse_TablesEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          const entry1 = QueryLayerResponse_TablesEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
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
  create(base) {
    return QueryLayerResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQueryLayerResponse();
    message.tables = Object.entries(object.tables ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = GenericTable.fromPartial(value);
        }
        return acc;
      },
      {}
    );
    return message;
  }
};
function createBaseQueryLayerResponse_TablesEntry() {
  return { key: "", value: void 0 };
}
var QueryLayerResponse_TablesEntry = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== void 0) {
      GenericTable.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return QueryLayerResponse_TablesEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQueryLayerResponse_TablesEntry();
    message.key = object.key ?? "";
    message.value = object.value !== void 0 && object.value !== null ? GenericTable.fromPartial(object.value) : void 0;
    return message;
  }
};
function createBaseQueryLayerStateResponse() {
  return { chainTables: {}, worldTables: {} };
}
var QueryLayerStateResponse = {
  encode(message, writer = _m0.Writer.create()) {
    Object.entries(message.chainTables).forEach(([key, value]) => {
      QueryLayerStateResponse_ChainTablesEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.worldTables).forEach(([key, value]) => {
      QueryLayerStateResponse_WorldTablesEntry.encode({ key, value }, writer.uint32(18).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseQueryLayerStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          const entry1 = QueryLayerStateResponse_ChainTablesEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
            message.chainTables[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          const entry2 = QueryLayerStateResponse_WorldTablesEntry.decode(reader, reader.uint32());
          if (entry2.value !== void 0) {
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
  create(base) {
    return QueryLayerStateResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQueryLayerStateResponse();
    message.chainTables = Object.entries(object.chainTables ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = GenericTable.fromPartial(value);
        }
        return acc;
      },
      {}
    );
    message.worldTables = Object.entries(object.worldTables ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = GenericTable.fromPartial(value);
        }
        return acc;
      },
      {}
    );
    return message;
  }
};
function createBaseQueryLayerStateResponse_ChainTablesEntry() {
  return { key: "", value: void 0 };
}
var QueryLayerStateResponse_ChainTablesEntry = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== void 0) {
      GenericTable.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return QueryLayerStateResponse_ChainTablesEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQueryLayerStateResponse_ChainTablesEntry();
    message.key = object.key ?? "";
    message.value = object.value !== void 0 && object.value !== null ? GenericTable.fromPartial(object.value) : void 0;
    return message;
  }
};
function createBaseQueryLayerStateResponse_WorldTablesEntry() {
  return { key: "", value: void 0 };
}
var QueryLayerStateResponse_WorldTablesEntry = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== void 0) {
      GenericTable.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return QueryLayerStateResponse_WorldTablesEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQueryLayerStateResponse_WorldTablesEntry();
    message.key = object.key ?? "";
    message.value = object.value !== void 0 && object.value !== null ? GenericTable.fromPartial(object.value) : void 0;
    return message;
  }
};
function createBaseQueryLayerStateStreamResponse() {
  return { inserted: void 0, updated: void 0, deleted: void 0 };
}
var QueryLayerStateStreamResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.inserted !== void 0) {
      QueryLayerStateResponse.encode(message.inserted, writer.uint32(10).fork()).ldelim();
    }
    if (message.updated !== void 0) {
      QueryLayerStateResponse.encode(message.updated, writer.uint32(18).fork()).ldelim();
    }
    if (message.deleted !== void 0) {
      QueryLayerStateResponse.encode(message.deleted, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return QueryLayerStateStreamResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQueryLayerStateStreamResponse();
    message.inserted = object.inserted !== void 0 && object.inserted !== null ? QueryLayerStateResponse.fromPartial(object.inserted) : void 0;
    message.updated = object.updated !== void 0 && object.updated !== null ? QueryLayerStateResponse.fromPartial(object.updated) : void 0;
    message.deleted = object.deleted !== void 0 && object.deleted !== null ? QueryLayerStateResponse.fromPartial(object.deleted) : void 0;
    return message;
  }
};
function createBaseNamespace() {
  return { chainId: "", worldAddress: "" };
}
var Namespace = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    if (message.worldAddress !== "") {
      writer.uint32(18).string(message.worldAddress);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Namespace.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseNamespace();
    message.chainId = object.chainId ?? "";
    message.worldAddress = object.worldAddress ?? "";
    return message;
  }
};
function createBaseStateRequest() {
  return { namespace: void 0, worldTables: [], chainTables: [] };
}
var StateRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.namespace !== void 0) {
      Namespace.encode(message.namespace, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.worldTables) {
      writer.uint32(18).string(v);
    }
    for (const v of message.chainTables) {
      writer.uint32(26).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return StateRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStateRequest();
    message.namespace = object.namespace !== void 0 && object.namespace !== null ? Namespace.fromPartial(object.namespace) : void 0;
    message.worldTables = object.worldTables?.map((e) => e) || [];
    message.chainTables = object.chainTables?.map((e) => e) || [];
    return message;
  }
};
function createBaseSingleStateRequest() {
  return { namespace: void 0, table: "", filter: [], project: [] };
}
var SingleStateRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.namespace !== void 0) {
      Namespace.encode(message.namespace, writer.uint32(10).fork()).ldelim();
    }
    if (message.table !== "") {
      writer.uint32(18).string(message.table);
    }
    for (const v of message.filter) {
      Filter.encode(v, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.project) {
      ProjectedField.encode(v, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return SingleStateRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSingleStateRequest();
    message.namespace = object.namespace !== void 0 && object.namespace !== null ? Namespace.fromPartial(object.namespace) : void 0;
    message.table = object.table ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    message.project = object.project?.map((e) => ProjectedField.fromPartial(e)) || [];
    return message;
  }
};
function createBaseFindRequest() {
  return { from: "", filter: [], project: [], namespace: void 0, options: void 0 };
}
var FindRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    for (const v of message.filter) {
      Filter.encode(v, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.project) {
      ProjectedField.encode(v, writer.uint32(26).fork()).ldelim();
    }
    if (message.namespace !== void 0) {
      Namespace.encode(message.namespace, writer.uint32(34).fork()).ldelim();
    }
    if (message.options !== void 0) {
      FindRequestOptions.encode(message.options, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return FindRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFindRequest();
    message.from = object.from ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    message.project = object.project?.map((e) => ProjectedField.fromPartial(e)) || [];
    message.namespace = object.namespace !== void 0 && object.namespace !== null ? Namespace.fromPartial(object.namespace) : void 0;
    message.options = object.options !== void 0 && object.options !== null ? FindRequestOptions.fromPartial(object.options) : void 0;
    return message;
  }
};
function createBaseFindAllRequest() {
  return { tables: [], namespace: void 0, options: void 0 };
}
var FindAllRequest = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.tables) {
      writer.uint32(10).string(v);
    }
    if (message.namespace !== void 0) {
      Namespace.encode(message.namespace, writer.uint32(18).fork()).ldelim();
    }
    if (message.options !== void 0) {
      FindRequestOptions.encode(message.options, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return FindAllRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFindAllRequest();
    message.tables = object.tables?.map((e) => e) || [];
    message.namespace = object.namespace !== void 0 && object.namespace !== null ? Namespace.fromPartial(object.namespace) : void 0;
    message.options = object.options !== void 0 && object.options !== null ? FindRequestOptions.fromPartial(object.options) : void 0;
    return message;
  }
};
function createBaseJoinRequest() {
  return { on: void 0, children: [], namespace: void 0 };
}
var JoinRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.on !== void 0) {
      FieldPair.encode(message.on, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.children) {
      FindRequest.encode(v, writer.uint32(18).fork()).ldelim();
    }
    if (message.namespace !== void 0) {
      Namespace.encode(message.namespace, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return JoinRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseJoinRequest();
    message.on = object.on !== void 0 && object.on !== null ? FieldPair.fromPartial(object.on) : void 0;
    message.children = object.children?.map((e) => FindRequest.fromPartial(e)) || [];
    message.namespace = object.namespace !== void 0 && object.namespace !== null ? Namespace.fromPartial(object.namespace) : void 0;
    return message;
  }
};
function createBaseDeleteRequest() {
  return { from: "", filter: [] };
}
var DeleteRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    for (const v of message.filter) {
      Filter.encode(v, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return DeleteRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDeleteRequest();
    message.from = object.from ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    return message;
  }
};
function createBaseUpdateRequest() {
  return { target: "", filter: [], row: {} };
}
var UpdateRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.target !== "") {
      writer.uint32(10).string(message.target);
    }
    for (const v of message.filter) {
      Filter.encode(v, writer.uint32(18).fork()).ldelim();
    }
    Object.entries(message.row).forEach(([key, value]) => {
      UpdateRequest_RowEntry.encode({ key, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
          if (entry3.value !== void 0) {
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
  create(base) {
    return UpdateRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseUpdateRequest();
    message.target = object.target ?? "";
    message.filter = object.filter?.map((e) => Filter.fromPartial(e)) || [];
    message.row = Object.entries(object.row ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseUpdateRequest_RowEntry() {
  return { key: "", value: "" };
}
var UpdateRequest_RowEntry = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return UpdateRequest_RowEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseUpdateRequest_RowEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseInsertRequest() {
  return { into: "", row: {} };
}
var InsertRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.into !== "") {
      writer.uint32(10).string(message.into);
    }
    Object.entries(message.row).forEach(([key, value]) => {
      InsertRequest_RowEntry.encode({ key, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
          if (entry3.value !== void 0) {
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
  create(base) {
    return InsertRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseInsertRequest();
    message.into = object.into ?? "";
    message.row = Object.entries(object.row ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseInsertRequest_RowEntry() {
  return { key: "", value: "" };
}
var InsertRequest_RowEntry = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return InsertRequest_RowEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseInsertRequest_RowEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseCreateRequest() {
  return { name: "" };
}
var CreateRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return CreateRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCreateRequest();
    message.name = object.name ?? "";
    return message;
  }
};
function createBaseFindRequestOptions() {
  return { compressed: false, group: false, negate: false };
}
var FindRequestOptions = {
  encode(message, writer = _m0.Writer.create()) {
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
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return FindRequestOptions.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFindRequestOptions();
    message.compressed = object.compressed ?? false;
    message.group = object.group ?? false;
    message.negate = object.negate ?? false;
    return message;
  }
};
function createBaseField() {
  return { tableName: "", tableField: "" };
}
var Field = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.tableName !== "") {
      writer.uint32(10).string(message.tableName);
    }
    if (message.tableField !== "") {
      writer.uint32(18).string(message.tableField);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Field.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseField();
    message.tableName = object.tableName ?? "";
    message.tableField = object.tableField ?? "";
    return message;
  }
};
function createBaseFieldPair() {
  return { field1: void 0, field2: void 0 };
}
var FieldPair = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.field1 !== void 0) {
      Field.encode(message.field1, writer.uint32(10).fork()).ldelim();
    }
    if (message.field2 !== void 0) {
      Field.encode(message.field2, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return FieldPair.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldPair();
    message.field1 = object.field1 !== void 0 && object.field1 !== null ? Field.fromPartial(object.field1) : void 0;
    message.field2 = object.field2 !== void 0 && object.field2 !== null ? Field.fromPartial(object.field2) : void 0;
    return message;
  }
};
function createBaseProjectedField() {
  return { field: void 0, rename: void 0 };
}
var ProjectedField = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.field !== void 0) {
      Field.encode(message.field, writer.uint32(10).fork()).ldelim();
    }
    if (message.rename !== void 0) {
      writer.uint32(18).string(message.rename);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return ProjectedField.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProjectedField();
    message.field = object.field !== void 0 && object.field !== null ? Field.fromPartial(object.field) : void 0;
    message.rename = object.rename ?? void 0;
    return message;
  }
};
function createBaseFilter() {
  return { field: void 0, operator: "", value: "", function: "" };
}
var Filter = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.field !== void 0) {
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
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Filter.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFilter();
    message.field = object.field !== void 0 && object.field !== null ? Field.fromPartial(object.field) : void 0;
    message.operator = object.operator ?? "";
    message.value = object.value ?? "";
    message.function = object.function ?? "";
    return message;
  }
};
var QueryLayerDefinition = {
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
      options: {}
    },
    /** Stream state endpoint. */
    streamState: {
      name: "StreamState",
      requestType: StateRequest,
      requestStream: false,
      responseType: QueryLayerStateStreamResponse,
      responseStream: true,
      options: {}
    },
    /** Get state from single table endpoint. */
    single__GetState: {
      name: "Single__GetState",
      requestType: SingleStateRequest,
      requestStream: false,
      responseType: QueryLayerStateResponse,
      responseStream: false,
      options: {}
    },
    /** Stream state from single table endpoint. */
    single__StreamState: {
      name: "Single__StreamState",
      requestType: SingleStateRequest,
      requestStream: false,
      responseType: QueryLayerStateStreamResponse,
      responseStream: true,
      options: {}
    }
  }
};
export {
  CreateRequest,
  DeleteRequest,
  Field,
  FieldPair,
  Filter,
  FindAllRequest,
  FindRequest,
  FindRequestOptions,
  GenericTable,
  InsertRequest,
  InsertRequest_RowEntry,
  JoinRequest,
  Namespace,
  ProjectedField,
  QueryLayerDefinition,
  QueryLayerResponse,
  QueryLayerResponse_TablesEntry,
  QueryLayerStateResponse,
  QueryLayerStateResponse_ChainTablesEntry,
  QueryLayerStateResponse_WorldTablesEntry,
  QueryLayerStateStreamResponse,
  Row,
  SingleStateRequest,
  StateRequest,
  UpdateRequest,
  UpdateRequest_RowEntry,
  protobufPackage
};
//# sourceMappingURL=mode.js.map