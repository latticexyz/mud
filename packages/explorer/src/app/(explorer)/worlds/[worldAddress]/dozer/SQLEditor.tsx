// import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../../../components/ui/Form";
import { PlayIcon } from "lucide-react";
import { set } from "zod";
import { useEffect, useState } from "react";
import { Button } from "../../../../../components/ui/Button";
import { Input } from "../../../../../components/ui/Input";

type Props = {
  query: string | undefined;
  setQuery: (query: string) => void;
};

export function SQLEditor({ query, setQuery }: Props) {
  const [intermediateQuery, setIntermediateQuery] = useState<string | undefined>(query);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(intermediateQuery || "");
  };

  useEffect(() => {
    setIntermediateQuery(query);
  }, [query]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <Input
          value={intermediateQuery || ""}
          onChange={(e) => setIntermediateQuery(e.target.value)}
          className="pr-[90px]"
        />

        <Button className="absolute right-1 top-1 h-8 px-4" type="submit">
          <PlayIcon className="mr-1.5 h-3 w-3" /> Run
        </Button>
      </div>
    </form>
  );

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
