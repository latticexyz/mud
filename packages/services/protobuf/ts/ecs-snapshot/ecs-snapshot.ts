/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "ecssnapshot";

export interface ECSState {
  componentIdIdx: number;
  entityIdIdx: number;
  value: Uint8Array;
}

export interface ECSStateSnapshot {
  state: ECSState[];
  stateComponents: string[];
  stateEntities: string[];
  stateHash: string;
  startBlockNumber: number;
  endBlockNumber: number;
  worldAddress: string;
}

export interface Worlds {
  worldAddress: string[];
}

/** The request message for the latest ECS state. */
export interface ECSStateRequestLatest {
  worldAddress: string;
}

/** The request message for the latest ECS statem, pruned for specific address. */
export interface ECSStateRequestLatestStreamPruned {
  worldAddress: string;
  pruneAddress: string;
  pruneComponentId?: string | undefined;
  chunkPercentage?: number | undefined;
}

/** The request message for the latest chunked ECS state. */
export interface ECSStateRequestLatestStream {
  worldAddress: string;
  chunkPercentage?: number | undefined;
}

/** The request message for the latest block based on latest ECS state. */
export interface ECSStateBlockRequestLatest {
  worldAddress: string;
}

/** The request message for the ECS state given a block number. */
export interface ECSStateRequestAtBlock {
  blockNumber: number;
}

/** The request message for all worlds. */
export interface WorldsRequest {}

/** The response message containing the current state, hash of that state, and the block number of that state. */
export interface ECSStateReply {
  state: ECSState[];
  stateComponents: string[];
  stateEntities: string[];
  stateHash: string;
  blockNumber: number;
}

export interface ECSStateReplyV2 {
  state: ECSState[];
  stateComponents: string[];
  stateEntities: Uint8Array[];
  stateHash: string;
  blockNumber: number;
}

export interface ECSStateBlockReply {
  blockNumber: number;
}

function createBaseECSState(): ECSState {
  return { componentIdIdx: 0, entityIdIdx: 0, value: new Uint8Array() };
}

export const ECSState = {
  encode(message: ECSState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSState>): ECSState {
    return ECSState.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSState>): ECSState {
    const message = createBaseECSState();
    message.componentIdIdx = object.componentIdIdx ?? 0;
    message.entityIdIdx = object.entityIdIdx ?? 0;
    message.value = object.value ?? new Uint8Array();
    return message;
  },
};

function createBaseECSStateSnapshot(): ECSStateSnapshot {
  return {
    state: [],
    stateComponents: [],
    stateEntities: [],
    stateHash: "",
    startBlockNumber: 0,
    endBlockNumber: 0,
    worldAddress: "",
  };
}

export const ECSStateSnapshot = {
  encode(message: ECSStateSnapshot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.state) {
      ECSState.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.stateComponents) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.stateEntities) {
      writer.uint32(26).string(v!);
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

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateSnapshot {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateSnapshot>): ECSStateSnapshot {
    return ECSStateSnapshot.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateSnapshot>): ECSStateSnapshot {
    const message = createBaseECSStateSnapshot();
    message.state = object.state?.map((e) => ECSState.fromPartial(e)) || [];
    message.stateComponents = object.stateComponents?.map((e) => e) || [];
    message.stateEntities = object.stateEntities?.map((e) => e) || [];
    message.stateHash = object.stateHash ?? "";
    message.startBlockNumber = object.startBlockNumber ?? 0;
    message.endBlockNumber = object.endBlockNumber ?? 0;
    message.worldAddress = object.worldAddress ?? "";
    return message;
  },
};

function createBaseWorlds(): Worlds {
  return { worldAddress: [] };
}

export const Worlds = {
  encode(message: Worlds, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.worldAddress) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Worlds {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<Worlds>): Worlds {
    return Worlds.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Worlds>): Worlds {
    const message = createBaseWorlds();
    message.worldAddress = object.worldAddress?.map((e) => e) || [];
    return message;
  },
};

function createBaseECSStateRequestLatest(): ECSStateRequestLatest {
  return { worldAddress: "" };
}

export const ECSStateRequestLatest = {
  encode(message: ECSStateRequestLatest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateRequestLatest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateRequestLatest>): ECSStateRequestLatest {
    return ECSStateRequestLatest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateRequestLatest>): ECSStateRequestLatest {
    const message = createBaseECSStateRequestLatest();
    message.worldAddress = object.worldAddress ?? "";
    return message;
  },
};

function createBaseECSStateRequestLatestStreamPruned(): ECSStateRequestLatestStreamPruned {
  return { worldAddress: "", pruneAddress: "", pruneComponentId: undefined, chunkPercentage: undefined };
}

