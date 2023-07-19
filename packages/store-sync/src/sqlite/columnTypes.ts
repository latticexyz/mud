import { customType, SQLiteCustomColumnBuilder } from "drizzle-orm/sqlite-core";
import { ColumnBuilderBaseConfig } from "drizzle-orm";
import superjson from "superjson";

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
