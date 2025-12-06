
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { RecipeAgent } from '../src/agents/RecipeAgent.js';
import { ImageAgent } from '../src/agents/ImageAgent.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, '../../ashpazi_completed.json');
const OUTPUT_FILE = path.resolve(__dirname, '../../ashpazi_refined.json');
const IMAGES_DIR = path.resolve(__dirname, '../public/images/recipes');

// Parse args: node batch_processor.js [start_index] [batch_size]
const args = process.argv.slice(2);
const START_INDEX = parseInt(args[0]) || 0;
const BATCH_SIZE = parseInt(args[1]) || 100;

async function downloadImage(url, filepath) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
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
    console.log("Starting Batch Processor...");

    // Initialize Agents
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("Error: OPENAI_API_KEY not found in .env");
        process.exit(1);
    }

    const recipeAgent = new RecipeAgent(apiKey);
    const imageAgent = new ImageAgent(apiKey);

    // Ensure directories exist
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Read Input
    console.log(`Reading from ${INPUT_FILE}...`);
    const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
    const categories = JSON.parse(rawData);

    // Flatten recipes
    const allRecipes = [];
    categories.forEach(cat => {
        cat.items.forEach(item => {
            allRecipes.push({ ...item, categoryId: cat.id, categoryTitle: cat.title });
        });
    });

    console.log(`Found total ${allRecipes.length} recipes.`);
    console.log(`Processing batch of ${BATCH_SIZE} recipes starting from index ${START_INDEX}...`);

    // Load existing progress
    let refinedRecipes = await loadExistingRefined();

    // Create a map for quick lookup to enable updates
    const refinedMap = new Map(refinedRecipes.map(r => [r.name, r]));

    const recipesToProcess = allRecipes.slice(START_INDEX, START_INDEX + BATCH_SIZE);
    let processedCount = 0;

    for (const recipe of recipesToProcess) {
        console.log(`-----------------------------------`);
        console.log(`[${START_INDEX + processedCount + 1}/${allRecipes.length}] Processing: ${recipe.name}`);

        try {
            // 1. Clean Text
            let cleanRecipe = await recipeAgent.clean(recipe);

            // 2. Generate/Check Image
            const slug = cleanRecipe.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '');
            const imageFilename = `${slug}.jpg`;
            const localImagePath = path.join(IMAGES_DIR, imageFilename);
            const publicImagePath = `/images/recipes/${imageFilename}`;

            // Check local image
            try {
                await fs.access(localImagePath);
                console.log(`Image exists: ${imageFilename}`);
                cleanRecipe.image = publicImagePath;
            } catch (e) {
                // Generate if missing and real
                if (cleanRecipe.isReal !== false) {
                    console.log("Generating new image...");
                    const imageUrl = await imageAgent.generateImage(cleanRecipe);
                    if (imageUrl) {
                        await downloadImage(imageUrl, localImagePath);
                        cleanRecipe.image = publicImagePath;
                        console.log(`Saved image: ${imageFilename}`);
                    }
                } else {
                    console.log("Skipping image (Recipe marked as fake/invalid).");
                }
            }

            // Update map
            refinedMap.set(cleanRecipe.name, cleanRecipe);

            // Save incrementally (every 5 items) to avoid data loss
            if (processedCount % 5 === 0) {
                await fs.writeFile(OUTPUT_FILE, JSON.stringify(Array.from(refinedMap.values()), null, 2));
            }

        } catch (err) {
            console.error(`Failed to process ${recipe.name}:`, err);
        }

        processedCount++;
    }

    // Final Save
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(Array.from(refinedMap.values()), null, 2));

    console.log(`-----------------------------------`);
    console.log(`Batch Complete. Processed ${processedCount} recipes.`);
    console.log(`Total refined recipes in database: ${refinedMap.size}`);
    console.log(`To continue, run: node scripts/batch_processor.js ${START_INDEX + BATCH_SIZE} ${BATCH_SIZE}`);
}

main().catch(console.error);
