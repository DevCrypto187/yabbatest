"use client";
import { useState, useEffect } from "react";

export function useScreenHeight() {
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    // Set initial height
    setScreenHeight(window.innerHeight);

    // Update height on resize
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenHeight;
}
