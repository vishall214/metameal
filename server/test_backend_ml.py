import requests
import json

# Test the Node.js backend ML proxy endpoints
print("Testing Node.js Backend ML Proxy...")

# Test health endpoint through backend
try:
    response = requests.get('http://localhost:5002/api/ml/health')
    print("Backend ML Health Status:", response.status_code)
    print("Backend ML Health Response:", response.json())
except Exception as e:
    print("Backend ML health check failed:", e)

# Test workout prediction through backend with sample user_id
try:
    test_data = {
        "user_id": "60f7b8c4d4f8e1234567890a"  # Sample ObjectId format
    }
    
    response = requests.post('http://localhost:5002/api/ml/predict-workout', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(test_data))
    
    print("\nBackend Workout Prediction Status:", response.status_code)
    print("Backend Workout Prediction Response:", response.json())
except Exception as e:
    print("Backend workout prediction test failed:", e)

# Test workout suggestions through backend
try:
    test_data = {
        "weight": 70,
        "height": 1.7,
        "age": 30,
        "gender": "Male"
    }
    
    response = requests.post('http://localhost:5002/api/ml/workout-suggestions', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(test_data))
    
    print("\nBackend Workout Suggestions Status:", response.status_code)
    print("Backend Workout Suggestions Response:", response.json())
except Exception as e:
    print("Backend workout suggestions test failed:", e)
