import React from "react";

const WarningBox = ({ title, message }) => {
  const styles = {
    container: {
      backgroundColor: "#ffebee",
      borderRadius: "4px",
      boxShadow: "0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12)",
      padding: "12px 20px",
      margin: "16px 0",
      color: "#b71c1c",
    },
    header: {
      display: "flex",
      alignItems: "center",
      fontSize: "1rem",
      fontWeight: "bold",
      lineHeight: "1.43",
      letterSpacing: "0.01071em",
    },
    icon: {
      marginRight: "12px",
      fontSize: "22px",
    },
    message: {
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "1.43",
      letterSpacing: "0.01071em",
      paddingLeft: "34px",
    },
  };

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
