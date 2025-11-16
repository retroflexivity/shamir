import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Check localStorage first, then DOM as fallback
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const checkTheme = () => {
      // Check both DOM and localStorage to be sure
      const hasDarkClass = document.documentElement.classList.contains('dark');
      const savedTheme = localStorage.getItem('theme');
      const isDarkMode = hasDarkClass || savedTheme === 'dark';
      setIsDark(isDarkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const currentIsDark = document.documentElement.classList.contains('dark');
    console.log(currentIsDark)
    const newTheme = currentIsDark ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
    setIsDark(newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn p-2 shadow-md"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon for light mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
