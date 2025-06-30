from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import numpy as np
import os
from pymongo import MongoClient
from bson import ObjectId
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
MONGODB_URI = "mongodb+srv://vishalnyapathi214:5QgwpkLnDSoxkdvf@maindb.mx4soxz.mongodb.net/main?retryWrites=true&w=majority&appName=MainDB"
mongo_client = None
db = None

def connect_to_mongodb():
    """Connect to MongoDB database"""
    global mongo_client, db
    try:
        mongo_client = MongoClient(MONGODB_URI)
        db = mongo_client['main']  # Use 'main' database
        # Test the connection
        mongo_client.admin.command('ping')
        print("✅ Connected to MongoDB successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False

def get_user_from_db(user_id):
    """Fetch user data from MongoDB"""
    global db
    try:
        if db is None:
            connect_to_mongodb()
        
        # Find user by ObjectId
        user = db.User.find_one({"_id": ObjectId(user_id)})
        if user:
            return {
                "age": user.get("profile", {}).get("age"),
                "height": user.get("profile", {}).get("height"),
                "weight": user.get("profile", {}).get("weight"),
                "gender": user.get("profile", {}).get("gender"),
                "name": user.get("name"),
                "email": user.get("email")
            }
        return None
    except Exception as e:
        print(f"Error fetching user from database: {e}")
        return None

# Load and prepare the model
def load_and_train_model():
    try:
        # Load dataset from client/src directory
        dataset_path = os.path.join(os.path.dirname(__file__), '..', 'client', 'src', 'final_dataset.csv')
        df = pd.read_csv(dataset_path)
        
        # Encode Gender
        gender_encoder = LabelEncoder()
        df['Gender_encoded'] = gender_encoder.fit_transform(df['Gender'])
        
        # Features and target
        X = df[['Weight', 'Height', 'Age', 'Gender_encoded']]
        y = df['Exercise Recommendation Plan']
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        return model, gender_encoder
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None

# Initialize model and MongoDB connection
model, gender_encoder = load_and_train_model()
mongodb_connected = connect_to_mongodb()

def get_bmi_category(bmi):
    """Get BMI category based on WHO classification"""
    if bmi < 16:
        return "Severe Thinness"
    elif 16 <= bmi < 16.9:
        return "Moderate Thinness"
    elif 16.9 <= bmi < 18.4:
        return "Mild Thinness"
    elif 18.4 <= bmi < 24.9:
        return "Normal"
    elif 24.9 <= bmi < 29.9:
        return "Overweight"
    elif 29.9 <= bmi < 34.9:
        return "Obese"
    else:
        return "Severe Obese"

def map_exercise_to_workout(exercise_plan):
    """Map exercise recommendations to workout recommendations"""
    workout_plans = {
        1: {
            "category": "Weight Gain Workouts",
            "intensity": "Low-Moderate",
            "frequency": "3-4 days/week",
            "focus": "Strength building and muscle mass",
            "workouts": [
                "Bodyweight strength training (squats, push-ups)",
                "Light resistance band exercises",
                "Short walks (20-30 minutes)",
                "Yoga and flexibility training",
                "Core strengthening exercises"
            ],
            "tips": [
                "Focus on progressive overload",
                "Avoid excessive cardio",
                "Include rest days for recovery",
                "Eat protein after workouts"
            ]
        },
        2: {
            "category": "Gradual Strength Building",
            "intensity": "Moderate",
            "frequency": "4-5 days/week",
            "focus": "Building lean muscle and endurance",
            "workouts": [
                "Full body strength training",
                "Resistance band workouts",
                "Light dumbbell exercises",
                "Power yoga sessions",
                "Moderate cardio (brisk walking)"
            ],
            "tips": [
                "Gradually increase workout intensity",
                "Focus on compound movements",
                "Stay consistent with schedule",
                "Track your progress weekly"
            ]
        },
        3: {
            "category": "Muscle Building",
            "intensity": "Moderate-High",
            "frequency": "5-6 days/week",
            "focus": "Lean muscle development",
            "workouts": [
                "Weight training (upper/lower split)",
                "Compound exercises (deadlifts, squats)",
                "HIIT workouts (2-3 times/week)",
                "Core strengthening routines",
                "Active recovery sessions"
            ],
            "tips": [
                "Focus on progressive overload",
                "Eat protein within 30 min post-workout",
                "Get adequate rest between sets",
                "Include both strength and cardio"
            ]
        },
        4: {
            "category": "Fitness Maintenance",
            "intensity": "Moderate",
            "frequency": "4-5 days/week",
            "focus": "Overall fitness and health",
            "workouts": [
                "Mixed cardio and strength training",
                "Functional fitness exercises",
                "Sports activities and recreation",
                "Flexibility and mobility work",
                "Outdoor activities (hiking, cycling)"
            ],
            "tips": [
                "Maintain variety in workouts",
                "Listen to your body",
                "Stay active throughout the day",
                "Focus on consistency over intensity"
            ]
        },
        5: {
            "category": "Weight Loss Workouts",
            "intensity": "Moderate-High",
            "frequency": "5-6 days/week",
            "focus": "Fat burning and cardiovascular health",
            "workouts": [
                "Cardio sessions (30-45 minutes)",
                "HIIT workouts (3-4 times/week)",
                "Circuit training",
                "Strength training for muscle retention",
                "Low-impact activities (swimming, elliptical)"
            ],
            "tips": [
                "Create a calorie deficit through exercise",
                "Combine cardio with strength training",
                "Stay hydrated during workouts",
                "Track your heart rate"
            ]
        },
        6: {
            "category": "Low-Impact Fat Loss",
            "intensity": "Low-Moderate",
            "frequency": "4-5 days/week",
            "focus": "Joint-friendly fat burning",
            "workouts": [
                "Water aerobics and swimming",
                "Chair exercises and seated workouts",
                "Low-impact cardio (walking, cycling)",
                "Resistance band training",
                "Gentle yoga and stretching"
            ],
            "tips": [
                "Protect your joints with low-impact exercises",
                "Start slowly and build gradually",
                "Use supportive equipment",
                "Focus on consistency"
            ]
        },
        7: {
            "category": "Therapeutic Exercise",
            "intensity": "Very Low",
            "frequency": "Daily (short sessions)",
            "focus": "Mobility and basic movement",
            "workouts": [
                "Seated cardio exercises",
                "Chair yoga and stretching",
                "Breathing exercises",
                "Light resistance band work",
                "Short walks (5-10 minutes)"
            ],
            "tips": [
                "Consult healthcare provider before starting",
                "Start with 5-10 minute sessions",
                "Focus on movement quality over quantity",
                "Listen to your body always"
            ]
        }
    }
    return workout_plans.get(exercise_plan, workout_plans[4])

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "model_loaded": model is not None,
        "mongodb_connected": mongodb_connected
    })

