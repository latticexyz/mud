type Props = {
  error: unknown;
};

export function ErrorTrace({ error }: Props) {
  return (
    <div className="font-mono text-xs whitespace-pre overflow-auto bg-red-900/50 text-white p-4 rounded">
      {error instanceof Error ? error.stack : String(error)}
    </div>
  );
}
