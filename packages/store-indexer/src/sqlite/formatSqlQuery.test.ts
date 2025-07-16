import { describe, expect, it } from "vitest";
import { formatSqlQuery } from "./formatSqlQuery";

describe("formatSqlQuery", () => {
  it("should convert camelCase column names to snake_case", () => {
    const input = "SELECT userId, firstName, lastName FROM users";
    const expected = 'SELECT "user_id", "first_name", "last_name" FROM "users"';
    expect(formatSqlQuery(input)).toBe(expected);
  });

  it("should not modify non-camelCase column names", () => {
    const input = "SELECT user_id, first_name, last_name FROM users";
    const expected = 'SELECT "user_id", "first_name", "last_name" FROM "users"';
    expect(formatSqlQuery(input)).toBe(expected);
  });

  it("should not modify camelCase words that are not column names", () => {
    const input = "SELECT * FROM users WHERE firstName LIKE '%NameSurname%'";
    const expected = 'SELECT * FROM "users" WHERE "first_name" LIKE \'%NameSurname%\'';
    expect(formatSqlQuery(input)).toBe(expected);
  });

  it("should not modify table names", () => {
    const input = "SELECT * FROM usersTable";
    const expected = 'SELECT * FROM "usersTable"';
    expect(formatSqlQuery(input)).toBe(expected);

    const input2 = "SELECT * FROM users_table";
    const expected2 = 'SELECT * FROM "users_table"';
    expect(formatSqlQuery(input2)).toBe(expected2);
  });
});
