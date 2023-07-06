// TODO: implement

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});
