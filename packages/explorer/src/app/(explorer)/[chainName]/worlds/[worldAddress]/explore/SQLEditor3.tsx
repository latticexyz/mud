import { useQueryState } from "nuqs";
import React from "react";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";

// Define the schema
const schema = {
  users: ["id", "username", "email", "created_at"],
  posts: ["id", "user_id", "title", "content", "published_at"],
  comments: ["id", "post_id", "user_id", "content", "created_at"],
  world__FunctionSignatur: ["functionSelector", "functionSignature", "asd"],
};

export function SQLEditor3() {
  const [query, setQuery] = useQueryState("query");
  const onChange = React.useCallback(
    (val, viewUpdate) => {
      console.log("val:", val);
      setQuery(val);
    },
    [setQuery],
  );

  return (
    <CodeMirror
      value={query || ""}
      height="100px"
      extensions={[
        sql({
          dialect: PostgreSQL,
          upperCaseKeywords: true,
          schema: schema,
          defaultTable: "world__FunctionSignatur",
        }),
      ]}
      onChange={onChange}
      theme="dark"
      basicSetup={{
        lineNumbers: false,
      }}
    />
  );
}
