import { customType } from "drizzle-orm/sqlite-core";
import superjson from "superjson";
import { Address, Hex, getAddress } from "viem";

// TODO: migrate these to same patterns in postgres/columnTypes

export const json = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(data: TData): string {
      return superjson.stringify(data);
    },
    fromDriver(driverData: string): TData {
      return superjson.parse(driverData);
    },
  })(name);

export const address = (name: string) =>
  customType<{ data: Address; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(data: Address): string {
      return data.toLowerCase();
    },
    fromDriver(driverData: string): Address {
      return getAddress(driverData);
    },
  })(name);

export const asHex = (name: string) =>
  customType<{ data: Hex; driverData: Hex }>({
    dataType() {
      return "string";
    },
  })(name);
