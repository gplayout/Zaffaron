import fs from 'fs';
import { getRecipesByCategory } from './src/utils/dataParser.js';

const recipes = JSON.parse(fs.readFileSync('./src/data/recipes.json', 'utf8'));

console.log("Total categories:", recipes.length);

let hasError = false;
recipes.forEach(cat => {
    if (!cat.items) {
        console.error(`Category ${cat.id} (${cat.title}) has no items!`);
        hasError = true;
    } else if (!Array.isArray(cat.items)) {
        console.error(`Category ${cat.id} (${cat.title}) items is not an array!`);
        hasError = true;
    }
});

if (!hasError) {
    console.log("All categories have valid 'items' array.");
}

const testId = "1";
const result = getRecipesByCategory(recipes, testId);
console.log(`getRecipesByCategory(recipes, "${testId}") returned type:`, typeof result);
console.log("Is array?", Array.isArray(result));
console.log("Length:", result ? result.length : "N/A");
