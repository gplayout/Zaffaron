
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.resolve(__dirname, '../../ashpazi_refined.json');

// Map TheMealDB categories to our simple Category IDs (or create new ones)
// For simplicity, we'll put them in a generic "Global Cuisine" category or map dynamically.
// Let's create a new Category ID: 100 = Global / International
const GLOBAL_CATEGORY_ID = 100;

async function fetchRandomRecipe() {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await res.json();
    return data.meals[0];
}

async function fetchRecipes(count = 10) {
    const recipes = [];
    console.log(`Fetching ${count} global recipes...`);

    for (let i = 0; i < count; i++) {
        try {
            const raw = await fetchRandomRecipe();
            if (!raw) continue;

            // Transform to Ashpazi Schema
            const ingredients = [];
            for (let j = 1; j <= 20; j++) {
                const ingred = raw[`strIngredient${j}`];
                const measure = raw[`strMeasure${j}`];
                if (ingred && ingred.trim()) {
                    ingredients.push(`${measure ? measure : ''} ${ingred}`.trim());
                }
            }

            // Split instructions
            const instructions = raw.strInstructions
                .split(/\r\n|\n/)
                .filter(step => step.trim().length > 10);

            const recipe = {
                name: raw.strMeal, // Keep English name for "Global" feel
                recipe: raw.strInstructions, // Raw text
                categoryId: GLOBAL_CATEGORY_ID,
                categoryTitle: `International (${raw.strArea})`,
                ingredients: ingredients,
                instructions: instructions,
                prepTime: "20 mins", // Default/Estimate
                cookTime: "30 mins",
                servings: "4",
                difficulty: "Medium",
                tags: raw.strTags ? raw.strTags.split(',') : [raw.strArea, raw.strCategory],
                visualDescription: `A photorealistic shot of ${raw.strMeal} (${raw.strArea} cuisine).`,
                isReal: true,
                cleanedAt: new Date().toISOString(),
                image: raw.strMealThumb, // Use their high-res image directly!
                origin: raw.strArea,
                source: "TheMealDB"
            };

            recipes.push(recipe);
            console.log(`[+] Fetched: ${recipe.name} (${recipe.origin})`);
        } catch (e) {
            console.error("Error fetching recipe:", e);
        }
    }
    return recipes;
}

async function loadExistingRefined() {
    try {
        const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

async function main() {
    const args = process.argv.slice(2);
    const count = parseInt(args[0]) || 20;

    const newRecipes = await fetchRecipes(count);
    const existing = await loadExistingRefined();

    // Merge preventing duplicates (by name)
    const existingNames = new Set(existing.map(r => r.name));
    let addedCount = 0;

    for (const r of newRecipes) {
        if (!existingNames.has(r.name)) {
            existing.push(r);
            addedCount++;
        }
    }

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(existing, null, 2));
    console.log(`\nSuccess! Added ${addedCount} new international recipes.`);
    console.log(`Total Library Size: ${existing.length}`);
}

main();
