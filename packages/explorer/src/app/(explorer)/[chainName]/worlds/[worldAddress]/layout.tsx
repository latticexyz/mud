"use client";

import { Navigation } from "../../../../../components/Navigation";
import { Providers } from "./Providers";

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navigation />
      {children}
    </Providers>
  );
}
