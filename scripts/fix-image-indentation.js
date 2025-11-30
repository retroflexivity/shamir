import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');

/**
 * Fix image indentation - remove leading whitespace/tabs from image markdown
 */
function fixImageIndentation(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const originalLine = line;
    
    // Check if line contains image markdown with leading whitespace
    // Pattern: whitespace followed by ![ or [![
    const imagePattern = /^(\s+)(!\[.*?\]\(.*?\)|\[!\[.*?\]\(.*?\)\]\(.*?\))/;
    const imageMatch = line.match(imagePattern);
    
    if (imageMatch) {
      // Remove leading whitespace, keep only the image markdown
      line = imageMatch[2];
      fixedLines.push(line);
    } else {
      // Also check for lines that are just whitespace before/after images
      // If previous or next line is an image, this might be a spacing line
      const trimmed = line.trim();
      if (trimmed === '' || trimmed === '&nbsp;') {
        // Keep empty lines and &nbsp; as is
        fixedLines.push(line);
      } else {
        fixedLines.push(line);
      }
    }
  }
  
  return fixedLines.join('\n');
}

function main() {
  // Get all translation files (-lv.md and -en.md)
  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => /-(lv|en)\.md$/.test(f))
    .sort();
  
  let processed = 0;
  let fixed = 0;
  
  console.log(`Found ${files.length} translation files to check\n`);
  
  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(content);
      
      // Fix image indentation in body content
      const fixedBody = fixImageIndentation(parsed.content);
      
      // Check if anything changed
      if (fixedBody !== parsed.content) {
        // Reconstruct file
        const newContent = matter.stringify(fixedBody, parsed.data);
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`✓ Fixed: ${file}`);
        fixed++;
      }
      
      processed++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      processed++;
    }
  }
  
  console.log(`\n✅ Processed ${processed} files, fixed ${fixed} files`);
}

main();
