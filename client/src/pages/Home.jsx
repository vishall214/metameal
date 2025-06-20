import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUtensils, FaWeight, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { dashboardAPI } from '../services/api';
import MealCard from '../components/MealCard';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-light);
  opacity: 0.8;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  h2 {
    color: var(--text-light);
    margin-bottom: 1rem;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--primary);
  font-size: 1.25rem;
`;

const CardTitle = styled.h3`
  color: var(--text-light);
  margin: 0;
`;

const MealSection = styled(Section)`
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      color: var(--primary);
    }
  }
`;

const MealGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
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
  width: ${props => Math.min(props.progress, 100)}%;
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

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  opacity: 0.8;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--error);
  background: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  margin: 1rem 0;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getDashboard();
      
      if (response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('No dashboard data received');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
      
      // Set default data on error
      setDashboardData({
        calories: { consumed: 0, goal: 2000 },
        water: { consumed: 0, goal: 2.5 },
        weight: { current: 0, goal: 0 },
        meals: [],
        goals: [
          { _id: '1', text: 'Complete daily water intake', completed: false },
          { _id: '2', text: 'Track all meals', completed: false },
          { _id: '3', text: 'Exercise for 30 minutes', completed: false }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleMealStatusUpdate = async (mealId, completed) => {
    try {
      await dashboardAPI.updateMealStatus(mealId, { completed });
      await fetchDashboardData(); // Refresh dashboard data
      toast.success('Meal status updated');
    } catch (error) {
      console.error('Error updating meal status:', error);
      toast.error('Failed to update meal status');
    }
  };

  const handleGoalStatusUpdate = async (goalId, completed) => {
    try {
      await dashboardAPI.updateGoalStatus(goalId, { completed });
      await fetchDashboardData(); // Refresh dashboard data
      toast.success('Goal status updated');
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast.error('Failed to update goal status');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <WelcomeSection>
          <Title>Welcome back, {user?.name}!</Title>
          <Subtitle>Loading your dashboard...</Subtitle>
        </WelcomeSection>
        <LoadingState>Loading...</LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <WelcomeSection>
        <Title>Welcome back, {user?.name}!</Title>
        <Subtitle>Here's your daily progress</Subtitle>
      </WelcomeSection>

      {error && (
        <ErrorState>
          <p>⚠️ {error}</p>
          <button 
            onClick={fetchDashboardData}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </ErrorState>
      )}

      <DashboardGrid>
        <Card>
          <CardHeader>
            <FaUtensils />
            <CardTitle>Calories</CardTitle>
          </CardHeader>
          <StatValue>
            {dashboardData.calories.consumed} / {dashboardData.calories.goal} kcal
          </StatValue>
          <ProgressBar>
            <Progress progress={(dashboardData.calories.consumed / dashboardData.calories.goal) * 100} />
          </ProgressBar>
        </Card>

        <Card>
          <CardHeader>
            <FaWeight />
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <StatValue>
            {dashboardData.weight.current} / {dashboardData.weight.goal} kg
          </StatValue>
          <ProgressBar>
            <Progress progress={dashboardData.weight.goal ? (dashboardData.weight.current / dashboardData.weight.goal) * 100 : 0} />
          </ProgressBar>
        </Card>
      </DashboardGrid>

      <MealSection>
        <h2>
          <FaUtensils />
          Today's Meals
        </h2>
        {dashboardData.meals && dashboardData.meals.length > 0 ? (
          <MealGrid>
            {dashboardData.meals.map(meal => (
              <MealCard key={meal._id || meal.id} meal={meal} />
            ))}
          </MealGrid>
        ) : (
          <Card>
            <p style={{ color: 'var(--text-light)', opacity: 0.8, textAlign: 'center' }}>
              No meals planned for today. Visit the <a href="/meal-plan" style={{ color: 'var(--primary)' }}>Meal Plan</a> page to generate your personalized meal plan.
            </p>
          </Card>
        )}
      </MealSection>

      <Section>
        <h2>Goals</h2>
        <GoalList>
          {dashboardData.goals && dashboardData.goals.length > 0 ? (
            dashboardData.goals.map((goal, index) => (
              <GoalItem key={goal._id || index} completed={goal.completed}>
                <FaCheckCircle />
                <span>{goal.text}</span>
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleGoalStatusUpdate(goal._id, !goal.completed)}
                />
              </GoalItem>
            ))
          ) : (
            <Card>
              <p style={{ color: 'var(--text-light)', opacity: 0.8, textAlign: 'center' }}>
                No goals set. Complete your profile to get personalized goals.
              </p>
            </Card>
          )}
        </GoalList>
      </Section>
    </PageContainer>
  );
}