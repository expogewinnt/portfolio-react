"use client";

import type { ButtonHTMLAttributes } from "react";

type ConfirmDeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  label?: string;
};

export function ConfirmDeleteButton({
  className,
  label = "Delete",
  ...props
}: ConfirmDeleteButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm("この作品を削除します。よろしいですか？")) {
          event.preventDefault();
        }

        props.onClick?.(event);
      }}
    >
      {label}
    </button>
  );
}
