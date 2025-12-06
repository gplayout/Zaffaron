
import fs from 'fs';

const recipesPath = 'c:/Users/Mehdi/Desktop/Ashpazi/ashpazi-pwa/src/data/recipes.json';
const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

let found = [];

data.forEach(category => {
    if (category.items) {
        const matches = category.items.filter(r => r.name && r.name.includes('نان سوپ'));
        matches.forEach(m => {
            console.log(JSON.stringify(m, null, 2));
            found.push({ category: category.title, name: m.name });
        });
    }
});

console.log(`Found ${found.length} matches.`);
