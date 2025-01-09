"use client";

import { CommandIcon, CornerDownLeft } from "lucide-react";
import { KeyCode, KeyMod, editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import Editor from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
import { cn } from "../../../../../../utils";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { monacoOptions } from "./consts";
import { useMonacoSuggestions } from "./useMonacoSuggestions";
import { useQueryValidator } from "./useQueryValidator";

type Props = {
  table?: Table;
};

export function SQLEditor({ table }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const validateQuery = useQueryValidator(table);
  const { data } = useTableDataQuery({ table, query });
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
                  editor.addAction({
                    id: "executeSQL",
                    label: "Execute SQL command",
                    keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
                    run: () => {
                      handleSubmit();
                    },
                  });

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

        <div className="absolute bottom-1 right-1 flex items-center gap-2">
          {data?.executionTime && (
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-success" />
              <span>{Math.round(data.executionTime)}ms</span>
            </span>
          )}

          <Button className="ml-2 h-8 gap-2 pl-4 pr-3" type="submit">
            Run
            <span className="flex items-center gap-0.5 text-white/60">
              {navigator.platform.toLowerCase().includes("mac") ? (
                <>
                  <CommandIcon className="h-3 w-3" />
                  <CornerDownLeft className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span className="text-xs">CTRL</span>
                  <CornerDownLeft className="h-3 w-3" />
                </>
              )}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  );
}
