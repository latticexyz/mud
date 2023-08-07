import React from "react";
import { useState } from "react";

const Card = ({ title, text, iconSVG, link }) => {
  const [hover, setHover] = useState(false);

  const styles = {
    cardBackground: {
      display: "flex",
      padding: "16px",
      alignItems: "center",
      gap: "12px",
      flex: "1 0 0",
      borderRadius: "4px",
      border: "1px solid rgba(0, 0, 0, 0.08)",
      transition: "background-color 0.3s, color 0.3s",
      backgroundColor: hover ? "#F2F0EE" : "#FAFAF9",
    },
    cardContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
      flex: "1 0 0",
    },
    icon: {
      display: "flex",
      padding: "4px",
      alignItems: "center",
    },
    header: {
      color: "#000",
      fontFamily: "Inter",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "24px",
    },
    text: {
      color: "rgba(0, 0, 0, 0.70)",
      fontFamily: "Inter",
      fontSize: "15px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
    },
  };

  return (
    <div style={styles.cardBackground} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={styles.icon}>{iconSVG}</div>

      <div style={styles.cardContent}>
        <div style={styles.header}>{title}</div>
        <div style={styles.text}>{text}</div>
      </div>
    </div>
  );
};

export default Card;
