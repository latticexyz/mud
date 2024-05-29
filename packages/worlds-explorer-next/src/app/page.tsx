"use client";

import { Select, Flex, Button, Table, TextArea, Container } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
    <Container>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger />
        <Select.Content>
          {options?.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Container>
  );
}

export function SQLEditor() {
  return (
    <>
      <TextArea placeholder="SQL query…" />
      <Button>Execute query</Button>
    </>
  );
}

export function TablesViewer({ table }: { table: string | undefined }) {
  const { data: rows } = useQuery({
    queryKey: ["rows", { table }],
    queryFn: async () => {
      const response = await fetch(`/api/rows?table=${table}`);
      return response.json();
    },
    select: (data) => data.rows,
    enabled: Boolean(table),
    refetchInterval: 15000,
  });

  const { data: schema } = useQuery({
    queryKey: ["schema", { table }],
    queryFn: async () => {
      const response = await fetch(`/api/schema?table=${table}`);
      return response.json();
    },
    select: (data) => data.schema,
  });

  console.log("rows", rows, schema);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.RowHeaderCell>Danilo Sousa</Table.RowHeaderCell>
          <Table.Cell>danilo@example.com</Table.Cell>
          <Table.Cell>Developer</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
          <Table.Cell>zahra@example.com</Table.Cell>
          <Table.Cell>Admin</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
          <Table.Cell>jasper@example.com</Table.Cell>
          <Table.Cell>Developer</Table.Cell>
        </Table.Row>
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
    <Flex direction="column" gap="2">
      <SQLEditor />
      <TableSelector value={table} onChange={setTable} options={tables} />
      <TablesViewer table={table} />
    </Flex>
  );
}
