"use client";

import { useEffect } from "react";
import { createRelay } from "../../../monitor/relay";

export function Relay() {
  useEffect(createRelay, []);
  return null;
}
