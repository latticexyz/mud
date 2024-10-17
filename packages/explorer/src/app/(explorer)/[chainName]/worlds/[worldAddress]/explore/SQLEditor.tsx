"use client";

import { PlayIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import Editor from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
import { cn } from "../../../../../../utils";
import { monacoOptions } from "./consts";
import { useMonacoSuggestions } from "./useMonacoSuggestions";
import { useQueryValidator } from "./useQueryValidator";

type Props = {
  table?: Table;
};

export function SQLEditor({ table }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const validateQuery = useQueryValidator(table);
  useMonacoSuggestions(table);

  const form = useForm({
    defaultValues: {
      query: query || "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (validateQuery(data.query)) {
      setQuery(data.query);
    }
  });

  useEffect(() => {
    form.reset({ query: query || "" });
  }, [query, form]);

  return (
    <Form {...form}>
      <form
        className={cn(
          "relative flex w-full flex-grow items-center justify-center bg-black align-middle",
          "h-10 rounded-md border px-3 py-2 ring-offset-background",
          {
            "outline-none ring-2 ring-ring ring-offset-2": isFocused,
          },
        )}
        onSubmit={handleSubmit}
      >
        <FormField
          name="query"
          render={({ field }) => (
            <Editor
              width="100%"
              theme="hc-black"
              value={field.value}
              options={monacoOptions}
              language="sql"
              onChange={(value) => field.onChange(value)}
              onMount={(editor) => {
                editor.onDidFocusEditorText(() => {
                  setIsFocused(true);
                });

                editor.onDidBlurEditorText(() => {
                  setIsFocused(false);
                });
              }}
              loading={null}
            />
          )}
        />

        <Button className="absolute right-1 top-1 h-8 px-4" type="submit">
          <PlayIcon className="mr-1.5 h-3 w-3" /> Run
        </Button>
      </form>
    </Form>
  );
}
