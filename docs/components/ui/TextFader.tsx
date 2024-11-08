"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TextFaderProps {
  texts: string[];
  interval?: number;
}

export default function TextFader({ texts, interval = 3000 }: TextFaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (texts.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);

      console.log(currentIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  if (texts.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-[29px] font-bold uppercase font-mono"
          >
            {texts[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
