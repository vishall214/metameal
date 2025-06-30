import requests
import json

# Test health endpoint
try:
    response = requests.get('http://localhost:5001/health')
    print("Health Check Status:", response.status_code)
    print("Health Check Response:", response.json())
except Exception as e:
    print("Health check failed:", e)

# Test workout prediction with sample user_id
try:
    # You'll need to replace this with a real user ID from your database
    test_data = {
        "user_id": "60f7b8c4d4f8e1234567890a"  # Sample ObjectId format
    }
    
    response = requests.post('http://localhost:5001/predict-workout', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(test_data))
    
    print("\nWorkout Prediction Status:", response.status_code)
    print("Workout Prediction Response:", response.json())
except Exception as e:
    print("Workout prediction test failed:", e)

# Test workout suggestions endpoint
try:
    test_data = {
        "weight": 70,
        "height": 1.7,
        "age": 30,
        "gender": "Male"
    }
    
    response = requests.post('http://localhost:5001/workout-suggestions', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(test_data))
    
    print("\nWorkout Suggestions Status:", response.status_code)
    print("Workout Suggestions Response:", response.json())
except Exception as e:
    print("Workout suggestions test failed:", e)
