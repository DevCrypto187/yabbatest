"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  showConfirm?: boolean;
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
  showConfirm = true,
}: AlertDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity backdrop-blur-sm duration-300 select-none outline-none ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-90" />
      <div
        className={`relative max-w-[90%] rounded-lg border-none text-center p-4 transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        } flex flex-col items-center`}
      >
        <div className="flex flex-col items-center select-none outline-none">
          <p
            className={`text-white font-lilita text-[32px] ${showConfirm ? "max-w-[250px]" : "max-w-[300px]"} text-shadow-yb`}
          >
            {message}
          </p>
        </div>
      </div>

      <div className="fixed bottom-10 flex flex-col gap-4">
        {showConfirm && (
          <button onClick={onConfirm}>
            <Image
              alt="btn-confirm"
              src="/images/vector/btn-confirm.png"
              width={266}
              height={38}
              unoptimized
            />
          </button>
        )}
        <button onClick={onClose}>
          <Image
            alt="btn-cancel"
            src="/images/vector/btn-exit.png"
            width={266}
            height={38}
            unoptimized
          />
        </button>
      </div>
    </div>
  );
}
