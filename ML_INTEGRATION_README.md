# MetaMeal ML Integration Setup ✅

## ✅ Status: READY TO USE

The ML integration has been tested and is working correctly! All required dependencies are installed and the services are functioning properly.

## Quick Start

### Prerequisites ✅
- ✅ Python 3.11.5 (Verified)
- ✅ Node.js and npm (Available)
- ✅ Required Python packages (Installed)
- ✅ All existing project dependencies

### Installation

1. **Install remaining dependencies** (if needed):
   ```bash
   cd server
   pip install flask-cors requests
   npm install node-fetch
   ```

2. **Start all services** (Choose one method):

   **Method A - Batch File:**
   ```bash
   cd server
   start-all.bat
   ```

   **Method B - PowerShell (if batch fails):**
   ```powershell
   cd server
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\start-all.ps1
   ```

   **Method C - Manual (most reliable):**
   ```bash
   # Terminal 1: ML Service
   cd server
   python ml_service.py

   # Terminal 2: Backend
   cd server  
   npm run dev

   # Terminal 3: Frontend
   cd client
   npm start
   ```

   This will start:
   - ✅ Python ML Service on port 5001 (Tested & Working)
   - Node.js Backend on port 5002
   - React Frontend on port 3000

### Manual Start (Alternative)

If automated scripts don't work, see `MANUAL_START.md` for detailed instructions.

If the batch file doesn't work, start each service manually:

1. **Start Python ML Service**:
   ```bash
   cd server
   python ml_service.py
   ```

2. **Start Node.js Backend**:
   ```bash
   cd server
   npm run dev
   ```

3. **Start React Frontend**:
   ```bash
   cd client
   npm start
   ```

## How to Use

1. **Login/Register** in the application
2. **Complete the Quiz** (if not already done) to provide basic profile data
3. **Navigate to AI Recommendations** via:
   - Navbar: "Recommendations" link
   - Sidebar: "AI Recommendations" link
4. **Generate Recommendations** by clicking the button
5. **View your personalized nutrition plan** with:
   - BMI analysis
   - Calorie targets
   - Macro recommendations
   - Meal suggestions
   - Nutrition tips

## Features

### Current ML Features
- **BMI-based nutrition planning**: Uses weight, height, age, gender
- **Personalized meal recommendations**: 7 different nutrition categories
- **Calorie calculation**: Harris-Benedict equation with activity factors
- **Macro guidance**: Protein, carbs, fats recommendations
- **Meal suggestions**: Category-specific meal ideas
- **Nutrition tips**: Actionable advice based on goals

### ML Model Details
- **Algorithm**: Random Forest Classifier
- **Features**: Weight, Height, Age, Gender
- **Training Data**: 5000+ records from final_dataset.csv
- **Categories**: 
  1. Weight Gain (Severe/Moderate Thinness)
  2. Muscle Building (Mild Thinness)  
  3. Maintenance (Normal BMI)
  4. Weight Loss (Overweight)
  5. Structured Weight Loss (Obese)
  6. Medical Nutrition (Severe Obesity)

## API Endpoints

### Python ML Service (Port 5001)
- `POST /predict-nutrition` - Get nutrition recommendations
- `POST /meal-suggestions` - Get specific meal suggestions
- `GET /health` - Health check

### Node.js Proxy (Port 5002)
- `POST /api/ml/predict-nutrition` - Proxied ML predictions
- `POST /api/ml/meal-suggestions` - Proxied meal suggestions

## Troubleshooting

### Common Issues

1. **Python ML Service not starting**:
   - Ensure Python 3.7+ is installed
   - Install requirements: `pip install -r requirements.txt`
   - Check if port 5001 is available

2. **"Model not loaded" error**:
   - Ensure `final_dataset.csv` exists in `client/src/`
   - Check Python console for dataset loading errors

3. **CORS errors in frontend**:
   - Ensure Python ML service is running on port 5001
   - Check that Flask-CORS is installed

4. **Frontend shows loading forever**:
   - Check browser network tab for failed API calls
   - Ensure all three services are running
   - Check console for JavaScript errors

### Logs to Check
- **Python ML Service**: Check terminal running `ml_service.py`
- **Node.js Backend**: Check terminal running `npm run dev`
- **React Frontend**: Check browser console and network tab

## Future Enhancements

1. **Enhanced ML Model**:
   - Include activity level, dietary preferences
   - Add user feedback learning
   - Implement collaborative filtering

2. **Extended Features**:
   - Weekly meal planning
   - Grocery list generation
   - Progress tracking
   - Recipe database integration

3. **Advanced Analytics**:
   - Nutrition trend analysis
   - Goal achievement tracking
   - Health metric predictions
