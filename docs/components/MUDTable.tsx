import React, { ReactNode } from "react";
import styles from "./MUDTable.module.css";

type Props = {
  children: ReactNode;
};

export function MUDTable({ children }: Props) {
  return <table className={styles.table}>{children}</table>;
}
