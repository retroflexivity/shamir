import React, { useState, useRef, useEffect } from "react";
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  
  // Check if we're on the homepage
  const normalizedPath = currentPath.replace(/\/$/, ''); // Remove trailing slash
  const isHomepage = normalizedPath === '' || normalizedPath === `/${locale}`;
  
  // Focus input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);
  
  // Handle form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const archivePath = getLocalizedPath('/archive', locale);
      const searchParam = encodeURIComponent(searchQuery.trim());
      window.location.href = `${archivePath}?search=${searchParam}`;
    }
  };
  
  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node) &&
        !searchQuery.trim()
      ) {
        setIsSearchExpanded(false);
      }
    };
    
    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSearchExpanded, searchQuery]);
  
  return (
    <header className="flex justify-between items-center mb-6 mt-8">
      <div className="flex items-center gap-4">
        {isHomepage && t && (
          <form
            ref={searchFormRef}
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
            onClick={(e) => {
              if (!isSearchExpanded) {
                e.preventDefault();
                setIsSearchExpanded(true);
              }
            }}
          >
            <div
              className={`btn h-10 transition-all duration-300 ease-in-out ${
                isSearchExpanded 
                  ? 'w-64 sm:w-80 min-w-0'
                  : 'w-10 h-10 p-0 min-w-[2.5rem]'
              } flex items-center justify-center overflow-hidden relative`}
            >
              {isSearchExpanded ? (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search}
                    className="w-full bg-transparent border-none outline-none text-lightfg dark:text-darkfg placeholder-lightfg/60 dark:placeholder-darkfg/60 px-2 pr-10"
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      // Don't collapse if there's text
                      if (!searchQuery.trim()) {
                        // Small delay to allow form submission to fire first
                        setTimeout(() => {
                          if (document.activeElement !== e.target) {
                            setIsSearchExpanded(false);
                          }
                        }, 200);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t.search}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label={t.search}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
          </form>
        )}
        {showBackButton && t ? (
          <a
            href={backHref}
            className="btn w-auto hidden sm:inline-flex"
          >
            {t.backToHome}
          </a>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        {t && <LanguageSwitcher currentLocale={locale} currentPath={currentPath} />}
        <ThemeToggle key="theme-toggle" />
      </div>
    </header>
  );
}
