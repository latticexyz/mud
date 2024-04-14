import { IconSVG, Props } from "./IconSVG";

export function CloseIcon(props: Props) {
  return (
    <IconSVG strokeWidth="2" stroke="currentColor" {...props}>
      <path
        d="M6 18L18 6M6 6L18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSVG>
  );
}
