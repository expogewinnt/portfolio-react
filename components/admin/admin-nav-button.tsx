"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes } from "react";

type AdminNavButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href: string;
  label: string;
};

export function AdminNavButton({ href, label, onClick, ...props }: AdminNavButtonProps) {
  const router = useRouter();

  return (
    <button
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }

        router.push(href);
      }}
    >
      {label}
    </button>
  );
}
