import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the database
const dbPath = join(__dirname, 'data', 'database.json');
const db = JSON.parse(readFileSync(dbPath, 'utf-8'));

// Get all icon IDs from the database
const iconIds = new Set(db.icons.map(icon => icon.id));

// Function to recursively find all iconId values in an object
function findIconIds(obj, path = '') {
  const iconIds = [];
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      iconIds.push(...findIconIds(item, `${path}[${index}]`));
    });
  } else if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      if (key === 'iconId' && typeof obj[key] === 'string' && obj[key]) {
        iconIds.push({ id: obj[key], path: newPath });
      } else {
        iconIds.push(...findIconIds(obj[key], newPath));
      }
    });
  }
  
  return iconIds;
}

// Find all iconIds referenced in pages
const referencedIconIds = findIconIds(db.pages);
const uniqueReferencedIds = new Set(referencedIconIds.map(ref => ref.id));

// Check for missing icons
const missingIcons = [];
referencedIconIds.forEach(ref => {
  if (!iconIds.has(ref.id)) {
    missingIcons.push(ref);
  }
});

// Report results
console.log('=== Icon Verification Report ===\n');
console.log(`Total icons in database: ${db.icons.length}`);
console.log(`Total iconIds referenced: ${uniqueReferencedIds.size}\n`);

if (missingIcons.length === 0) {
  console.log('✅ All referenced icons exist in the database!\n');
  console.log('Referenced iconIds:');
  Array.from(uniqueReferencedIds).sort().forEach(id => {
    const icon = db.icons.find(i => i.id === id);
    console.log(`  - ${id} (${icon ? icon.name : 'NOT FOUND'})`);
  });
} else {
  console.log('❌ Missing icons found:\n');
  missingIcons.forEach(ref => {
    console.log(`  - ${ref.id} (referenced at: ${ref.path})`);
  });
}

// List all icons in database
console.log('\n=== All Icons in Database ===');
db.icons.forEach(icon => {
  const isReferenced = uniqueReferencedIds.has(icon.id);
  console.log(`  ${isReferenced ? '✓' : '○'} ${icon.id} - ${icon.name}`);
});
