# Translation Scraper

This script scrapes English and Latvian translations of articles from `shamir.lv` and `rglhm.lv`.

## Usage

```bash
npm run scrape-translations
```

## How it works

1. **Reads all articles** from `src/content/articles/`
2. **Extracts the `oldUrl` field** from each article's frontmatter
3. **Determines translation URLs**:
   - For `shamir.lv`: Adds `?lang=en` or `?lang=lv` query parameter
   - For `rglhm.lv`: Replaces `/ru/` with `/en/` or `/lv/` in the path
4. **Scrapes the content** (title, body, tags, date, image) from the translated pages
5. **Creates new article files** with the translated content:
   - Format: `{articleId}-en.md` and `{articleId}-lv.md`
   - Includes proper frontmatter with `locale` field set

## Features

- **Respectful scraping**: 1 second delay between requests
- **Error handling**: Skips articles that fail to scrape
- **Duplicate prevention**: Skips if translation file already exists
- **HTML to Markdown**: Converts scraped HTML to Markdown format
- **Date parsing**: Extracts and formats dates from various formats

## Output

The script will:
- Create `{id}-en.md` files for English translations
- Create `{id}-lv.md` files for Latvian translations
- Print progress and summary statistics

## Notes

- The script respects existing translation files and won't overwrite them
- Articles without `oldUrl` are skipped
- Articles that already have a non-Russian `locale` are skipped (assumed to be translations)
- Failed scrapes are logged but don't stop the process
