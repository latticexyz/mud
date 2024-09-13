import { Providers } from "./Providers";

// TODO: might not be needed, or could be moved elsewhere
export default function WorldsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Providers>{children}</Providers>;
}
