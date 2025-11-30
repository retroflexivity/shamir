# Multilingual Setup Guide

This Astro website now supports three languages: Russian (ru), Latvian (lv), and English (en).

## How It Works

### Routing
- **Russian (default)**: `/` - No prefix needed
- **Latvian**: `/lv`
- **English**: `/en`

All pages automatically support all three languages:
- Home: `/`, `/lv`, `/en`
- Archive: `/archive`, `/lv/archive`, `/en/archive`
- Articles: `/[slug]`, `/lv/[slug]`, `/en/[slug]`

### Content Organization

Each article in `src/content/articles/` must include a `locale` field in its frontmatter:

```yaml
---
id: "0"
title: "Article Title"
locale: "ru"  # Required: "ru", "lv", or "en"
tags: ['Tag1']
date: 2016-03-18
---
```

### Adding Translations

1. **UI Strings**: Edit `src/i18n/translations.ts` to add or modify translations
2. **Articles**: Create separate markdown files for each language version of an article, or use the same file with different locale values

### Language Switcher

A language switcher is automatically displayed in the header on all pages, allowing users to switch between languages while maintaining their current page context.

### Example: Adding a New Article

**Russian version** (`src/content/articles/100.md`):
```yaml
---
id: "100"
title: "Новая статья"
locale: "ru"
tags: ['Новости']
date: 2024-01-01
---
Содержание статьи на русском языке.
```

**Latvian version** (`src/content/articles/100-lv.md`):
```yaml
---
id: "100"
title: "Jauns raksts"
locale: "lv"
tags: ['Ziņas']
date: 2024-01-01
---
Raksta saturs latviešu valodā.
```

**English version** (`src/content/articles/100-en.md`):
```yaml
---
id: "100"
title: "New Article"
locale: "en"
tags: ['News']
date: 2024-01-01
---
Article content in English.
```

Note: All three versions share the same `id` but have different `locale` values. This allows them to be linked together if needed.

### Current Status

- ✅ All UI strings are translatable
- ✅ Language switcher component
- ✅ Locale-aware routing
- ✅ Content filtering by locale
- ⚠️ **Action Required**: Add `locale: "ru"` (or "lv"/"en") to all existing articles in `src/content/articles/`

### Next Steps

1. Add `locale: "ru"` to all existing Russian articles
2. Create Latvian and English translations for articles
3. Update any hardcoded text in components (if any remain)
4. Test all three language versions
