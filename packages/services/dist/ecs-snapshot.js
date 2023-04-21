// protobuf/ts/ecs-snapshot/ecs-snapshot.ts
import Long from "long";
import _m0 from "protobufjs/minimal";
var protobufPackage = "ecssnapshot";
function createBaseECSState() {
  return { componentIdIdx: 0, entityIdIdx: 0, value: new Uint8Array() };
}
var ECSState = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.componentIdIdx !== 0) {
      writer.uint32(8).uint32(message.componentIdIdx);
    }
    if (message.entityIdIdx !== 0) {
      writer.uint32(16).uint32(message.entityIdIdx);
    }
    if (message.value.length !== 0) {
      writer.uint32(26).bytes(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }
          message.componentIdIdx = reader.uint32();
          continue;
        case 2:
          if (tag != 16) {
            break;
          }
          message.entityIdIdx = reader.uint32();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }
          message.value = reader.bytes();
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
    return ECSState.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSState();
    message.componentIdIdx = object.componentIdIdx ?? 0;
    message.entityIdIdx = object.entityIdIdx ?? 0;
    message.value = object.value ?? new Uint8Array();
    return message;
  }
};
function createBaseECSStateSnapshot() {
  return {
    state: [],
    stateComponents: [],
    stateEntities: [],
    stateHash: "",
    startBlockNumber: 0,
    endBlockNumber: 0,
    worldAddress: ""
  };
}
var ECSStateSnapshot = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.state) {
      ECSState.encode(v, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.stateComponents) {
      writer.uint32(18).string(v);
    }
    for (const v of message.stateEntities) {
      writer.uint32(26).string(v);
    }
    if (message.stateHash !== "") {
      writer.uint32(34).string(message.stateHash);
    }
    if (message.startBlockNumber !== 0) {
      writer.uint32(40).uint32(message.startBlockNumber);
    }
    if (message.endBlockNumber !== 0) {
      writer.uint32(48).uint32(message.endBlockNumber);
    }
    if (message.worldAddress !== "") {
      writer.uint32(58).string(message.worldAddress);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateSnapshot();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.state.push(ECSState.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.stateComponents.push(reader.string());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }
          message.stateEntities.push(reader.string());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }
          message.stateHash = reader.string();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }
          message.startBlockNumber = reader.uint32();
          continue;
        case 6:
          if (tag != 48) {
            break;
          }
          message.endBlockNumber = reader.uint32();
          continue;
        case 7:
          if (tag != 58) {
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
    return ECSStateSnapshot.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateSnapshot();
    message.state = object.state?.map((e) => ECSState.fromPartial(e)) || [];
    message.stateComponents = object.stateComponents?.map((e) => e) || [];
    message.stateEntities = object.stateEntities?.map((e) => e) || [];
    message.stateHash = object.stateHash ?? "";
    message.startBlockNumber = object.startBlockNumber ?? 0;
    message.endBlockNumber = object.endBlockNumber ?? 0;
    message.worldAddress = object.worldAddress ?? "";
    return message;
  }
};
function createBaseWorlds() {
  return { worldAddress: [] };
}
var Worlds = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.worldAddress) {
      writer.uint32(10).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWorlds();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.worldAddress.push(reader.string());
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
    return Worlds.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWorlds();
    message.worldAddress = object.worldAddress?.map((e) => e) || [];
    return message;
  }
};
function createBaseECSStateRequestLatest() {
  return { worldAddress: "" };
}
var ECSStateRequestLatest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateRequestLatest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
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
    return ECSStateRequestLatest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateRequestLatest();
    message.worldAddress = object.worldAddress ?? "";
    return message;
  }
};
function createBaseECSStateRequestLatestStreamPruned() {
  return { worldAddress: "", pruneAddress: "", pruneComponentId: void 0, chunkPercentage: void 0 };
}
var ECSStateRequestLatestStreamPruned = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    if (message.pruneAddress !== "") {
      writer.uint32(18).string(message.pruneAddress);
    }
    if (message.pruneComponentId !== void 0) {
      writer.uint32(26).string(message.pruneComponentId);
    }
    if (message.chunkPercentage !== void 0) {
      writer.uint32(32).uint32(message.chunkPercentage);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateRequestLatestStreamPruned();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.worldAddress = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.pruneAddress = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }
          message.pruneComponentId = reader.string();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }
          message.chunkPercentage = reader.uint32();
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
    return ECSStateRequestLatestStreamPruned.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateRequestLatestStreamPruned();
    message.worldAddress = object.worldAddress ?? "";
    message.pruneAddress = object.pruneAddress ?? "";
    message.pruneComponentId = object.pruneComponentId ?? void 0;
    message.chunkPercentage = object.chunkPercentage ?? void 0;
    return message;
  }
};
function createBaseECSStateRequestLatestStream() {
  return { worldAddress: "", chunkPercentage: void 0 };
}
var ECSStateRequestLatestStream = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    if (message.chunkPercentage !== void 0) {
      writer.uint32(16).uint32(message.chunkPercentage);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateRequestLatestStream();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.worldAddress = reader.string();
          continue;
        case 2:
          if (tag != 16) {
            break;
          }
          message.chunkPercentage = reader.uint32();
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
    return ECSStateRequestLatestStream.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateRequestLatestStream();
    message.worldAddress = object.worldAddress ?? "";
    message.chunkPercentage = object.chunkPercentage ?? void 0;
    return message;
  }
};
function createBaseECSStateBlockRequestLatest() {
  return { worldAddress: "" };
}
var ECSStateBlockRequestLatest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateBlockRequestLatest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
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
    return ECSStateBlockRequestLatest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateBlockRequestLatest();
    message.worldAddress = object.worldAddress ?? "";
    return message;
  }
};
function createBaseECSStateRequestAtBlock() {
  return { blockNumber: 0 };
}
var ECSStateRequestAtBlock = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.blockNumber !== 0) {
      writer.uint32(8).uint64(message.blockNumber);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateRequestAtBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }
          message.blockNumber = longToNumber(reader.uint64());
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
    return ECSStateRequestAtBlock.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateRequestAtBlock();
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  }
};
function createBaseWorldsRequest() {
  return {};
}
var WorldsRequest = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWorldsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  create(base) {
    return WorldsRequest.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseWorldsRequest();
    return message;
  }
};
function createBaseECSStateReply() {
  return { state: [], stateComponents: [], stateEntities: [], stateHash: "", blockNumber: 0 };
}
var ECSStateReply = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.state) {
      ECSState.encode(v, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.stateComponents) {
      writer.uint32(18).string(v);
    }
    for (const v of message.stateEntities) {
      writer.uint32(26).string(v);
    }
    if (message.stateHash !== "") {
      writer.uint32(34).string(message.stateHash);
    }
    if (message.blockNumber !== 0) {
      writer.uint32(40).uint32(message.blockNumber);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.state.push(ECSState.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.stateComponents.push(reader.string());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }
          message.stateEntities.push(reader.string());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }
          message.stateHash = reader.string();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }
          message.blockNumber = reader.uint32();
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
    return ECSStateReply.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateReply();
    message.state = object.state?.map((e) => ECSState.fromPartial(e)) || [];
    message.stateComponents = object.stateComponents?.map((e) => e) || [];
    message.stateEntities = object.stateEntities?.map((e) => e) || [];
    message.stateHash = object.stateHash ?? "";
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  }
};
function createBaseECSStateReplyV2() {
  return { state: [], stateComponents: [], stateEntities: [], stateHash: "", blockNumber: 0 };
}
var ECSStateReplyV2 = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.state) {
      ECSState.encode(v, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.stateComponents) {
      writer.uint32(18).string(v);
    }
    for (const v of message.stateEntities) {
      writer.uint32(26).bytes(v);
    }
    if (message.stateHash !== "") {
      writer.uint32(34).string(message.stateHash);
    }
    if (message.blockNumber !== 0) {
      writer.uint32(40).uint32(message.blockNumber);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateReplyV2();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.state.push(ECSState.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.stateComponents.push(reader.string());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }
          message.stateEntities.push(reader.bytes());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }
          message.stateHash = reader.string();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }
          message.blockNumber = reader.uint32();
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
    return ECSStateReplyV2.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateReplyV2();
    message.state = object.state?.map((e) => ECSState.fromPartial(e)) || [];
    message.stateComponents = object.stateComponents?.map((e) => e) || [];
    message.stateEntities = object.stateEntities?.map((e) => e) || [];
    message.stateHash = object.stateHash ?? "";
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  }
};
function createBaseECSStateBlockReply() {
  return { blockNumber: 0 };
}
var ECSStateBlockReply = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.blockNumber !== 0) {
      writer.uint32(8).uint32(message.blockNumber);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseECSStateBlockReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }
          message.blockNumber = reader.uint32();
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
    return ECSStateBlockReply.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseECSStateBlockReply();
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  }
};
var ECSStateSnapshotServiceDefinition = {
  name: "ECSStateSnapshotService",
  fullName: "ecssnapshot.ECSStateSnapshotService",
  methods: {
    /** Requests the latest ECS state. */
    getStateLatest: {
      name: "GetStateLatest",
      requestType: ECSStateRequestLatest,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: false,
      options: {}
    },
    /** Requests the latest ECS state in stream format, which will chunk the state. */
    getStateLatestStream: {
      name: "GetStateLatestStream",
      requestType: ECSStateRequestLatestStream,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: true,
      options: {}
    },
    /**
     * Requests the latest ECS state in stream format, which will chunk the state.
     *
     * V2 version optimized to return entities as raw bytes.
     */
    getStateLatestStreamV2: {
      name: "GetStateLatestStreamV2",
      requestType: ECSStateRequestLatestStream,
      requestStream: false,
      responseType: ECSStateReplyV2,
      responseStream: true,
      options: {}
    },
    /** Requests the latest ECS state, with aditional pruning. */
    getStateLatestStreamPruned: {
      name: "GetStateLatestStreamPruned",
      requestType: ECSStateRequestLatestStreamPruned,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: true,
      options: {}
    },
    /**
     * Requests the latest ECS state, with aditional pruning.
     *
     * V2 version optimized to return entities as raw bytes.
     */
    getStateLatestStreamPrunedV2: {
      name: "GetStateLatestStreamPrunedV2",
      requestType: ECSStateRequestLatestStreamPruned,
      requestStream: false,
      responseType: ECSStateReplyV2,
      responseStream: true,
      options: {}
    },
    /** Requests the latest block number based on the latest ECS state. */
    getStateBlockLatest: {
      name: "GetStateBlockLatest",
      requestType: ECSStateBlockRequestLatest,
      requestStream: false,
      responseType: ECSStateBlockReply,
      responseStream: false,
      options: {}
    },
    /** Requests the ECS state at specific block. */
    getStateAtBlock: {
      name: "GetStateAtBlock",
      requestType: ECSStateRequestAtBlock,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: false,
      options: {}
    },
    /** Requests a list of known worlds based on chain state. */
    getWorlds: {
      name: "GetWorlds",
      requestType: WorldsRequest,
      requestStream: false,
      responseType: Worlds,
      responseStream: false,
      options: {}
    }
  }
};
var tsProtoGlobalThis = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();
function longToNumber(long) {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}
if (_m0.util.Long !== Long) {
  _m0.util.Long = Long;
  _m0.configure();
}
export {
  ECSState,
  ECSStateBlockReply,
  ECSStateBlockRequestLatest,
  ECSStateReply,
  ECSStateReplyV2,
  ECSStateRequestAtBlock,
  ECSStateRequestLatest,
  ECSStateRequestLatestStream,
  ECSStateRequestLatestStreamPruned,
  ECSStateSnapshot,
  ECSStateSnapshotServiceDefinition,
  Worlds,
  WorldsRequest,
  protobufPackage
};
//# sourceMappingURL=ecs-snapshot.js.map