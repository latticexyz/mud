import { IconSVG, Props } from "./IconSVG";

export function CalendarIcon(props: Props) {
  return (
    <IconSVG viewBox="0 0 34 34" fill="none" {...props}>
      <path d="M32 32H2V2H32V32Z" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="6" width="6" height="6" fill="currentColor" />
      <rect x="6" y="14" width="6" height="6" fill="currentColor" />
      <rect opacity="0.5" x="6" y="22" width="6" height="6" fill="currentColor" />
      <rect x="14" y="6" width="6" height="6" fill="currentColor" />
      <rect opacity="0.5" x="14" y="14" width="6" height="6" fill="currentColor" />
      <rect opacity="0.5" x="14" y="22" width="6" height="6" fill="currentColor" />
      <rect x="22" y="6" width="6" height="6" fill="currentColor" />
      <rect opacity="0.5" x="22" y="14" width="6" height="6" fill="currentColor" />
      <rect opacity="0.5" x="22" y="22" width="6" height="6" fill="currentColor" />
    </IconSVG>
  );
}
