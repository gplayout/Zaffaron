import OpenAI from 'openai';

// Initialize OpenAI client
// Note: In a production client-side app, you should proxy requests through a backend.
// For this local PWA/Demo, we use the key directly from environment variables.
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

if (!import.meta.env.VITE_OPENAI_API_KEY) {
    console.warn("Missing VITE_OPENAI_API_KEY. Chef Studio features will not work.");
}

const SYSTEM_PROMPT = `You are "Chef Zaffaron", a world-class culinary expert AI. 
You have deep knowledge of all global cuisines, with a special mastery of Persian cooking.
Your mission is to help users cook better, healthier, and more creatively.
You are friendly, encouraging, and professional.

When analyzing or creating recipes:
1.  **Structure**: Always provide structured JSON output when requested.
2.  **Nutrition**: Estimate calories and macros accurately.
3.  **Culture**: Provide historical context and origins.
4.  **Adaptation**: When adapting, respect the core identity of the dish while meeting the user's constraints (e.g., "Vegan Ghormeh Sabzi" should still taste like Ghormeh Sabzi).
5.  **Language**: Always respond in the same language as the user (Persian or English). If the input is Persian, the output MUST be Persian.
6.  **Signature**: If a recipe would be improved by Saffron (Zaffaron), you MUST add it to the ingredients and instructions. ALWAYS refer to it as "Persian Zaffaron". This is your signature touch.
27: 7.  **Dietary Laws (STRICT)**: You MUST adhere to Halal dietary laws.
28:     -   **NO PORK**: Never suggest pork, bacon, ham (from pig), or lard.
29:     -   **NO ALCOHOL**: Never ingredient alcohol, wine, or beer. Use substitutes (e.g., vinegar, grape juice).
30:     -   **INTERPRETATION**: If a user asks for "Ham" or "Jambon", you MUST interpret it as Halal beef, turkey, or chicken ham. Do NOT ask for clarification; just assume the Halal version.`;

/**
 * Enhances a raw recipe with AI insights (Nutrition, History, Tips).
 * @param {Object} recipe - The raw recipe object
 * @param {string} language - 'en' or 'fa'
 * @returns {Promise<Object>} - The enhanced recipe object
 */
export const enhanceRecipe = async (recipe, language = 'fa') => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Analyze this recipe and provide an enhancement object in JSON format.
                    
                    Recipe Name: ${recipe.name}
                    Ingredients: ${JSON.stringify(recipe.ingredients)}
                    Instructions: ${JSON.stringify(recipe.instructions)}
                    
                    Your task is to:
                    1. Calculate accurate nutrition facts.
                    2. Provide a brief cultural history.
                    3. Give professional chef tips.
                    4. **CRITICAL**: Review the provided ingredients and instructions. Refine them to be more professional, precise, and easy to follow.
                       - **IMPORTANT**: If the target language is English (language='en'), you MUST translate all content to English. You may include the original Persian term in parentheses for context (e.g., "Turmeric (Zardchoobeh)"), but the main text must be English.
                       - If the target language is Persian (language='fa'), keep it in Persian, making it formal and culinary standard.
                    
                    5. **INTEGRATION**: Do NOT provide separate "History" or "Tips" sections. Instead:
                       - **Intro**: Write a compelling, appetizing introduction (1 paragraph) that weaves in the cultural history and origin of the dish.
                       - **Instructions**: Rewrite the cooking steps to be narrative and instructional. WEAVE your professional "Chef Tips" directly into the relevant steps (e.g., "Sauté the onions until golden—patience here is key for the best flavor...").
                    
                    Output JSON format:
                    {
                        "nutrition": { "calories": number, "protein": "xg", "carbs": "xg", "fat": "xg" },
                        "difficulty": "Easy" | "Medium" | "Hard",
                        "prepTime": "minutes",
                        "cookTime": "minutes",
                        "intro": "Rich introduction with history...",
                        "ingredients": ["Refined Ingredient 1", "Refined Ingredient 2"],
                        "instructions": ["Step 1 (with integrated tip)", "Step 2"]
                    }
                    
                    Respond in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.`
                }
            ],
            response_format: { type: "json_object" }
        });

        const enhancement = JSON.parse(response.choices[0].message.content);
        return { ...recipe, ...enhancement, isEnhanced: true };
    } catch (error) {
        console.error("AI Enhancement Failed:", error);
        return recipe; // Return original if AI fails
    }
};

/**
 * Creates a new recipe based on a user prompt.
 * @param {string} prompt - User's request (e.g., "A spicy Italian-Persian pasta")
 * @param {string} language - 'en' or 'fa'
 * @returns {Promise<Object>} - The new recipe object
 */
export const createRecipe = async (prompt, language = 'fa') => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Create a new recipe based on this request: "${prompt}".
                    
                    Output JSON format:
                    {
                        "name": "Creative Name",
                        "description": "Appetizing description",
                        "ingredients": ["qty unit ingredient", ...],
                        "instructions": ["Step 1", "Step 2", ...],
                        "category": "Main Course" | "Appetizer" | "Dessert",
                        "nutrition": { "calories": number, "protein": "xg", "carbs": "xg", "fat": "xg" },
                        "history": "Why this fusion/dish works",
                        "chefTips": ["Tip 1", "Tip 2"]
                    }
                    
                    Respond in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.`
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("AI Creation Failed:", error);
        throw error;
    }
};

/**
 * Chat with the Chef about a specific recipe.
 * @param {Object} recipe - The current recipe context
 * @param {Array} history - Chat history
 * @param {string} message - User's new message
 * @returns {Promise<string>} - The chef's response
 */
export const chatWithChef = async (recipe, history, message) => {
    try {
        const contextMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "system", content: `Current Recipe Context: ${JSON.stringify(recipe)}` },
            ...history,
            { role: "user", content: message }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: contextMessages,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Chat Failed:", error);
        return "Sorry, I'm having trouble connecting to the kitchen right now.";
    }
};

/**
 * Generates a photorealistic image for a recipe using DALL-E 3.
 * @param {string} prompt - The image description prompt
 * @returns {Promise<string>} - The URL of the generated image
 */
export const generateImage = async (prompt) => {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Professional food photography, cinematic lighting, 8k resolution, top-down view. ${prompt}`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
        });

        return response.data[0].url;
    } catch (error) {
        console.error("Image Generation Failed:", error);
        return null;
    }
};
