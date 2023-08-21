import { customType, PgCustomColumnBuilder } from "drizzle-orm/pg-core";
import { ColumnBuilderBaseConfig } from "drizzle-orm";
import superjson from "superjson";
import { Address, getAddress } from "viem";

export const json = <TData>(name: string): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: TData }> =>
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

export const address = (name: string): PgCustomColumnBuilder<ColumnBuilderBaseConfig & { data: Address }> =>
  customType<{ data: Address; driverData: string }>({
    dataType() {
      // TODO: move to bytea column type?
      return "text";
    },
    toDriver(data: Address): string {
      return data.toLowerCase();
    },
    fromDriver(driverData: string): Address {
      return getAddress(driverData);
    },
  })(name);
