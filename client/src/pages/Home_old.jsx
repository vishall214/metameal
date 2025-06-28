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
import Sidebar from '../components/Sidebar';
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
  justify-content: between;
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
  color: var(--primary);
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MealTypeIcon = styled.span`
  font-size: 1.2rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 181, 176, 0.1);
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  transition: width 0.3s ease;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  color: var(--primary);
  font-weight: bold;
  margin: 0.5rem 0;
`;

const GoalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GoalItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-light);
  opacity: ${props => props.completed ? 1 : 0.7};
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 181, 176, 0.1);

  svg {
    color: ${props => props.completed ? 'var(--primary)' : 'var(--text-light)'};
  }

  span {
    flex: 1;
  }

  input[type="checkbox"] {
    accent-color: var(--primary);
  }
`;

const DashboardWrapper = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 250px;
  padding: 2rem 0;
`;

export default function Home() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    calories: { consumed: 0, goal: 2000 },
    water: { consumed: 0, goal: 2.5 },
    weight: { current: 0, goal: 0 },
    meals: [],
    goals: []
  });
  const [mondayMeals, setMondayMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  }, [user?.token]);

  const fetchMondayMeals = useCallback(async () => {
    try {
      const response = await mealPlansAPI.getAll();
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const activePlan = response.data[0]; // Get the most recent meal plan
        
        // For rolling plan, get today's meals (which would be the first day in the rolling week)
        const today = new Date();
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = daysOfWeek[today.getDay()];
        
        // Get today's meals from the rolling plan
        const todayMealsData = activePlan.meals?.filter(meal => meal.day === todayName) || [];
        setMondayMeals(todayMealsData);
      }
    } catch (error) {
      console.error('Error fetching today\'s meals:', error);
      // Don't show error toast for meals as it's not critical for dashboard
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchMondayMeals()]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchDashboardData, fetchMondayMeals]);

  const handleGoalStatusUpdate = async (goalId, completed) => {
    try {
      await axios.put(`/api/dashboard/goals/${goalId}`, { completed }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      fetchDashboardData(); // Refresh dashboard data
      toast.success('Goal status updated');
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast.error('Failed to update goal status');
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // Group today's meals by meal type
  const mealTypeConfig = {
    breakfast: { icon: '🌅', label: 'Breakfast' },
    lunch: { icon: '🌞', label: 'Lunch' },
    snack: { icon: '🍎', label: 'Snacks/Dessert' },
    dinner: { icon: '🌙', label: 'Dinner' }
  };

  const groupedTodayMeals = {};
  mondayMeals.forEach(meal => {
    if (!groupedTodayMeals[meal.mealType]) {
      groupedTodayMeals[meal.mealType] = [];
    }
    groupedTodayMeals[meal.mealType].push(meal);
  });

  return (
    <DashboardWrapper>
      <Sidebar />
      <MainContent>
        <WelcomeSection>
          <Title>Welcome back, {user?.name}!</Title>
          <Subtitle>Here's your daily progress</Subtitle>
        </WelcomeSection>

        <DashboardGrid>
          <Card>
            <CardHeader>
              <FaUtensils />
              <CardTitle>Calories</CardTitle>
            </CardHeader>
            <StatValue>{dashboardData.calories.consumed} / {dashboardData.calories.goal} kcal</StatValue>
            <ProgressBar>
              <Progress progress={(dashboardData.calories.consumed / dashboardData.calories.goal) * 100} />
            </ProgressBar>
          </Card>

          <Card>
            <CardHeader>
              <FaWeight />
              <CardTitle>Weight Progress</CardTitle>
            </CardHeader>
            <StatValue>{dashboardData.weight.current} / {dashboardData.weight.goal} kg</StatValue>
            <ProgressBar>
              <Progress progress={(dashboardData.weight.current / dashboardData.weight.goal) * 100} />
            </ProgressBar>
          </Card>
        </DashboardGrid>

        <MealSection>
          <h2>
            <FaCalendarDay />
            Today's Meal Plan
          </h2>
          {Object.keys(groupedTodayMeals).length > 0 ? (
            <MealGrid>
              {['breakfast', 'lunch', 'snack', 'dinner'].map(mealType => {
                const meals = groupedTodayMeals[mealType];
                const config = mealTypeConfig[mealType];
                
                if (!meals || meals.length === 0) {
                  return (
                    <MealTypeSection key={mealType}>
                      <MealTypeTitle>
                        <MealTypeIcon>{config.icon}</MealTypeIcon>
                        {config.label}
                      </MealTypeTitle>
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-light)',
                        borderRadius: '12px',
                        border: '1px dashed var(--border)',
                        height: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                          {config.icon}
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                          No {config.label.toLowerCase()} planned
                        </div>
                      </div>
                    </MealTypeSection>
                  );
                }
                
                return (
                  <MealTypeSection key={mealType}>
                    <MealTypeTitle>
                      <MealTypeIcon>{config.icon}</MealTypeIcon>
                      {config.label}
                    </MealTypeTitle>
                    {meals.map((mealItem, index) => (
                      <MealCard
                        key={mealItem._id || `${mealType}-${index}`}
                        meal={mealItem.meal}
                        isFavorite={false}
                        onFavoriteClick={() => {}}
                      />
                    ))}
                  </MealTypeSection>
                );
              })}
            </MealGrid>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-light)',
              borderRadius: '16px',
              border: '1px dashed var(--border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
              <h3 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>No Meal Plan for Today</h3>
              <p>Generate a meal plan to see today's meals here!</p>
            </div>
          )}
        </MealSection>

        <Section>
          <h2>Goals</h2>
          <GoalList>
            {dashboardData.goals.map((goal, index) => (
              <GoalItem key={index} completed={goal.completed}>
                <FaCheckCircle />
                <span>{goal.text}</span>
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleGoalStatusUpdate(goal._id, !goal.completed)}
                />
              </GoalItem>
            ))}
          </GoalList>
        </Section>
      </MainContent>
    </DashboardWrapper>
  );
}