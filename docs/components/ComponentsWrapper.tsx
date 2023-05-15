import { useTheme } from "nextra-theme-docs";
import Logo from "./Logo";
import Splash from "./Splash";
import WarningBox from "./WarningBox";

export default function ComponentsWrapper() {
  // This component wraps the Splash and Logo components, to make sure that they're only loaded once light/dark mode has been confirmed.
  // This makes sure that the correct MUD logo (light/dark-mode) is displayed

  const { resolvedTheme } = useTheme();

  return (
    <>
      <Splash theme={resolvedTheme} />
      <WarningBox
        title="MUD v2 is still in alpha"
        message="Please note that MUD v2 is still under development! Quick start templates are not yet available and some APIs may change. If you're here for the Autonomous Worlds Hackathon, we recommend you get familiar with the high-level concepts and check back here when the hackathon starts"
      />
      <div align="center">
        <div style={{ width: "200px", marginBottom: "20px" }}>
          <Logo theme={resolvedTheme} />
        </div>
      </div>
    </>
  );
}
