
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const recipesPath = path.join(__dirname, '../src/data/recipes.json');

try {
    const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
    let updatedCount = 0;

    data.forEach(category => {
        if (category.items) {
            category.items.forEach(item => {
                if (!item.id) {
                    item.id = crypto.randomUUID();
                    updatedCount++;
                }
            });
        }
    });

    if (updatedCount > 0) {
        fs.writeFileSync(recipesPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully added IDs to ${updatedCount} recipes.`);
    } else {
        console.log('No recipes needed ID updates.');
    }

} catch (error) {
    console.error('Error updating recipes:', error);
}
