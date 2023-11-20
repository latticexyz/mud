import { IconSVG, Props } from "./IconSVG";

export function ChangelogIcon(props: Props) {
  return (
    <IconSVG viewBox="0 0 34 34" fill="none" {...props}>
      <path d="M8 7.5L8 25.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 18.5H26H25V13" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="2" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="26" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="22" y="6" width="6" height="6" stroke="currentColor" strokeWidth="2" />
    </IconSVG>
  );
}
