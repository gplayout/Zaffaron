
import { SocialAgent } from '../src/agents/SocialAgent.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, 'social_output');

async function main() {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const agent = new SocialAgent(apiKey);

    const mockRecipe = {
        name: "Ghormeh Sabzi",
        image: "/images/recipes/ghormeh-sabzi.jpg" // Path isn't used for real image load yet in agent draft
    };

    console.log("Testing Social Agent...");
    try {
        const result = await agent.createContent(mockRecipe, OUTPUT_DIR);
        console.log("Success!");
        console.log("Caption saved to:", result.captionPath);
        console.log("Image saved to:", result.imagePath);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

main();
