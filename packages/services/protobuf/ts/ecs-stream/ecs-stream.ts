/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "ecsstream";

export interface TxMetadata {
  to: string;
  data: Uint8Array;
  value: number;
}

export interface ECSEvent {
  eventType: string;
  componentId: string;
  entityId: string;
  value: Uint8Array;
  txHash: string;
  txMetadata: TxMetadata | undefined;
}

/**
 * Request to subscribe to an ECSStream. The required parameter is 'worldAddress', while others
 * are opt-in based on which data the client is interested in receiving.
 */
export interface ECSStreamBlockBundleRequest {
  worldAddress: string;
  blockNumber: boolean;
  blockHash: boolean;
  blockTimestamp: boolean;
  transactionsConfirmed: boolean;
  ecsEvents: boolean;
  ecsEventsIncludeTxMetadata: boolean;
}

/**
 * ECSStream response. The fields are populated based on the request which must have been sent when
 * starting the subscription.
 */
export interface ECSStreamBlockBundleReply {
  blockNumber: number;
  blockHash: string;
  blockTimestamp: number;
  transactionsConfirmed: string[];
  ecsEvents: ECSEvent[];
}

function createBaseTxMetadata(): TxMetadata {
  return { to: "", data: new Uint8Array(), value: 0 };
}

