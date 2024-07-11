import { Children, ReactNode } from "react";

export type Props = {
  children: ReactNode;
  separator: ReactNode;
};

export function Join({ children, separator }: Props) {
  return Children.map(children, (child, i) => (
    <>
      {i > 0 ? separator : null}
      {child}
    </>
  ));
}
