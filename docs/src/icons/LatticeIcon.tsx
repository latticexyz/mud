import { DetailedHTMLProps, SVGAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type Props = DetailedHTMLProps<SVGAttributes<SVGSVGElement>, SVGSVGElement>;

export function LatticeIcon({ className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
      className={twMerge("-my-[0.125em] h-[1.25em] w-[1.25em]", className)}
      {...props}
    >
      <path opacity=".5" d="M0 8h1V7H0z" />
      <path d="M5 8h1V7H5zM2 8h1V7H2zM2 4h1V3H2zM2 5h1V4H2z" />
      <path opacity=".5" d="M7 8h1V7H7z" />
      <path opacity=".75" d="M1 8h1V7H1zM6 8h1V7H6zM0 7h1V6H0zM0 2h1V1H0z" />
      <path d="M5 7h1V6H5zM5 2h1V1H5zM2 7h1V6H2zM2 2h1V1H2z" />
      <path opacity=".75" d="M7 7h1V6H7zM7 2h1V1H7z" />
      <path d="M0 6h1V5H0zM0 3h1V2H0z" />
      <path opacity=".5" d="M0 1h1V0H0z" />
      <path d="M5 6h1V5H5zM5 3h1V2H5zM5 5h1V4H5zM5 4h1V3H5zM5 1h1V0H5zM1 6h1V5H1zM1 3h1V2H1z" />
      <path opacity=".75" d="M1 1h1V0H1z" />
      <path d="M6 6h1V5H6zM6 3h1V2H6z" />
      <path opacity=".75" d="M6 1h1V0H6z" />
      <path d="M2 6h1V5H2zM2 3h1V2H2zM3 6h1V5H3zM3 3h1V2H3zM4 6h1V5H4zM4 3h1V2H4zM2 1h1V0H2zM7 6h1V5H7zM7 3h1V2H7z" />
      <path opacity=".5" d="M7 1h1V0H7z" />
    </svg>
  );
}
