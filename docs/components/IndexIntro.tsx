import { useTheme } from "nextra-theme-docs";
import Logo from "./Logo";
import Splash from "./Splash";

export default function IndexIntro() {
  // This component wraps the Splash and Logo components, to make sure that they're only loaded once light/dark mode has been confirmed.
  // This makes sure that the correct MUD logo (light/dark-mode) is displayed

  const { resolvedTheme } = useTheme();

  return (
    <>
      <Splash theme={resolvedTheme} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "200px", marginBottom: "20px" }}>
          <Logo theme={resolvedTheme} />
        </div>
      </div>
    </>
  );
}
