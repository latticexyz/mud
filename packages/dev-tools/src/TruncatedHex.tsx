import { Hex } from "viem";

type Props = {
  hex: Hex;
};

export function TruncatedHex({ hex }: Props) {
  if (hex.length <= 10) {
    return <span>{hex}</span>;
  }

  return (
    <span>
      <span className="after:content-['…'] after:select-none">{hex.slice(0, 6)}</span>
      <span className="tracking-[-1ch] text-transparent">{hex.slice(6, -4)}</span>
      {hex.slice(-4)}
    </span>
  );
}
