import streamlit as st
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# App Title
st.title("🏋️ Exercise Recommendation Predictor")

# Load dataset
@st.cache_data
def load_data():
    df = pd.read_csv("final_dataset.csv")
    return df

df = load_data()

# Encode Gender
gender_encoder = LabelEncoder()
df['Gender'] = gender_encoder.fit_transform(df['Gender'])

# Define Features & Target
X = df[['Weight', 'Height', 'Age', 'Gender']]
y = df['Exercise Recommendation Plan']

# Train the Model
model = RandomForestClassifier()
model.fit(X, y)

# WHO BMI Classification
def get_bmi_case(bmi):
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

# User Input Section
st.header("Enter Your Details")

weight = st.number_input("Weight (kg)", min_value=20.0, max_value=200.0, step=0.5)
height = st.number_input("Height (m)", min_value=1.0, max_value=2.5, step=0.01)
age = st.number_input("Age", min_value=10, max_value=100, step=1)
gender = st.selectbox("Gender", ["Male", "Female"])

# Predict Button
if st.button("Predict Plan"):
    # Encode gender and form input data
    gender_encoded = gender_encoder.transform([gender])[0]
    input_data = [[weight, height, age, gender_encoded]]
    
    # Predict the plan
    prediction = model.predict(input_data)[0]
    
    # Calculate BMI and BMI Case
    bmi = round(weight / (height ** 2), 2)
    bmi_case = get_bmi_case(bmi)

    # Map predicted plan to description
    if prediction == 1:
        plan = """Exercise Plan for Severe Thinness

Goal: Healthy weight gain and lean muscle building

Weekly Plan:
- Monday: Bodyweight Strength (Squats, Push-ups, Glute Bridges) + 20 min Walk
- Tuesday: Light Yoga (Cat-Cow, Cobra, Child’s Pose)
- Wednesday: Resistance Band Training + Walk
- Thursday: Rest or Gentle Stretching
- Friday: Bodyweight Strength Repeat + 20 min Walk
- Saturday: Yoga + Short Walk
- Sunday: Full Rest

Notes:
- Avoid high-intensity cardio
- Focus on muscle-building with light weights
- Eat 5–6 nutrient-rich meals/day
- Include protein, nuts, dairy, and smoothies"""

    elif prediction == 2:
        plan = """Exercise Plan for Moderate Thinness

Goal: Gradual healthy weight gain, improve muscle tone, and boost energy

Weekly Plan:
- Monday: Bodyweight Training (Squats, Push-ups, Lunges) + 20 min Light Walk
- Tuesday: Yoga for Strength (Warrior Pose, Cobra, Bridge Pose)
- Wednesday: Resistance Band Training (Rows, Lateral Raises)
- Thursday: Active Rest (Stretching or Leisure Walk)
- Friday: Dumbbell Strength (Bicep Curls, Shoulder Press) + Core Work (Planks)
- Saturday: Yoga + 15 min Light Jog or Brisk Walk
- Sunday: Rest or Relaxation Stretching

Notes:
- Avoid calorie-burning cardio (e.g., running, cycling)
- Increase protein intake (eggs, lentils, paneer, etc.)
- Include calorie-dense snacks (trail mix, nut butters)
- Stay hydrated and track energy levels daily
"""

    elif prediction == 3:
        plan = """Exercise Plan for Mild Thinness

Goal: Build strength, maintain lean muscle, and support a healthy metabolism

Weekly Plan:
- Monday: Full Body Strength (Squats, Lunges, Push-ups) + 20 min Walk
- Tuesday: Power Yoga (Sun Salutations, Warrior Pose, Plank Flow)
- Wednesday: Light Dumbbell Routine (Upper body focus) + Core (Planks, Bird-Dog)
- Thursday: Rest or Light Activity (Walking, Stretching)
- Friday: Resistance Band Workout (Legs & Back) + Mobility Drills
- Saturday: Low-impact Cardio (Brisk Walk or Stationary Cycling 20–25 min)
- Sunday: Gentle Yoga or Stretch & Recover

Notes:
- Focus on progressive overload in strength workouts
- Increase protein & calorie intake moderately
- Use recovery days to improve flexibility and avoid fatigue
- Include healthy fats and snacks (avocado, seeds, yogurt smoothies)
"""

    elif prediction == 4:
        plan = """Exercise Plan for Normal BMI

Goal: Maintain healthy weight, improve overall fitness, and build endurance

Weekly Plan:
- Monday: Full Body Strength Training (Bodyweight + Dumbbells) + 20 min Brisk Walk
- Tuesday: Moderate Cardio (Jogging, Cycling) – 30 mins + Stretching
- Wednesday: Upper Body Strength (Push-ups, Dumbbell Rows, Shoulder Press) + Core
- Thursday: Yoga or Mobility Training
- Friday: Lower Body Strength (Squats, Lunges, Glute Bridges) + Resistance Band Work
- Saturday: Fun Activity (Dance, Sports, Hike) or HIIT (15–20 mins)
- Sunday: Active Recovery (Stretching, Leisure Walk, Foam Rolling)

Notes:
- Aim for a balanced mix of cardio, strength, and mobility
- Follow a clean, portion-controlled diet with whole foods
- Prioritize sleep, hydration, and stress management
- Adjust intensity based on energy levels and goals (muscle gain, endurance, etc.)
"""

    elif prediction == 5:
        plan = """Exercise Plan for Overweight (BMI 25–29.9)

Goal: Fat loss, improve heart health, and increase mobility

Weekly Plan:
- Monday: Low-Impact Cardio (Walking or Elliptical – 30 min) + Core (Planks, Leg Raises)
- Tuesday: Full Body Strength (Bodyweight + Dumbbells) – Moderate Intensity
- Wednesday: Active Recovery (Yoga, Stretching)
- Thursday: HIIT (Short Intervals – 20 mins) + Resistance Band
- Friday: Strength Training Focus (Legs & Glutes) + Light Cardio
- Saturday: Outdoor Activity (Brisk Walk, Light Hike, or Cycling)
- Sunday: Full Rest or Meditation + Breathing Exercises

Notes:
- Focus on consistency, not intensity
- Prioritize joint-friendly movement (avoid jumping-heavy workouts)
- Follow a calorie-controlled, protein-rich diet
- Track steps (aim for 7,000–10,000/day)
"""

    elif prediction == 6:
        plan = """Exercise Plan for Obese Class (BMI 30–34.9)

Goal: Reduce fat safely, protect joints, and build long-term stamina

Weekly Plan:
- Monday: Chair Exercises + Resistance Band (20–30 min)
- Tuesday: Light Walking (15–20 mins) + Deep Breathing + Stretching
- Wednesday: Full Body Low-Impact Strength (No Floor Work)
- Thursday: Yoga (Chair or Modified Poses for Flexibility)
- Friday: Water Aerobics or Pool Walking (if available)
- Saturday: Active Mobility (Standing Leg Lifts, Arm Circles, Marching in Place)
- Sunday: Rest & Reflection + Gentle Stretching

Notes:
- Use supportive footwear and avoid high-impact
- Daily movement > intense workouts
- Follow dietitian-approved calorie-deficit plan
- Track progress weekly via inches, not just weight
"""

    elif prediction == 7:
        plan = """Exercise Plan for Severe Obesity (BMI 35+)

Goal: Begin safe movement, reduce health risks, and build a habit of exercise

Weekly Plan:
- Monday: Seated Cardio (Arm Circles, Knee Lifts) – 15–20 min
- Tuesday: Chair Yoga or Gentle Stretching
- Wednesday: Short Walks (5–10 mins x 2–3 sessions/day)
- Thursday: Resistance Bands (Seated Rows, Arm Raises)
- Friday: Breathing Exercises + Light Movement
- Saturday: Guided Meditation or Light Tai Chi
- Sunday: Total Rest or Deep Stretch Routine

Notes:
- Start slow — even 5 minutes counts
- Consult a physician before beginning any new program
- Focus on improving breathing, posture, and balance
- Combine with medically supervised nutrition plan
"""
    else:
        plan = "error"

    # Show Results
    st.subheader("Results")
    st.write(f"**BMI:** {bmi}")
    st.write(f"**BMI Category:** {bmi_case}")
    st.success(f"**Recommended Exercise Plan:** {plan}")
