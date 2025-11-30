import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_DIR = path.join(__dirname, '../src/content/articles');
const DELAY_MS = 1000; // Delay between requests to be respectful

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse URL and determine translation URLs
function getTranslationUrls(originalUrl) {
  const urls = { en: null, lv: null };
  
  if (!originalUrl) return urls;
  
  try {
    const url = new URL(originalUrl);
    
    if (url.hostname.includes('shamir.lv')) {
      // shamir.lv uses ?lang= parameter
      // Handle URLs that might already have query parameters
      const separator = originalUrl.includes('?') ? '&' : '?';
      urls.en = `${originalUrl}${separator}lang=en`;
      urls.lv = `${originalUrl}${separator}lang=lv`;
    } else if (url.hostname.includes('rglhm.lv')) {
      // rglhm.lv uses subroutes - replace /ru/ with /en/ or /lv/
      if (originalUrl.includes('/ru/')) {
        urls.en = originalUrl.replace('/ru/', '/en/');
        urls.lv = originalUrl.replace('/ru/', '/lv/');
      } else {
        // If URL doesn't have /ru/, try to infer from path structure
        // This handles edge cases where URL format might be different
        console.warn(`rglhm.lv URL doesn't contain /ru/: ${originalUrl}`);
      }
    }
  } catch (e) {
    console.error(`Error parsing URL ${originalUrl}:`, e.message);
  }
  
  return urls;
}

// Parse shamir.lv article
function parseShamirArticle($, url) {
  const post = {
    title: null,
    body: null,
    tags: [],
    date: null,
    image: null,
  };

  try {
    // Find the main content area
    const thumbnail = $('.herald-post-thumbnail-single');
    const header = thumbnail.find('header.entry-header');
    
    // Title
    const titleDiv = header.find('div').first();
    post.title = titleDiv.text().trim();
    
    // Date
    const dateEl = header.find('.herald-date');
    if (dateEl.length) {
      post.date = dateEl.text().trim();
    }
    
    // Tags
    const metaCategory = header.find('.meta-category');
    if (metaCategory.length) {
      post.tags = metaCategory.find('a').map((i, el) => $(el).text().trim()).get();
    }
    
    // Image
    const img = $('img.attachment-herald-lay-a-full');
    if (img.length) {
      post.image = img.attr('src') || img.attr('data-src');
    }
    
    // Body content
    const entryContent = $('.entry-content');
    if (entryContent.length) {
      // Get HTML content and clean it up
      post.body = entryContent.html();
    }
  } catch (e) {
    console.error(`Error parsing shamir.lv article:`, e.message);
  }
  
  return post;
}

// Parse rglhm.lv article
function parseRglhmArticle($, url) {
  const post = {
    title: null,
    body: null,
    tags: [],
    date: null,
    image: null,
  };

  try {
    // rglhm.lv structure - adjust selectors based on actual HTML
    // Title - try multiple selectors
    post.title = $('h1').first().text().trim() || 
                 $('.post-title').text().trim() ||
                 $('title').text().trim();
    
    // Date - look for date elements
    const dateEl = $('.date, .post-date, time, [class*="date"]').first();
    if (dateEl.length) {
      post.date = dateEl.text().trim() || dateEl.attr('datetime');
    }
    
    // Tags/Categories
    const tagEls = $('.tags a, .categories a, [class*="tag"] a, [class*="category"] a');
    if (tagEls.length) {
      post.tags = tagEls.map((i, el) => $(el).text().trim()).get();
    }
    
    // Image - try to find featured image
    const img = $('img[class*="featured"], img[class*="main"], .post-image img, article img').first();
    if (img.length) {
      post.image = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src');
    }
    
    // Body content - try multiple selectors
    const content = $('.post-content, .entry-content, article .content, [class*="content"]').first();
    if (content.length) {
      post.body = content.html();
    } else {
      // Fallback: get main article content
      const article = $('article, main, [role="main"]');
      if (article.length) {
        // Remove header, nav, footer elements
        article.find('header, nav, footer, .header, .footer').remove();
        post.body = article.html();
      }
    }
  } catch (e) {
    console.error(`Error parsing rglhm.lv article:`, e.message);
  }
  
  return post;
}

