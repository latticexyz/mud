import { PlayIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "../../../../../../components/ui/Form";
import { Input } from "../../../../../../components/ui/Input";

type Props = {
  query: string | undefined;
  setQuery: (query: string) => void;
};

export function SQLEditor({ query, setQuery }: Props) {
  const form = useForm({
    defaultValues: {
      query: query || "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    setQuery(data.query);
  });

  useEffect(() => {
    form.reset({ query: query || "" });
  }, [query, form]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <FormField
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} className="pr-[90px]" disabled={!query} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button className="absolute right-1 top-1 h-8 px-4" type="submit">
            <PlayIcon className="mr-1.5 h-3 w-3" /> Run
          </Button>
        </div>
      </form>
    </Form>
  );
}
