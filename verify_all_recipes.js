import fs from 'fs';
import { parseRecipe } from './src/utils/dataParser.js';

const recipesData = JSON.parse(fs.readFileSync('./src/data/recipes.json', 'utf8'));

console.log(`Scanning ${recipesData.length} categories...`);

let totalRecipes = 0;
let issues = [];

recipesData.forEach(category => {
    category.items.forEach(recipe => {
        totalRecipes++;
        const { ingredients, instructions } = parseRecipe(recipe.recipe);

        if (ingredients.length === 0 || instructions.length === 0) {
            issues.push({
                category: category.title,
                name: recipe.name,
                missingIngredients: ingredients.length === 0,
                missingInstructions: instructions.length === 0
            });
        }
    });
});

console.log(`Checked ${totalRecipes} recipes.`);

if (issues.length === 0) {
    console.log("✅ All recipes parsed successfully! No items missed.");
} else {
    console.log(`⚠️ Found ${issues.length} potential issues:`);
    issues.forEach(issue => {
        console.log(`- [${issue.category}] ${issue.name}: ${issue.missingIngredients ? 'No Ingredients' : ''} ${issue.missingInstructions ? 'No Instructions' : ''}`);
    });
}
