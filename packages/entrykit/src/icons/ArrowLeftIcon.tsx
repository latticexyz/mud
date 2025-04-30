import { IconSVG, Props } from "./IconSVG";

export function ArrowLeftIcon(props: Props) {
  return (
    <IconSVG strokeWidth="2" stroke="currentColor" {...props}>
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSVG>
  );
}