// Scrape a single URL
async function scrapeUrl(url, locale) {
  if (!url) return null;
  
  try {
    console.log(`Fetching ${locale} version: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Determine which parser to use
    if (url.includes('shamir.lv')) {
      return parseShamirArticle($, url);
    } else if (url.includes('rglhm.lv')) {
      return parseRglhmArticle($, url);
    }
    
    return null;
  } catch (e) {
    console.error(`Error scraping ${url}:`, e.message);
    return null;
  }
}

// Convert HTML to Markdown (simple conversion)
function htmlToMarkdown(html) {
  if (!html) return '';
  
  // Basic HTML to Markdown conversion
  let md = html;
  
  // Remove scripts and styles
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  
  // Bold and italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Links
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Images
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');
  
  // Lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  
  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Line breaks
  md = md.replace(/<br[^>]*\/?>/gi, '\n');
  
  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');
  
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  
  return md;
}

// Parse date string to YYYY-MM-DD format
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Try to extract date from various formats
    const match = dateStr.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  return null;
}

// Main function
async function main() {
  console.log('Starting translation scraper...\n');
  
  // Read all article files
  const articleFiles = fs.readdirSync(ARTICLES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(ARTICLES_DIR, file));
  
  console.log(`Found ${articleFiles.length} articles to process\n`);
  
  const results = {
    processed: 0,
    created: { en: 0, lv: 0 },
    failed: { en: 0, lv: 0 },
    skipped: 0,
  };
  
  for (const filePath of articleFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);
      
      // Skip if already has locale set (might be a translation)
      if (frontmatter.locale && frontmatter.locale !== 'ru') {
        console.log(`Skipping ${path.basename(filePath)} - already a translation`);
        results.skipped++;
        continue;
      }
      
      const oldUrl = frontmatter.oldUrl;
      if (!oldUrl) {
        console.log(`Skipping ${path.basename(filePath)} - no oldUrl`);
        results.skipped++;
        continue;
      }
      
      const articleId = frontmatter.id || path.basename(filePath, '.md');
      const translationUrls = getTranslationUrls(oldUrl);
      
      console.log(`\nProcessing article ${articleId}:`);
      console.log(`  Original: ${oldUrl}`);
      
      // Scrape English and Latvian versions
      for (const locale of ['en', 'lv']) {
        const url = translationUrls[locale];
        if (!url) {
          console.log(`  ${locale.toUpperCase()}: No URL available`);
          continue;
        }
        
        // Check if translation already exists
        const translationFile = path.join(ARTICLES_DIR, `${articleId}-${locale}.md`);
        if (fs.existsSync(translationFile)) {
          console.log(`  ${locale.toUpperCase()}: Translation file already exists, skipping`);
          continue;
        }
        
        await delay(DELAY_MS); // Be respectful
        const scraped = await scrapeUrl(url, locale);
        
        if (!scraped || !scraped.title) {
          console.log(`  ${locale.toUpperCase()}: Failed to scrape or no content found`);
          results.failed[locale]++;
          continue;
        }
        
        // Convert HTML body to Markdown
        const markdownBody = scraped.body ? htmlToMarkdown(scraped.body) : '';
        
        // Create frontmatter
        const translationFrontmatter = {
          id: articleId,
          title: scraped.title,
          locale: locale,
          date: parseDate(scraped.date) || frontmatter.date,
          tags: scraped.tags.length > 0 ? scraped.tags : frontmatter.tags,
          oldUrl: url,
        };
        
        if (scraped.image) {
          translationFrontmatter.image = scraped.image;
        } else if (frontmatter.image) {
          translationFrontmatter.image = frontmatter.image;
        }
        
        // Write translation file
        const translationContent = matter.stringify(markdownBody, translationFrontmatter);
        fs.writeFileSync(translationFile, translationContent, 'utf-8');
        
        console.log(`  ${locale.toUpperCase()}: ✓ Created ${path.basename(translationFile)}`);
        results.created[locale]++;
      }
      
      results.processed++;
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e.message);
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Processed: ${results.processed}`);
  console.log(`Created EN: ${results.created.en}`);
  console.log(`Created LV: ${results.created.lv}`);
  console.log(`Failed EN: ${results.failed.en}`);
  console.log(`Failed LV: ${results.failed.lv}`);
  console.log(`Skipped: ${results.skipped}`);
}

main().catch(console.error);
