
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load recipes
const recipesPath = path.join(__dirname, 'src/data/recipes.json');
const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Extract all recipe names
let allRecipeNames = [];
recipesData.forEach(category => {
    if (category.items) {
        category.items.forEach(item => {
            if (item.name) {
                allRecipeNames.push(item.name.trim());
            }
        });
    }
});

// Load translationDB
// Since aiTranslation.js is an ES module export, we'll read it as text and extract the keys to avoid module loading issues in this simple script
const translationPath = path.join(__dirname, 'src/utils/aiTranslation.js');
const translationContent = fs.readFileSync(translationPath, 'utf8');

// Regex to find keys in the object: "Key Name": {
const regex = /"([^"]+)":\s*{/g;
let match;
const translationKeys = new Set();

while ((match = regex.exec(translationContent)) !== null) {
    translationKeys.add(match[1]); // No trim here to check exact match first, but keys in file are quoted
}

// Check coverage
let found = 0;
let missing = 0;
let missingSamples = [];

allRecipeNames.forEach(name => {
    if (translationKeys.has(name)) {
        found++;
    } else {
        missing++;
        missingSamples.push(name);
    }
});

console.log(`Total Recipes: ${allRecipeNames.length}`);
console.log(`Found Translations: ${found}`);
console.log(`Missing Translations: ${missing}`);
console.log(`Coverage: ${((found / allRecipeNames.length) * 100).toFixed(2)}%`);
const missingListPath = path.join(__dirname, 'missing_recipes.txt');
fs.writeFileSync(missingListPath, missingSamples.join('\n'), 'utf8');

console.log(`Total Recipes: ${allRecipeNames.length}`);
console.log(`Found Translations: ${found}`);
console.log(`Missing Translations: ${missing}`);
console.log(`Coverage: ${((found / allRecipeNames.length) * 100).toFixed(2)}%`);
console.log(`Missing recipes saved to: ${missingListPath}`);
