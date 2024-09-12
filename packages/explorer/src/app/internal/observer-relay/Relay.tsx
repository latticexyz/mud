"use client";

import { useEffect } from "react";
import { createRelay } from "../../../observer/relay";

export function Relay() {
  useEffect(createRelay, []);
  return null;
}
