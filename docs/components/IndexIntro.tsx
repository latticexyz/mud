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
            <p>Please note that MUD v2 is still under development and some APIs may change!</p>
            <p>
              If you're here for the{" "}
              <a href="https://ethglobal.com/events/autonomous" target="_blank" style={{ textDecoration: "underline" }}>
                Autonomous Worlds Hackathon
              </a>
              , we recommend you get familiar with the high-level concepts and check back here when the hackathon
              starts.
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
