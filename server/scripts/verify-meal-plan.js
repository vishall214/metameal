const mongoose = require('mongoose');
const Food = require('../models/Food');

async function verifyMealPlan() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/metameal');
    console.log('Connected to MongoDB');

    // 1. Verify database connection and Food collection
    const foodCount = await Food.countDocuments();
    console.log(`\nTotal foods in database: ${foodCount}`);

    // 2. Sample a breakfast item
    const breakfastItem = await Food.findOne({ course: 'breakfast' });
    console.log('\nSample breakfast item:');
    console.log(JSON.stringify(breakfastItem, null, 2));

    // 3. Test meal filtering for different dietary preferences
    console.log('\nTesting meal filtering:');

    // 3.1 Test vegetarian meals
    const vegetarianMeals = await Food.find({
      filter: { $not: { $in: ['chicken', 'meat', 'beef', 'fish'] } }
    }).limit(2);
    
    console.log('\nVegetarian meals found:', vegetarianMeals.length);
    vegetarianMeals.forEach(meal => {
      console.log(`- ${meal.name} (Filters: ${meal.filter.join(', ')})`);
    });

    // 3.2 Test diabetes-friendly meals
    const diabeticMeals = await Food.find({
      sugar: { $lte: 5 },
      addedSugar: { $lte: 0 }
    }).limit(2);

    console.log('\nDiabetes-friendly meals found:', diabeticMeals.length);
    diabeticMeals.forEach(meal => {
      console.log(`- ${meal.name} (Sugar: ${meal.sugar}, Added Sugar: ${meal.addedSugar})`);
    });

    // 3.3 Test low-sodium meals
    const lowSodiumMeals = await Food.find({
      sodium: { $lte: 400 }
    }).limit(2);

    console.log('\nLow-sodium meals found:', lowSodiumMeals.length);
    lowSodiumMeals.forEach(meal => {
      console.log(`- ${meal.name} (Sodium: ${meal.sodium}mg)`);
    });

    // 4. Test meal distribution
    console.log('\nMeal distribution:');
    const mealCounts = await Food.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log(mealCounts);

    // 5. Verify calorie ranges
    console.log('\nCalorie distribution:');
    const calorieRanges = await Food.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$calories', 200] }, then: '0-200' },
                { case: { $lte: ['$calories', 400] }, then: '201-400' },
                { case: { $lte: ['$calories', 600] }, then: '401-600' },
                { case: { $lte: ['$calories', 800] }, then: '601-800' }
              ],
              default: '800+'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log(calorieRanges);

    console.log('\nVerification completed successfully');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyMealPlan(); 