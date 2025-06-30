import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaUtensils, 
  FaWeight, 
  FaCheckCircle, 
  FaCalendarDay, 
  FaFire, 
  FaDumbbell, 
  FaBreadSlice, 
  FaTint,
  FaChartLine,
  FaBullseye,
  FaPlay,
  FaArrowRight,
  FaTrophy
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { mealPlansAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MealCard from '../components/mealcard';

// Main Dashboard Container
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

// Welcome Header
const WelcomeHeader = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  
  span {
    color: var(--primary);
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 1rem;
  opacity: 0.8;
`;

// Progress Overview Section
const ProgressOverview = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

// Daily Goals Card
const GoalsCard = styled.div`
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(0, 181, 176, 0.05) 100%);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
`;

const GoalsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const GoalsTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-light);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

// Progress Ring Component
const ProgressRing = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
`;

const ProgressCircle = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const ProgressBackground = styled.circle`
  fill: none;
  stroke: rgba(0, 181, 176, 0.1);
  stroke-width: 8;
`;

const ProgressForeground = styled.circle`
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  .percentage {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-light);
  }
  
  .label {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }
`;

// Nutrition Progress Card
const NutritionCard = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 181, 176, 0.15);
  }
`;

const NutritionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--text-light);
`;

const NutritionValues = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  
  .current {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-light);
  }
  
  .target {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
`;

// Quick Stats Card
const QuickStatsCard = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 181, 176, 0.1);
    transform: translateX(5px);
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
  
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
`;

// Today's Meals Section
const TodayMealsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  color: var(--text-light);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewAllButton = styled.button`
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
  }
`;

const MealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

// Empty State
const EmptyMealsState = styled.div`
  text-align: center;
  padding: 3rem;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(0, 181, 176, 0.2);
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }
`;

const ActionButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 181, 176, 0.3);
  }
