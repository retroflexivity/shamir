import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { translate } from '@vitalets/google-translate-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const DELAY_MS = 5000; // Delay between translations to avoid rate limiting (5 seconds)

// Tag translations
const tagTranslations = {
  'Выставки': 'Exhibitions',
  'Исследования': 'Researches',
  'Конференции': 'Conferences',
  'Концерты': 'Concerts',
  'Мероприятия': 'Activity',
  'Образование': 'Education',
  'Проекты': 'Projects',
  'Публикации': 'Publications',
  'Фестивали': 'Festivals',
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function translateTag(tag) {
  return tagTranslations[tag] || tag;
}

async function translateText(text, targetLang = 'en') {
  if (!text || text.trim().length === 0) return '';
  
  try {
    await delay(DELAY_MS);
    // Split long text into chunks to avoid issues
    const maxLength = 4000;
    if (text.length > maxLength) {
      // Split by sentences or paragraphs
      const chunks = text.match(/.{1,4000}(?:\n|\.|$)/g) || [text];
      const translatedChunks = [];
      for (const chunk of chunks) {
        if (chunk.trim()) {
          const result = await translate(chunk, { to: targetLang });
          translatedChunks.push(result.text);
          await delay(DELAY_MS);
        }
      }
      return translatedChunks.join(' ');
    } else {
      const result = await translate(text, { to: targetLang });
      return result.text;
    }
  } catch (error) {
    console.error(`Translation error: ${error.message}`);
    // If rate limited, wait longer and retry
    if (error.message.includes('Too Many Requests')) {
      console.log('    Rate limited, waiting 30 seconds...');
      await delay(30000);
      try {
        const result = await translate(text, { to: targetLang });
        return result.text;
      } catch (retryError) {
        console.error(`Retry after rate limit also failed: ${retryError.message}`);
        return text; // Return original if translation fails
      }
    } else {
      // Retry once after longer delay for other errors
      try {
        await delay(DELAY_MS * 2);
        const result = await translate(text, { to: targetLang });
        return result.text;
      } catch (retryError) {
        console.error(`Retry also failed: ${retryError.message}`);
        return text; // Return original if translation fails
      }
    }
  }
}

function extractArticleId(filename) {
  // Extract ID from filename like "134-en.md" -> "134" or "134-lv.md" -> "134"
  const match = filename.match(/^(\d+)-(en|lv)\.md$/);
  return match ? { id: match[1], locale: match[2] } : null;
}

function isRussianText(text) {
  // Check if text contains Cyrillic characters
  return /[А-ЯЁа-яё]/.test(text);
}

function needsTranslation(content, locale) {
  if (locale === 'en') {
    // Check for the "Sorry" message OR if content is in Russian
    if (content.includes('Sorry, this entry is only available')) {
      return true;
    }
    // Check if the body content is in Russian (Cyrillic)
    // Parse frontmatter and check only the body
    try {
      const { content: body } = matter(content);
      if (body && isRussianText(body)) {
        return true;
      }
    } catch (e) {
      // If parsing fails, check the whole content
      if (isRussianText(content)) {
        return true;
      }
    }
  } else if (locale === 'lv') {
    // Check for various Latvian "not available" messages
    if (content.includes('šīs materiāls vēl nav pieejams') || 
        content.includes('šī materiāls vēl nav pieejams') ||
        content.includes('Piedodiet, šīs materiāls') ||
        content.includes('šīs materiāls vēl nav pieejams latviešu valodā')) {
      return true;
    }
    // Also check if body is in Russian
    try {
      const { content: body } = matter(content);
      if (body && isRussianText(body)) {
        return true;
      }
    } catch (e) {
      // If parsing fails, check the whole content
      if (isRussianText(content)) {
        return true;
      }
    }
  }
  return false;
}

// Latvian tag translations
const tagTranslationsLv = {
  'Выставки': 'Izstādes',
  'Исследования': 'Pētijumi',
  'Конференции': 'Konferences',
  'Концерты': 'Koncerti',
  'Мероприятия': 'Darbība',
  'Образование': 'Izglītība',
  'Проекты': 'Projekti',
  'Публикации': 'Publikācijas',
  'Фестивали': 'Festivāli',
};

function translateTagForLocale(tag, locale) {
  if (locale === 'en') {
    return translateTag(tag);
  } else if (locale === 'lv') {
    return tagTranslationsLv[tag] || tag;
  }
  return tag;
}

async function main() {
  console.log('Starting article translation...\n');
  
  // Find all English and Latvian articles
  const translationFiles = fs.readdirSync(ARTICLES_DIR)
    .filter(file => file.endsWith('-en.md') || file.endsWith('-lv.md'))
    .map(file => path.join(ARTICLES_DIR, file));
  
  console.log(`Found ${translationFiles.length} translation articles\n`);
  
  const results = {
    processed: 0,
    translated: { en: 0, lv: 0 },
    skipped: 0,
    failed: 0,
  };
  
  for (const filePath of translationFiles) {
    try {
      const filename = path.basename(filePath);
      const articleInfo = extractArticleId(filename);
      
      if (!articleInfo) {
        console.log(`Skipping ${filename} - invalid format`);
        results.skipped++;
        continue;
      }
      
      const { id: articleId, locale: targetLocale } = articleInfo;
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);
      
      // Check if translation is needed
      if (!needsTranslation(body, targetLocale)) {
        console.log(`Skipping ${filename} - already translated`);
        results.skipped++;
        continue;
      }
      
      // Find corresponding Russian file
      const russianFile = path.join(ARTICLES_DIR, `${articleId}.md`);
      if (!fs.existsSync(russianFile)) {
        console.log(`Skipping ${filename} - Russian file ${articleId}.md not found`);
        results.skipped++;
        continue;
      }
      
      console.log(`\nProcessing ${filename} (${targetLocale.toUpperCase()})...`);
      
      // Read Russian article
      const russianContent = fs.readFileSync(russianFile, 'utf-8');
      const { data: ruFrontmatter, content: ruBody } = matter(russianContent);
      
      // Translate title
      console.log('  Translating title...');
      const translatedTitle = await translateText(ruFrontmatter.title || '', targetLocale);
      
      // Translate body (split into paragraphs for better translation)
      console.log('  Translating body...');
      // Remove the "Sorry, this entry..." message and Russian content from existing file
      const cleanRuBody = ruBody.trim();
      
      // Split into paragraphs, preserving structure
      const lines = cleanRuBody.split('\n');
      const paragraphs = [];
      let currentPara = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') {
          if (currentPara.trim()) {
            paragraphs.push(currentPara.trim());
            currentPara = '';
          }
          paragraphs.push(''); // Preserve empty lines
        } else {
          currentPara += (currentPara ? ' ' : '') + trimmed;
        }
      }
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
      }
      
      const translatedParagraphs = [];
      const nonEmptyParagraphs = paragraphs.filter(p => p.length > 0);
      let paraIndex = 0;
      
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];
        if (para.length > 0) {
          paraIndex++;
          console.log(`    Translating paragraph ${paraIndex}/${nonEmptyParagraphs.length}...`);
          const translated = await translateText(para, targetLocale);
          translatedParagraphs.push(translated);
        } else {
          translatedParagraphs.push('');
        }
      }
      
      const translatedBody = translatedParagraphs.join('\n\n');
      
      // Translate tags
      const translatedTags = (ruFrontmatter.tags || []).map(tag => {
        if (Array.isArray(tag)) {
          return tag.map(t => translateTagForLocale(t, targetLocale));
        }
        return translateTagForLocale(tag, targetLocale);
      });
      
      // Create new frontmatter
      const newFrontmatter = {
        ...frontmatter,
        title: translatedTitle,
        tags: translatedTags.length > 0 ? translatedTags : frontmatter.tags,
        locale: targetLocale,
      };
      
      // Write translated file
      const newContent = matter.stringify(translatedBody, newFrontmatter);
      fs.writeFileSync(filePath, newContent, 'utf-8');
      
      console.log(`  ✓ Translated ${filename}`);
      results.translated[targetLocale]++;
      results.processed++;
      
    } catch (error) {
      console.error(`Error processing ${path.basename(filePath)}:`, error.message);
      results.failed++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Processed: ${results.processed}`);
  console.log(`Translated EN: ${results.translated.en}`);
  console.log(`Translated LV: ${results.translated.lv}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);
}

main().catch(console.error);
