import React from "react";

const WarningBox = ({ title, message }) => {
  const styles = {
    container: {
      backgroundColor: "rgba(255, 118, 18, 0.2)",
      borderRadius: "4px",
      border: "none",
      padding: "12px 12px 4px 16px",
      margin: "16px 0",
      color: "white",
    },
    header: {
      display: "flex",
      alignItems: "center",
      fontSize: "1.2rem",
      fontFamily: "PP Supply Mono",
      textTransform: "uppercase",
      fontWeight: "bold",
      lineHeight: "1.5",
    },
    icon: {
      marginRight: "12px",
      fontSize: "22px",
    },
    message: {
      fontSize: "1.05rem",
      fontFamily: "Basier Circle",
      fontWeight: "400",
      lineHeight: "1.43",
      paddingLeft: "34px",
      color: "white",
    },
  } as const;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>⚠</span>
        {title}
      </div>
      <div style={styles.message}>{message}</div>
    </div>
  );
};

export default WarningBox;