`;

// Component for Progress Ring
const CircularProgress = ({ percentage, children }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <ProgressRing>
      <ProgressCircle>
        <ProgressBackground
          cx="40"
          cy="40"
          r={radius}
        />
        <ProgressForeground
          cx="40"
          cy="40"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </ProgressCircle>
      <ProgressText>
        <div className="percentage">{Math.round(percentage)}%</div>
        {children}
      </ProgressText>
    </ProgressRing>
  );
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({
    calories: { current: 0, target: 2000 },
    protein: { current: 0, target: 120 },
    carbs: { current: 0, target: 250 },
    fats: { current: 0, target: 65 }
  });
  const [stats, setStats] = useState({
    streak: 0,
    completedGoals: 0,
    totalMeals: 0,
    weekProgress: 85
  });
  const [loading, setLoading] = useState(true);

  // Get today's day name
  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Fetch today's meals
  const fetchTodayMeals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mealPlansAPI.getAll();
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const mostRecentPlan = response.data[0];
        const today = getTodayDayName();
        
        // Filter meals for today
        const todaysMeals = (mostRecentPlan.meals || []).filter(meal => meal.day === today);
        setTodayMeals(todaysMeals);
        
        // Calculate daily progress
        calculateDailyProgress(todaysMeals);
      } else {
        setTodayMeals([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s meals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate daily nutrition progress
  const calculateDailyProgress = (meals) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    meals.forEach(mealItem => {
      const meal = mealItem.meal;
      if (meal) {
        totalCalories += Number(meal.calories) || 0;
        totalProtein += Number(meal.protein) || 0;
        totalCarbs += Number(meal.carbs) || 0;
        totalFats += Number(meal.fats) || 0;
      }
    });

    // Get user's targets from profile or use defaults
    const userProfile = user?.profile || {};
    const targets = {
      calories: userProfile.calorieGoal || 2000,
      protein: userProfile.proteinGoal || 120,
      carbs: userProfile.carbGoal || 250,
      fats: userProfile.fatGoal || 65
    };

    setDailyProgress({
      calories: { current: totalCalories, target: targets.calories },
      protein: { current: totalProtein, target: targets.protein },
      carbs: { current: totalCarbs, target: targets.carbs },
      fats: { current: totalFats, target: targets.fats }
    });

    // Update stats
    setStats(prev => ({
      ...prev,
      completedGoals: [
        totalCalories >= targets.calories * 0.9,
        totalProtein >= targets.protein * 0.9,
        totalCarbs >= targets.carbs * 0.9,
        totalFats >= targets.fats * 0.9
      ].filter(Boolean).length,
      totalMeals: meals.length
    }));
  };

  // Format date
  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    fetchTodayMeals();
  }, [fetchTodayMeals]);

  // Group meals by type
  const groupedMeals = todayMeals.reduce((acc, meal) => {
    const type = meal.mealType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  return (
    <DashboardContainer>
      {/* Welcome Header */}
      <WelcomeHeader>
        <WelcomeTitle>
          Welcome back, <span>{user?.name || 'User'}</span>! 👋
        </WelcomeTitle>
        <WelcomeSubtitle>
          Let's make today a healthy and productive day
        </WelcomeSubtitle>
        <DateInfo>
          <FaCalendarDay />
          {formatDate()}
        </DateInfo>
      </WelcomeHeader>

      {/* Progress Overview */}
      <ProgressOverview>
        {/* Daily Goals Card */}
        <GoalsCard>
          <GoalsHeader>
            <GoalsTitle>
              <FaBullseye />
              Today's Nutrition Goals
            </GoalsTitle>
          </GoalsHeader>
          
          <NutritionGrid>
            <NutritionCard onClick={() => navigate('/analytics')}>
              <NutritionHeader>
                <FaFire />
                <span>Calories</span>
              </NutritionHeader>
              <CircularProgress 
                percentage={(dailyProgress.calories.current / dailyProgress.calories.target) * 100}
              >
                <div className="label">kcal</div>
              </CircularProgress>
              <NutritionValues>
                <span className="current">{Math.round(dailyProgress.calories.current)}</span>
                <span className="target">/ {dailyProgress.calories.target}</span>
              </NutritionValues>
            </NutritionCard>

            <NutritionCard onClick={() => navigate('/analytics')}>
              <NutritionHeader>
                <FaDumbbell />
                <span>Protein</span>
              </NutritionHeader>
              <CircularProgress 
                percentage={(dailyProgress.protein.current / dailyProgress.protein.target) * 100}
              >
                <div className="label">grams</div>
              </CircularProgress>
              <NutritionValues>
                <span className="current">{Math.round(dailyProgress.protein.current)}</span>
                <span className="target">/ {dailyProgress.protein.target}</span>
              </NutritionValues>
            </NutritionCard>

            <NutritionCard onClick={() => navigate('/analytics')}>
              <NutritionHeader>
                <FaBreadSlice />
                <span>Carbs</span>
              </NutritionHeader>
              <CircularProgress 
                percentage={(dailyProgress.carbs.current / dailyProgress.carbs.target) * 100}
              >
                <div className="label">grams</div>
              </CircularProgress>
              <NutritionValues>
                <span className="current">{Math.round(dailyProgress.carbs.current)}</span>
                <span className="target">/ {dailyProgress.carbs.target}</span>
              </NutritionValues>
            </NutritionCard>

            <NutritionCard onClick={() => navigate('/analytics')}>
              <NutritionHeader>
                <FaTint />
                <span>Fats</span>
              </NutritionHeader>
              <CircularProgress 
                percentage={(dailyProgress.fats.current / dailyProgress.fats.target) * 100}
              >
                <div className="label">grams</div>
              </CircularProgress>
              <NutritionValues>
                <span className="current">{Math.round(dailyProgress.fats.current)}</span>
                <span className="target">/ {dailyProgress.fats.target}</span>
              </NutritionValues>
            </NutritionCard>
          </NutritionGrid>
        </GoalsCard>

        {/* Quick Stats Card */}
        <QuickStatsCard>
          <GoalsTitle style={{ marginBottom: '1.5rem' }}>
            <FaChartLine />
            Quick Stats
          </GoalsTitle>
          
          <StatsGrid>
            <StatItem onClick={() => navigate('/analytics')}>
              <StatIcon>
                <FaTrophy />
              </StatIcon>
              <StatContent>
                <div className="value">{stats.completedGoals}/4</div>
                <div className="label">Goals Completed</div>
              </StatContent>
            </StatItem>

            <StatItem onClick={() => navigate('/meal-plan')}>
              <StatIcon>
                <FaUtensils />
              </StatIcon>
              <StatContent>
                <div className="value">{stats.totalMeals}</div>
                <div className="label">Meals Today</div>
              </StatContent>
            </StatItem>

            <StatItem onClick={() => navigate('/analytics')}>
              <StatIcon>
                <FaWeight />
              </StatIcon>
              <StatContent>
                <div className="value">{stats.weekProgress}%</div>
                <div className="label">Week Progress</div>
              </StatContent>
            </StatItem>
          </StatsGrid>
        </QuickStatsCard>
      </ProgressOverview>

      {/* Today's Meals Section */}
      <TodayMealsSection>
        <SectionHeader>
          <SectionTitle>
            <FaUtensils />
            Today's Meal Plan
          </SectionTitle>
          <ViewAllButton onClick={() => navigate('/meal-plan')}>
            View Full Week
            <FaArrowRight />
          </ViewAllButton>
        </SectionHeader>

        {loading ? (
          <EmptyMealsState>
            <div className="icon">⏳</div>
            <h3>Loading your meals...</h3>
          </EmptyMealsState>
        ) : todayMeals.length > 0 ? (
          <MealsGrid>
            {['breakfast', 'lunch', 'snack', 'dinner'].map(mealType => {
              const meals = groupedMeals[mealType] || [];
              const mealTypeIcons = {
                breakfast: '🥞',
                lunch: '🥗',
                snack: '🍎',
                dinner: '🍽️'
              };

              return (
                <div key={mealType}>
                  <h3 style={{ 
                    color: 'var(--text-light)', 
                    marginBottom: '1rem',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{mealTypeIcons[mealType]}</span>
                    {mealType}
                  </h3>
                  {meals.length > 0 ? (
                    meals.map((mealItem, index) => (
                      <MealCard 
                        key={`${mealType}-${index}`}
                        meal={mealItem.meal} 
                      />
                    ))
                  ) : (
                    <EmptyMealsState style={{ padding: '2rem', fontSize: '0.9rem' }}>
                      <div className="icon" style={{ fontSize: '2rem' }}>🍽️</div>
                      <p style={{ margin: 0 }}>No {mealType} planned</p>
                    </EmptyMealsState>
                  )}
                </div>
              );
            })}
          </MealsGrid>
        ) : (
          <EmptyMealsState>
            <div className="icon">🍽️</div>
            <h3>No meals planned for today</h3>
            <p>Start your healthy journey by creating a personalized meal plan!</p>
            <ActionButton onClick={() => navigate('/meal-plan')}>
              <FaPlay />
              Create Meal Plan
            </ActionButton>
          </EmptyMealsState>
        )}
      </TodayMealsSection>
    </DashboardContainer>
  );
}