export const TxMetadata = {
  encode(message: TxMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.to !== "") {
      writer.uint32(18).string(message.to);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    if (message.value !== 0) {
      writer.uint32(32).uint64(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TxMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTxMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag != 18) {
            break;
          }

          message.to = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.data = reader.bytes();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.value = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<TxMetadata>): TxMetadata {
    return TxMetadata.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<TxMetadata>): TxMetadata {
    const message = createBaseTxMetadata();
    message.to = object.to ?? "";
    message.data = object.data ?? new Uint8Array();
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseECSEvent(): ECSEvent {
  return { eventType: "", componentId: "", entityId: "", value: new Uint8Array(), txHash: "", txMetadata: undefined };
}

export const ECSEvent = {
  encode(message: ECSEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventType !== "") {
      writer.uint32(10).string(message.eventType);
    }
    if (message.componentId !== "") {
      writer.uint32(18).string(message.componentId);
    }
    if (message.entityId !== "") {
      writer.uint32(26).string(message.entityId);
    }
    if (message.value.length !== 0) {
      writer.uint32(34).bytes(message.value);
    }
    if (message.txHash !== "") {
      writer.uint32(42).string(message.txHash);
    }
    if (message.txMetadata !== undefined) {
      TxMetadata.encode(message.txMetadata, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseECSEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.eventType = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.componentId = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.entityId = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.value = reader.bytes();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.txHash = reader.string();
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.txMetadata = TxMetadata.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ECSEvent>): ECSEvent {
    return ECSEvent.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSEvent>): ECSEvent {
    const message = createBaseECSEvent();
    message.eventType = object.eventType ?? "";
    message.componentId = object.componentId ?? "";
    message.entityId = object.entityId ?? "";
    message.value = object.value ?? new Uint8Array();
    message.txHash = object.txHash ?? "";
    message.txMetadata =
      object.txMetadata !== undefined && object.txMetadata !== null
        ? TxMetadata.fromPartial(object.txMetadata)
        : undefined;
    return message;
  },
};

function createBaseECSStreamBlockBundleRequest(): ECSStreamBlockBundleRequest {
  return {
    worldAddress: "",
    blockNumber: false,
    blockHash: false,
    blockTimestamp: false,
    transactionsConfirmed: false,
    ecsEvents: false,
    ecsEventsIncludeTxMetadata: false,
  };
}

export const ECSStreamBlockBundleRequest = {
  encode(message: ECSStreamBlockBundleRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.worldAddress !== "") {
      writer.uint32(10).string(message.worldAddress);
    }
    if (message.blockNumber === true) {
      writer.uint32(16).bool(message.blockNumber);
    }
    if (message.blockHash === true) {
      writer.uint32(24).bool(message.blockHash);
    }
    if (message.blockTimestamp === true) {
      writer.uint32(32).bool(message.blockTimestamp);
    }
    if (message.transactionsConfirmed === true) {
      writer.uint32(40).bool(message.transactionsConfirmed);
    }
    if (message.ecsEvents === true) {
      writer.uint32(48).bool(message.ecsEvents);
    }
    if (message.ecsEventsIncludeTxMetadata === true) {
      writer.uint32(56).bool(message.ecsEventsIncludeTxMetadata);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStreamBlockBundleRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseECSStreamBlockBundleRequest();
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

          message.blockNumber = reader.bool();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.blockHash = reader.bool();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.blockTimestamp = reader.bool();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.transactionsConfirmed = reader.bool();
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.ecsEvents = reader.bool();
          continue;
        case 7:
          if (tag != 56) {
            break;
          }

          message.ecsEventsIncludeTxMetadata = reader.bool();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ECSStreamBlockBundleRequest>): ECSStreamBlockBundleRequest {
    return ECSStreamBlockBundleRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStreamBlockBundleRequest>): ECSStreamBlockBundleRequest {
    const message = createBaseECSStreamBlockBundleRequest();
    message.worldAddress = object.worldAddress ?? "";
    message.blockNumber = object.blockNumber ?? false;
    message.blockHash = object.blockHash ?? false;
    message.blockTimestamp = object.blockTimestamp ?? false;
    message.transactionsConfirmed = object.transactionsConfirmed ?? false;
    message.ecsEvents = object.ecsEvents ?? false;
    message.ecsEventsIncludeTxMetadata = object.ecsEventsIncludeTxMetadata ?? false;
    return message;
  },
};

function createBaseECSStreamBlockBundleReply(): ECSStreamBlockBundleReply {
  return { blockNumber: 0, blockHash: "", blockTimestamp: 0, transactionsConfirmed: [], ecsEvents: [] };
}

export const ECSStreamBlockBundleReply = {
  encode(message: ECSStreamBlockBundleReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.blockNumber !== 0) {
      writer.uint32(8).uint32(message.blockNumber);
    }
    if (message.blockHash !== "") {
      writer.uint32(18).string(message.blockHash);
    }
    if (message.blockTimestamp !== 0) {
      writer.uint32(24).uint32(message.blockTimestamp);
    }
    for (const v of message.transactionsConfirmed) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.ecsEvents) {
      ECSEvent.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ECSStreamBlockBundleReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseECSStreamBlockBundleReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.blockNumber = reader.uint32();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.blockHash = reader.string();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.blockTimestamp = reader.uint32();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.transactionsConfirmed.push(reader.string());
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.ecsEvents.push(ECSEvent.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ECSStreamBlockBundleReply>): ECSStreamBlockBundleReply {
    return ECSStreamBlockBundleReply.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ECSStreamBlockBundleReply>): ECSStreamBlockBundleReply {
    const message = createBaseECSStreamBlockBundleReply();
    message.blockNumber = object.blockNumber ?? 0;
    message.blockHash = object.blockHash ?? "";
    message.blockTimestamp = object.blockTimestamp ?? 0;
    message.transactionsConfirmed = object.transactionsConfirmed?.map((e) => e) || [];
    message.ecsEvents = object.ecsEvents?.map((e) => ECSEvent.fromPartial(e)) || [];
    return message;
  },
};

/** The Stream Service definition. */
export type ECSStreamServiceDefinition = typeof ECSStreamServiceDefinition;
export const ECSStreamServiceDefinition = {
  name: "ECSStreamService",
  fullName: "ecsstream.ECSStreamService",
  methods: {
    /** Opens a cursor to receive the latest ECS events and additional data specified via request. */
    subscribeToStreamLatest: {
      name: "SubscribeToStreamLatest",
      requestType: ECSStreamBlockBundleRequest,
      requestStream: false,
      responseType: ECSStreamBlockBundleReply,
      responseStream: true,
      options: {},
    },
  },
} as const;

export interface ECSStreamServiceImplementation<CallContextExt = {}> {
  /** Opens a cursor to receive the latest ECS events and additional data specified via request. */
  subscribeToStreamLatest(
    request: ECSStreamBlockBundleRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ECSStreamBlockBundleReply>>;
}

export interface ECSStreamServiceClient<CallOptionsExt = {}> {
  /** Opens a cursor to receive the latest ECS events and additional data specified via request. */
  subscribeToStreamLatest(
    request: DeepPartial<ECSStreamBlockBundleRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ECSStreamBlockBundleReply>;
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
