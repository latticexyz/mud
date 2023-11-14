import { useTheme } from "nextra-theme-docs";

export default function NavLogo() {
  const { resolvedTheme } = useTheme();
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>
      {/* TODO: figure out how to size Logo and use that here instead */}
      <img
        src={resolvedTheme === "light" ? "/logo512-black.svg" : "/logo512-white.svg"}
        style={{ height: "calc(var(--nextra-navbar-height) - 35px)" }}
        alt="MUD logo"
      />
    </div>
  );
}
