import { DetailedHTMLProps, HTMLAttributes } from "react";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Wrap any piece of UI that needs to receive click events with this.
 * Make sure it is unmounted when the click events are no longer needed.
 */
export const ClickWrapper = (props: Props) => {
  const { children, style } = props;

  return (
    <div {...props} style={{ pointerEvents: "all", ...style }}>
      {children}
    </div>
  );
};
