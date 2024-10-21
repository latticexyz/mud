"use client";

import { PlayIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
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
      query,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (validateQuery(data.query)) {
      setQuery(query);
    }
  });

  useEffect(() => {
    form.reset({ query });
  }, [query, form]);

  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateHeight = () => {
    if (editorRef.current) {
      console.log("UPDATE HEIGHT");

      const contentHeight = Math.min(200, editorRef.current.getContentHeight());
      if (containerRef.current) {
        containerRef.current.style.height = `${contentHeight}px`;
      }

      editorRef.current.layout({
        width: editorRef.current.getLayoutInfo().width,
        height: contentHeight,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn(
          "relative flex w-full flex-grow items-center justify-center bg-black align-middle",
          "rounded-md border px-3 py-2 ring-offset-background",
          {
            "outline-none ring-2 ring-ring ring-offset-2": isFocused,
          },
        )}
        onSubmit={handleSubmit}
      >
        <FormField
          name="query"
          render={({ field }) => (
            <div ref={containerRef} className="w-full">
              <Editor
                forwardRef={editorRef}
                width="100%"
                theme="hc-black"
                value={decodeURIComponent(field.value)}
                options={monacoOptions}
                language="sql"
                onChange={(value) => {
                  field.onChange(encodeURIComponent(value));
                  updateHeight();
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                  updateHeight();

                  editor.onDidFocusEditorText(() => {
                    setIsFocused(true);
                  });

                  editor.onDidBlurEditorText(() => {
                    setIsFocused(false);
                  });
                }}
                loading={null}
              />
            </div>
          )}
        />

        <Button className="absolute bottom-1 right-1 h-8 px-4" type="submit">
          <PlayIcon className="mr-1.5 h-3 w-3" /> Run
        </Button>
      </form>
    </Form>
  );
}
