import React from "react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  showBackButton?: boolean;
}

export function Header({ showBackButton = false }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 mt-8">
      {showBackButton ? (
        <a
          href="/"
          className="btn w-auto hidden sm:inline-flex"
        >
          ← Вернуться на главную
        </a>
      ) : (
        <div></div>
      )}
      <ThemeToggle key="theme-toggle" />
    </header>
  );
}
