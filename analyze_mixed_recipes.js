import fs from 'fs';
import { parseRecipe } from './src/utils/dataParser.js';

const recipesData = JSON.parse(fs.readFileSync('./src/data/recipes.json', 'utf8'));

let mixedRecipes = [];

recipesData.forEach(category => {
    category.items.forEach(recipe => {
        const { ingredients, instructions } = parseRecipe(recipe.recipe);
        // If we have instructions but NO ingredients, or if the parser had to fallback
        // heavily, it's a candidate for "mixed" content.
        // Also check for short "Ingredients" that might just be a header.

        if (ingredients.length === 0 && instructions.length > 0) {
            mixedRecipes.push({
                category: category.title,
                name: recipe.name,
                reason: "No Ingredients Found",
                preview: recipe.recipe.substring(0, 100).replace(/\n/g, ' ')
            });
        }
    });
});

console.log(`Found ${mixedRecipes.length} potentially mixed recipes.`);
mixedRecipes.forEach(r => {
    console.log(`[${r.category}] ${r.name}: ${r.preview}...`);
});
