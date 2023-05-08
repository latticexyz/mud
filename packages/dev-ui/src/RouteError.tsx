import { useRouteError } from "react-router-dom";

export function RouteError() {
  const error = useRouteError();
  return (
    <>
      <div className="p-6">
        Whoops, something broke! Please{" "}
        <a
          href={`https://github.com/latticexyz/mud/issues/new?${new URLSearchParams({
            body: `
**Steps to reproduce**

1. Go to …
2. Click on …
3. Scroll down to …
4. See error

**Expected behavior**

A clear and concise description of what you expected to happen.

**Error**
\`\`\`
${error instanceof Error ? error.stack : String(error)}
\`\`\`
`,
          })}`}
          target="_blank"
          className="text-white underline"
        >
          report the issue
        </a>{" "}
        so we can look into it.
      </div>
      <div className="p-6 whitespace-pre overflow-auto font-mono bg-red-900/60 text-white">
        {error instanceof Error ? error.stack : String(error)}
      </div>
    </>
  );
}
