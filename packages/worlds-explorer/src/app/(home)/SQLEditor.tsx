import { useEffect, useState } from "react";

export function SQLEditor({
  table,
  setQuery,
  tablesLoading,
}: {
  table: string | undefined;
  setQuery: React.Dispatch<React.SetStateAction<string | undefined>>;
  tablesLoading: boolean;
}) {
  const [deferredQuery, setDeferredQuery] = useState<string | undefined>("");

  const submitQuery = (evt) => {
    evt.preventDefault();
    setQuery(deferredQuery);
  };

  useEffect(() => {
    if (table) {
      const initialQuery = `SELECT * FROM '${table}' LIMIT 30`;
      setQuery(initialQuery);
      setDeferredQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, tablesLoading]);

  return (
    <form onSubmit={submitQuery}>
      {/* <Flex direction="row" gap="2">
        <TextField.Root
          style={{ flex: "1" }}
          placeholder="SQL query…"
          value={deferredQuery}
          onChange={(evt) => setDeferredQuery(evt.target.value)}
        >
          <TextField.Slot></TextField.Slot>
        </TextField.Root>

        <Button type="submit">Execute query</Button>
      </Flex> */}
    </form>
  );
}
