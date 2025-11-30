import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Translations, Locale } from "../i18n/translations";
import { getLocalizedPath } from "../i18n/utils";

interface HeaderProps {
  showBackButton?: boolean;
  locale?: Locale;
  translations?: Translations;
  currentPath?: string;
}

export function Header({ showBackButton = false, locale = 'ru', translations, currentPath = '/' }: HeaderProps) {
  const t = translations;
  const backHref = getLocalizedPath('/', locale);
  
  return (
    <header className="flex justify-between items-center mb-6 mt-8">
      <div className="flex items-center gap-4">
        {showBackButton && t ? (
          <a
            href={backHref}
            className="btn w-auto hidden sm:inline-flex"
          >
            {t.backToHome}
          </a>
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {t && <LanguageSwitcher currentLocale={locale} currentPath={currentPath} />}
        <ThemeToggle key="theme-toggle" />
      </div>
    </header>
  );
}
