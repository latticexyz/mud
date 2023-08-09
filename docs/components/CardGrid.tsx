import React from "react";
import Card from "./Card";
import styles from "./CardGrid.module.css"; // Import the CSS module
import Link from "next/link";

const CardGrid = ({ cards }) => {
  return (
    <div className={styles.cardGrid}>
      {cards.map((card, index) => (
        <Link key={index} href={card.link} target={card.target}>
          <Card key={index} title={card.title} text={card.content} iconSVG={card.icon} />
        </Link>
      ))}
    </div>
  );
};

export default CardGrid;
