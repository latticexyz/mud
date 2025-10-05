import { serialize } from "../serialize";

type Props = {
  name: string;
  args: readonly unknown[] | undefined;
  viaName?: string;
};

export function WriteFunctionNameAndArgs({ name, args, viaName }: Props) {
  return (
    <>
      {name}({args?.map((value) => serialize(value)).join(", ")})
      {viaName && (
        <>
          {" "}
          <span className="text-xs text-white/40">via {viaName}</span>
        </>
      )}
    </>
  );
}
