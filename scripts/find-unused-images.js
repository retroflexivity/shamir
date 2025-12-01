#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all image files in public/images/
const imagesDir = path.join(__dirname, '..', 'public', 'images');
const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
  .map(file => file.toLowerCase());

console.log(`Found ${imageFiles.length} image files in public/images/`);

// Get all article files
const articlesDir = path.join(__dirname, '..', 'src', 'content', 'articles');
const articleFiles = fs.readdirSync(articlesDir)
  .filter(file => file.endsWith('.md'));

console.log(`Scanning ${articleFiles.length} article files...`);

// Extract all image references from articles
const referencedImages = new Set();

articleFiles.forEach(file => {
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
  
  // Match patterns like /images/123.jpg or /images/123.png
  const imagePattern = /\/images\/([0-9]+\.(jpg|jpeg|png))/gi;
  let match;
  
  while ((match = imagePattern.exec(content)) !== null) {
    referencedImages.add(match[1].toLowerCase());
  }
});

console.log(`Found ${referencedImages.size} unique image references in articles`);

// Find unused images
const unusedImages = imageFiles.filter(img => !referencedImages.has(img));

console.log(`\nFound ${unusedImages.length} unused images:\n`);
unusedImages.sort().forEach(img => {
  console.log(img);
});

// Also write to file
const outputFile = path.join(__dirname, '..', 'unused-images.txt');
fs.writeFileSync(outputFile, unusedImages.sort().join('\n') + '\n');
console.log(`\nList written to ${outputFile}`);
