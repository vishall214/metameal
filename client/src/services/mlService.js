import * as tf from '@tensorflow/tfjs';

class MLService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }
  async loadModel() {
    try {
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 5, activation: 'softmax' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.isModelLoaded = true;
      console.log('✅ ML Model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load ML model:', error);
    }
  }

  async getMealRecommendations(userProfile) {
    if (!this.isModelLoaded) {
      await this.loadModel();
    }

    try {
      const features = this.extractFeatures(userProfile);
      const prediction = this.model.predict(tf.tensor2d([features]));
      const probabilities = await prediction.data();
      
      return this.convertToRecommendations(probabilities);
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      return this.getFallbackRecommendations();
    }
  }

  extractFeatures(userProfile) {
    const {
      age = 25,
      weight = 70,
      height = 170,
      activityLevel = 'moderate',
      dietaryPreferences = [],
      healthGoals = [],
      allergies = [],
      previousMeals = []
    } = userProfile;

    const features = [
      age / 100,                                    // Normalized age
      weight / 150,                                 // Normalized weight
      height / 200,                                 // Normalized height
      this.encodeActivityLevel(activityLevel),      // Activity level encoding
      dietaryPreferences.length / 10,               // Dietary preferences count
      healthGoals.includes('weight_loss') ? 1 : 0,  // Weight loss goal
      healthGoals.includes('muscle_gain') ? 1 : 0,  // Muscle gain goal
      allergies.length / 5,                         // Allergies count
      previousMeals.length / 10,                    // Meal history
      this.calculateNutritionalNeeds(userProfile)   // Calculated nutritional needs
    ];

    return features;
  }

  encodeActivityLevel(level) {
    const levels = { 'low': 0.2, 'moderate': 0.5, 'high': 0.8, 'very_high': 1.0 };
    return levels[level] || 0.5;
  }

  calculateNutritionalNeeds(profile) {
    // Simple BMR calculation
    const { age, weight, height, gender = 'male' } = profile;
    let bmr;
    
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    return bmr / 3000; // Normalize to 0-1 range
  }

  convertToRecommendations(probabilities) {
    const mealCategories = [
      'high_protein',
      'low_carb', 
      'balanced',
      'vegetarian',
      'keto'
    ];

    const recommendations = mealCategories
      .map((category, index) => ({
        category,
        confidence: probabilities[index],
        priority: probabilities[index] > 0.6 ? 'high' : probabilities[index] > 0.3 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.confidence - a.confidence);

    return recommendations;
  }

  getFallbackRecommendations() {
    return [
      { category: 'balanced', confidence: 0.8, priority: 'high' },
      { category: 'high_protein', confidence: 0.6, priority: 'medium' },
      { category: 'vegetarian', confidence: 0.4, priority: 'low' }
    ];
  }

  async analyzeNutrition(mealData) {
    const { ingredients, portions } = mealData;
    
    // Simple nutritional calculation (replace with ML model)
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    ingredients.forEach((ingredient, index) => {
      const portion = portions[index] || 100; // grams
      const nutritionPer100g = this.getNutritionData(ingredient);
      
      Object.keys(nutrition).forEach(key => {
        nutrition[key] += (nutritionPer100g[key] * portion) / 100;
      });
    });

    return nutrition;
  }

  getNutritionData(ingredient) {
    // Simplified nutrition database (replace with real data or API)
    const nutritionDB = {
      'chicken_breast': { calories: 231, protein: 43.5, carbs: 0, fat: 5, fiber: 0 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 12, fiber: 0 },
      'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8 }
    };

    return nutritionDB[ingredient] || { calories: 100, protein: 5, carbs: 15, fat: 2, fiber: 1 };
  }

  // Train model with user feedback (simple online learning)
  async updateModelWithFeedback(userProfile, recommendation, feedback) {
    if (!this.isModelLoaded) return;

    try {
      const features = this.extractFeatures(userProfile);
      const target = this.encodeFeedback(recommendation, feedback);
      
      // Simple gradient update (in production, use proper batch training)
      const xs = tf.tensor2d([features]);
      const ys = tf.tensor2d([target]);
      
      await this.model.fit(xs, ys, {
        epochs: 1,
        verbose: 0
      });

      console.log('✅ Model updated with user feedback');
    } catch (error) {
      console.error('❌ Failed to update model:', error);
    }
  }

  encodeFeedback(recommendation, feedback) {
    // Convert user feedback to training target
    const target = new Array(5).fill(0);
    const categoryIndex = ['high_protein', 'low_carb', 'balanced', 'vegetarian', 'keto']
      .indexOf(recommendation.category);
    
    if (categoryIndex !== -1) {
      // Positive feedback increases target, negative decreases
      target[categoryIndex] = feedback.liked ? 1 : 0;
    }
    
    return target;
  }
}

export default new MLService();
