"use client";

import { useEffect } from "react";
import { useHashState } from "../hooks/useHashState";

type Props = {
  elementId: string;
  children: React.ReactNode;
  className?: string;
  copyOnClick?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ScrollIntoViewLink({ elementId, children, copyOnClick = false, ...rest }: Props) {
  const [hash, setHash] = useHashState();

  const handleClick = () => {
    setHash(elementId);

    if (copyOnClick) {
      const url = new URL(window.location.href);
      url.hash = elementId;
      navigator.clipboard.writeText(url.toString());
    }
  };

  useEffect(() => {
    if (hash === elementId) {
      document.getElementById(elementId)?.scrollIntoView();
    }
  }, [hash, elementId]);

  return (
    <a href={`#${elementId}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
