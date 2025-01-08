"use client";

import { PlayIcon } from "lucide-react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { Parser } from "node-sql-parser";
import { parseAsInteger, useQueryState } from "nuqs";
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

const sqlParser = new Parser();

type Props = {
  table?: Table;
};

export function SQLEditor({ table }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });

  // TODO: update offset/limit based on page/pageSize
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const validateQuery = useQueryValidator(table);
  useMonacoSuggestions(table);

  const form = useForm({
    defaultValues: {
      query,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (validateQuery(data.query)) {
      setQuery(data.query);
    }
  });

  useEffect(() => {
    form.reset({ query });
  }, [query, form]);

  useEffect(() => {
    const offset = page * pageSize;
    const limit = pageSize;
    const decodedQuery = decodeURIComponent(query);

    const ast = sqlParser.astify(decodedQuery);
    console.log(ast);

    // Only modify if we have a valid AST array with at least one query
    if ("limit" in ast) {
      ast.limit = {
        seperator: "offset",
        value: [
          { type: "number", value: limit },
          { type: "number", value: offset },
        ],
      };

      // Generate the new SQL query from the modified AST
      const updatedQuery = sqlParser.sqlify(ast, {
        database: "Postgresql",
      });

      // TODO: temporary fix for double-quotes while testing
      setQuery(updatedQuery.replace('"world__FunctionSelector"', "world__FunctionSelector"));
    }
  }, [table, page, pageSize, setQuery, query]);

  const updateHeight = () => {
    if (editorRef.current) {
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
        className={cn("relative w-full rounded-md border bg-black px-3 py-2 ring-offset-background", {
          "outline-none ring-2 ring-ring ring-offset-2": isFocused,
        })}
        onSubmit={handleSubmit}
      >
        <FormField
          name="query"
          render={({ field }) => (
            <div ref={containerRef} className="min-h-[21px] w-full">
              <Editor
                width="100%"
                theme="hc-black"
                value={decodeURIComponent(field.value)}
                options={monacoOptions}
                language="sql"
                onChange={(value) => field.onChange(encodeURIComponent(value ?? ""))}
                onMount={(editor) => {
                  editorRef.current = editor;

                  updateHeight();
                  editor.onDidContentSizeChange(updateHeight);
                  editor.onDidFocusEditorText(() => setIsFocused(true));
                  editor.onDidBlurEditorText(() => setIsFocused(false));
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
