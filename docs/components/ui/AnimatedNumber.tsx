"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  targetNumber: number;
  duration?: number;
}

export default function AnimatedNumber({ targetNumber = 100, duration = 2 }: AnimatedNumberProps) {
  const [isClient, setIsClient] = useState(false);
  const springValue = useSpring(0, { duration: duration * 1000 });
  const displayValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    setIsClient(true);
    springValue.set(targetNumber);
  }, [targetNumber, springValue]);

  if (!isClient) {
    return null;
  }

  return <motion.div>{displayValue}</motion.div>;
}
