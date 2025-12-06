
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required.');
    process.exit(1);
}

async function translateRecipe(text) {
    const prompt = `
    Translate this Farsi text to English JSON (name, description, ingredients, instructions):
    ${text}
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
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                if (res.statusCode !== 200) {
                    console.error('Body:', body);
                    reject(new Error(`API Error: ${res.statusCode}`));
                    return;
                }
                try {
                    const response = JSON.parse(body);
                    console.log('Response:', response.choices[0].message.content);
                    resolve(response);
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

translateRecipe("ماکارونی با پنیر").catch(console.error);
