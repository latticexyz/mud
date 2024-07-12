import { Table } from "../common";

export type PartialTable = Pick<Table, "address" | "tableId" | "namespace" | "name" | "keySchema" | "valueSchema">;
