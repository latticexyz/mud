import { snakeCase } from "../snakeCase";

export function getTableName(address: string, namespace: string, tableName: string): string {
  return `${address.toLowerCase()}__${snakeCase(namespace)}__${snakeCase(tableName)}`;
}
