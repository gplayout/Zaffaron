
const parseRecipe = (recipeText) => {
    if (!recipeText) return { ingredients: [], instructions: [] };

    // Normalize newlines and Persian characters
    const text = recipeText
        .replace(/\r\n/g, '\n')
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک');

    // Define regex patterns for headers
    const ingredientsHeaderPattern = /(?:\*\*\*|▪|•|●)?\s*مواد لازم\s*(?:\*\*\*|:|•|●)?/i;
    const instructionsHeaderPattern = /(?:\*\*\*|▪|•|●)?\s*(?:طرز تهیه|روش تهیه|چگونگی تهیه|دستور پخت|روش پخت|طرز پخت)\s*(?:\*\*\*|:|•|●)?/i;

    // Find start indices
    const ingredientsMatch = text.match(ingredientsHeaderPattern);
    const instructionsMatch = text.match(instructionsHeaderPattern);

    console.log("Ingredients Match:", ingredientsMatch);
    console.log("Instructions Match:", instructionsMatch);

    let ingredientsRaw = '';
    let instructionsRaw = '';

    if (ingredientsMatch && instructionsMatch) {
        if (ingredientsMatch.index < instructionsMatch.index) {
            ingredientsRaw = text.substring(ingredientsMatch.index + ingredientsMatch[0].length, instructionsMatch.index);
            instructionsRaw = text.substring(instructionsMatch.index + instructionsMatch[0].length);
        } else {
            instructionsRaw = text.substring(instructionsMatch.index + instructionsMatch[0].length, ingredientsMatch.index);
            ingredientsRaw = text.substring(ingredientsMatch.index + ingredientsMatch[0].length);
        }
    } else if (ingredientsMatch) {
        ingredientsRaw = text.substring(ingredientsMatch.index + ingredientsMatch[0].length);
    } else if (instructionsMatch) {
        instructionsRaw = text.substring(instructionsMatch.index + instructionsMatch[0].length);
        if (instructionsMatch.index > 0) {
            ingredientsRaw = text.substring(0, instructionsMatch.index);
        }
    } else {
        instructionsRaw = text;
    }

    const cleanLines = (str) => {
        if (!str) return [];
        return str
            .split('\n')
            .map(line => line.trim())
            .map(line => line.replace(/^[-▪•*●.]+\s*/, ''))
            .filter(line => line.length > 0 && line !== '-' && !line.match(/^\s*$/));
    };

    return {
        ingredients: cleanLines(ingredientsRaw),
        instructions: cleanLines(instructionsRaw)
    };
};

const sampleText = `*** مواد لازم ***\nبرای چهار نفر روغن - دو قاشق غذاخوریسیر ساطوری شده - چهار حبهپیاز، ریز خرد شده - یک عدداستیک گوساله نازک خرد شده - 500 گرمماکارونی آبکشی شده - 250 گرمسس سویا - دو قاشق غذاخوریجوانه لوبیا یا گندم - 110 گرمهویج خلالی نازک شده - دو عددفلفل قرمز تند، حلقه شده - دو عددپیازچه، درشت خرد شده - دو شاخهزیره - نصف قاشق چایخوریزردچوبه - یک قاشق چایخوریرب گوجه‌فرنگی - یک قاشق غذاخورینمک و فلفل - به میزان لازم ماکارونی گوشت گوساله\n\n*** طرز تهیه ***\nروغن را در تابه حرارت دهید، سیر و پیاز را در آن تفت دهید تا طلایی شوند. زردچوبه، زیره، سس سویا و گوشت را درون تابه بریزید و هم بزنید. در تابه را ببندید تا گوشت با حرارت کم بپزد. اگر لازم بود کمی آب در آن بریزید. وقتی گوشت پخت و به روغن افتاد بقیه مواد را به آن اضافه و هم بزنید تا کاملا با هم مخلوط شوند. پنج دقیقه بعد غذا آماده است و می‌توانید آن را سرو کنید. انواع خوراک ماکارونی`;

const result = parseRecipe(sampleText);
console.log("Result:", JSON.stringify(result, null, 2));
