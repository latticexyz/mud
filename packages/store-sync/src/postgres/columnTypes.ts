import { customType, PgCustomColumnBuilder } from "drizzle-orm/pg-core";
import { ColumnBuilderBaseConfig } from "drizzle-orm";
import superjson from "superjson";
import { Address, ByteArray, bytesToHex, getAddress, Hex, hexToBytes } from "viem";

export const asJson = <TData>(
  name: string
): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: TData; driverParam: string }> =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      // TODO: move to json column type? if we do, we'll prob wanna choose something other than superjson since it adds one level of depth (json/meta keys)
      return "text";
    },
    toDriver(data: TData): string {
      return superjson.stringify(data);
    },
    fromDriver(driverData: string): TData {
      return superjson.parse(driverData);
    },
  })(name);

export const asNumber = (
  name: string,
  columnType: string
): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: number; driverParam: string }> =>
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

export const asBigInt = (
  name: string,
  columnType: string
): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: bigint; driverParam: string }> =>
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

export const asHex = (
  name: string
): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: Hex; driverParam: ByteArray }> =>
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

export const asAddress = (
  name: string
): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: Address; driverParam: ByteArray }> =>
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
