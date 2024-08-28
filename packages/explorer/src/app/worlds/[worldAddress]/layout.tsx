"use client";

import { Navigation } from "../../../components/Navigation";

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navigation />
      {children}
    </div>
  );
}
