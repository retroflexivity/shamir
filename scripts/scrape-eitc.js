import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELAY_MS = 1000; // Delay between requests to be respectful
const BASE_URL = 'http://shamir.lv/eitc-2/';

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scrape a single URL
async function scrapeUrl(url, locale) {
  try {
    console.log(`Fetching ${locale.toUpperCase()} version: ${url}`);
    await delay(DELAY_MS);
    
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
    
    // Find the main content area
    let contentArea = $('.entry-content');
    if (contentArea.length === 0) {
      contentArea = $('.post-content, article .content, [class*="content"]').first();
    }
    if (contentArea.length === 0) {
      contentArea = $('body');
    }
    
    // Extract title
    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().trim();
    }
    
    // Extract content HTML
    const contentHtml = contentArea.html() || '';
    
    // Convert HTML to Markdown (simplified)
    const markdown = htmlToMarkdown(contentHtml);
    
    return {
      title,
      content: markdown,
      html: contentHtml
    };
  } catch (e) {
    console.error(`Error scraping ${url}:`, e.message);
    return null;
  }
}

// Convert HTML to Markdown (simplified version)
function htmlToMarkdown(html) {
  if (!html) return '';
  
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

async function main() {
  console.log('Scraping EITC page in three languages...\n');
  
  const locales = ['ru', 'lv', 'en'];
  const results = {};
  
  for (const locale of locales) {
    const url = locale === 'ru' ? BASE_URL : `${BASE_URL}?lang=${locale}`;
    const scraped = await scrapeUrl(url, locale);
    
    if (scraped) {
      results[locale] = scraped;
      console.log(`✓ ${locale.toUpperCase()}: Scraped successfully`);
    } else {
      console.log(`✗ ${locale.toUpperCase()}: Failed to scrape`);
    }
  }
  
  // Save results to files
  const outputDir = path.join(__dirname, '..', 'src', 'content', 'eitc');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const [locale, data] of Object.entries(results)) {
    const filePath = path.join(outputDir, `${locale}.md`);
    const frontmatter = `---
title: ${JSON.stringify(data.title)}
locale: ${locale}
---

${data.content}
`;
    fs.writeFileSync(filePath, frontmatter, 'utf-8');
    console.log(`✓ Saved ${locale} content to ${filePath}`);
  }
  
  console.log('\n✅ Scraping complete!');
}

main().catch(console.error);
