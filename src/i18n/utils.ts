import type { Locale } from './translations';

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment === 'lv' || firstSegment === 'en') {
    return firstSegment;
  }
  
  return 'ru'; // Default locale
}

export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading/trailing slashes
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  
  // If it's the default locale (ru), don't add prefix
  if (locale === 'ru') {
    return cleanPath ? `/${cleanPath}` : '/';
  }
  
  // For other locales, add the locale prefix
  // Handle special case for root
  if (!cleanPath || cleanPath === '') {
    return `/${locale}`;
  }
  
  return `/${locale}/${cleanPath}`;
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment === 'lv' || firstSegment === 'en') {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
}
