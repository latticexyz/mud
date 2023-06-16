import { useTheme } from "nextra-theme-docs";

export default function NavLogo() {
  const { resolvedTheme } = useTheme();
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>
      {/* TODO: figure out how to size Logo and use that here instead */}
      <img
        src={resolvedTheme === "light" ? "/logo512-black.png" : "/logo512-white.png"}
        style={{ height: "calc(var(--nextra-navbar-height) - 25px)" }}
        alt="MUD logo"
      />
      <p style={{ fontWeight: "bold", fontSize: "25px", marginTop: "6px", paddingLeft: "4px" }}>MUD</p>
    </div>
  );
}
