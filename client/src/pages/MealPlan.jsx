import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { mealPlansAPI } from '../services/api';
import MealCard from '../components/mealcard';
import BackButton from '../components/BackButton';
import { FaRedo, FaSpinner } from 'react-icons/fa';
import usePageTitle from '../utils/usePageTitle';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 2rem 1rem;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 1rem;
  letter-spacing: -2px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1.5rem;
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  font-size: 3rem;
  color: var(--primary);
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: var(--text-light);
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  
  h3 {
    color: #ff6b6b;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    color: var(--text-light);
    line-height: 1.6;
  }
`;

const WeekContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const DayCard = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  margin-bottom: 2.5rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
`;

const DayHeader = styled.div`
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  padding: 1.5rem 2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
`;

const DayInfo = styled.div`
  flex: 1;
`;

const DayTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DayNutrition = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const RerollButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    animation: ${props => props.isLoading ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const MealsContainer = styled.div`
  padding: 2rem;
`;

const DayMealsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MealSlot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 480px; /* Ensure consistent height including header */
`;

const MealTypeHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border);
`;

const MealTypeTitle = styled.h3`
  color: var(--text-light);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  text-transform: capitalize;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: var(--primary);
    border-radius: 2px;
  }
`;

const MealTypeIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-muted);
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-light);
  }
  
  p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
