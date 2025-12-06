import fs from 'fs';
import { parseRecipe } from './src/utils/dataParser.js';

const DATA_FILE = './src/data/recipes.json';
const BACKUP_FILE = './src/data/recipes.backup.json';

// 1. Backup
console.log("Creating backup...");
fs.copyFileSync(DATA_FILE, BACKUP_FILE);
console.log(`Backup saved to ${BACKUP_FILE}`);

// 2. Read Data
const recipesData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let modifiedCount = 0;
let removedCount = 0;

// 3. Process
const cleanedData = recipesData.map(category => {
    const validItems = category.items.filter(recipe => {
        // Safety check
        if (!recipe || !recipe.recipe) {
            console.log(`Removing invalid entry (no recipe text): [${category.title}] ${recipe ? recipe.name : 'Unknown'}`);
            removedCount++;
            return false;
        }

        // Filter garbage
        if (recipe.name.includes("Error") || recipe.recipe.includes("Error fetching URL") || recipe.recipe.includes("Status code 404")) {
            console.log(`Removing garbage entry: [${category.title}] ${recipe.name}`);
            removedCount++;
            return false;
        }
        return true;
    }).map(recipe => {
        // Parse using our improved logic
        const { ingredients, instructions } = parseRecipe(recipe.recipe);

        // Reconstruct standard format
        // Normalize Persian characters in the content
        const cleanIngredients = ingredients.map(line => line.replace(/ي/g, 'ی').replace(/ك/g, 'ک')).join('\n');
        const cleanInstructions = instructions.map(line => line.replace(/ي/g, 'ی').replace(/ك/g, 'ک')).join('\n');

        let newRecipeText = "";

        if (cleanIngredients) {
            newRecipeText += `*** مواد لازم ***\n${cleanIngredients}\n\n`;
        }

        if (cleanInstructions) {
            newRecipeText += `*** طرز تهیه ***\n${cleanInstructions}`;
        }

        // If both are empty, keep original (though it might be empty)
        if (!newRecipeText.trim()) {
            newRecipeText = recipe.recipe;
        }

        if (newRecipeText !== recipe.recipe) {
            modifiedCount++;
        }

        return {
            ...recipe,
            recipe: newRecipeText.trim()
        };
    });

    return {
        ...category,
        items: validItems
    };
});

// 4. Save
console.log(`Saving cleaned data...`);
fs.writeFileSync(DATA_FILE, JSON.stringify(cleanedData, null, 2), 'utf8');

console.log("--------------------------------------------------");
console.log(`Process Complete.`);
console.log(`- Removed ${removedCount} garbage entries.`);
console.log(`- Standardized ${modifiedCount} recipes.`);
console.log(`- Backup available at ${BACKUP_FILE}`);
