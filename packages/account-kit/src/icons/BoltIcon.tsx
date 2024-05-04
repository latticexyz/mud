import { IconSVG, Props } from "./IconSVG";

export function BoltIcon(props: Props) {
  return (
    <IconSVG fill="none" {...props}>
      <path
        d="M13 10V3L4 14H11L11 21L20 10L13 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSVG>
  );
}
