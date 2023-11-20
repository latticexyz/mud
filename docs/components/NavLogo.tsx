export default function NavLogo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25em",
        fontSize: "32px",
        fontFamily: "PP Supply Mono",
        textTransform: "uppercase",
      }}
    >
      {/* TODO: figure out how to size Logo and use that here instead */}
      <img
        src="/images/logos/mud-white.svg"
        style={{ height: "calc(var(--nextra-navbar-height) - 35px)" }}
        alt="MUD logo"
      />
      MUD
    </div>
  );
}
