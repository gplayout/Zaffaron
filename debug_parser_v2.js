import fs from 'fs';
import { parseRecipe } from './src/utils/dataParser.js';

const recipesData = JSON.parse(fs.readFileSync('./src/data/recipes.json', 'utf8'));

const targetNames = [
    "راتاتویی دونفره",
    "کيک شکلاتي با مايکروفر",
    "ببرهای خوراکی"
];

recipesData.forEach(category => {
    category.items.forEach(recipe => {
        if (targetNames.includes(recipe.name)) {
            console.log(`\n--- ${recipe.name} ---`);
            console.log("Raw:", JSON.stringify(recipe.recipe));
            const parsed = parseRecipe(recipe.recipe);
            console.log("Parsed:", JSON.stringify(parsed, null, 2));
        }
    });
});
