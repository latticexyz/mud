import { isValidElement, cloneElement, Children } from "react";
import { twMerge } from "tailwind-merge";

// We use this in place of Radix's `Slot` because it's missing the ability to merge class names in a way that is Tailwind friendly
// See https://github.com/radix-ui/primitives/issues/2631

export type AsChildProps<DefaultElementProps> =
  | ({ asChild?: false } & DefaultElementProps)
  | { asChild: true; children: React.ReactNode };

export function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
}) {
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ...children.props,
      style: {
        ...props.style,
        ...children.props.style,
      },
      className: twMerge(props.className, children.props.className),
    });
  }

  if (Children.count(children) > 1) {
    Children.only(null);
  }

  return null;
}
