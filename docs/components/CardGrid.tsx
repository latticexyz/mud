import React from "react";
import styles from "./CardGrid.module.css"; // Import the CSS module

const CardGrid = ({ children }) => {
  return <div className={styles.cardGrid}>{children}</div>;
};

export default CardGrid;
