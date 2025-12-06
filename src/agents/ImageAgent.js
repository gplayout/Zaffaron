import { BaseAgent } from './BaseAgent.js';
import OpenAI from 'openai';

export class ImageAgent extends BaseAgent {
    constructor(apiKey) {
        super('ImageAgent');
        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    /**
     * Generates a DALL-E 3 image prompt for a recipe.
     */
    createPrompt(recipe) {
        // Use the visual description if available, otherwise fall back to name + ingredients
        const subject = recipe.visualDescription || `${recipe.name} containing ${recipe.ingredients.slice(0, 3).join(', ')}`;

        return `A 100% authentic, photorealistic food photograph of ${recipe.name}.
    Visual details: ${subject}.
    Style: Documentary food photography, shot on a 50mm lens. Natural window lighting.
    The food must look homemade, edible, and real.
    CRITICAL NEGATIVES: No plastic look, no AI artifacts, no 3D rendering style, no fantasy elements, no over-saturation, no smooth/fake textures.
    The image must be an exact match to the dish description.`;
    }

    /**
     * Generates an image URL for the recipe.
     * @param {Object} recipe 
     * @returns {Promise<string|null>} - The URL of the generated image or null
     */
    async generateImage(recipe) {
        this.log(`Generating image for: ${recipe.name}`);

        try {
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: this.createPrompt(recipe),
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url"
            });

            return response.data[0].url;
        } catch (error) {
            this.log(`Image generation failed: ${error.message}`, 'ERROR');
            return null;
        }
    }
}
