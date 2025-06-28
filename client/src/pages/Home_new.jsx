import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaUtensils, 
  FaCheckCircle, 
  FaCalendarDay, 
  FaFire, 
  FaTint,
  FaPlay,
  FaArrowRight,
  FaCheck
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
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

// Goals Card
const GoalsCard = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
`;

const GoalsHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const GoalsTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GoalsSubtitle = styled.p`
  color: var(--text-muted);
  margin: 0;
  font-size: 0.9rem;
`;

// Daily Goals List
const GoalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GoalItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 181, 176, 0.1);
  }
  
  ${props => props.completed && `
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
  `}
`;

const GoalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const GoalIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.completed ? '#22c55e' : 'var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
`;

const GoalText = styled.div`
  .title {
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 0.25rem;
  }
  
  .progress {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
`;

const GoalCheckbox = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${props => props.checked ? '#22c55e' : 'var(--border)'};
  border-radius: 6px;
  background: ${props => props.checked ? '#22c55e' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #22c55e;
  }
`;

// Progress Card
const ProgressCard = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const ProgressItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 12px;
`;

const ProgressValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.25rem;
`;

const ProgressLabel = styled.div`
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(0, 181, 176, 0.1);
  border-radius: 3px;
  margin: 0.5rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.5s ease;
  width: ${props => Math.min(props.percentage, 100)}%;
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

// Component for Progress Ring - Removed as it's no longer needed

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
  const [completedGoals, setCompletedGoals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    water: false
  });
  const [loading, setLoading] = useState(true);

  // Get today's day name
  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Calculate daily nutrition progress
  const calculateDailyProgress = useCallback((meals) => {
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
  }, [user?.profile]);

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
  }, [calculateDailyProgress]);

  // Toggle goal completion
  const toggleGoal = (goalType) => {
    setCompletedGoals(prev => ({
      ...prev,
      [goalType]: !prev[goalType]
    }));
  };

  // Define daily goals
  const dailyGoals = [
    {
      id: 'breakfast',
      title: 'Eat Breakfast',
      icon: <FaUtensils />,
      description: 'Start your day with a healthy meal'
    },
    {
      id: 'lunch',
      title: 'Eat Lunch',
      icon: <FaUtensils />,
      description: 'Fuel your afternoon with nutrition'
    },
    {
      id: 'dinner',
      title: 'Eat Dinner',
      icon: <FaUtensils />,
      description: 'End your day with a balanced meal'
    },
    {
      id: 'water',
      title: 'Drink 8 Glasses of Water',
      icon: <FaTint />,
      description: 'Stay hydrated throughout the day'
    }
  ];

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
              <FaCheckCircle />
              Today's Goals
            </GoalsTitle>
            <GoalsSubtitle>Check off your daily health goals</GoalsSubtitle>
          </GoalsHeader>
          
          <GoalsList>
            {dailyGoals.map(goal => (
              <GoalItem 
                key={goal.id} 
                completed={completedGoals[goal.id]}
                onClick={() => toggleGoal(goal.id)}
              >
                <GoalInfo>
                  <GoalIcon completed={completedGoals[goal.id]}>
                    {goal.icon}
                  </GoalIcon>
                  <GoalText>
                    <div className="title">{goal.title}</div>
                    <div className="progress">{goal.description}</div>
                  </GoalText>
                </GoalInfo>
                <GoalCheckbox checked={completedGoals[goal.id]}>
                  {completedGoals[goal.id] && <FaCheck />}
                </GoalCheckbox>
              </GoalItem>
            ))}
          </GoalsList>
        </GoalsCard>

        {/* Nutrition Progress Card */}
        <ProgressCard>
          <GoalsTitle style={{ marginBottom: '1.5rem' }}>
            <FaFire />
            Nutrition Progress
          </GoalsTitle>
          
          <ProgressGrid>
            <ProgressItem>
              <ProgressValue>{Math.round(dailyProgress.calories.current)}</ProgressValue>
              <ProgressLabel>Calories</ProgressLabel>
              <ProgressBar>
                <ProgressFill percentage={(dailyProgress.calories.current / dailyProgress.calories.target) * 100} />
              </ProgressBar>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                / {dailyProgress.calories.target}
              </div>
            </ProgressItem>

            <ProgressItem>
              <ProgressValue>{Math.round(dailyProgress.protein.current)}g</ProgressValue>
              <ProgressLabel>Protein</ProgressLabel>
              <ProgressBar>
                <ProgressFill percentage={(dailyProgress.protein.current / dailyProgress.protein.target) * 100} />
              </ProgressBar>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                / {dailyProgress.protein.target}g
              </div>
            </ProgressItem>

            <ProgressItem>
              <ProgressValue>{Math.round(dailyProgress.carbs.current)}g</ProgressValue>
              <ProgressLabel>Carbs</ProgressLabel>
              <ProgressBar>
                <ProgressFill percentage={(dailyProgress.carbs.current / dailyProgress.carbs.target) * 100} />
              </ProgressBar>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                / {dailyProgress.carbs.target}g
              </div>
            </ProgressItem>

            <ProgressItem>
              <ProgressValue>{Math.round(dailyProgress.fats.current)}g</ProgressValue>
              <ProgressLabel>Fats</ProgressLabel>
              <ProgressBar>
                <ProgressFill percentage={(dailyProgress.fats.current / dailyProgress.fats.target) * 100} />
              </ProgressBar>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                / {dailyProgress.fats.target}g
              </div>
            </ProgressItem>
          </ProgressGrid>
        </ProgressCard>
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
            {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
              const meals = groupedMeals[mealType] || [];
              const mealTypeIcons = {
                breakfast: '🥞',
                lunch: '🥗',
                dinner: '🍽️',
                snack: '🍎'
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
