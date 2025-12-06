import fs from 'fs';

const recipesData = JSON.parse(fs.readFileSync('./src/data/recipes.json', 'utf8'));

const targetNames = [
    "تاریخچه پیتزا",
    "استیک کوردن بلوی فرانسوی",
    "مربای توت فرنگی",
    "سوپ اسپانيائی",
    "ببرهای خوراکی"
];

recipesData.forEach(category => {
    category.items.forEach(recipe => {
        if (targetNames.includes(recipe.name)) {
            console.log(`\n--- ${recipe.name} ---`);
            console.log(JSON.stringify(recipe.recipe));
        }
    });
});
