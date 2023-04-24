import { useTheme } from "nextra-theme-docs";

export default function Logo() {
  const { resolvedTheme } = useTheme();
  return <img src={resolvedTheme === "light" ? "/logo512-black.png" : "logo512-white.png"} alt="MUD logo" />;
}
