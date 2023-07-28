import React from "react";

const WarningBox = ({ title, message }) => {
  const styles = {
    container: {
      backgroundColor: "#FDF2F3",
      borderRadius: "4px",
      border: "1px solid #E8D9DA",
      padding: "12px 20px",
      margin: "16px 0",
      color: "#7D221C",
    },
    header: {
      display: "flex",
      alignItems: "center",
      fontSize: "1rem",
      fontWeight: "bold",
      lineHeight: "1.43",
    },
    icon: {
      marginRight: "12px",
      fontSize: "22px",
    },
    message: {
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "1.43",
      paddingLeft: "34px",
      color: "#995A56",
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
