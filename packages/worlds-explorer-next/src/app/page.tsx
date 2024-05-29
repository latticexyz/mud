import { Select, Flex, Button, Table, TextArea } from "@radix-ui/themes";

export function TableSelector() {
  return (
    <Select.Root defaultValue="apple">
      <Select.Trigger>Select table</Select.Trigger>

      <Select.Content>
        <Select.Group>
          <Select.Label>Fruits</Select.Label>
          <Select.Item value="orange">Orange</Select.Item>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="grape" disabled>
            Grape
          </Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Vegetables</Select.Label>
          <Select.Item value="carrot">Carrot</Select.Item>
          <Select.Item value="potato">Potato</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}

export function SQLEditor() {
  return (
    <>
      <TextArea placeholder="SQL query…" />
      <Button>Let&apos;s go</Button>
    </>
  );
}

export function TablesViewer() {
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

export default async function Home() {
  const processCwd = process.cwd().split("node_modules")[0];
  console.log(processCwd);

  // const rows = db.prepare("SELECT * FROM '0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b__app__counter';").all();
  // console.log(rows);

  return (
    <Flex direction="column" gap="2">
      <SQLEditor />

      <TableSelector />
      <TablesViewer />
    </Flex>
  );
}
