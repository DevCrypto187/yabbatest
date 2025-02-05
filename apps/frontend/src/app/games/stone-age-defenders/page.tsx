"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function StoneAgeDefenders() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  // const [showRotatePrompt, setShowRotatePrompt] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    // Handle fullscreen and resize events
    const handleResize = () => {
      if (iframeRef.current) {
        iframeRef.current.style.height = `${window.innerHeight}px`;
      }
      checkOrientation();
    };

    window.addEventListener("resize", handleResize);
    checkOrientation(); // Initial check
    handleResize(); // Initial resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {isPortrait && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white p-4">
          <svg
            className="w-16 h-16 mb-4 animate-bounce"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z" />
          </svg>
          <p className="text-center text-xl font-bold mb-2">
            Please Rotate Your Device
          </p>
          <p className="text-center text-sm mb-4">
            For the best experience, please rotate your device <br /> to
            landscape mode
          </p>
          {/* <button
            onClick={() => setShowRotatePrompt(false)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Continue Anyway
          </button> */}

          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      )}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src="/games/stone-age-defenders/index.html"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          title="Stone Age Defenders"
          loading="eager"
          allow="fullscreen; autoplay"
        />
      </div>
    </div>
  );
}
