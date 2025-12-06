import { BaseAgent } from './BaseAgent.js';
import OpenAI from 'openai';

export class RecipeAgent extends BaseAgent {
    constructor(apiKey) {
        super('RecipeAgent');
        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Allowed because we might use this in a local tool/client-side
        });
    }

    /**
     * Cleans and structures a raw recipe using LLM.
     * @param {Object} rawRecipe - The recipe object from the current JSON
     * @returns {Promise<Object>} - Structured recipe
     */
    async clean(rawRecipe) {
        this.log(`Cleaning recipe: ${rawRecipe.name}`);

        const systemPrompt = `
      You are an expert Culinary Data Chef. Your goal is to transform raw recipe text into a perfectly structured JSON object.
      
      Input Text often contains mixed "Ingredients" and "Instructions" stuck together, sometimes in Persian.
      
      Output JSON Schema:
      {
        "name": "Corrected Persian Name",
        "ingredients": ["item 1", "item 2"],
        "instructions": ["Step 1", "Step 2"],
        "prepTime": "estimated string (e.g. 15 mins)",
        "cookTime": "estimated string",
        "servings": "estimated number",
        "difficulty": "Easy" | "Medium" | "Hard",
        "tags": ["tag1", "tag2"],
        "visualDescription": "A detailed, photorealistic visual description of what the finished dish looks like (e.g. 'A bowl of green herb stew with red kidney beans and whole dried limes, served with white saffron rice'). Used for image generation.",
        "isReal": boolean // Set to false if the recipe looks like gibberish or non-food
      }

      Rules:
      1. Fix typos in Persian.
      2. Ensure ingredients have quantities if possible.
      3. Split instructions into logical steps.
      4. Do NOT verify the "Truth" of the recipe (if it says add sugar to omelet, do it), but DO verify if it's actually a recipe.
    `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Recipe Name: ${rawRecipe.name}\n\nRaw Content: ${rawRecipe.recipe}` }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content);

            // Merge with original ID and slug if needed
            return {
                ...rawRecipe,
                ...result,
                cleanedAt: new Date().toISOString()
            };

        } catch (error) {
            this.log(`Error cleaning recipe: ${error.message}`, 'ERROR');
            return rawRecipe; // Return original on failure
        }
    }

    /**
     * Suggests a recipe based on ingredients (Live Mode)
     * @param {string} ingredients - User provided ingredients or request
     * @returns {Promise<Object>} - Suggested recipe
     */
    async suggestRecipe(ingredients) {
        this.log(`Suggesting recipe for: ${ingredients}`);

        const systemPrompt = `
      You are a World-Class International Chef. 
      The user will give you a list of ingredients or a general request (e.g., "I have eggs and tomatoes").
      To suggest a unique, delicious recipe. 
      CRITICAL RULES:
      1. Do NOT default to Persian food unless the ingredients strongly suggest it (e.g., saffron, barberries).
      2. Consider Italian, Mexican, Japanese, French, Indian, or Mediterranean cuisines.
      3. The recipe must be practical and real.
      
      Output JSON Schema:
      {
        "name": "Recipe Name (English)",
        "description": "Brief tempting description",
        "cuisine": "Origin (e.g. Italian)",
        "ingredients": ["item 1", "item 2"],
        "instructions": ["Step 1", "Step 2"],
        "prepTime": "15 mins",
        "difficulty": "Easy"
      }
    `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `I have these ingredients: ${ingredients}` }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content);
            return {
                ...result,
                id: 'generated_' + Date.now(),
                image: '/images/default-recipe.jpg'
            };

        } catch (error) {
            this.log(`Error suggesting recipe: ${error.message}`, 'ERROR');
            throw error;
        }
    }
}
