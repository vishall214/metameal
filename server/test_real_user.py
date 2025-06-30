import requests
import json

# Test with the real user ID we just created
real_user_id = "686291a8eaef645daddfb2db"

print(f"Testing ML service with real user ID: {real_user_id}")

# Test direct ML service
try:
    test_data = {
        "user_id": real_user_id
    }
    
    response = requests.post('http://localhost:5001/predict-workout', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(test_data))
    
    print("Direct ML Service Status:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print("✅ Direct ML Service Response:")
        print(f"  User: {data['user_data']['name']} ({data['user_data']['gender']})")
        print(f"  BMI: {data['user_data']['bmi']} ({data['user_data']['bmi_category']})")
        print(f"  Workout Plan: {data['workout_plan']['category']}")
        print(f"  Intensity: {data['workout_plan']['intensity']}")
        print(f"  Frequency: {data['workout_plan']['frequency']}")
        print(f"  Exercise Plan ID: {data['exercise_plan_id']}")
    else:
        print("❌ Direct ML Service Error:", response.json())
        
except Exception as e:
    print("❌ Direct ML service test failed:", e)

# Test through Node.js backend
try:
    test_data = {
        "user_id": real_user_id
    }
    
    response = requests.post('http://localhost:5002/api/ml/predict-workout', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(test_data))
    
    print("\nBackend Proxy Status:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print("✅ Backend Proxy Response:")
        print(f"  User: {data['user_data']['name']} ({data['user_data']['gender']})")
        print(f"  BMI: {data['user_data']['bmi']} ({data['user_data']['bmi_category']})")
        print(f"  Workout Plan: {data['workout_plan']['category']}")
        print(f"  Intensity: {data['workout_plan']['intensity']}")
        print(f"  Frequency: {data['workout_plan']['frequency']}")
        print(f"  Exercise Plan ID: {data['exercise_plan_id']}")
    else:
        print("❌ Backend Proxy Error:", response.json())
        
except Exception as e:
    print("❌ Backend proxy test failed:", e)
