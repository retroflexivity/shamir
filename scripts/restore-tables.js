import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const DELAY_MS = 1000; // Delay between requests to be respectful

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extract table blocks from markdown content
 * Returns array of {start: line number, end: line number, content: string}
 */
function extractTables(content) {
  const lines = content.split('\n');
  const tables = [];
  let inTable = false;
  let tableStart = -1;
  let tableLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    const isSeparator = /^\s*\|[\s\-:]+\|\s*$/.test(line);
    
    if (isTableRow || isSeparator) {
      if (!inTable) {
        inTable = true;
        tableStart = i;
        tableLines = [line];
      } else {
        tableLines.push(line);
      }
    } else {
      if (inTable) {
        // End of table
        if (tableLines.length >= 2) { // At least header + separator
          tables.push({
            start: tableStart,
            end: i - 1,
            content: tableLines.join('\n')
          });
        }
        inTable = false;
        tableLines = [];
      }
    }
  }
  
  // Handle table at end of file
  if (inTable && tableLines.length >= 2) {
    tables.push({
      start: tableStart,
      end: lines.length - 1,
      content: tableLines.join('\n')
    });
  }
  
  return tables;
}

/**
 * Find the best insertion point for a table in translated content
 * Looks for context markers like date headers, section headers, etc.
 */
function findInsertionPoint(ruContent, ruTable, translatedContent) {
  const ruLines = ruContent.split('\n');
  const transLines = translatedContent.split('\n');
  
  // Get the line immediately before the table in Russian version
  let contextLine = '';
  for (let i = ruTable.start - 1; i >= 0; i--) {
    const line = ruLines[i].trim();
    if (line && !line.startsWith('|')) {
      contextLine = line;
      break;
    }
  }
  
  if (!contextLine) {
    return -1;
  }
  
  // Extract date pattern from context line (e.g., "**27.05.2013**")
  const dateMatch = contextLine.match(/\*\*(\d{2}\.\d{2}\.\d{4})\*\*/);
  
  // Look for matching date in translated content
  if (dateMatch) {
    const date = dateMatch[1];
    for (let i = 0; i < transLines.length; i++) {
      const line = transLines[i].trim();
      // Check if this line contains the same date
      if (line.includes(date) || line.match(new RegExp(date.replace(/\./g, '\\.')))) {
        // Find the next non-empty, non-table line after this date
        for (let j = i + 1; j < transLines.length; j++) {
          const nextLine = transLines[j].trim();
          if (nextLine && !nextLine.startsWith('|')) {
            // Check if it's not already a table row by looking ahead
            let isTable = false;
            for (let k = j; k < Math.min(j + 3, transLines.length); k++) {
              if (transLines[k].trim().startsWith('|')) {
                isTable = true;
                break;
              }
            }
            if (!isTable) {
              return j;
            }
          }
        }
        // If we found the date but no content after, insert right after the date line
        return i + 1;
      }
    }
  }
  
  // Fallback: look for section headers that match
  const headerMatch = contextLine.match(/\*\*(.+?)\*\*/);
  if (headerMatch) {
    const headerText = headerMatch[1].toLowerCase();
    // Look for similar headers in translated content
    for (let i = 0; i < transLines.length; i++) {
      const line = transLines[i].trim();
      if (line.startsWith('**') && line.endsWith('**')) {
        const transHeader = line.toLowerCase();
        // Check if they contain similar keywords (dates, session, program, etc.)
        if (headerText.match(/\d{2}\.\d{2}\.\d{4}/) && transHeader.match(/\d{2}\.\d{2}\.\d{4}/)) {
          // Both have dates, check if dates match
          const ruDate = headerText.match(/\d{2}\.\d{2}\.\d{4}/)?.[0];
          const transDate = transHeader.match(/\d{2}\.\d{2}\.\d{4}/)?.[0];
          if (ruDate && transDate && ruDate === transDate) {
            // Find the next non-empty, non-table line
            for (let j = i + 1; j < transLines.length; j++) {
              const nextLine = transLines[j].trim();
              if (nextLine && !nextLine.startsWith('|')) {
                return j;
              }
            }
            return i + 1;
          }
        }
      }
    }
  }
  
  return -1; // Could not find insertion point
}

/**
 * Check if table already exists in translated content
 */
function tableExists(tableContent, translatedContent) {
  // Check if any line from the table exists in translated content
  const tableLines = tableContent.split('\n').filter(l => l.trim().startsWith('|'));
  if (tableLines.length === 0) return false;
  
  // Check if first few table rows exist
  const firstRows = tableLines.slice(0, 3);
  const transLines = translatedContent.split('\n');
  
  for (let i = 0; i < transLines.length - firstRows.length; i++) {
    let matches = 0;
    for (let j = 0; j < firstRows.length; j++) {
      if (transLines[i + j].trim() === firstRows[j].trim()) {
        matches++;
      }
    }
    if (matches === firstRows.length) {
      return true;
    }
  }
  
  return false;
}