@app.route('/predict-workout', methods=['POST'])
def predict_workout():
    try:
        if model is None or gender_encoder is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        data = request.json
        
        # Get user ID from request
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Fetch user data from MongoDB
        user_data = get_user_from_db(user_id)
        if not user_data:
            return jsonify({"error": "User not found or incomplete profile"}), 404
        
        # Validate required fields
        weight = user_data.get('weight')
        height = user_data.get('height')
        age = user_data.get('age')
        gender = user_data.get('gender')
        
        if not all([weight, height, age, gender]):
            return jsonify({
                "error": "Incomplete user profile. Please complete your profile with weight, height, age, and gender."
            }), 400
        
        # Convert height to meters if it's in cm
        if height > 3:  # Assume it's in cm if > 3
            height = height / 100
        
        # Calculate BMI
        bmi = round(weight / (height ** 2), 2)
        bmi_category = get_bmi_category(bmi)
        
        # Encode gender - handle different formats
        gender_formatted = gender.lower().capitalize()
        if gender_formatted not in ['Male', 'Female']:
            gender_formatted = 'Male'  # Default fallback
        
        gender_encoded = gender_encoder.transform([gender_formatted])[0]
        
        # Make prediction
        input_data = [[weight, height, age, gender_encoded]]
        exercise_prediction = model.predict(input_data)[0]
        
        # Get workout recommendation
        workout_plan = map_exercise_to_workout(exercise_prediction)
        
        # Calculate daily calorie needs (Harris-Benedict equation)
        if gender_formatted.lower() == 'male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age)
        
        # Adjust for activity level (assuming moderate activity)
        daily_calories = round(bmr * 1.55)
        
        response = {
            "user_data": {
                "name": user_data.get('name', 'User'),
                "email": user_data.get('email', ''),
                "weight": weight,
                "height": height,
                "age": age,
                "gender": gender_formatted,
                "bmi": bmi,
                "bmi_category": bmi_category,
                "daily_calories": daily_calories
            },
            "workout_plan": workout_plan,
            "exercise_plan_id": int(exercise_prediction),
            "confidence": "High",
            "generated_at": pd.Timestamp.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/workout-suggestions', methods=['POST'])
def workout_suggestions():
    """Get specific workout suggestions based on workout category"""
    try:
        data = request.json
        category = data.get('category', 'Fitness Maintenance')
        workout_type = data.get('workout_type', 'all')  # strength, cardio, flexibility, all
        
        # Extended workout database
        workout_database = {
            "Weight Gain Workouts": {
                "strength": ["Bodyweight squats", "Modified push-ups", "Resistance band rows", "Wall sits"],
                "cardio": ["Gentle walking", "Stationary bike (low intensity)", "Swimming (leisure pace)"],
                "flexibility": ["Basic stretching", "Gentle yoga", "Foam rolling", "Deep breathing"],
                "recovery": ["Rest days", "Light stretching", "Meditation", "Adequate sleep"]
            },
            "Weight Loss Workouts": {
                "strength": ["Circuit training", "Bodyweight exercises", "Weight lifting", "Resistance bands"],
                "cardio": ["Running", "HIIT workouts", "Cycling", "Swimming laps", "Jump rope"],
                "flexibility": ["Dynamic stretching", "Yoga flow", "Pilates", "Mobility work"],
                "recovery": ["Active recovery walks", "Gentle stretching", "Massage", "Rest days"]
            },
            "Fitness Maintenance": {
                "strength": ["Full body workouts", "Push-ups", "Squats", "Planks", "Dumbbells"],
                "cardio": ["Jogging", "Dancing", "Sports activities", "Hiking", "Cycling"],
                "flexibility": ["Yoga classes", "Stretching routines", "Tai chi", "Pilates"],
                "recovery": ["Rest days", "Light activities", "Stretching", "Self-care"]
            }
        }
        
        # Default to fitness maintenance if category not found
        workouts = workout_database.get(category, workout_database["Fitness Maintenance"])
        
        if workout_type == 'all':
            return jsonify(workouts)
        else:
            return jsonify({workout_type: workouts.get(workout_type, [])})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting ML Workout Recommendation Service...")
    if model is not None:
        print("✅ Model loaded successfully")
    else:
        print("❌ Failed to load model")
    
    if mongodb_connected:
        print("✅ MongoDB connected successfully")
    else:
        print("❌ Failed to connect to MongoDB")
        
    app.run(debug=True, port=5001)
