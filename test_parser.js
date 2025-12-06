
import { parseRecipe, findRecipeByName } from './src/utils/dataParser.js';
import fs from 'fs';

const recipes = JSON.parse(fs.readFileSync('./src/data/recipes.json', 'utf8'));

// Test Lookup
const name = "نان-سوپ"; // URL slug format
const recipe = findRecipeByName(recipes, name);
console.log("Found Recipe:", recipe ? recipe.name : "Not Found");

if (recipe) {
    // Test Parsing
    try {
        const parsed = parseRecipe(recipe.recipe);
        console.log("Parsed Ingredients:", parsed.ingredients.length);
        console.log("Parsed Instructions:", parsed.instructions.length);
        console.log("First Ingredient:", parsed.ingredients[0]);
    } catch (error) {
        console.error("Parsing Error:", error);
    }
}
