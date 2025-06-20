import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUtensils, FaWeight, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MealCard from '../components/mealcard';

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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          <h2>Today's Meals</h2>
          <MealGrid>
            {dashboardData.meals.map((meal, index) => (
              <MealCard
                key={meal._id || index}
                image={meal.photo || meal.meal?.preview?.photo}
                title={meal.name || meal.meal?.preview?.name}
                description={meal.description || meal.meal?.details?.description}
                prepTime={meal.cookingTime || meal.meal?.preview?.cookingTime}
                servings={meal.portionSize || meal.meal?.details?.portionSize}
                isFavorite={false}
                onFavoriteClick={() => {}}
              />
            ))}
          </MealGrid>
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