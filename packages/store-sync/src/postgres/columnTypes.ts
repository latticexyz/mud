import { customType } from "drizzle-orm/pg-core";
import { Address, ByteArray, bytesToHex, getAddress, Hex, hexToBytes } from "viem";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asNumber = (name: string, columnType: string) =>
  customType<{ data: number; driverData: string }>({
    dataType() {
      return columnType;
    },
    toDriver(data: number): string {
      return String(data);
    },
    fromDriver(driverData: string): number {
      return Number(driverData);
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asBigInt = (name: string, columnType: string) =>
  customType<{ data: bigint; driverData: string }>({
    dataType() {
      return columnType;
    },
    toDriver(data: bigint): string {
      return String(data);
    },
    fromDriver(driverData: string): bigint {
      return BigInt(driverData);
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asHex = (name: string) =>
  customType<{ data: Hex; driverData: ByteArray }>({
    dataType() {
      return "bytea";
    },
    toDriver(data: Hex): ByteArray {
      return hexToBytes(data);
    },
    fromDriver(driverData: ByteArray): Hex {
      return bytesToHex(driverData);
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asAddress = (name: string) =>
  customType<{ data: Address; driverData: ByteArray }>({
    dataType() {
      return "bytea";
    },
    toDriver(data: Address): ByteArray {
      return hexToBytes(data);
    },
    fromDriver(driverData: ByteArray): Address {
      return getAddress(bytesToHex(driverData));
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asBoolArray = (name: string) =>
  customType<{ data: boolean[]; driverData: string[] }>({
    dataType() {
      return "bool[]";
    },
    toDriver(data: boolean[]): string[] {
      return data.map((datum) => String(datum));
    },
    fromDriver(driverData: string[]): boolean[] {
      return driverData.map((datum) => Boolean(datum));
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asNumberArray = (name: string, columnType: string) =>
  customType<{ data: number[]; driverData: string[] }>({
    dataType() {
      return columnType;
    },
    toDriver(data: number[]): string[] {
      return data.map((datum) => String(datum));
    },
    fromDriver(driverData: string[]): number[] {
      return driverData.map((datum) => Number(datum));
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asBigIntArray = (name: string, columnType: string) =>
  customType<{ data: bigint[]; driverData: string[] }>({
    dataType() {
      return columnType;
    },
    toDriver(data: bigint[]): string[] {
      return data.map((datum) => String(datum));
    },
    fromDriver(driverData: string[]): bigint[] {
      return driverData.map((datum) => BigInt(datum));
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asHexArray = (name: string) =>
  customType<{ data: Hex[]; driverData: ByteArray[] }>({
    dataType() {
      return "bytea[]";
    },
  })(name);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asAddressArray = (name: string) =>
  customType<{ data: Address[]; driverData: ByteArray[] }>({
    dataType() {
      return "bytea[]";
    },
  })(name);