export const ECSStateRequestLatestStreamPruned = {
  encode(message: ECSStateRequestLatestStreamPruned, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    if (message.pruneAddress !== "") {
      writer.uint32(18).string(message.pruneAddress);
    }
    if (message.pruneComponentId !== undefined) {
      writer.uint32(26).string(message.pruneComponentId);
    }
    if (message.chunkPercentage !== undefined) {
      writer.uint32(32).uint32(message.chunkPercentage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateRequestLatestStreamPruned {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateRequestLatestStreamPruned>): ECSStateRequestLatestStreamPruned {
    return ECSStateRequestLatestStreamPruned.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateRequestLatestStreamPruned>): ECSStateRequestLatestStreamPruned {
    const message = createBaseECSStateRequestLatestStreamPruned();
    message.worldAddress = object.worldAddress ?? "";
    message.pruneAddress = object.pruneAddress ?? "";
    message.pruneComponentId = object.pruneComponentId ?? undefined;
    message.chunkPercentage = object.chunkPercentage ?? undefined;
    return message;
  },
};

function createBaseECSStateRequestLatestStream(): ECSStateRequestLatestStream {
  return { worldAddress: "", chunkPercentage: undefined };
}

export const ECSStateRequestLatestStream = {
  encode(message: ECSStateRequestLatestStream, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    if (message.chunkPercentage !== undefined) {
      writer.uint32(16).uint32(message.chunkPercentage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateRequestLatestStream {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateRequestLatestStream>): ECSStateRequestLatestStream {
    return ECSStateRequestLatestStream.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateRequestLatestStream>): ECSStateRequestLatestStream {
    const message = createBaseECSStateRequestLatestStream();
    message.worldAddress = object.worldAddress ?? "";
    message.chunkPercentage = object.chunkPercentage ?? undefined;
    return message;
  },
};

function createBaseECSStateBlockRequestLatest(): ECSStateBlockRequestLatest {
  return { worldAddress: "" };
}

export const ECSStateBlockRequestLatest = {
  encode(message: ECSStateBlockRequestLatest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateBlockRequestLatest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateBlockRequestLatest>): ECSStateBlockRequestLatest {
    return ECSStateBlockRequestLatest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateBlockRequestLatest>): ECSStateBlockRequestLatest {
    const message = createBaseECSStateBlockRequestLatest();
    message.worldAddress = object.worldAddress ?? "";
    return message;
  },
};

function createBaseECSStateRequestAtBlock(): ECSStateRequestAtBlock {
  return { blockNumber: 0 };
}

export const ECSStateRequestAtBlock = {
  encode(message: ECSStateRequestAtBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.blockNumber !== 0) {
      writer.uint32(8).uint64(message.blockNumber);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateRequestAtBlock {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseECSStateRequestAtBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.blockNumber = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ECSStateRequestAtBlock>): ECSStateRequestAtBlock {
    return ECSStateRequestAtBlock.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateRequestAtBlock>): ECSStateRequestAtBlock {
    const message = createBaseECSStateRequestAtBlock();
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  },
};

function createBaseWorldsRequest(): WorldsRequest {
  return {};
}

export const WorldsRequest = {
  encode(_: WorldsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorldsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<WorldsRequest>): WorldsRequest {
    return WorldsRequest.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<WorldsRequest>): WorldsRequest {
    const message = createBaseWorldsRequest();
    return message;
  },
};

function createBaseECSStateReply(): ECSStateReply {
  return { state: [], stateComponents: [], stateEntities: [], stateHash: "", blockNumber: 0 };
}

export const ECSStateReply = {
  encode(message: ECSStateReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.state) {
      ECSState.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.stateComponents) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.stateEntities) {
      writer.uint32(26).string(v!);
    }
    if (message.stateHash !== "") {
      writer.uint32(34).string(message.stateHash);
    }
    if (message.blockNumber !== 0) {
      writer.uint32(40).uint32(message.blockNumber);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateReply>): ECSStateReply {
    return ECSStateReply.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateReply>): ECSStateReply {
    const message = createBaseECSStateReply();
    message.state = object.state?.map((e) => ECSState.fromPartial(e)) || [];
    message.stateComponents = object.stateComponents?.map((e) => e) || [];
    message.stateEntities = object.stateEntities?.map((e) => e) || [];
    message.stateHash = object.stateHash ?? "";
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  },
};

function createBaseECSStateReplyV2(): ECSStateReplyV2 {
  return { state: [], stateComponents: [], stateEntities: [], stateHash: "", blockNumber: 0 };
}

export const ECSStateReplyV2 = {
  encode(message: ECSStateReplyV2, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.state) {
      ECSState.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.stateComponents) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.stateEntities) {
      writer.uint32(26).bytes(v!);
    }
    if (message.stateHash !== "") {
      writer.uint32(34).string(message.stateHash);
    }
    if (message.blockNumber !== 0) {
      writer.uint32(40).uint32(message.blockNumber);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateReplyV2 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateReplyV2>): ECSStateReplyV2 {
    return ECSStateReplyV2.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateReplyV2>): ECSStateReplyV2 {
    const message = createBaseECSStateReplyV2();
    message.state = object.state?.map((e) => ECSState.fromPartial(e)) || [];
    message.stateComponents = object.stateComponents?.map((e) => e) || [];
    message.stateEntities = object.stateEntities?.map((e) => e) || [];
    message.stateHash = object.stateHash ?? "";
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  },
};

function createBaseECSStateBlockReply(): ECSStateBlockReply {
  return { blockNumber: 0 };
}

export const ECSStateBlockReply = {
  encode(message: ECSStateBlockReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.blockNumber !== 0) {
      writer.uint32(8).uint32(message.blockNumber);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStateBlockReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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

  create(base?: DeepPartial<ECSStateBlockReply>): ECSStateBlockReply {
    return ECSStateBlockReply.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStateBlockReply>): ECSStateBlockReply {
    const message = createBaseECSStateBlockReply();
    message.blockNumber = object.blockNumber ?? 0;
    return message;
  },
};

/** The Snapshot Service definition. */
export type ECSStateSnapshotServiceDefinition = typeof ECSStateSnapshotServiceDefinition;
export const ECSStateSnapshotServiceDefinition = {
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
      options: {},
    },
    /** Requests the latest ECS state in stream format, which will chunk the state. */
    getStateLatestStream: {
      name: "GetStateLatestStream",
      requestType: ECSStateRequestLatestStream,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: true,
      options: {},
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
      options: {},
    },
    /** Requests the latest ECS state, with aditional pruning. */
    getStateLatestStreamPruned: {
      name: "GetStateLatestStreamPruned",
      requestType: ECSStateRequestLatestStreamPruned,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: true,
      options: {},
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
      options: {},
    },
    /** Requests the latest block number based on the latest ECS state. */
    getStateBlockLatest: {
      name: "GetStateBlockLatest",
      requestType: ECSStateBlockRequestLatest,
      requestStream: false,
      responseType: ECSStateBlockReply,
      responseStream: false,
      options: {},
    },
    /** Requests the ECS state at specific block. */
    getStateAtBlock: {
      name: "GetStateAtBlock",
      requestType: ECSStateRequestAtBlock,
      requestStream: false,
      responseType: ECSStateReply,
      responseStream: false,
      options: {},
    },
    /** Requests a list of known worlds based on chain state. */
    getWorlds: {
      name: "GetWorlds",
      requestType: WorldsRequest,
      requestStream: false,
      responseType: Worlds,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface ECSStateSnapshotServiceImplementation<CallContextExt = {}> {
  /** Requests the latest ECS state. */
  getStateLatest(
    request: ECSStateRequestLatest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ECSStateReply>>;
  /** Requests the latest ECS state in stream format, which will chunk the state. */
  getStateLatestStream(
    request: ECSStateRequestLatestStream,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ECSStateReply>>;
  /**
   * Requests the latest ECS state in stream format, which will chunk the state.
   *
   * V2 version optimized to return entities as raw bytes.
   */
  getStateLatestStreamV2(
    request: ECSStateRequestLatestStream,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ECSStateReplyV2>>;
  /** Requests the latest ECS state, with aditional pruning. */
  getStateLatestStreamPruned(
    request: ECSStateRequestLatestStreamPruned,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ECSStateReply>>;
  /**
   * Requests the latest ECS state, with aditional pruning.
   *
   * V2 version optimized to return entities as raw bytes.
   */
  getStateLatestStreamPrunedV2(
    request: ECSStateRequestLatestStreamPruned,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ECSStateReplyV2>>;
  /** Requests the latest block number based on the latest ECS state. */
  getStateBlockLatest(
    request: ECSStateBlockRequestLatest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ECSStateBlockReply>>;
  /** Requests the ECS state at specific block. */
  getStateAtBlock(
    request: ECSStateRequestAtBlock,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ECSStateReply>>;
  /** Requests a list of known worlds based on chain state. */
  getWorlds(request: WorldsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Worlds>>;
}

export interface ECSStateSnapshotServiceClient<CallOptionsExt = {}> {
  /** Requests the latest ECS state. */
  getStateLatest(
    request: DeepPartial<ECSStateRequestLatest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ECSStateReply>;
  /** Requests the latest ECS state in stream format, which will chunk the state. */
  getStateLatestStream(
    request: DeepPartial<ECSStateRequestLatestStream>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ECSStateReply>;
  /**
   * Requests the latest ECS state in stream format, which will chunk the state.
   *
   * V2 version optimized to return entities as raw bytes.
   */
  getStateLatestStreamV2(
    request: DeepPartial<ECSStateRequestLatestStream>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ECSStateReplyV2>;
  /** Requests the latest ECS state, with aditional pruning. */
  getStateLatestStreamPruned(
    request: DeepPartial<ECSStateRequestLatestStreamPruned>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ECSStateReply>;
  /**
   * Requests the latest ECS state, with aditional pruning.
   *
   * V2 version optimized to return entities as raw bytes.
   */
  getStateLatestStreamPrunedV2(
    request: DeepPartial<ECSStateRequestLatestStreamPruned>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ECSStateReplyV2>;
  /** Requests the latest block number based on the latest ECS state. */
  getStateBlockLatest(
    request: DeepPartial<ECSStateBlockRequestLatest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ECSStateBlockReply>;
  /** Requests the ECS state at specific block. */
  getStateAtBlock(
    request: DeepPartial<ECSStateRequestAtBlock>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ECSStateReply>;
  /** Requests a list of known worlds based on chain state. */
  getWorlds(request: DeepPartial<WorldsRequest>, options?: CallOptions & CallOptionsExt): Promise<Worlds>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
