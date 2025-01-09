import { DetailedHTMLProps, SVGAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type Props = DetailedHTMLProps<SVGAttributes<SVGSVGElement>, SVGSVGElement>;

export function EthIcon({ className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 263 428"
      fill="currentColor"
      className={twMerge("w-[0.6em] h-[1em]", className)}
      {...props}
    >
      <path d="M132 321V428L263 243L132 321Z" />
      <path d="M0 243L132 321V428" fillOpacity="0.5" />
      <path d="M132 0V296L263 218" />
      <path d="M0 218L132 296V0L0 218Z" fillOpacity="0.5" />
    </svg>
  );
}
