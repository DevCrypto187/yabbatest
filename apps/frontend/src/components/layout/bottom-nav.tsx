"use client";

import Link from "next/link";
import Image from "next/image";

const navItems = [
  {
    path: "/",
    icon: "/images/vector/menu-home.png",
  },
  {
    path: "/task",
    icon: "/images/vector/menu-task.png",
  },
  {
    path: "/rank",
    icon: "/images/vector/menu-rank.png",
  },
  {
    path: "/invite",
    icon: "/images/vector/menu-invite.png",
  },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-5 px-0 py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="w-[70px] h-[70px] flex items-center justify-center"
          >
            <Image
              src={item.icon}
              alt="Navigation Icon"
              width={70}
              unoptimized
              height={70}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
