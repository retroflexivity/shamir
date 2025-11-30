import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const TRANSLATIONS_FILE = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');
const HOMEPAGE_FILE = path.join(__dirname, '..', 'src', 'components', 'HomePage.tsx');
const EITC_COMPONENT = path.join(__dirname, '..', 'src', 'components', 'eitc.tsx');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const DELAY_MS = 500; // Delay between downloads

// Create images directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractImageUrls(content) {
  const urls = new Set();
  
  // Match markdown images: ![alt](url)
  const markdownImages = content.matchAll(/!\[.*?\]\((http[^)]+)\)/g);
  for (const match of markdownImages) {
    urls.add(match[1]);
  }
  
  // Match HTML img tags: <img src="url">
  const htmlImages = content.matchAll(/<img[^>]+src=["'](http[^)]+)["']/gi);
  for (const match of htmlImages) {
    urls.add(match[1]);
  }
  
  // Match frontmatter image fields
  const frontmatterImages = content.matchAll(/image:\s*['"](http[^'"]+)['"]/g);
  for (const match of frontmatterImages) {
    urls.add(match[1]);
  }
  
  return Array.from(urls);
}

function getLocalImagePath(url) {
  // Extract filename from URL
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = path.basename(pathname);
  
  // Create a safe filename (remove query params, etc.)
  const safeFilename = filename.split('?')[0].split('#')[0];
  
  // Preserve directory structure from wp-content/uploads
  if (pathname.includes('/wp-content/uploads/')) {
    const uploadsIndex = pathname.indexOf('/wp-content/uploads/');
    const relativePath = pathname.substring(uploadsIndex + '/wp-content/uploads/'.length);
    const dirPath = path.dirname(relativePath);
    const finalDir = path.join(IMAGES_DIR, dirPath);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    return path.join(finalDir, safeFilename);
  }
  
  // For wixstatic or other domains, just use filename
  return path.join(IMAGES_DIR, safeFilename);
}

function getLocalImageUrl(localPath) {
  // Convert to URL path relative to public directory
  const relativePath = path.relative(path.join(__dirname, '..', 'public'), localPath);
  return '/' + relativePath.replace(/\\/g, '/');
}

async function downloadImage(url, localPath) {
  try {
    console.log(`Downloading: ${url}`);
    await delay(DELAY_MS);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to download ${url}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.buffer();
    fs.writeFileSync(localPath, buffer);
    console.log(`  ✓ Saved to ${localPath}`);
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting image download...\n');
  
  const allUrls = new Set();
  
  // Collect URLs from article files
  console.log('Scanning article files...');
  const articleFiles = fs.readdirSync(ARTICLES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(ARTICLES_DIR, file));
  
  for (const filePath of articleFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const urls = extractImageUrls(content);
    urls.forEach(url => allUrls.add(url));
  }
  
  // Collect URLs from translations file
  console.log('Scanning translations file...');
  const translationsFileContentScan = fs.readFileSync(TRANSLATIONS_FILE, 'utf-8');
  const translationUrls = extractImageUrls(translationsFileContentScan);
  translationUrls.forEach(url => allUrls.add(url));
  
  // Collect URLs from HomePage component
  console.log('Scanning HomePage component...');
  const homepageContentScan = fs.readFileSync(HOMEPAGE_FILE, 'utf-8');
  const homepageUrls = extractImageUrls(homepageContentScan);
  homepageUrls.forEach(url => allUrls.add(url));
  
  // Collect URLs from EITC component
  console.log('Scanning EITC component...');
  const eitcContentScan = fs.readFileSync(EITC_COMPONENT, 'utf-8');
  const eitcUrls = extractImageUrls(eitcContentScan);
  eitcUrls.forEach(url => allUrls.add(url));
  
  // Filter only external URLs
  const externalUrls = Array.from(allUrls).filter(url => 
    url.includes('shamir.lv') || url.includes('wixstatic.com')
  );
  
  console.log(`\nFound ${externalUrls.length} unique external image URLs\n`);
  
  // Download images
  const urlMap = new Map(); // Maps original URL to local URL
  let downloaded = 0;
  let failed = 0;
  
  for (const url of externalUrls) {
    const localPath = getLocalImagePath(url);
    const localUrl = getLocalImageUrl(localPath);
    
    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      console.log(`Skipping (already exists): ${url}`);
      urlMap.set(url, localUrl);
      continue;
    }
    
    const success = await downloadImage(url, localPath);
    if (success) {
      urlMap.set(url, localUrl);
      downloaded++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n=== Download Summary ===`);
  console.log(`Total URLs: ${externalUrls.length}`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Already existed: ${externalUrls.length - downloaded - failed}`);
  console.log(`Failed: ${failed}`);
  
  // Now update all files with local URLs
  console.log(`\n=== Updating file references ===`);
  
  // Update article files
  let articlesUpdated = 0;
  for (const filePath of articleFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let updated = false;
    
    for (const [originalUrl, localUrl] of urlMap.entries()) {
      // Replace in markdown images
      const markdownPattern = new RegExp(`!\\[([^\\]]*)\\]\\(${originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      if (markdownPattern.test(content)) {
        content = content.replace(markdownPattern, `![$1](${localUrl})`);
        updated = true;
      }
      
      // Replace in frontmatter
      const frontmatterPattern = new RegExp(`(image:\\s*['"])${originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g');
      if (frontmatterPattern.test(content)) {
        content = content.replace(frontmatterPattern, `$1${localUrl}$2`);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf-8');
      articlesUpdated++;
    }
  }
  
  // Update translations file
  let translationsFileContent = fs.readFileSync(TRANSLATIONS_FILE, 'utf-8');
  let translationsUpdated = false;
  for (const [originalUrl, localUrl] of urlMap.entries()) {
    if (translationsFileContent.includes(originalUrl)) {
      translationsFileContent = translationsFileContent.replaceAll(originalUrl, localUrl);
      translationsUpdated = true;
    }
  }
  if (translationsUpdated) {
    fs.writeFileSync(TRANSLATIONS_FILE, translationsFileContent, 'utf-8');
    console.log('Updated translations.ts');
  }
  
  // Update HomePage component
  let homepageFileContent = fs.readFileSync(HOMEPAGE_FILE, 'utf-8');
  let homepageUpdated = false;
  for (const [originalUrl, localUrl] of urlMap.entries()) {
    if (homepageFileContent.includes(originalUrl)) {
      homepageFileContent = homepageFileContent.replaceAll(originalUrl, localUrl);
      homepageUpdated = true;
    }
  }
  if (homepageUpdated) {
    fs.writeFileSync(HOMEPAGE_FILE, homepageFileContent, 'utf-8');
    console.log('Updated HomePage.tsx');
  }
  
  // Update EITC component
  let eitcFileContent = fs.readFileSync(EITC_COMPONENT, 'utf-8');
  let eitcUpdated = false;
  for (const [originalUrl, localUrl] of urlMap.entries()) {
    if (eitcFileContent.includes(originalUrl)) {
      eitcFileContent = eitcFileContent.replaceAll(originalUrl, localUrl);
      eitcUpdated = true;
    }
  }
  if (eitcUpdated) {
    fs.writeFileSync(EITC_COMPONENT, eitcFileContent, 'utf-8');
    console.log('Updated eitc.tsx');
  }
  
  console.log(`\n=== Update Summary ===`);
  console.log(`Articles updated: ${articlesUpdated}`);
  console.log(`Translations updated: ${translationsUpdated ? 'Yes' : 'No'}`);
  console.log(`HomePage updated: ${homepageUpdated ? 'Yes' : 'No'}`);
  console.log(`EITC component updated: ${eitcUpdated ? 'Yes' : 'No'}`);
}

main().catch(console.error);
