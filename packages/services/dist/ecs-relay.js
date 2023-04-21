// protobuf/ts/ecs-relay/ecs-relay.ts
import Long from "long";
import _m0 from "protobufjs/minimal";
var protobufPackage = "ecsrelay";
function createBaseIdentity() {
  return { name: "" };
}
var Identity = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Identity.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseIdentity();
    message.name = object.name ?? "";
    return message;
  }
};
function createBaseSignature() {
  return { signature: "" };
}
var Signature = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.signature !== "") {
      writer.uint32(10).string(message.signature);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Signature.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSignature();
    message.signature = object.signature ?? "";
    return message;
  }
};
function createBaseMessage() {
  return { version: 0, id: "", data: new Uint8Array(), timestamp: 0, signature: "" };
}
var Message = {
  encode(message, writer = _m0.Writer.create()) {
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
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
          message.timestamp = longToNumber(reader.int64());
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
  create(base) {
    return Message.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseMessage();
    message.version = object.version ?? 0;
    message.id = object.id ?? "";
    message.data = object.data ?? new Uint8Array();
    message.timestamp = object.timestamp ?? 0;
    message.signature = object.signature ?? "";
    return message;
  }
};
function createBaseSubscriptionRequest() {
  return { signature: void 0, subscription: void 0 };
}
var SubscriptionRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.signature !== void 0) {
      Signature.encode(message.signature, writer.uint32(10).fork()).ldelim();
    }
    if (message.subscription !== void 0) {
      Subscription.encode(message.subscription, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return SubscriptionRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSubscriptionRequest();
    message.signature = object.signature !== void 0 && object.signature !== null ? Signature.fromPartial(object.signature) : void 0;
    message.subscription = object.subscription !== void 0 && object.subscription !== null ? Subscription.fromPartial(object.subscription) : void 0;
    return message;
  }
};
function createBaseSubscription() {
  return { label: "" };
}
var Subscription = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return Subscription.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSubscription();
    message.label = object.label ?? "";
    return message;
  }
};
function createBasePushRequest() {
  return { label: "", message: void 0 };
}
var PushRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.message !== void 0) {
      Message.encode(message.message, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return PushRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePushRequest();
    message.label = object.label ?? "";
    message.message = object.message !== void 0 && object.message !== null ? Message.fromPartial(object.message) : void 0;
    return message;
  }
};
function createBasePushManyRequest() {
  return { signature: void 0, label: "", messages: [] };
}
var PushManyRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.signature !== void 0) {
      Signature.encode(message.signature, writer.uint32(10).fork()).ldelim();
    }
    if (message.label !== "") {
      writer.uint32(18).string(message.label);
    }
    for (const v of message.messages) {
      Message.encode(v, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return PushManyRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePushManyRequest();
    message.signature = object.signature !== void 0 && object.signature !== null ? Signature.fromPartial(object.signature) : void 0;
    message.label = object.label ?? "";
    message.messages = object.messages?.map((e) => Message.fromPartial(e)) || [];
    return message;
  }
};
function createBasePushResponse() {
  return {};
}
var PushResponse = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return PushResponse.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBasePushResponse();
    return message;
  }
};
function createBaseCountIdentitiesRequest() {
  return {};
}
var CountIdentitiesRequest = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return CountIdentitiesRequest.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseCountIdentitiesRequest();
    return message;
  }
};
function createBaseCountIdentitiesResponse() {
  return { count: 0 };
}
var CountIdentitiesResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.count !== 0) {
      writer.uint32(8).uint32(message.count);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return CountIdentitiesResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCountIdentitiesResponse();
    message.count = object.count ?? 0;
    return message;
  }
};
function createBaseBalanceRequest() {
  return {};
}
var BalanceRequest = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
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
  create(base) {
    return BalanceRequest.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseBalanceRequest();
    return message;
  }
};
function createBaseBalanceResponse() {
  return { wei: 0, ether: 0 };
}
var BalanceResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.wei !== 0) {
      writer.uint32(8).uint64(message.wei);
    }
    if (message.ether !== 0) {
      writer.uint32(17).double(message.ether);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseBalanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }
          message.wei = longToNumber(reader.uint64());
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
  create(base) {
    return BalanceResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBalanceResponse();
    message.wei = object.wei ?? 0;
    message.ether = object.ether ?? 0;
    return message;
  }
};
var ECSRelayServiceDefinition = {
  name: "ECSRelayService",
  fullName: "ecsrelay.ECSRelayService",
  methods: {
    authenticate: {
      name: "Authenticate",
      requestType: Signature,
      requestStream: false,
      responseType: Identity,
      responseStream: false,
      options: {}
    },
    revoke: {
      name: "Revoke",
      requestType: Signature,
      requestStream: false,
      responseType: Identity,
      responseStream: false,
      options: {}
    },
    ping: {
      name: "Ping",
      requestType: Signature,
      requestStream: false,
      responseType: Identity,
      responseStream: false,
      options: {}
    },
    countAuthenticated: {
      name: "CountAuthenticated",
      requestType: CountIdentitiesRequest,
      requestStream: false,
      responseType: CountIdentitiesResponse,
      responseStream: false,
      options: {}
    },
    countConnected: {
      name: "CountConnected",
      requestType: CountIdentitiesRequest,
      requestStream: false,
      responseType: CountIdentitiesResponse,
      responseStream: false,
      options: {}
    },
    subscribe: {
      name: "Subscribe",
      requestType: SubscriptionRequest,
      requestStream: false,
      responseType: Subscription,
      responseStream: false,
      options: {}
    },
    unsubscribe: {
      name: "Unsubscribe",
      requestType: SubscriptionRequest,
      requestStream: false,
      responseType: Subscription,
      responseStream: false,
      options: {}
    },
    openStream: {
      name: "OpenStream",
      requestType: Signature,
      requestStream: false,
      responseType: Message,
      responseStream: true,
      options: {}
    },
    /** Push a stream of messages to be relayed. */
    pushStream: {
      name: "PushStream",
      requestType: PushRequest,
      requestStream: true,
      responseType: PushResponse,
      responseStream: true,
      options: {}
    },
    /** Push a single message to be relayed. */
    push: {
      name: "Push",
      requestType: PushRequest,
      requestStream: false,
      responseType: PushResponse,
      responseStream: false,
      options: {}
    },
    /** Minimum balance an account must have to be able to push. */
    minBalanceForPush: {
      name: "MinBalanceForPush",
      requestType: BalanceRequest,
      requestStream: false,
      responseType: BalanceResponse,
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
  BalanceRequest,
  BalanceResponse,
  CountIdentitiesRequest,
  CountIdentitiesResponse,
  ECSRelayServiceDefinition,
  Identity,
  Message,
  PushManyRequest,
  PushRequest,
  PushResponse,
  Signature,
  Subscription,
  SubscriptionRequest,
  protobufPackage
};
//# sourceMappingURL=ecs-relay.js.map