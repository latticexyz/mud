/* eslint-disable */
import Long from "long";
import { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "faucet";

export interface LinkedTwitterPair {
  username: string;
  address: string;
}

export interface FaucetStore {
  addressToUsername: { [key: string]: string };
  usernameToAddress: { [key: string]: string };
  /** Username to timestamp of latest drip. */
  latestDrip: { [key: string]: number };
  /** Global drip counter. */
  totalDripCount: number;
}

export interface FaucetStore_AddressToUsernameEntry {
  key: string;
  value: string;
}

export interface FaucetStore_UsernameToAddressEntry {
  key: string;
  value: string;
}

export interface FaucetStore_LatestDripEntry {
  key: string;
  value: number;
}

/** Request for drip after a successful DripVerifyTweet RPC. */
export interface DripRequest {
  username: string;
  address: string;
}

/** Request for initial drip via DripVerifyTweet RPC that requires verifying a tweet */
export interface DripVerifyTweetRequest {
  username: string;
  address: string;
}

/** Request for drip to any address when running in dev mode. */
export interface DripDevRequest {
  address: string;
}

/** Response for drip request that contains the transaction hash of the drip tx and the ECS component set hash (if any). */
export interface DripResponse {
  dripTxHash: string;
  ecsTxHash: string;
}

/** Response for the time until next drip request. */
export interface TimeUntilDripResponse {
  timeUntilDripMinutes: number;
  timeUntilDripSeconds: number;
}

export interface GetLinkedTwittersRequest {}

export interface GetLinkedTwittersResponse {
  linkedTwitters: LinkedTwitterPair[];
}

export interface LinkedTwitterForAddressRequest {
  address: string;
}

export interface LinkedTwitterForAddressResponse {
  username: string;
}

export interface LinkedAddressForTwitterRequest {
  username: string;
}

export interface LinkedAddressForTwitterResponse {
  address: string;
}

export interface SetLinkedTwitterRequest {
  address: string;
  username: string;
  signature: string;
}

export interface SetLinkedTwitterResponse {}

function createBaseLinkedTwitterPair(): LinkedTwitterPair {
  return { username: "", address: "" };
}

export const LinkedTwitterPair = {
  encode(message: LinkedTwitterPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LinkedTwitterPair {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<LinkedTwitterPair>): LinkedTwitterPair {
    const message = createBaseLinkedTwitterPair();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseFaucetStore(): FaucetStore {
  return { addressToUsername: {}, usernameToAddress: {}, latestDrip: {}, totalDripCount: 0 };
}

export const FaucetStore = {
  encode(message: FaucetStore, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.addressToUsername).forEach(([key, value]) => {
      FaucetStore_AddressToUsernameEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.usernameToAddress).forEach(([key, value]) => {
      FaucetStore_UsernameToAddressEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    Object.entries(message.latestDrip).forEach(([key, value]) => {
      FaucetStore_LatestDripEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    if (message.totalDripCount !== 0) {
      writer.uint32(32).uint64(message.totalDripCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FaucetStore {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFaucetStore();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = FaucetStore_AddressToUsernameEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.addressToUsername[entry1.key] = entry1.value;
          }
          break;
        case 2:
          const entry2 = FaucetStore_UsernameToAddressEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.usernameToAddress[entry2.key] = entry2.value;
          }
          break;
        case 3:
          const entry3 = FaucetStore_LatestDripEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.latestDrip[entry3.key] = entry3.value;
          }
          break;
        case 4:
          message.totalDripCount = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<FaucetStore>): FaucetStore {
    const message = createBaseFaucetStore();
    message.addressToUsername = Object.entries(object.addressToUsername ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {}
    );
    message.usernameToAddress = Object.entries(object.usernameToAddress ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {}
    );
    message.latestDrip = Object.entries(object.latestDrip ?? {}).reduce<{ [key: string]: number }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = Number(value);
        }
        return acc;
      },
      {}
    );
    message.totalDripCount = object.totalDripCount ?? 0;
    return message;
  },
};

function createBaseFaucetStore_AddressToUsernameEntry(): FaucetStore_AddressToUsernameEntry {
  return { key: "", value: "" };
}

export const FaucetStore_AddressToUsernameEntry = {
  encode(message: FaucetStore_AddressToUsernameEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FaucetStore_AddressToUsernameEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFaucetStore_AddressToUsernameEntry();
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

  fromPartial(object: DeepPartial<FaucetStore_AddressToUsernameEntry>): FaucetStore_AddressToUsernameEntry {
    const message = createBaseFaucetStore_AddressToUsernameEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseFaucetStore_UsernameToAddressEntry(): FaucetStore_UsernameToAddressEntry {
  return { key: "", value: "" };
}

export const FaucetStore_UsernameToAddressEntry = {
  encode(message: FaucetStore_UsernameToAddressEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FaucetStore_UsernameToAddressEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFaucetStore_UsernameToAddressEntry();
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

  fromPartial(object: DeepPartial<FaucetStore_UsernameToAddressEntry>): FaucetStore_UsernameToAddressEntry {
    const message = createBaseFaucetStore_UsernameToAddressEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseFaucetStore_LatestDripEntry(): FaucetStore_LatestDripEntry {
  return { key: "", value: 0 };
}

export const FaucetStore_LatestDripEntry = {
  encode(message: FaucetStore_LatestDripEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int64(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FaucetStore_LatestDripEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFaucetStore_LatestDripEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<FaucetStore_LatestDripEntry>): FaucetStore_LatestDripEntry {
    const message = createBaseFaucetStore_LatestDripEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseDripRequest(): DripRequest {
  return { username: "", address: "" };
}

export const DripRequest = {
  encode(message: DripRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DripRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDripRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<DripRequest>): DripRequest {
    const message = createBaseDripRequest();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseDripVerifyTweetRequest(): DripVerifyTweetRequest {
  return { username: "", address: "" };
}

export const DripVerifyTweetRequest = {
  encode(message: DripVerifyTweetRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DripVerifyTweetRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDripVerifyTweetRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<DripVerifyTweetRequest>): DripVerifyTweetRequest {
    const message = createBaseDripVerifyTweetRequest();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseDripDevRequest(): DripDevRequest {
  return { address: "" };
}

export const DripDevRequest = {
  encode(message: DripDevRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DripDevRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDripDevRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<DripDevRequest>): DripDevRequest {
    const message = createBaseDripDevRequest();
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseDripResponse(): DripResponse {
  return { dripTxHash: "", ecsTxHash: "" };
}

export const DripResponse = {
  encode(message: DripResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.dripTxHash !== "") {
      writer.uint32(10).string(message.dripTxHash);
    }
    if (message.ecsTxHash !== "") {
      writer.uint32(18).string(message.ecsTxHash);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DripResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDripResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.dripTxHash = reader.string();
          break;
        case 2:
          message.ecsTxHash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<DripResponse>): DripResponse {
    const message = createBaseDripResponse();
    message.dripTxHash = object.dripTxHash ?? "";
    message.ecsTxHash = object.ecsTxHash ?? "";
    return message;
  },
};

function createBaseTimeUntilDripResponse(): TimeUntilDripResponse {
  return { timeUntilDripMinutes: 0, timeUntilDripSeconds: 0 };
}

export const TimeUntilDripResponse = {
  encode(message: TimeUntilDripResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timeUntilDripMinutes !== 0) {
      writer.uint32(9).double(message.timeUntilDripMinutes);
    }
    if (message.timeUntilDripSeconds !== 0) {
      writer.uint32(17).double(message.timeUntilDripSeconds);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimeUntilDripResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimeUntilDripResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timeUntilDripMinutes = reader.double();
          break;
        case 2:
          message.timeUntilDripSeconds = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<TimeUntilDripResponse>): TimeUntilDripResponse {
    const message = createBaseTimeUntilDripResponse();
    message.timeUntilDripMinutes = object.timeUntilDripMinutes ?? 0;
    message.timeUntilDripSeconds = object.timeUntilDripSeconds ?? 0;
    return message;
  },
};

function createBaseGetLinkedTwittersRequest(): GetLinkedTwittersRequest {
  return {};
}

export const GetLinkedTwittersRequest = {
  encode(_: GetLinkedTwittersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetLinkedTwittersRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLinkedTwittersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(_: DeepPartial<GetLinkedTwittersRequest>): GetLinkedTwittersRequest {
    const message = createBaseGetLinkedTwittersRequest();
    return message;
  },
};

function createBaseGetLinkedTwittersResponse(): GetLinkedTwittersResponse {
  return { linkedTwitters: [] };
}

export const GetLinkedTwittersResponse = {
  encode(message: GetLinkedTwittersResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.linkedTwitters) {
      LinkedTwitterPair.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetLinkedTwittersResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLinkedTwittersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.linkedTwitters.push(LinkedTwitterPair.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<GetLinkedTwittersResponse>): GetLinkedTwittersResponse {
    const message = createBaseGetLinkedTwittersResponse();
    message.linkedTwitters = object.linkedTwitters?.map((e) => LinkedTwitterPair.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLinkedTwitterForAddressRequest(): LinkedTwitterForAddressRequest {
  return { address: "" };
}

export const LinkedTwitterForAddressRequest = {
  encode(message: LinkedTwitterForAddressRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LinkedTwitterForAddressRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterForAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<LinkedTwitterForAddressRequest>): LinkedTwitterForAddressRequest {
    const message = createBaseLinkedTwitterForAddressRequest();
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseLinkedTwitterForAddressResponse(): LinkedTwitterForAddressResponse {
  return { username: "" };
}

export const LinkedTwitterForAddressResponse = {
  encode(message: LinkedTwitterForAddressResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LinkedTwitterForAddressResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterForAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<LinkedTwitterForAddressResponse>): LinkedTwitterForAddressResponse {
    const message = createBaseLinkedTwitterForAddressResponse();
    message.username = object.username ?? "";
    return message;
  },
};

function createBaseLinkedAddressForTwitterRequest(): LinkedAddressForTwitterRequest {
  return { username: "" };
}

export const LinkedAddressForTwitterRequest = {
  encode(message: LinkedAddressForTwitterRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LinkedAddressForTwitterRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLinkedAddressForTwitterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<LinkedAddressForTwitterRequest>): LinkedAddressForTwitterRequest {
    const message = createBaseLinkedAddressForTwitterRequest();
    message.username = object.username ?? "";
    return message;
  },
};

function createBaseLinkedAddressForTwitterResponse(): LinkedAddressForTwitterResponse {
  return { address: "" };
}

export const LinkedAddressForTwitterResponse = {
  encode(message: LinkedAddressForTwitterResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LinkedAddressForTwitterResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLinkedAddressForTwitterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<LinkedAddressForTwitterResponse>): LinkedAddressForTwitterResponse {
    const message = createBaseLinkedAddressForTwitterResponse();
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseSetLinkedTwitterRequest(): SetLinkedTwitterRequest {
  return { address: "", username: "", signature: "" };
}

export const SetLinkedTwitterRequest = {
  encode(message: SetLinkedTwitterRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): SetLinkedTwitterRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetLinkedTwitterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.username = reader.string();
          break;
        case 3:
          message.signature = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(object: DeepPartial<SetLinkedTwitterRequest>): SetLinkedTwitterRequest {
    const message = createBaseSetLinkedTwitterRequest();
    message.address = object.address ?? "";
    message.username = object.username ?? "";
    message.signature = object.signature ?? "";
    return message;
  },
};

function createBaseSetLinkedTwitterResponse(): SetLinkedTwitterResponse {
  return {};
}

export const SetLinkedTwitterResponse = {
  encode(_: SetLinkedTwitterResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetLinkedTwitterResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetLinkedTwitterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromPartial(_: DeepPartial<SetLinkedTwitterResponse>): SetLinkedTwitterResponse {
    const message = createBaseSetLinkedTwitterResponse();
    return message;
  },
};

/** The Faucet Service definition. */
export type FaucetServiceDefinition = typeof FaucetServiceDefinition;
export const FaucetServiceDefinition = {
  name: "FaucetService",
  fullName: "faucet.FaucetService",
  methods: {
    drip: {
      name: "Drip",
      requestType: DripRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {},
    },
    dripDev: {
      name: "DripDev",
      requestType: DripDevRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {},
    },
    dripVerifyTweet: {
      name: "DripVerifyTweet",
      requestType: DripVerifyTweetRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {},
    },
    timeUntilDrip: {
      name: "TimeUntilDrip",
      requestType: DripRequest,
      requestStream: false,
      responseType: TimeUntilDripResponse,
      responseStream: false,
      options: {},
    },
    getLinkedTwitters: {
      name: "GetLinkedTwitters",
      requestType: GetLinkedTwittersRequest,
      requestStream: false,
      responseType: GetLinkedTwittersResponse,
      responseStream: false,
      options: {},
    },
    getLinkedTwitterForAddress: {
      name: "GetLinkedTwitterForAddress",
      requestType: LinkedTwitterForAddressRequest,
      requestStream: false,
      responseType: LinkedTwitterForAddressResponse,
      responseStream: false,
      options: {},
    },
    getLinkedAddressForTwitter: {
      name: "GetLinkedAddressForTwitter",
      requestType: LinkedAddressForTwitterRequest,
      requestStream: false,
      responseType: LinkedAddressForTwitterResponse,
      responseStream: false,
      options: {},
    },
    /** Admin utility endpoints for modifying state. Requires a signature with faucet private key. */
    setLinkedTwitter: {
      name: "SetLinkedTwitter",
      requestType: SetLinkedTwitterRequest,
      requestStream: false,
      responseType: SetLinkedTwitterResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface FaucetServiceServiceImplementation<CallContextExt = {}> {
  drip(request: DripRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DripResponse>>;
  dripDev(request: DripDevRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DripResponse>>;
  dripVerifyTweet(
    request: DripVerifyTweetRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<DripResponse>>;
  timeUntilDrip(
    request: DripRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<TimeUntilDripResponse>>;
  getLinkedTwitters(
    request: GetLinkedTwittersRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<GetLinkedTwittersResponse>>;
  getLinkedTwitterForAddress(
    request: LinkedTwitterForAddressRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<LinkedTwitterForAddressResponse>>;
  getLinkedAddressForTwitter(
    request: LinkedAddressForTwitterRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<LinkedAddressForTwitterResponse>>;
  /** Admin utility endpoints for modifying state. Requires a signature with faucet private key. */
  setLinkedTwitter(
    request: SetLinkedTwitterRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<SetLinkedTwitterResponse>>;
}

export interface FaucetServiceClient<CallOptionsExt = {}> {
  drip(request: DeepPartial<DripRequest>, options?: CallOptions & CallOptionsExt): Promise<DripResponse>;
  dripDev(request: DeepPartial<DripDevRequest>, options?: CallOptions & CallOptionsExt): Promise<DripResponse>;
  dripVerifyTweet(
    request: DeepPartial<DripVerifyTweetRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<DripResponse>;
  timeUntilDrip(
    request: DeepPartial<DripRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<TimeUntilDripResponse>;
  getLinkedTwitters(
    request: DeepPartial<GetLinkedTwittersRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<GetLinkedTwittersResponse>;
  getLinkedTwitterForAddress(
    request: DeepPartial<LinkedTwitterForAddressRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<LinkedTwitterForAddressResponse>;
  getLinkedAddressForTwitter(
    request: DeepPartial<LinkedAddressForTwitterRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<LinkedAddressForTwitterResponse>;
  /** Admin utility endpoints for modifying state. Requires a signature with faucet private key. */
  setLinkedTwitter(
    request: DeepPartial<SetLinkedTwitterRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<SetLinkedTwitterResponse>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
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
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
