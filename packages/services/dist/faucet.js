// protobuf/ts/faucet/faucet.ts
import Long from "long";
import _m0 from "protobufjs/minimal.js";
var protobufPackage = "faucet";
function createBaseLinkedTwitterPair() {
  return { username: "", address: "" };
}
var LinkedTwitterPair = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.username = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.address = reader.string();
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
    return LinkedTwitterPair.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseLinkedTwitterPair();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseFaucetStore() {
  return { addressToUsername: {}, usernameToAddress: {}, latestDrip: {}, totalDripCount: 0 };
}
var FaucetStore = {
  encode(message, writer = _m0.Writer.create()) {
    Object.entries(message.addressToUsername).forEach(([key, value]) => {
      FaucetStore_AddressToUsernameEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.usernameToAddress).forEach(([key, value]) => {
      FaucetStore_UsernameToAddressEntry.encode({ key, value }, writer.uint32(18).fork()).ldelim();
    });
    Object.entries(message.latestDrip).forEach(([key, value]) => {
      FaucetStore_LatestDripEntry.encode({ key, value }, writer.uint32(26).fork()).ldelim();
    });
    if (message.totalDripCount !== 0) {
      writer.uint32(33).double(message.totalDripCount);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFaucetStore();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          const entry1 = FaucetStore_AddressToUsernameEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
            message.addressToUsername[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          const entry2 = FaucetStore_UsernameToAddressEntry.decode(reader, reader.uint32());
          if (entry2.value !== void 0) {
            message.usernameToAddress[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag != 26) {
            break;
          }
          const entry3 = FaucetStore_LatestDripEntry.decode(reader, reader.uint32());
          if (entry3.value !== void 0) {
            message.latestDrip[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag != 33) {
            break;
          }
          message.totalDripCount = reader.double();
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
    return FaucetStore.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFaucetStore();
    message.addressToUsername = Object.entries(object.addressToUsername ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = String(value);
        }
        return acc;
      },
      {}
    );
    message.usernameToAddress = Object.entries(object.usernameToAddress ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = String(value);
        }
        return acc;
      },
      {}
    );
    message.latestDrip = Object.entries(object.latestDrip ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = Number(value);
        }
        return acc;
      },
      {}
    );
    message.totalDripCount = object.totalDripCount ?? 0;
    return message;
  }
};
function createBaseFaucetStore_AddressToUsernameEntry() {
  return { key: "", value: "" };
}
var FaucetStore_AddressToUsernameEntry = {
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
    const message = createBaseFaucetStore_AddressToUsernameEntry();
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
    return FaucetStore_AddressToUsernameEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFaucetStore_AddressToUsernameEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseFaucetStore_UsernameToAddressEntry() {
  return { key: "", value: "" };
}
var FaucetStore_UsernameToAddressEntry = {
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
    const message = createBaseFaucetStore_UsernameToAddressEntry();
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
    return FaucetStore_UsernameToAddressEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFaucetStore_UsernameToAddressEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseFaucetStore_LatestDripEntry() {
  return { key: "", value: 0 };
}
var FaucetStore_LatestDripEntry = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int64(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFaucetStore_LatestDripEntry();
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
          if (tag != 16) {
            break;
          }
          message.value = longToNumber(reader.int64());
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
    return FaucetStore_LatestDripEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFaucetStore_LatestDripEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  }
};
function createBaseDripRequest() {
  return { username: "", address: "" };
}
var DripRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDripRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.username = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.address = reader.string();
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
    return DripRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDripRequest();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseDripDevRequest() {
  return { address: "" };
}
var DripDevRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDripDevRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.address = reader.string();
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
    return DripDevRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDripDevRequest();
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseDripResponse() {
  return { dripTxHash: "", ecsTxHash: "" };
}
var DripResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.dripTxHash !== "") {
      writer.uint32(10).string(message.dripTxHash);
    }
    if (message.ecsTxHash !== "") {
      writer.uint32(18).string(message.ecsTxHash);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDripResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.dripTxHash = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.ecsTxHash = reader.string();
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
    return DripResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDripResponse();
    message.dripTxHash = object.dripTxHash ?? "";
    message.ecsTxHash = object.ecsTxHash ?? "";
    return message;
  }
};
function createBaseTimeUntilDripResponse() {
  return { timeUntilDripMinutes: 0, timeUntilDripSeconds: 0 };
}
var TimeUntilDripResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.timeUntilDripMinutes !== 0) {
      writer.uint32(9).double(message.timeUntilDripMinutes);
    }
    if (message.timeUntilDripSeconds !== 0) {
      writer.uint32(17).double(message.timeUntilDripSeconds);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseTimeUntilDripResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 9) {
            break;
          }
          message.timeUntilDripMinutes = reader.double();
          continue;
        case 2:
          if (tag != 17) {
            break;
          }
          message.timeUntilDripSeconds = reader.double();
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
    return TimeUntilDripResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseTimeUntilDripResponse();
    message.timeUntilDripMinutes = object.timeUntilDripMinutes ?? 0;
    message.timeUntilDripSeconds = object.timeUntilDripSeconds ?? 0;
    return message;
  }
};
function createBaseGetLinkedTwittersRequest() {
  return {};
}
var GetLinkedTwittersRequest = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGetLinkedTwittersRequest();
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
    return GetLinkedTwittersRequest.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseGetLinkedTwittersRequest();
    return message;
  }
};
function createBaseGetLinkedTwittersResponse() {
  return { linkedTwitters: [] };
}
var GetLinkedTwittersResponse = {
  encode(message, writer = _m0.Writer.create()) {
    for (const v of message.linkedTwitters) {
      LinkedTwitterPair.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGetLinkedTwittersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.linkedTwitters.push(LinkedTwitterPair.decode(reader, reader.uint32()));
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
    return GetLinkedTwittersResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetLinkedTwittersResponse();
    message.linkedTwitters = object.linkedTwitters?.map((e) => LinkedTwitterPair.fromPartial(e)) || [];
    return message;
  }
};
function createBaseLinkedTwitterForAddressRequest() {
  return { address: "" };
}
var LinkedTwitterForAddressRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterForAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.address = reader.string();
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
    return LinkedTwitterForAddressRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseLinkedTwitterForAddressRequest();
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseLinkedTwitterForAddressResponse() {
  return { username: "" };
}
var LinkedTwitterForAddressResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterForAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.username = reader.string();
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
    return LinkedTwitterForAddressResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseLinkedTwitterForAddressResponse();
    message.username = object.username ?? "";
    return message;
  }
};
function createBaseLinkedAddressForTwitterRequest() {
  return { username: "" };
}
var LinkedAddressForTwitterRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedAddressForTwitterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.username = reader.string();
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
    return LinkedAddressForTwitterRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseLinkedAddressForTwitterRequest();
    message.username = object.username ?? "";
    return message;
  }
};
function createBaseLinkedAddressForTwitterResponse() {
  return { address: "" };
}
var LinkedAddressForTwitterResponse = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedAddressForTwitterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.address = reader.string();
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
    return LinkedAddressForTwitterResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseLinkedAddressForTwitterResponse();
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseSetLinkedTwitterRequest() {
  return { address: "", username: "", signature: "" };
}
var SetLinkedTwitterRequest = {
  encode(message, writer = _m0.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.username !== "") {
      writer.uint32(18).string(message.username);
    }
    if (message.signature !== "") {
      writer.uint32(26).string(message.signature);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetLinkedTwitterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }
          message.address = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }
          message.username = reader.string();
          continue;
        case 3:
          if (tag != 26) {
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
    return SetLinkedTwitterRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSetLinkedTwitterRequest();
    message.address = object.address ?? "";
    message.username = object.username ?? "";
    message.signature = object.signature ?? "";
    return message;
  }
};
function createBaseSetLinkedTwitterResponse() {
  return {};
}
var SetLinkedTwitterResponse = {
  encode(_, writer = _m0.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetLinkedTwitterResponse();
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
    return SetLinkedTwitterResponse.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseSetLinkedTwitterResponse();
    return message;
  }
};
var FaucetServiceDefinition = {
  name: "FaucetService",
  fullName: "faucet.FaucetService",
  methods: {
    drip: {
      name: "Drip",
      requestType: DripRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {}
    },
    dripDev: {
      name: "DripDev",
      requestType: DripDevRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {}
    },
    dripVerifyTweet: {
      name: "DripVerifyTweet",
      requestType: DripRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {}
    },
    timeUntilDrip: {
      name: "TimeUntilDrip",
      requestType: DripRequest,
      requestStream: false,
      responseType: TimeUntilDripResponse,
      responseStream: false,
      options: {}
    },
    getLinkedTwitters: {
      name: "GetLinkedTwitters",
      requestType: GetLinkedTwittersRequest,
      requestStream: false,
      responseType: GetLinkedTwittersResponse,
      responseStream: false,
      options: {}
    },
    getLinkedTwitterForAddress: {
      name: "GetLinkedTwitterForAddress",
      requestType: LinkedTwitterForAddressRequest,
      requestStream: false,
      responseType: LinkedTwitterForAddressResponse,
      responseStream: false,
      options: {}
    },
    getLinkedAddressForTwitter: {
      name: "GetLinkedAddressForTwitter",
      requestType: LinkedAddressForTwitterRequest,
      requestStream: false,
      responseType: LinkedAddressForTwitterResponse,
      responseStream: false,
      options: {}
    },
    /** Admin utility endpoints for modifying state. Requires a signature with faucet private key. */
    setLinkedTwitter: {
      name: "SetLinkedTwitter",
      requestType: SetLinkedTwitterRequest,
      requestStream: false,
      responseType: SetLinkedTwitterResponse,
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
  DripDevRequest,
  DripRequest,
  DripResponse,
  FaucetServiceDefinition,
  FaucetStore,
  FaucetStore_AddressToUsernameEntry,
  FaucetStore_LatestDripEntry,
  FaucetStore_UsernameToAddressEntry,
  GetLinkedTwittersRequest,
  GetLinkedTwittersResponse,
  LinkedAddressForTwitterRequest,
  LinkedAddressForTwitterResponse,
  LinkedTwitterForAddressRequest,
  LinkedTwitterForAddressResponse,
  LinkedTwitterPair,
  SetLinkedTwitterRequest,
  SetLinkedTwitterResponse,
  TimeUntilDripResponse,
  protobufPackage
};
//# sourceMappingURL=faucet.js.map