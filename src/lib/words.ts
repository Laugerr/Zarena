// Curated drawable words — every word here can be sketched and guessed visually.
// Organized by category for maintainability.

const ANIMALS = [
  "cat", "dog", "fish", "bird", "shark", "whale", "dolphin", "elephant",
  "giraffe", "lion", "tiger", "bear", "penguin", "owl", "eagle", "snake",
  "frog", "turtle", "rabbit", "horse", "cow", "pig", "duck", "monkey",
  "gorilla", "zebra", "crocodile", "wolf", "fox", "deer", "kangaroo",
  "koala", "panda", "flamingo", "parrot", "octopus", "jellyfish", "crab",
  "lobster", "starfish", "butterfly", "bee", "ant", "ladybug", "dragonfly",
  "spider", "scorpion", "bat", "hedgehog", "squirrel", "beaver", "otter",
  "seal", "walrus", "polar bear", "hamster", "peacock", "toucan", "chameleon",
  "sloth", "narwhal", "platypus", "axolotl", "capybara", "meerkat",
  "cheetah", "rhino", "hippo", "camel", "llama", "alpaca", "ostrich",
  "pelican", "stork", "hummingbird", "woodpecker", "swan", "goose",
  "rooster", "donkey", "sheep", "goat", "moose", "bison", "porcupine",
  "skunk", "raccoon", "armadillo", "manatee", "piranha", "stingray",
  "clownfish", "seahorse", "lobster", "praying mantis", "firefly",
];

const FOOD_AND_DRINKS = [
  "pizza", "burger", "hot dog", "sandwich", "taco", "sushi", "noodles",
  "pasta", "cake", "donut", "cookie", "ice cream", "chocolate", "waffle",
  "pancake", "apple", "banana", "orange", "strawberry", "watermelon",
  "pineapple", "cherry", "grapes", "lemon", "avocado", "corn", "carrot",
  "broccoli", "tomato", "potato", "mushroom", "onion", "coffee", "tea",
  "milkshake", "popcorn", "pretzel", "candy", "lollipop", "cupcake",
  "muffin", "bread", "toast", "egg", "bacon", "spaghetti", "burrito",
  "french fries", "nachos", "cheese", "honey", "butter", "croissant",
  "dumpling", "ramen", "baguette", "soda", "bubble tea", "smoothie",
  "popsicle", "brownie", "cheesecake", "cotton candy", "gummy bear",
  "marshmallow", "fortune cookie", "churro", "kebab", "spring roll",
];

const OBJECTS = [
  "chair", "table", "lamp", "sofa", "clock", "watch", "umbrella",
  "backpack", "suitcase", "key", "door", "window", "mirror", "book",
  "pencil", "ruler", "scissors", "envelope", "mailbox", "glasses",
  "hat", "boot", "shoe", "crown", "ring", "necklace", "trophy",
  "sword", "shield", "hammer", "wrench", "saw", "shovel", "rake",
  "broom", "bucket", "ladder", "rope", "anchor", "compass", "map",
  "flag", "telescope", "microscope", "thermometer", "stethoscope",
  "camera", "binoculars", "magnifying glass", "hourglass", "lantern",
  "candle", "torch", "lightbulb", "battery", "plug", "guitar",
  "drum", "piano", "trumpet", "violin", "microphone", "headphones",
  "television", "remote control", "phone", "laptop", "keyboard",
  "joystick", "paintbrush", "palette", "stapler", "paperclip",
  "thumbtack", "eraser", "calculator", "diary", "newspaper",
  "treasure chest", "safe", "vault", "lock", "handcuffs", "whip",
  "lasso", "boomerang", "yo-yo", "kite", "frisbee", "balloon",
  "dart", "fishing rod", "net", "trap", "cage", "leash", "collar",
];

