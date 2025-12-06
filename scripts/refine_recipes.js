import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECIPES_PATH = path.resolve(__dirname, '../src/data/recipes.json');
const OUTPUT_PATH = path.resolve(__dirname, '../src/data/recipes_enhanced.json');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
});

if (!process.env.VITE_OPENAI_API_KEY) {
    console.error("❌ Missing VITE_OPENAI_API_KEY in .env file");
    process.exit(1);
}

const SYSTEM_PROMPT = `You are "Chef Zaffaron", a world-class culinary expert AI. 
Your task is to polish recipe data to be professional, appetizing, and structured.

CRITICAL RULES:
1. If a recipe would be improved by Saffron (Zaffaron), you MUST add it to the ingredients and instructions. This is your SIGNATURE touch.
2. ALWAYS refer to Saffron as "Persian Zaffaron".
3. Respond ONLY with the enhanced JSON object.`;

/**
 * Polishes the recipe text (Intro, Instructions, Tags)
 */
async function polishRecipeText(recipe) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Enhance this recipe.
                    
                    Input:
                    Name: ${recipe.name}
                    Raw Text: ${recipe.recipe}
                    
                    Tasks:
                    1. Parse the 'Raw Text' to extract ingredients and instructions.
                    2. Write a short, appetizing 'intro' (1-2 sentences).
                    3. Clean up 'instructions' to be clear and numbered.
                    4. Suggest 3-5 'tags' (e.g., "Vegetarian", "Quick", "Persian").
                    5. Estimate 'prepTime' and 'cookTime'.
                    
                    Output JSON:
                    {
                        "intro": "...",
                        "ingredients": ["..."],
                        "instructions": ["..."],
                        "tags": ["..."],
                        "prepTime": "XX mins",
                        "cookTime": "XX mins"
                    }`
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error(`❌ Failed to polish text for ${recipe.name}:`, error.message);
        return null;
    }
}

/**
 * Generates a Hero Image using DALL-E 3
 */
async function generateHeroImage(recipe) {
    try {
        const prompt = `Professional food photography of ${recipe.name}, ${recipe.intro || 'delicious dish'}. Cinematic lighting, 8k resolution, top-down view on a rustic wooden table.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
        });

        return response.data[0].url;
    } catch (error) {
        console.error(`❌ Failed to generate image for ${recipe.name}:`, error.message);
        return null;
    }
}

async function main() {
    console.log("👨‍🍳 Starting Recipe Refinery...");

    // 1. Load Original Recipes
    let categories = [];
    try {
        const data = await fs.readFile(RECIPES_PATH, 'utf8');
        categories = JSON.parse(data);
        console.log(`📚 Loaded ${categories.length} categories from source.`);
    } catch (error) {
        console.error("❌ Could not load recipes:", error.message);
        process.exit(1);
    }

    // 2. Load Existing Enhanced Recipes (Resumption Logic)
    let enhancedCategories = [...categories];
    try {
        const existingData = await fs.readFile(OUTPUT_PATH, 'utf8');
        const existingEnhanced = JSON.parse(existingData);
        // Merge existing progress
        if (existingEnhanced && existingEnhanced.length > 0) {
            enhancedCategories = existingEnhanced;
            console.log(`🔄 Resuming... Loaded existing progress.`);
        }
    } catch (error) {
        console.log("🆕 No existing enhanced data found. Starting fresh.");
    }

    // 3. Process Batch
    const BATCH_SIZE = 2000; // Set high to process all
    let processedCount = 0;

    console.log(`🚀 Starting migration for up to ${BATCH_SIZE} recipes...`);

    outerLoop:
    for (let i = 0; i < enhancedCategories.length; i++) {
        const category = enhancedCategories[i];

        if (!category.items) continue;

        for (let j = 0; j < category.items.length; j++) {
            if (processedCount >= BATCH_SIZE) break outerLoop;

            const recipe = category.items[j];

            // Skip if already enhanced
            if (recipe.isEnhanced) {
                continue;
            }

            console.log(`\n🍳 Processing [${i}-${j}]: ${recipe.name}`);

            // A. Polish Text
            const polishedData = await polishRecipeText(recipe);
            if (polishedData) {
                enhancedCategories[i].items[j] = { ...recipe, ...polishedData };
                console.log("   ✅ Text Polished");
            }

            // B. Generate Image (ALWAYS generate, ignore legacy images)
            console.log("   🎨 Generating Image...");
            const imageUrl = await generateHeroImage(enhancedCategories[i].items[j]);
            if (imageUrl) {
                enhancedCategories[i].items[j].image = imageUrl;
                console.log("   ✅ Image Generated");
            } else {
                console.log("   ⚠️ Image generation failed, keeping original or empty.");
            }

            // Mark as enhanced
            enhancedCategories[i].items[j].isEnhanced = true;
            processedCount++;

            // Save progress periodically (every item to be safe)
            await fs.writeFile(OUTPUT_PATH, JSON.stringify(enhancedCategories, null, 2));
        }
    }

    console.log(`\n✨ Batch Complete! Enhanced ${processedCount} new recipes.`);
    console.log(`💾 Saved to: ${OUTPUT_PATH}`);
}

main();
