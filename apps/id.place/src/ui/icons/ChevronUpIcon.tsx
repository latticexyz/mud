import { IconSVG, Props } from "./IconSVG";

export function ChevronUpIcon(props: Props) {
  return (
    <IconSVG viewBox="0 0 16 16" {...props}>
      <path
        fillRule="evenodd"
        d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z"
        clipRule="evenodd"
      />
    </IconSVG>
  );
}