`;

const CreateButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 181, 176, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 181, 176, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const mealTypeConfig = {
  breakfast: { icon: '🌅', label: 'Breakfast' },
  lunch: { icon: '🌞', label: 'Lunch' },
  snack: { icon: '🍎', label: 'Snacks/Dessert' },
  dinner: { icon: '🌙', label: 'Dinner' }
};

const MealPlan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mealPlans, setMealPlans] = useState([]);
  const [rerollingDays, setRerollingDays] = useState(new Set());
  const [creating, setCreating] = useState(false);
  
  // Set the page title
  usePageTitle('Meal Plan');

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, update the rolling meal plan to ensure it's current
      await mealPlansAPI.updateRolling();
      
      // Fetch all meal plans and get the most recent one
      const response = await mealPlansAPI.getAll();
      
      console.log('📋 Fetched meal plans:', response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Get the most recent meal plan (first one, since they're sorted by createdAt desc)
        const mostRecentPlan = response.data[0];
        setMealPlans([mostRecentPlan]);
      } else {
        setMealPlans([]);
      }
    } catch (err) {
      console.error('❌ Error fetching meal plans:', err);
      setError('Failed to load meal plans: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const generateNewMealPlan = async (planType = 'weekly') => {
    try {
      setCreating(true);
      setError('');
      
      console.log('🔄 Generating new meal plan with type:', planType);
      const response = await mealPlansAPI.generate({ planType });
      console.log('✅ Generation response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Meal plan generated successfully, fetching updated plans...');
        await fetchMealPlans();
      } else {
        setError('Failed to generate meal plan: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Error generating meal plan:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Failed to generate meal plan: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const rerollDay = async (day) => {
    try {
      setRerollingDays(prev => new Set([...prev, day]));
      setError('');
      
      const response = await mealPlansAPI.rerollDay(day);
      
      if (response.data.success) {
        await fetchMealPlans();
      } else {
        setError(`Failed to reroll meals for ${day}`);
      }
    } catch (err) {
      console.error(`❌ Error rerolling day ${day}:`, err);
      setError(`Failed to reroll meals for ${day}: ` + (err.response?.data?.error || err.message));
    } finally {
      setRerollingDays(prev => {
        const newSet = new Set(prev);
        newSet.delete(day);
        return newSet;
      });
    }
  };

  // Function to get rolling 7 days starting from today
  const getRolling7Days = (meals) => {
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate 7 days starting from today
    const rollingDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      rollingDays.push(daysOfWeek[date.getDay()]);
    }
    
    return rollingDays;
  };

  // Check if we need to update the rolling meal plan (when day changes)
  const checkAndUpdateRollingPlan = useCallback(async () => {
    try {
      const response = await mealPlansAPI.addNextDay();
      if (response.data.success) {
        await fetchMealPlans();
      }
    } catch (err) {
      console.error('❌ Error updating rolling plan:', err);
      // Don't show error to user as this is automatic
    }
  }, []);

  // Check for day change every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      
      // Check if it's midnight (new day)
      if (currentHour === 0 && currentMinute === 0) {
        checkAndUpdateRollingPlan();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkAndUpdateRollingPlan]);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const groupMealsByDay = (meals) => {
    const grouped = {};
    meals.forEach(meal => {
      if (!grouped[meal.day]) {
        grouped[meal.day] = {};
      }
      if (!grouped[meal.day][meal.mealType]) {
        grouped[meal.day][meal.mealType] = [];
      }
      grouped[meal.day][meal.mealType].push(meal);
    });
    return grouped;
  };

  const calculateDayNutrition = (dayMeals) => {
    let totalCalories = 0;
    let totalProtein = 0;
    
    Object.values(dayMeals).forEach(mealTypeArray => {
      mealTypeArray.forEach(meal => {
        if (meal.meal) {
          totalCalories += meal.meal.calories || 0;
          totalProtein += meal.meal.protein || 0;
        }
      });
    });
    
    return { totalCalories, totalProtein };
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading your meal plans...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header>
          <Title>Meal Plans</Title>
        </Header>
        <ErrorContainer>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Check if we have any meal plans at all
  if (mealPlans.length === 0) {
    return (
      <PageContainer>
        <BackButton to="/home">Back to Dashboard</BackButton>
        <Header>
          <Title>Your 7-Day Meal Plan</Title>
          <Subtitle>Start your healthy journey with personalized meal plans</Subtitle>
        </Header>
        <EmptyState>
          <div className="icon">🍽️</div>
          <h3>No Meal Plans Yet</h3>
          <p>Generate your first personalized meal plan tailored to your dietary preferences and health goals!</p>
          <CreateButton 
            onClick={() => generateNewMealPlan()}
            disabled={creating}
          >
            {creating ? <><FaSpinner /> Creating your plan...</> : 'Create Your First Plan'}
          </CreateButton>
        </EmptyState>
      </PageContainer>
    );
  }

  // If we have a meal plan but it might be empty, still show the 7-day structure
  return (
    <PageContainer>
      <BackButton to="/home">Back to Dashboard</BackButton>
      <Header>
        <Title>Your 7-Day Meal Plan</Title>
        <Subtitle>Delicious and nutritious meals planned just for you</Subtitle>
        <CreateButton 
          onClick={() => generateNewMealPlan()}
          disabled={creating}
          style={{ marginTop: '1rem' }}
        >
          {creating ? <><FaSpinner /> Generating...</> : 'Generate New Week'}
        </CreateButton>
      </Header>

      <WeekContainer>
        {mealPlans.map((plan) => {
          const groupedMeals = groupMealsByDay(plan.meals || []);
          const rolling7Days = getRolling7Days(plan.meals || []);
          
          return (
            <div key={plan._id}>
              {rolling7Days.map((day, index) => {
                const dayMeals = groupedMeals[day] || {};
                const { totalCalories, totalProtein } = calculateDayNutrition(dayMeals);
                const isRerolling = rerollingDays.has(day);
                
                // Get relative day label
                const today = new Date();
                const dayDate = new Date(today);
                dayDate.setDate(today.getDate() + index);
                const isToday = index === 0;
                const isTomorrow = index === 1;
                
                let dayLabel = day;
                if (isToday) dayLabel = `${day} (Today)`;
                else if (isTomorrow) dayLabel = `${day} (Tomorrow)`;
                else dayLabel = `${day} (${dayDate.toLocaleDateString()})`;
                
                return (
                  <DayCard key={`${plan._id}-${day}-${index}`}>
                    <DayHeader>
                      <DayInfo>
                        <DayTitle>{dayLabel}</DayTitle>
                        {totalCalories > 0 && (
                          <DayNutrition>
                            🔥 {totalCalories} calories • 💪 {totalProtein}g protein
                          </DayNutrition>
                        )}
                      </DayInfo>
                      
                      <RerollButton 
                        onClick={() => rerollDay(day)}
                        disabled={isRerolling}
                        isLoading={isRerolling}
                      >
                        {isRerolling ? <FaSpinner /> : <FaRedo />}
                        {isRerolling ? 'Rerolling...' : 'Reroll Day'}
                      </RerollButton>
                    </DayHeader>

                    <MealsContainer>
                      <DayMealsRow>
                        {['breakfast', 'lunch', 'snack', 'dinner'].map(mealType => {
                          const meals = dayMeals[mealType];
                          const config = mealTypeConfig[mealType];
                          
                          return (
                            <MealSlot key={mealType}>
                              <MealTypeHeader>
                                <MealTypeIcon>{config.icon}</MealTypeIcon>
                                <MealTypeTitle>{config.label}</MealTypeTitle>
                              </MealTypeHeader>
                              
                              {meals && meals.length > 0 ? (
                                meals.map((mealItem, index) => (
                                  <MealCard
                                    key={mealItem._id || `${mealType}-${index}`}
                                    meal={mealItem.meal}
                                    isFavorite={false}
                                    onFavoriteClick={() => {}}
                                  />
                                ))
                              ) : (
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
                              )}
                            </MealSlot>
                          );
                        })}
                      </DayMealsRow>
                    </MealsContainer>
                  </DayCard>
                );
              })}
            </div>
          );
        })}
      </WeekContainer>
    </PageContainer>
  );
};

export default MealPlan;