// Parse URL and determine translation URLs
function getTranslationUrls(originalUrl) {
  const urls = { en: null, lv: null };
  
  if (!originalUrl) return urls;
  
  try {
    const url = new URL(originalUrl);
    
    if (url.hostname.includes('shamir.lv')) {
      // shamir.lv uses ?lang= parameter
      const separator = originalUrl.includes('?') ? '&' : '?';
      urls.en = `${originalUrl}${separator}lang=en`;
      urls.lv = `${originalUrl}${separator}lang=lv`;
    } else if (url.hostname.includes('rglhm.lv')) {
      // rglhm.lv uses subroutes - replace /ru/ with /en/ or /lv/
      if (originalUrl.includes('/ru/')) {
        urls.en = originalUrl.replace('/ru/', '/en/');
        urls.lv = originalUrl.replace('/ru/', '/lv/');
      }
    }
  } catch (e) {
    console.error(`Error parsing URL ${originalUrl}:`, e.message);
  }
  
  return urls;
}

// Extract tables from HTML content
function extractTablesFromHTML(html) {
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const tables = [];
  
  // Try to find content area first (similar to scrape-translations.js)
  let contentArea = $('.entry-content');
  if (contentArea.length === 0) {
    contentArea = $('.post-content, article .content, [class*="content"]').first();
  }
  if (contentArea.length === 0) {
    contentArea = $('body'); // Fallback to entire body
  }
  
  contentArea.find('table').each((i, tableEl) => {
    const $table = $(tableEl);
    const rows = [];
    
    $table.find('tr').each((j, rowEl) => {
      const $row = $(rowEl);
      const cells = [];
      
      // Check if it's a header row
      const isHeader = $row.find('th').length > 0;
      const cellSelector = isHeader ? 'th' : 'td';
      
      $row.find(cellSelector).each((k, cellEl) => {
        const $cell = $(cellEl);
        // Get text content, preserving line breaks as spaces
        let cellText = $cell.text().trim();
        // Clean up extra whitespace
        cellText = cellText.replace(/\s+/g, ' ');
        cells.push(cellText);
      });
      
      if (cells.length > 0) {
        rows.push({
          cells,
          isHeader
        });
      }
    });
    
    if (rows.length > 0) {
      // Convert to markdown table
      const markdownTable = convertTableToMarkdown(rows);
      tables.push(markdownTable);
    }
  });
  
  return tables;
}

// Convert table rows to markdown format
function convertTableToMarkdown(rows) {
  if (rows.length === 0) return '';
  
  const markdownRows = [];
  
  // Determine number of columns from the first row
  const numCols = rows[0].cells.length;
  
  // First row is always the header (even if it's not marked as header in HTML)
  const headerRow = rows[0];
  markdownRows.push('| ' + headerRow.cells.join(' | ') + ' |');
  
  // Separator row
  const separator = '| ' + Array(numCols).fill('---').join(' | ') + ' |';
  markdownRows.push(separator);
  
  // Data rows (start from second row)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Pad or truncate cells to match column count
    const cells = [...row.cells];
    while (cells.length < numCols) {
      cells.push('');
    }
    if (cells.length > numCols) {
      cells.splice(numCols);
    }
    markdownRows.push('| ' + cells.join(' | ') + ' |');
  }
  
  return markdownRows.join('\n');
}

