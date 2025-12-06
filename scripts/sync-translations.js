
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RECIPES_PATH = path.join(__dirname, '../src/data/recipes.json');
const TRANSLATIONS_PATH = path.join(__dirname, '../src/data/translations.en.json');
const API_KEY = process.env.OPENAI_API_KEY || process.argv[2];

if (!API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable or argument is required.');
    process.exit(1);
}

// --- Helper Functions ---

function computeHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function loadJSON(filepath) {
    if (!fs.existsSync(filepath)) return {};
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function saveJSON(filepath, data) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

async function translateRecipe(recipe) {
    const prompt = `
    You are a professional translator and chef. 
    Translate the following Farsi recipe into English. 
    Return ONLY a valid JSON object with this structure:
    {
        "name": "English Name",
        "description": "A short appetizing description (max 20 words)",
        "ingredients": ["Ingredient 1", "Ingredient 2"],
        "instructions": ["Step 1", "Step 2"]
    }

    Recipe Name: ${recipe.name}
    Recipe Content: ${recipe.recipe}
    `;

    const data = JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`API Error: ${res.statusCode} ${body}`));
                    return;
                }
                try {
                    const response = JSON.parse(body);
                    const content = JSON.parse(response.choices[0].message.content);
                    resolve(content);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

// --- Main Logic ---

async function main() {
    console.log('Starting translation sync...');

    const recipesData = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
    const translations = loadJSON(TRANSLATIONS_PATH);

    let updatedCount = 0;
    let errorCount = 0;

    // Flatten recipes list
    const allRecipes = [];
    recipesData.forEach(cat => {
        if (cat.items) allRecipes.push(...cat.items);
    });

    console.log(`Found ${allRecipes.length} recipes.`);

    for (const recipe of allRecipes) {
        if (!recipe.id) {
            console.warn(`Skipping recipe without ID: ${recipe.name}`);
            continue;
        }

        const farsiContent = (recipe.name || '') + (recipe.recipe || '');
        const currentHash = computeHash(farsiContent);
        const existing = translations[recipe.id];

        if (!existing || existing.sourceHash !== currentHash) {
            console.log(`Translating: ${recipe.name}...`);
            try {
                const translatedData = await translateRecipe(recipe);
                translations[recipe.id] = {
                    ...translatedData,
                    sourceHash: currentHash,
                    lastUpdated: new Date().toISOString()
                };
                updatedCount++;

                // Save periodically
                if (updatedCount % 5 === 0) {
                    saveJSON(TRANSLATIONS_PATH, translations);
                    console.log(`Saved progress (${updatedCount} translated).`);
                }

                // Rate limit protection (simple delay)
                await new Promise(r => setTimeout(r, 500));

            } catch (err) {
                console.error(`Failed to translate ${recipe.name}:`, err.message);
                errorCount++;
            }
        }
    }

    saveJSON(TRANSLATIONS_PATH, translations);
    console.log(`Sync complete. Updated: ${updatedCount}, Errors: ${errorCount}`);
}

main();
