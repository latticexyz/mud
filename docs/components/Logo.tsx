export default function Logo() {
  // TODO: switch between dark and light logo depending on color theme
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>
      <img src="/logo512.png" style={{ height: "calc(var(--nextra-navbar-height) - 25px)" }} />
      <p style={{ fontWeight: "bold", fontSize: "25px", marginTop: "6px", paddingLeft: "4px" }}>MUD</p>
    </div>
  );
}
