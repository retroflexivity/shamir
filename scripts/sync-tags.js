import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Translation mapping: Russian -> {lv: Latvian, en: English}
const tagTranslations = {
  'Выставки': { lv: 'Izstādes', en: 'Exhibitions' },
  'Исследования': { lv: 'Pētijumi', en: 'Researches' },
  'Конференции': { lv: 'Konferences', en: 'Conferences' },
  'Концерты': { lv: 'Koncerti', en: 'Concerts' },
  'Мероприятия': { lv: 'Darbība', en: 'Activity' },
  'Образование': { lv: 'Izglītība', en: 'Education' },
  'Проекты': { lv: 'Projekti', en: 'Projects' },
  'Публикации': { lv: 'Publikācijas', en: 'Publications' },
  'Фестивали': { lv: 'Festivāli', en: 'Festivals' },
};

// Special tags that might appear (from existing files)
const specialTagTranslations = {
  'Rīgas Geto Muzejs': { lv: 'Rīgas Geto Muzejs', en: 'Riga Ghetto Museum' },
  'Riga Ghetto Museum': { lv: 'Rīgas Geto Muzejs', en: 'Riga Ghetto Museum' },
  'Holokausta pasniegšana': { lv: 'Holokausta pasniegšana', en: 'Teaching about the Holocaust' },
  'Teaching about the Holocaust': { lv: 'Holokausta pasniegšana', en: 'Teaching about the Holocaust' },
  'Dzīvo gajiens': { lv: 'Dzīvo gajiens', en: 'March for life' },
  'March for life': { lv: 'Dzīvo gajiens', en: 'March for life' },
};

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');

function translateTag(tag, locale) {
  // Check special tags first
  if (specialTagTranslations[tag]) {
    return specialTagTranslations[tag][locale];
  }
  
  // Check regular translations
  if (tagTranslations[tag]) {
    return tagTranslations[tag][locale];
  }
  
  // If no translation found, return original (for custom tags)
  return tag;
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.filter(t => t && t.trim().length > 0);
  }
  if (typeof tags === 'string' && tags.trim().length > 0) {
    return [tags.trim()];
  }
  return [];
}

function escapeYAMLString(str) {
  // If string contains special characters, wrap in quotes
  if (str.includes(':') || str.includes("'") || str.includes('"') || str.includes('\n') || str.startsWith(' ') || str.endsWith(' ')) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  return str;
}

function updateFileTags(filePath, newTags, locale) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(content);
  
  // Update tags
  parsed.data.tags = newTags.length > 0 ? newTags : undefined;
  
  // Ensure locale is set
  if (!parsed.data.locale) {
    parsed.data.locale = locale;
  }
  
  // Reconstruct file with proper YAML formatting
  // We'll manually format the frontmatter to ensure tags are in YAML list format
  const frontmatter = { ...parsed.data };
  
  // Use matter.stringify but we'll need to manually fix the tags format
  let newContent = matter.stringify(parsed.content, frontmatter);
  
  // Replace tags array format with YAML list format
  // matter.stringify might output tags as ['tag1', 'tag2'] or tags: tag1, tag2
  // We want: tags:\n  - tag1\n  - tag2
  if (newTags && newTags.length > 0) {
    const tagsYAML = 'tags:\n' + newTags.map(t => `  - ${escapeYAMLString(t)}`).join('\n');
    
    // Find and replace the tags line(s)
    const lines = newContent.split('\n');
    const frontmatterEnd = lines.indexOf('---', 1);
    if (frontmatterEnd > 0) {
      let tagsStart = -1;
      let tagsEnd = -1;
      
      // Find tags section
      for (let i = 0; i < frontmatterEnd; i++) {
        if (lines[i].startsWith('tags:')) {
          tagsStart = i;
          // Find where tags end (next key or end of frontmatter)
          for (let j = i + 1; j < frontmatterEnd; j++) {
            if (lines[j].match(/^[a-zA-Z_]+:/) || lines[j].trim() === '') {
              tagsEnd = j;
              break;
            }
          }
          if (tagsEnd === -1) tagsEnd = frontmatterEnd;
          break;
        }
      }
      
      if (tagsStart >= 0) {
        // Replace existing tags
        lines.splice(tagsStart, tagsEnd - tagsStart, ...tagsYAML.split('\n'));
      } else {
        // Insert tags before the closing ---
        const insertPos = frontmatterEnd;
        lines.splice(insertPos, 0, ...tagsYAML.split('\n'));
      }
      
      newContent = lines.join('\n');
    }
  }
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
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
  let updated = 0;
  
  console.log(`Found ${files.length} Russian article files\n`);
  
  for (const file of files) {
    const articleId = file.replace('.md', '');
    const ruFile = path.join(ARTICLES_DIR, file);
    const lvFile = path.join(ARTICLES_DIR, `${articleId}-lv.md`);
    const enFile = path.join(ARTICLES_DIR, `${articleId}-en.md`);
    
    try {
      // Read Russian file
      const ruContent = fs.readFileSync(ruFile, 'utf-8');
      const ruParsed = matter(ruContent);
      const ruTags = normalizeTags(ruParsed.data.tags);
      
      if (ruTags.length === 0) {
        console.log(`⚠️  ${articleId}: No tags found in Russian version`);
        processed++;
        continue;
      }
      
      // Translate tags
      const lvTags = ruTags.map(tag => translateTag(tag, 'lv'));
      const enTags = ruTags.map(tag => translateTag(tag, 'en'));
      
      // Update Russian file (convert to YAML format)
      updateFileTags(ruFile, ruTags, 'ru');
      
      // Update Latvian file if it exists
      let lvUpdated = false;
      if (fs.existsSync(lvFile)) {
        updateFileTags(lvFile, lvTags, 'lv');
        lvUpdated = true;
      }
      
      // Update English file if it exists
      let enUpdated = false;
      if (fs.existsSync(enFile)) {
        updateFileTags(enFile, enTags, 'en');
        enUpdated = true;
      }
      
      const status = [];
      status.push('RU');
      if (lvUpdated) status.push('LV');
      if (enUpdated) status.push('EN');
      
      console.log(`✓ ${articleId}: Updated ${status.join(', ')} tags: [${ruTags.join(', ')}]`);
      
      updated++;
      processed++;
    } catch (error) {
      console.error(`❌ Error processing ${articleId}:`, error.message);
      processed++;
    }
  }
  
  console.log(`\n✅ Processed ${processed} files, updated ${updated} files with tags`);
}

main();
