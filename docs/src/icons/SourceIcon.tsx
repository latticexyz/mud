import { IconSVG, Props } from "./IconSVG";

export function SourceIcon(props: Props) {
  return (
    <IconSVG viewBox="0 0 34 34" fill="none" {...props}>
      <path d="M2 28V6H32V28H2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11L12 15L8 19" stroke="currentColor" strokeWidth="2" />
      <path opacity="0.5" d="M14.5 22H24.5" stroke="currentColor" strokeWidth="2" />
    </IconSVG>
  );
}
