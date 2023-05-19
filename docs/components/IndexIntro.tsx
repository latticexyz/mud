import { useTheme } from "nextra-theme-docs";
import Logo from "./Logo";
import Splash from "./Splash";
import WarningBox from "./WarningBox";

export default function IndexIntro() {
  // This component wraps the Splash and Logo components, to make sure that they're only loaded once light/dark mode has been confirmed.
  // This makes sure that the correct MUD logo (light/dark-mode) is displayed

  const { resolvedTheme } = useTheme();

  return (
    <>
      <Splash theme={resolvedTheme} />
      <WarningBox
        title="MUD v2 is still in alpha"
        message={
          <>
            <p>
              Please note that MUD v2 is still under development and some APIs may change! Stay up to date with MUD core
              development, changes, and roadmap by checking out the{" "}
              <a href="https://github.com/latticexyz/mud" target="_blank" style={{ textDecoration: "underline" }}>
                Github repo
              </a>{" "}
              and join the{" "}
              <a href="https://lattice.xyz/discord" target="_blank" style={{ textDecoration: "underline" }}>
                MUD Discord
              </a>{" "}
            </p>
          </>
        }
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "200px", marginBottom: "20px" }}>
          <Logo theme={resolvedTheme} />
        </div>
      </div>
    </>
  );
}
