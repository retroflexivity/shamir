import React from "react";
import { locales, localeNames, type Locale } from "../i18n/translations";
import { getLocalizedPath, removeLocaleFromPath } from "../i18n/utils";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  currentPath: string;
}

export function LanguageSwitcher({ currentLocale, currentPath }: LanguageSwitcherProps) {
  // Remove locale prefix from current path to get the base path
  const basePath = removeLocaleFromPath(currentPath);
  
  return (
    <div className="flex gap-2 items-center">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;
        const href = getLocalizedPath(basePath, locale);
        
        return (
          <a
            key={locale}
            href={href}
            className={`px-2 py-1 rounded font-sans transition-colors ${
              isActive
                ? "bg-lightaccent dark:bg-darkaccent text-lightbg dark:text-darkbg font-semibold"
                : "hover:bg-lightfg/10 dark:hover:bg-darkfg/10"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {localeNames[locale]}
          </a>
        );
      })}
    </div>
  );
}
