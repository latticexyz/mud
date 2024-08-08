import React, { ReactNode } from "react";
import styles from "./Params.module.css";

type ParamsProps = {
  title?: string;
  children: ReactNode;
};

export function Params({ title, children }: ParamsProps) {
  return (
    <>
      {title ? <div className={styles.title}>{title}</div> : null}
      <dl className={styles.list}>{children}</dl>
    </>
  );
}

type ParamProps = {
  name: string;
  children: ReactNode;
};

export function Param({ name, children }: ParamProps) {
  return (
    <>
      <dt className={styles.term}>{name}</dt>
      <dd className={styles.definition}>{children}</dd>
    </>
  );
}
