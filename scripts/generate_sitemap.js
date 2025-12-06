import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://zaffaron.app'; // Replace with actual domain
const RECIPES_PATH = path.join(__dirname, '../src/data/recipes.json');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

async function generateSitemap() {
    console.log("🗺️ Generating Sitemap...");

    try {
        const data = await fs.readFile(RECIPES_PATH, 'utf8');
        const recipes = JSON.parse(data);

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${BASE_URL}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${BASE_URL}/chef-studio</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
`;

        recipes.forEach(category => {
            if (category.items) {
                category.items.forEach(recipe => {
                    const slug = encodeURIComponent(recipe.name.replace(/\s+/g, '-'));
                    sitemap += `    <url>
        <loc>${BASE_URL}/recipe/${slug}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>\n`;
                });
            }
        });

        sitemap += '</urlset>';

        await fs.writeFile(OUTPUT_PATH, sitemap);
        console.log(`✅ Sitemap generated at ${OUTPUT_PATH}`);

    } catch (error) {
        console.error("❌ Error generating sitemap:", error);
    }
}

generateSitemap();
