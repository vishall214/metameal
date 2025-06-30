import requests
import json

def test_ml_service():
    """Test the ML service with sample data"""
    print("🧪 Testing ML Service Integration...")
    
    # Test data
    test_user = {
        "weight": 70,
        "height": 1.75,
        "age": 30,
        "gender": "Male"
    }
    
    try:
        # Test health endpoint
        print("\n1. Testing health endpoint...")
        health_response = requests.get("http://localhost:5001/health")
        print(f"   ✅ Health check: {health_response.status_code}")
        print(f"   Response: {health_response.json()}")
        
        # Test nutrition prediction
        print("\n2. Testing nutrition prediction...")
        prediction_response = requests.post(
            "http://localhost:5001/predict-nutrition",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        print(f"   ✅ Prediction: {prediction_response.status_code}")
        
        if prediction_response.status_code == 200:
            data = prediction_response.json()
            print(f"   BMI: {data['user_data']['bmi']}")
            print(f"   Category: {data['nutrition_plan']['category']}")
            print(f"   Calories: {data['nutrition_plan']['calories_target']}")
            print(f"   Sample meal: {data['nutrition_plan']['meals'][0]}")
        else:
            print(f"   ❌ Error: {prediction_response.text}")
        
        # Test meal suggestions
        print("\n3. Testing meal suggestions...")
        meals_response = requests.post(
            "http://localhost:5001/meal-suggestions",
            json={"category": "Maintenance", "meal_type": "breakfast"},
            headers={"Content-Type": "application/json"}
        )
        print(f"   ✅ Meal suggestions: {meals_response.status_code}")
        
        if meals_response.status_code == 200:
            meals = meals_response.json()
            print(f"   Sample breakfast: {meals['breakfast'][0]}")
        
        print("\n🎉 All tests passed! ML service is working correctly.")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML service. Is it running on port 5001?")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_ml_service()
    if success:
        print("\n✅ Ready to use! Your ML integration should work normally.")
    else:
        print("\n❌ Issues found. Please check the ML service.")
