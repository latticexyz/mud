import { customType, PgCustomColumnBuilder } from "drizzle-orm/pg-core";
import { ColumnBuilderBaseConfig } from "drizzle-orm";
import superjson from "superjson";
import { Address, ByteArray, bytesToHex, getAddress, Hex, hexToBytes } from "viem";

export const json = <TData>(
  name: string
): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: TData; driverParam: string }> =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      // TODO: move to json column type
      return "text";
    },
    toDriver(data: TData): string {
      return superjson.stringify(data);
    },
    fromDriver(driverData: string): TData {
      return superjson.parse(driverData);
    },
  })(name);

export const bytes = (
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

export const address = (
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
