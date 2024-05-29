"use client";

import { Select, Flex, Button, Table, TextField, Container } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function bufferToBigInt(bufferData: number[]) {
  const hexString = bufferData.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const bigIntValue = BigInt("0x" + hexString);
  return bigIntValue;
}

export function TableSelector({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger style={{ width: "100%" }} placeholder="Select a table" />
        <Select.Content>
          {options?.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}

export function SQLEditor() {
  return (
    <Flex direction="row" gap="2">
      <TextField.Root style={{ flex: "1" }} placeholder="SQL query…">
        <TextField.Slot></TextField.Slot>
      </TextField.Root>

      <Button>Execute query</Button>
    </Flex>
  );
}

export function TablesViewer({ table }: { table: string | undefined }) {
  const { data: schema } = useQuery({
    queryKey: ["schema", { table }],
    queryFn: async () => {
      const response = await fetch(`/api/schema?table=${table}`);
      return response.json();
    },
    select: (data) => data.schema,
  });

  const { data: rows } = useQuery({
    queryKey: ["rows", { table }],
    queryFn: async () => {
      const response = await fetch(`/api/rows?table=${table}`);
      return response.json();
    },
    select: (data) => {
      return data.rows.map((row: object) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (value?.type === "Buffer") {
              return [key, bufferToBigInt(value?.data).toString()];
            }
            return [key, value];
          }),
        );
      });
    },
    enabled: Boolean(table),
    refetchInterval: 15000,
  });

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {schema?.map((column: { name: string }) => (
            <Table.ColumnHeaderCell key={column.name}>{column.name}</Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rows?.map((row: Record<string, string>, idx: number) => {
          return (
            <Table.Row key={idx}>
              {schema?.map((column: { name: string }) => {
                return <Table.Cell key={column.name}>{row[column.name]}</Table.Cell>;
              })}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}

export default function Home() {
  const [table, setTable] = useState<string | undefined>();
  const { data: tables } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("/api/tables");
      return response.json();
    },
    select: (data) => data.tables.map((table: { name: string }) => table.name),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!table && tables) {
      setTable(tables[0]);
    }
  }, [table, tables]);

  return (
    <Container>
      <Flex direction="column" gap="2">
        <TableSelector value={table} onChange={setTable} options={tables} />
        <SQLEditor />
        <TablesViewer table={table} />
      </Flex>
    </Container>
  );
}
