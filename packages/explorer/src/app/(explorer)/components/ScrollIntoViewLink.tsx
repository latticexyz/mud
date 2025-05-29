"use client";

import { useEffect } from "react";
import { useHashState } from "../hooks/useHashState";

type Props = {
  elementId: string;
  children: React.ReactNode;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ScrollIntoViewLink({ elementId, children, ...rest }: Props) {
  const [hash, setHash] = useHashState();

  const handleClick = () => {
    setHash(elementId);

    const url = new URL(window.location.href);
    url.hash = elementId;

    console.log(url.toString());

    navigator.clipboard.writeText(url.toString());
  };

  useEffect(() => {
    if (hash === elementId) {
      document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, elementId]);

  return (
    <a href={`#${elementId}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
