import { useEffect, useState } from "react";
// import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../../../components/ui/Form";
import { Input } from "../../../../../components/ui/Input";

type Props = {
  query: string | undefined;
};

export function SQLEditor({ query: initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return <Input value={query || ""} onChange={(e) => setQuery(e.target.value)} />;

  // TODO: make it a form?
  // <Form>
  //   <FormField name="query" control={control} render={({ field }) => (
  //     <FormItem>
  //       <FormLabel>Query</FormLabel>
  //       <FormControl>
  //         <Input {...field} />
  //       </FormControl>
  //     </FormItem>
  //   )} />
  // </Form>
}
