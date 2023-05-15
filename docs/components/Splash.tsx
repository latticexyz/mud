import React, { useState, useEffect } from "react";
import styles from "./Splash.module.css";

const Splash = ({ theme }) => {
  const [isSplashOpen, setSplashOpen] = useState(false);
  const [display, setDisplay] = useState(false);

  // Effect to only show Splash once the theme has been loaded, so that the light/dark theme logo can display properly underneath
  useEffect(() => {
    if (theme) {
      setSplashOpen(true);
    }
  }, [theme]);

  // Effect to set a flag in localstorage if splash screen hasn't been displayed
  useEffect(() => {
    const key = "ethglobal-aw-2023-splash-displayed";
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, "true");
      setDisplay(true);
    }
  }, []);

  const closeSplash = () => {
    setSplashOpen(false);
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  if (!isSplashOpen) return null;

  return (
    display && (
      <div className={styles.splashOverlay} onClick={closeSplash}>
        <div className={styles.splashContent} onClick={stopPropagation}>
          <button className={styles.splashClose} onClick={closeSplash}>
            &times;
          </button>
          <div>
            <div className={styles.content}>
              <img src="/aw-logo.png" alt="Logo" className={styles.logo} />
              <h2 className={styles.date}>May 18 - 26, 2023</h2>
              <h1 className={styles.title}>Autonomous Worlds Hackathon</h1>
              <a href="https://ethglobal.com/events/autonomous" target="_blank" className={styles.signupButton}>
                Sign-up now
              </a>
              <hr className={styles.separator} />
              <div className={styles.info}>
                <span role="img" aria-label="book">
                  💡
                </span>
                <p>
                  If you’re already signed-up, check out the docs and browse some of our{" "}
                  <a href="/ethglobal-hackathon">hackathon ideas</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Splash;