// Scrape tables from a URL
async function scrapeTablesFromUrl(url, locale) {
  if (!url) return [];
  
  try {
    console.log(`  Fetching ${locale.toUpperCase()} tables from: ${url}`);
    await delay(DELAY_MS);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn(`  Failed to fetch ${url}: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const tables = extractTablesFromHTML(html);
    
    return tables;
  } catch (e) {
    console.error(`  Error scraping ${url}:`, e.message);
    return [];
  }
}

function main() {
  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => /^[0-9]+\.md$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.replace('.md', ''));
      const numB = parseInt(b.replace('.md', ''));
      return numA - numB;
    });
  
  let processed = 0;
  let restored = 0;
  
  console.log(`Found ${files.length} Russian article files\n`);
  
  // Process files sequentially to avoid overwhelming the server
  (async () => {
    for (const file of files) {
      const articleId = file.replace('.md', '');
      const ruFile = path.join(ARTICLES_DIR, file);
      const lvFile = path.join(ARTICLES_DIR, `${articleId}-lv.md`);
      const enFile = path.join(ARTICLES_DIR, `${articleId}-en.md`);
      
      try {
        // Read Russian file
        const ruContent = fs.readFileSync(ruFile, 'utf-8');
        const ruParsed = matter(ruContent);
        const ruBody = ruParsed.content;
        
        // Extract tables from Russian version to know how many we expect
        const ruTables = extractTables(ruBody);
        
        if (ruTables.length === 0) {
          processed++;
          continue;
        }
        
        console.log(`\n📋 ${articleId}: Found ${ruTables.length} table(s) in Russian version`);
        
        // Get translation URLs
        const oldUrl = ruParsed.data.oldUrl;
        if (!oldUrl) {
          console.log(`  ⚠️  No oldUrl found, skipping`);
          processed++;
          continue;
        }
        
        const translationUrls = getTranslationUrls(oldUrl);
        
        // Process Latvian file
        if (fs.existsSync(lvFile) && translationUrls.lv) {
          const lvContent = fs.readFileSync(lvFile, 'utf-8');
          const lvParsed = matter(lvContent);
          let lvBody = lvParsed.content;
          
          // Scrape tables from Latvian version
          const lvScrapedTables = await scrapeTablesFromUrl(translationUrls.lv, 'lv');
          
          if (lvScrapedTables.length > 0) {
            console.log(`  ✓ LV: Scraped ${lvScrapedTables.length} table(s) from website`);
            
            // Replace tables in LV file
            // First, remove existing tables
            const lvLines = lvBody.split('\n');
            const cleanedLvLines = [];
            let inTable = false;
            
            for (let i = 0; i < lvLines.length; i++) {
              const line = lvLines[i].trim();
              const isTableRow = line.startsWith('|');
              
              if (isTableRow) {
                if (!inTable) {
                  inTable = true;
                }
                // Skip table rows
                continue;
              } else {
                if (inTable) {
                  inTable = false;
                }
                cleanedLvLines.push(lvLines[i]);
              }
            }
            
            // Insert scraped tables at appropriate positions
            let lvUpdated = false;
            for (let i = 0; i < ruTables.length && i < lvScrapedTables.length; i++) {
              const ruTable = ruTables[i];
              const scrapedTable = lvScrapedTables[i];
              const insertPos = findInsertionPoint(ruBody, ruTable, cleanedLvLines.join('\n'));
              
              if (insertPos >= 0) {
                cleanedLvLines.splice(insertPos, 0, '', scrapedTable, '');
                lvUpdated = true;
                console.log(`  ✓ LV: Inserted table ${i + 1} at line ${insertPos}`);
              }
            }
            
            if (lvUpdated) {
              const newLvContent = matter.stringify(cleanedLvLines.join('\n'), lvParsed.data);
              fs.writeFileSync(lvFile, newLvContent, 'utf-8');
              restored++;
            }
          } else {
            console.log(`  ⚠️  LV: No tables found on website`);
          }
        }
        
        // Process English file
        if (fs.existsSync(enFile) && translationUrls.en) {
          const enContent = fs.readFileSync(enFile, 'utf-8');
          const enParsed = matter(enContent);
          let enBody = enParsed.content;
          
          // Scrape tables from English version
          const enScrapedTables = await scrapeTablesFromUrl(translationUrls.en, 'en');
          
          if (enScrapedTables.length > 0) {
            console.log(`  ✓ EN: Scraped ${enScrapedTables.length} table(s) from website`);
            
            // Replace tables in EN file
            const enLines = enBody.split('\n');
            const cleanedEnLines = [];
            let inTable = false;
            
            for (let i = 0; i < enLines.length; i++) {
              const line = enLines[i].trim();
              const isTableRow = line.startsWith('|');
              
              if (isTableRow) {
                if (!inTable) {
                  inTable = true;
                }
                continue;
              } else {
                if (inTable) {
                  inTable = false;
                }
                cleanedEnLines.push(enLines[i]);
              }
            }
            
            // Insert scraped tables
            let enUpdated = false;
            for (let i = 0; i < ruTables.length && i < enScrapedTables.length; i++) {
              const ruTable = ruTables[i];
              const scrapedTable = enScrapedTables[i];
              const insertPos = findInsertionPoint(ruBody, ruTable, cleanedEnLines.join('\n'));
              
              if (insertPos >= 0) {
                cleanedEnLines.splice(insertPos, 0, '', scrapedTable, '');
                enUpdated = true;
                console.log(`  ✓ EN: Inserted table ${i + 1} at line ${insertPos}`);
              }
            }
            
            if (enUpdated) {
              const newEnContent = matter.stringify(cleanedEnLines.join('\n'), enParsed.data);
              fs.writeFileSync(enFile, newEnContent, 'utf-8');
              restored++;
            }
          } else {
            console.log(`  ⚠️  EN: No tables found on website`);
          }
        }
        
        processed++;
      } catch (error) {
        console.error(`❌ Error processing ${articleId}:`, error.message);
        processed++;
      }
    }
    
    console.log(`\n✅ Processed ${processed} files, restored tables in ${restored} translation files`);
  })().catch(console.error);
}

main();
