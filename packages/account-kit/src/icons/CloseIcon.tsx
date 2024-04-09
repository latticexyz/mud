import { IconSVG, Props } from "./IconSVG";

export function CloseIcon(props: Props) {
  return (
    <IconSVG strokeWidth="2" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </IconSVG>
  );
}
