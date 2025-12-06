
import { BaseAgent } from './BaseAgent.js';
import OpenAI from 'openai';

export class MarketingAgent extends BaseAgent {
    constructor(apiKey) {
        super('MarketingAgent');
        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    /**
     * Generates SEO metadata for a recipe.
     * @param {Object} recipe 
     * @returns {Promise<Object>} { title, metaDescription, keywords }
     */
    async generateSEO(recipe) {
        this.log(`Generating SEO for: ${recipe.name}`);

        const prompt = `act as an SEO Expert. Generate optimized metadata for this recipe.
        
        Recipe: "${recipe.name}"
        Category: "${recipe.categoryTitle}"
        Visual: "${recipe.visualDescription || ''}"
        
        Return JSON only:
        {
            "seoTitle": "Engaging Title (max 60 chars) | Zaffaron - Global Flavors",
            "metaDescription": "Compelling description including keywords (max 160 chars). Focus on taste and origin.",
            "keywords": ["keyword1", "keyword2", "keyword3", "recipe", "cooking", "homemade"]
        }`;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an SEO specialist for a Global Cooking App (Zaffaron)." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            this.log(`SEO Generation Failed: ${error.message}`, 'ERROR');
            return null;
        }
    }
}
