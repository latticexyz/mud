import { DetailedHTMLProps, SVGAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type Props = DetailedHTMLProps<SVGAttributes<SVGSVGElement>, SVGSVGElement>;

export function Logo({ className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
      className={twMerge("-my-[0.125em] h-[1.25em] w-[1.25em]", className)}
      {...props}
    >
      {/* eslint-disable-next-line max-len */}
      <path d="M0 0h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm0 1h1v1H0zm1 0h1v1H1zm1 0h1v1H2zm1 0h1v1H3zm1 0h1v1H4zm1 0h1v1H5zm2-1h1v1H7zm0 1h1v1H7zM6 7h1v1H6zm1-2h1v1H7zm0-1h1v1H7zm0-1h1v1H7z" />
      <path
        d="M2 2h1v1H2zm0 1h1v1H2zm0 1h1v1H2zm0 1h1v1H2zm1-3h1v1H3zm1 0h1v1H4zm1 0h1v1H5zm0 1h1v1H5zm0 1h1v1H5zm0 1h1v1H5zM4 5h1v1H4zM3 5h1v1H3z"
        opacity=".5"
      />
      <path d="M7 2h1v1H7zm0-1h1v1H7zM1 0h1v1H1zm1 0h1v1H2zm1 0h1v1H3zm1 0h1v1H4zm1 0h1v1H5zm1 0h1v1H6zm1 0h1v1H7z" />
    </svg>
  );
}
