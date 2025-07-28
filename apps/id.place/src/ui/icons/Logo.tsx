import { IconSVG, Props } from "./IconSVG";

export function Logo(props: Props) {
  return (
    <IconSVG shape-rendering="crispEdges" {...props}>
      <path d="M2 3H0v18h24V3H2zm20 2v14H2V5h20zM10 7H6v4h4V7zm-6 6h8v4H4v-4zm16-6h-6v2h6V7zm-6 4h6v2h-6v-2zm6 4h-6v2h6v-2z" />
    </IconSVG>
  );
}
