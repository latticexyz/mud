/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "ecsrelay";

/** Identifies a client connecting to Relay Service. */
export interface Identity {
  name: string;
}

/** Signature that a client must provide to prove ownership of identity. */
export interface Signature {
  signature: string;
}

export interface Message {
  version: number;
  id: string;
  data: Uint8Array;
  timestamp: number;
  signature: string;
}

export interface SubscriptionRequest {
  signature: Signature | undefined;
  subscription: Subscription | undefined;
}

export interface Subscription {
  label: string;
}

export interface PushRequest {
  label: string;
  message: Message | undefined;
}

export interface PushManyRequest {
  signature: Signature | undefined;
  label: string;
  messages: Message[];
}

export interface PushResponse {}

export interface CountIdentitiesRequest {}

export interface CountIdentitiesResponse {
  count: number;
}

export interface BalanceRequest {}

export interface BalanceResponse {
  wei: number;
  ether: number;
}

function createBaseIdentity(): Identity {
  return { name: "" };
}

export const Identity = {
  encode(message: Identity, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Identity {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIdentity();
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

  create(base?: DeepPartial<Identity>): Identity {
    return Identity.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Identity>): Identity {
    const message = createBaseIdentity();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseSignature(): Signature {
  return { signature: "" };
}

export const Signature = {
  encode(message: Signature, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.signature !== "") {
      writer.uint32(10).string(message.signature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Signature {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignature();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.signature = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Signature>): Signature {
    return Signature.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Signature>): Signature {
    const message = createBaseSignature();
    message.signature = object.signature ?? "";
    return message;
  },
};

function createBaseMessage(): Message {
  return { version: 0, id: "", data: new Uint8Array(), timestamp: 0, signature: "" };
}

export const Message = {
  encode(message: Message, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== 0) {
      writer.uint32(8).uint32(message.version);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    if (message.timestamp !== 0) {
      writer.uint32(32).int64(message.timestamp);
    }
    if (message.signature !== "") {
      writer.uint32(42).string(message.signature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Message {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.version = reader.uint32();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.id = reader.string();
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

          message.timestamp = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.signature = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Message>): Message {
    return Message.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Message>): Message {
    const message = createBaseMessage();
    message.version = object.version ?? 0;
    message.id = object.id ?? "";
    message.data = object.data ?? new Uint8Array();
    message.timestamp = object.timestamp ?? 0;
    message.signature = object.signature ?? "";
    return message;
  },
};

function createBaseSubscriptionRequest(): SubscriptionRequest {
  return { signature: undefined, subscription: undefined };
}

export const SubscriptionRequest = {
  encode(message: SubscriptionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.signature !== undefined) {
      Signature.encode(message.signature, writer.uint32(10).fork()).ldelim();
    }
    if (message.subscription !== undefined) {
      Subscription.encode(message.subscription, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SubscriptionRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscriptionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.signature = Signature.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.subscription = Subscription.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SubscriptionRequest>): SubscriptionRequest {
    return SubscriptionRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<SubscriptionRequest>): SubscriptionRequest {
    const message = createBaseSubscriptionRequest();
    message.signature =
      object.signature !== undefined && object.signature !== null ? Signature.fromPartial(object.signature) : undefined;
    message.subscription =
      object.subscription !== undefined && object.subscription !== null
        ? Subscription.fromPartial(object.subscription)
        : undefined;
    return message;
  },
};

function createBaseSubscription(): Subscription {
  return { label: "" };
}

export const Subscription = {
  encode(message: Subscription, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Subscription {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscription();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.label = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Subscription>): Subscription {
    return Subscription.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Subscription>): Subscription {
    const message = createBaseSubscription();
    message.label = object.label ?? "";
    return message;
  },
};

function createBasePushRequest(): PushRequest {
  return { label: "", message: undefined };
}

export const PushRequest = {
  encode(message: PushRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.message !== undefined) {
      Message.encode(message.message, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PushRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePushRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.label = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.message = Message.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PushRequest>): PushRequest {
    return PushRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<PushRequest>): PushRequest {
    const message = createBasePushRequest();
    message.label = object.label ?? "";
    message.message =
      object.message !== undefined && object.message !== null ? Message.fromPartial(object.message) : undefined;
    return message;
  },
};

function createBasePushManyRequest(): PushManyRequest {
  return { signature: undefined, label: "", messages: [] };
}

export const PushManyRequest = {
  encode(message: PushManyRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.signature !== undefined) {
      Signature.encode(message.signature, writer.uint32(10).fork()).ldelim();
    }
    if (message.label !== "") {
      writer.uint32(18).string(message.label);
    }
    for (const v of message.messages) {
      Message.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PushManyRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePushManyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.signature = Signature.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.label = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.messages.push(Message.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PushManyRequest>): PushManyRequest {
    return PushManyRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<PushManyRequest>): PushManyRequest {
    const message = createBasePushManyRequest();
    message.signature =
      object.signature !== undefined && object.signature !== null ? Signature.fromPartial(object.signature) : undefined;
    message.label = object.label ?? "";
    message.messages = object.messages?.map((e) => Message.fromPartial(e)) || [];
    return message;
  },
};

function createBasePushResponse(): PushResponse {
  return {};
}

export const PushResponse = {
  encode(_: PushResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PushResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePushResponse();
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

  create(base?: DeepPartial<PushResponse>): PushResponse {
    return PushResponse.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<PushResponse>): PushResponse {
    const message = createBasePushResponse();
    return message;
  },
};

function createBaseCountIdentitiesRequest(): CountIdentitiesRequest {
  return {};
}

export const CountIdentitiesRequest = {
  encode(_: CountIdentitiesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CountIdentitiesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCountIdentitiesRequest();
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

  create(base?: DeepPartial<CountIdentitiesRequest>): CountIdentitiesRequest {
    return CountIdentitiesRequest.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<CountIdentitiesRequest>): CountIdentitiesRequest {
    const message = createBaseCountIdentitiesRequest();
    return message;
  },
};

function createBaseCountIdentitiesResponse(): CountIdentitiesResponse {
  return { count: 0 };
}

export const CountIdentitiesResponse = {
  encode(message: CountIdentitiesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.count !== 0) {
      writer.uint32(8).uint32(message.count);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CountIdentitiesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCountIdentitiesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.count = reader.uint32();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CountIdentitiesResponse>): CountIdentitiesResponse {
    return CountIdentitiesResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CountIdentitiesResponse>): CountIdentitiesResponse {
    const message = createBaseCountIdentitiesResponse();
    message.count = object.count ?? 0;
    return message;
  },
};

function createBaseBalanceRequest(): BalanceRequest {
  return {};
}

export const BalanceRequest = {
  encode(_: BalanceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BalanceRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBalanceRequest();
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

  create(base?: DeepPartial<BalanceRequest>): BalanceRequest {
    return BalanceRequest.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<BalanceRequest>): BalanceRequest {
    const message = createBaseBalanceRequest();
    return message;
  },
};

function createBaseBalanceResponse(): BalanceResponse {
  return { wei: 0, ether: 0 };
}

export const BalanceResponse = {
  encode(message: BalanceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.wei !== 0) {
      writer.uint32(8).uint64(message.wei);
    }
    if (message.ether !== 0) {
      writer.uint32(17).double(message.ether);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BalanceResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBalanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.wei = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag != 17) {
            break;
          }

          message.ether = reader.double();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<BalanceResponse>): BalanceResponse {
    return BalanceResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<BalanceResponse>): BalanceResponse {
    const message = createBaseBalanceResponse();
    message.wei = object.wei ?? 0;
    message.ether = object.ether ?? 0;
    return message;
  },
};

/** The Relay Service definition. */
export type ECSRelayServiceDefinition = typeof ECSRelayServiceDefinition;
export const ECSRelayServiceDefinition = {
  name: "ECSRelayService",
  fullName: "ecsrelay.ECSRelayService",
  methods: {
    authenticate: {
      name: "Authenticate",
      requestType: Signature,
      requestStream: false,
      responseType: Identity,
      responseStream: false,
      options: {},
    },
    revoke: {
      name: "Revoke",
      requestType: Signature,
      requestStream: false,
      responseType: Identity,
      responseStream: false,
      options: {},
    },
    ping: {
      name: "Ping",
      requestType: Signature,
      requestStream: false,
      responseType: Identity,
      responseStream: false,
      options: {},
    },
    countAuthenticated: {
      name: "CountAuthenticated",
      requestType: CountIdentitiesRequest,
      requestStream: false,
      responseType: CountIdentitiesResponse,
      responseStream: false,
      options: {},
    },
    countConnected: {
      name: "CountConnected",
      requestType: CountIdentitiesRequest,
      requestStream: false,
      responseType: CountIdentitiesResponse,
      responseStream: false,
      options: {},
    },
    subscribe: {
      name: "Subscribe",
      requestType: SubscriptionRequest,
      requestStream: false,
      responseType: Subscription,
      responseStream: false,
      options: {},
    },
    unsubscribe: {
      name: "Unsubscribe",
      requestType: SubscriptionRequest,
      requestStream: false,
      responseType: Subscription,
      responseStream: false,
      options: {},
    },
    openStream: {
      name: "OpenStream",
      requestType: Signature,
      requestStream: false,
      responseType: Message,
      responseStream: true,
      options: {},
    },
    /** Push a stream of messages to be relayed. */
    pushStream: {
      name: "PushStream",
      requestType: PushRequest,
      requestStream: true,
      responseType: PushResponse,
      responseStream: true,
      options: {},
    },
    /** Push a single message to be relayed. */
    push: {
      name: "Push",
      requestType: PushRequest,
      requestStream: false,
      responseType: PushResponse,
      responseStream: false,
      options: {},
    },
    /** Minimum balance an account must have to be able to push. */
    minBalanceForPush: {
      name: "MinBalanceForPush",
      requestType: BalanceRequest,
      requestStream: false,
      responseType: BalanceResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface ECSRelayServiceImplementation<CallContextExt = {}> {
  authenticate(request: Signature, context: CallContext & CallContextExt): Promise<DeepPartial<Identity>>;
  revoke(request: Signature, context: CallContext & CallContextExt): Promise<DeepPartial<Identity>>;
  ping(request: Signature, context: CallContext & CallContextExt): Promise<DeepPartial<Identity>>;
  countAuthenticated(
    request: CountIdentitiesRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<CountIdentitiesResponse>>;
  countConnected(
    request: CountIdentitiesRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<CountIdentitiesResponse>>;
  subscribe(request: SubscriptionRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Subscription>>;
  unsubscribe(request: SubscriptionRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Subscription>>;
  openStream(
    request: Signature,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<Message>>;
  /** Push a stream of messages to be relayed. */
  pushStream(
    request: AsyncIterable<PushRequest>,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<PushResponse>>;
  /** Push a single message to be relayed. */
  push(request: PushRequest, context: CallContext & CallContextExt): Promise<DeepPartial<PushResponse>>;
  /** Minimum balance an account must have to be able to push. */
  minBalanceForPush(
    request: BalanceRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<BalanceResponse>>;
}

export interface ECSRelayServiceClient<CallOptionsExt = {}> {
  authenticate(request: DeepPartial<Signature>, options?: CallOptions & CallOptionsExt): Promise<Identity>;
  revoke(request: DeepPartial<Signature>, options?: CallOptions & CallOptionsExt): Promise<Identity>;
  ping(request: DeepPartial<Signature>, options?: CallOptions & CallOptionsExt): Promise<Identity>;
  countAuthenticated(
    request: DeepPartial<CountIdentitiesRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<CountIdentitiesResponse>;
  countConnected(
    request: DeepPartial<CountIdentitiesRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<CountIdentitiesResponse>;
  subscribe(request: DeepPartial<SubscriptionRequest>, options?: CallOptions & CallOptionsExt): Promise<Subscription>;
  unsubscribe(request: DeepPartial<SubscriptionRequest>, options?: CallOptions & CallOptionsExt): Promise<Subscription>;
  openStream(request: DeepPartial<Signature>, options?: CallOptions & CallOptionsExt): AsyncIterable<Message>;
  /** Push a stream of messages to be relayed. */
  pushStream(
    request: AsyncIterable<DeepPartial<PushRequest>>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<PushResponse>;
  /** Push a single message to be relayed. */
  push(request: DeepPartial<PushRequest>, options?: CallOptions & CallOptionsExt): Promise<PushResponse>;
  /** Minimum balance an account must have to be able to push. */
  minBalanceForPush(
    request: DeepPartial<BalanceRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<BalanceResponse>;
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
