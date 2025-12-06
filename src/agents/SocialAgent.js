
import { BaseAgent } from './BaseAgent.js';
import OpenAI from 'openai';
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

export class SocialAgent extends BaseAgent {
    constructor(apiKey) {
        super('SocialAgent');
        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });

        // Define styles
        this.COLORS = {
            primary: '#FFD700', // Gold
            background: '#1a1a1a',
            text: '#ffffff'
        };
    }

    /**
     * Generates a complete social media package for a recipe.
     * @param {Object} recipe 
     * @param {String} outputDir Path to save assets.
     */
    async createContent(recipe, outputDir) {
        this.log(`Creating social content for: ${recipe.name}`);

        await fs.mkdir(outputDir, { recursive: true });

        // 1. Generate Caption
        const caption = await this.generateCaption(recipe);

        // 2. Create Story Image (9:16)
        const storyBuffer = await this.createStoryImage(recipe);

        // Save assets
        const slug = recipe.name.replace(/\s+/g, '-').substring(0, 20);
        const captionPath = path.join(outputDir, `${slug}_caption.txt`);
        const imagePath = path.join(outputDir, `${slug}_story.png`);

        await fs.writeFile(captionPath, caption);
        await fs.writeFile(imagePath, storyBuffer);

        return { captionPath, imagePath };
    }

    async generateCaption(recipe) {
        const prompt = `Create an engaging Instagram caption for this dish: "${recipe.name}".
        
        Context: A Global Cooking Platform (Zaffaron).
        Target Audience: Home Cooks & Food Lovers Worldwide (No regional limits).
        Language: English (Primary).
        
        Include:
        - A hook question related to the cuisine/flavor.
        - Brief, appetizing description.
        - CTA: "Link in bio for the full recipe!"
        - Hashtags: Mix of specific (e.g. #${recipe.categoryTitle || 'Food'}) and global (#WorldCuisine #HomeCooking #ChefLife #Zaffaron).
        `;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }]
        });

        return response.choices[0].message.content;
    }

    async createStoryImage(recipe) {
        // Setup Canvas (1080x1920 for Stories)
        const width = 1080;
        const height = 1920;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = this.COLORS.background;
        ctx.fillRect(0, 0, width, height);

        // Load Recipe Image
        // Ideally we use the full high-res path. For now assumes local path relative to script
        // Note: verify path logic in integration. 
        // Here we'll try to load the buffer directly or a placeholder if testing.
        try {
            // In a real flow, we'd pass the full absolute path of the generated image
            // For this agent code, we'll assume 'recipe.localPath' is accurate or handle errors.
            if (recipe.image) {
                // If it's a relative path /images/..., resolving it might be tricky without __dirname context
                // Accepting we might need to fix path passing.
                // Fallback to a gradient if image fails.

                // Draw Gradient Placeholder
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#2b2b2b');
                gradient.addColorStop(1, '#000000');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
        } catch (e) {
            console.error("Failed to load image for canvas", e);
        }

        // Overlay Text
        ctx.fillStyle = this.COLORS.text;
        ctx.font = 'bold 80px Sans';
        ctx.textAlign = 'center';
        ctx.fillText(recipe.name, width / 2, height / 2);

        ctx.fillStyle = this.COLORS.primary;
        ctx.font = '50px Sans';
        ctx.fillText("New Recipe!", width / 2, (height / 2) - 100);

        ctx.fillStyle = '#cccccc';
        ctx.font = '40px Sans';
        ctx.fillText("Check Link in Bio", width / 2, height - 200);

        return canvas.toBuffer('image/png');
    }
}