const NATURE = [
  "mountain", "volcano", "island", "beach", "forest", "desert", "river",
  "lake", "ocean", "waterfall", "cave", "rainbow", "cloud", "lightning",
  "tornado", "hurricane", "snowflake", "fire", "smoke", "star", "moon",
  "sun", "earth", "tree", "flower", "leaf", "cactus", "palm tree",
  "pine tree", "seashell", "wave", "cliff", "glacier", "lava", "fog",
  "sunset", "comet", "meteor", "eclipse", "aurora", "iceberg",
  "quicksand", "swamp", "jungle", "meadow", "valley", "canyon",
  "geyser", "fossil", "crystal", "diamond", "gold", "gem",
  "dandelion", "sunflower", "rose", "tulip", "mushroom", "acorn",
  "pinecone", "vine", "thorn", "cobweb", "beehive", "honeycomb",
];

const TRANSPORT = [
  "car", "truck", "bus", "train", "airplane", "helicopter", "rocket",
  "boat", "ship", "submarine", "bicycle", "motorcycle", "scooter",
  "taxi", "ambulance", "fire truck", "police car", "tractor",
  "bulldozer", "crane", "hot air balloon", "parachute", "jet ski",
  "canoe", "sailboat", "gondola", "cable car", "skateboard",
  "roller skates", "unicycle", "snowmobile", "zeppelin", "segway",
  "forklift", "space shuttle", "tank", "hovercraft", "rickshaw",
];

const SPORTS_AND_ACTIVITIES = [
  "football", "basketball", "baseball", "soccer", "tennis", "golf",
  "volleyball", "swimming", "cycling", "skiing", "snowboarding",
  "surfing", "skateboarding", "boxing", "archery", "fishing", "bowling",
  "ping pong", "badminton", "gymnastics", "yoga", "diving", "climbing",
  "kayaking", "hockey", "cricket", "rugby", "darts", "billiards",
  "wrestling", "weightlifting", "fencing", "horseback riding",
  "cheerleading", "ballet", "breakdancing", "parkour",
];

const PLACES = [
  "castle", "lighthouse", "windmill", "igloo", "pyramid", "temple",
  "skyscraper", "hospital", "school", "church", "mosque", "stadium",
  "airport", "harbor", "farm", "barn", "greenhouse", "treehouse",
  "cabin", "mansion", "prison", "museum", "library", "theater",
  "circus", "amusement park", "campsite", "haunted house",
  "underwater city", "space station",
];

const FANTASY_AND_CHARACTERS = [
  "dragon", "unicorn", "mermaid", "vampire", "werewolf", "zombie",
  "wizard", "witch", "knight", "pirate", "ninja", "samurai",
  "robot", "alien", "ghost", "skeleton", "angel", "devil",
  "fairy", "gnome", "troll", "giant", "phoenix", "centaur",
  "minotaur", "kraken", "yeti", "mummy", "gladiator", "astronaut",
  "superhero", "caveman", "viking",
];

const BRANDS_AND_LOGOS = [
  "McDonald's", "Apple", "Nike", "Adidas", "Coca-Cola", "Pepsi",
  "Starbucks", "YouTube", "Netflix", "Instagram", "Twitter",
  "Facebook", "Spotify", "Tesla", "Ferrari", "Lamborghini", "BMW",
  "Mercedes", "KFC", "Pizza Hut", "Burger King", "IKEA", "Lego",
  "Disney", "Minecraft", "Pokemon", "Mario", "Batman", "Superman",
  "Spider-Man", "Mickey Mouse", "Pikachu", "Shrek", "Minions",
];

const ACTIONS = [
  "sleeping", "swimming", "dancing", "singing", "cooking", "painting",
  "running", "jumping", "flying", "falling", "eating", "drinking",
  "hugging", "crying", "laughing", "reading", "writing", "throwing",
  "catching", "climbing", "surfing", "skating", "fishing", "gardening",
  "camping", "typing", "driving", "sneezing", "yawning", "thinking",
  "praying", "meditating", "stretching", "weightlifting", "juggling",
];

export const WORDS_EN: string[] = [
  ...ANIMALS,
  ...FOOD_AND_DRINKS,
  ...OBJECTS,
  ...NATURE,
  ...TRANSPORT,
  ...SPORTS_AND_ACTIVITIES,
  ...PLACES,
  ...FANTASY_AND_CHARACTERS,
  ...BRANDS_AND_LOGOS,
  ...ACTIONS,
];
