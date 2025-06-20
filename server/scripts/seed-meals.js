const mongoose = require('mongoose');
const Food = require('../models/Food');
const config = require('../config/config');

// Sample meals data
const sampleMeals = [
  // Breakfast meals
  {
    name: "Oatmeal with Berries",
    filter: ["vegetarian", "breakfast", "healthy"],
    photo: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
    description: "Nutritious oatmeal topped with fresh berries and honey",
    recipe: "1. Cook oats with milk or water. 2. Top with fresh berries. 3. Drizzle with honey. 4. Add nuts if desired.",
    cookingTime: 10,
    course: "breakfast",
    calories: 320,
    protein: 12,
    fats: 8,
    carbs: 58,
    fibre: 8,
    sugar: 15,
    addedSugar: 5,
    sodium: 150,
    portionSize: 250
  },
  {
    name: "Scrambled Eggs with Toast",
    filter: ["non-veg", "breakfast", "protein"],
    photo: "https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg",
    description: "Classic scrambled eggs served with whole grain toast",
    recipe: "1. Beat eggs with salt and pepper. 2. Scramble in butter over low heat. 3. Serve with toasted bread.",
    cookingTime: 8,
    course: "breakfast",
    calories: 380,
    protein: 20,
    fats: 22,
    carbs: 28,
    fibre: 4,
    sugar: 3,
    addedSugar: 0,
    sodium: 420,
    portionSize: 200
  },
  {
    name: "Greek Yogurt Parfait",
    filter: ["vegetarian", "breakfast", "protein"],
    photo: "https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg",
    description: "Creamy Greek yogurt layered with granola and fresh fruits",
    recipe: "1. Layer Greek yogurt in a glass. 2. Add granola and fresh fruits. 3. Repeat layers. 4. Top with honey.",
    cookingTime: 5,
    course: "breakfast",
    calories: 280,
    protein: 18,
    fats: 8,
    carbs: 35,
    fibre: 5,
    sugar: 20,
    addedSugar: 8,
    sodium: 80,
    portionSize: 300
  },

  // Lunch meals
  {
    name: "Grilled Chicken Salad",
    filter: ["non-veg", "lunch", "protein", "low-carb"],
    photo: "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg",
    description: "Fresh mixed greens with grilled chicken breast and vegetables",
    recipe: "1. Grill chicken breast. 2. Mix greens and vegetables. 3. Slice chicken and add to salad. 4. Dress with olive oil and lemon.",
    cookingTime: 20,
    course: "lunch",
    calories: 420,
    protein: 35,
    fats: 18,
    carbs: 15,
    fibre: 6,
    sugar: 8,
    addedSugar: 0,
    sodium: 380,
    portionSize: 350
  },
  {
    name: "Quinoa Buddha Bowl",
    filter: ["vegetarian", "lunch", "healthy", "protein"],
    photo: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    description: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
    recipe: "1. Cook quinoa. 2. Roast vegetables. 3. Arrange in bowl. 4. Top with tahini dressing and seeds.",
    cookingTime: 30,
    course: "lunch",
    calories: 480,
    protein: 16,
    fats: 20,
    carbs: 62,
    fibre: 12,
    sugar: 12,
    addedSugar: 0,
    sodium: 320,
    portionSize: 400
  },
  {
    name: "Tuna Sandwich",
    filter: ["non-veg", "lunch", "protein"],
    photo: "https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg",
    description: "Classic tuna salad sandwich with fresh vegetables",
    recipe: "1. Mix tuna with mayo and seasonings. 2. Add vegetables. 3. Assemble sandwich with lettuce and tomato.",
    cookingTime: 10,
    course: "lunch",
    calories: 390,
    protein: 28,
    fats: 15,
    carbs: 35,
    fibre: 5,
    sugar: 6,
    addedSugar: 2,
    sodium: 680,
    portionSize: 250
  },

  // Dinner meals
  {
    name: "Baked Salmon with Vegetables",
    filter: ["non-veg", "dinner", "protein", "healthy"],
    photo: "https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg",
    description: "Oven-baked salmon fillet with roasted seasonal vegetables",
    recipe: "1. Season salmon with herbs. 2. Roast vegetables. 3. Bake salmon for 15-20 minutes. 4. Serve together.",
    cookingTime: 35,
    course: "dinner",
    calories: 520,
    protein: 42,
    fats: 28,
    carbs: 20,
    fibre: 8,
    sugar: 12,
    addedSugar: 0,
    sodium: 420,
    portionSize: 400
  },
  {
    name: "Vegetable Stir Fry",
    filter: ["vegetarian", "dinner", "healthy", "low-calorie"],
    photo: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
    description: "Colorful mixed vegetables stir-fried with aromatic spices",
    recipe: "1. Heat oil in wok. 2. Add vegetables in order of cooking time. 3. Season with soy sauce and spices. 4. Serve hot.",
    cookingTime: 15,
    course: "dinner",
    calories: 280,
    protein: 8,
    fats: 12,
    carbs: 38,
    fibre: 10,
    sugar: 18,
    addedSugar: 0,
    sodium: 580,
    portionSize: 300
  },
  {
    name: "Chicken Curry with Rice",
    filter: ["non-veg", "dinner", "protein", "spicy"],
    photo: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg",
    description: "Tender chicken in aromatic curry sauce served with basmati rice",
    recipe: "1. Marinate chicken. 2. Cook onions and spices. 3. Add chicken and simmer. 4. Serve with rice.",
    cookingTime: 45,
    course: "dinner",
    calories: 580,
    protein: 38,
    fats: 22,
    carbs: 55,
    fibre: 4,
    sugar: 8,
    addedSugar: 0,
    sodium: 720,
    portionSize: 450
  },

  // Snacks
  {
    name: "Mixed Nuts",
    filter: ["vegetarian", "snacks", "protein", "healthy"],
    photo: "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg",
    description: "Assorted roasted nuts perfect for a healthy snack",
    recipe: "1. Mix various nuts. 2. Lightly roast if desired. 3. Season with salt or spices.",
    cookingTime: 5,
    course: "snacks",
    calories: 180,
    protein: 6,
    fats: 15,
    carbs: 8,
    fibre: 3,
    sugar: 2,
    addedSugar: 0,
    sodium: 120,
    portionSize: 30
  },
  {
    name: "Fruit Smoothie",
    filter: ["vegetarian", "snacks", "healthy", "refreshing"],
    photo: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
    description: "Refreshing blend of seasonal fruits and yogurt",
    recipe: "1. Blend fruits with yogurt. 2. Add honey if needed. 3. Serve chilled.",
    cookingTime: 5,
    course: "snacks",
    calories: 150,
    protein: 8,
    fats: 2,
    carbs: 28,
    fibre: 4,
    sugar: 24,
    addedSugar: 5,
    sodium: 60,
    portionSize: 250
  }
];

// Seed function
const seedMeals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing meals
    await Food.deleteMany({});
    console.log('Cleared existing meals');

    // Insert sample meals
    const createdMeals = await Food.insertMany(sampleMeals);
    console.log(`Created ${createdMeals.length} sample meals`);

    // Verify the data
    const totalMeals = await Food.countDocuments();
    console.log(`Total meals in database: ${totalMeals}`);

    // Show distribution by course
    const distribution = await Food.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Meal distribution by course:', distribution);

    console.log('✅ Meal seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding meals:', error);
    process.exit(1);
  }
};

// Run the seed function
if (require.main === module) {
  seedMeals();
}

module.exports = { seedMeals, sampleMeals };