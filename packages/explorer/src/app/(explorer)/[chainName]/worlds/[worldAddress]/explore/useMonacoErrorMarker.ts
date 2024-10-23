import { useCallback } from "react";
import { useMonaco } from "@monaco-editor/react";

export function useMonacoErrorMarker() {
  const monaco = useMonaco();
  return useCallback(
    ({
      message,
      startLineNumber,
      endLineNumber,
      startColumn,
      endColumn,
    }: {
      message: string;
      startLineNumber: number;
      endLineNumber: number;
      startColumn: number;
      endColumn: number;
    }) => {
      if (monaco) {
        monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", [
          {
            severity: monaco.MarkerSeverity.Error,
            message,
            startLineNumber,
            endLineNumber,
            startColumn,
            endColumn,
          },
        ]);
      }
    },
    [monaco],
  );
}
