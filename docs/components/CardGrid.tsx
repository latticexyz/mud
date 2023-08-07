import React from "react";
import Card from "./Card";
import styles from "./CardGrid.module.css"; // Import the CSS module

const CardGrid = ({ cards }) => {
  return (
    <div className={styles.cardGrid}>
      {cards.map((card, index) => (
        <a key={index} href={card.link} target="_blank">
          <Card key={index} title={card.title} text={card.content} iconSVG={card.icon} />
        </a>
      ))}
    </div>
  );
};

export default CardGrid;
