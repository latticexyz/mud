import { customType, SQLiteCustomColumnBuilder } from "drizzle-orm/sqlite-core";
import { ColumnBuilderBaseConfig } from "drizzle-orm";
import superjson from "superjson";
import { Address, getAddress } from "viem";

export const json = <TData>(name: string): SQLiteCustomColumnBuilder<ColumnBuilderBaseConfig & { data: TData }> =>
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

export const address = (name: string): SQLiteCustomColumnBuilder<ColumnBuilderBaseConfig & { data: Address }> =>
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
