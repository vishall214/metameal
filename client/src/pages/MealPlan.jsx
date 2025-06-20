import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUtensils } from 'react-icons/fa';
import { mealPlansAPI } from '../services/api';
import MealCard from '../components/MealCard';
import { useAuth } from '../contexts/AuthContext';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
`;

const WeekContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DayContainer = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
`;

const DayHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const DayTitle = styled.h2`
  color: var(--text-light);
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
`;

const MealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  opacity: 0.8;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--error);
`;

const MealPlan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchWeeklyMeals = async () => {
      try {
        setLoading(true);
        const response = await mealPlansAPI.generate();
        setWeeklyMeals(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching weekly meals:', err);
        setError('Failed to load meal plan');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyMeals();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <Title>Weekly Meal Plan</Title>
        <LoadingState>Loading your meal plan...</LoadingState>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Title>Weekly Meal Plan</Title>
        <ErrorState>{error}</ErrorState>
      </PageContainer>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <PageContainer>
      <Title>Weekly Meal Plan</Title>
      <WeekContainer>
        {days.map(day => (
          <DayContainer key={day}>
            <DayHeader>
              <DayTitle>{day}</DayTitle>
            </DayHeader>
            <MealsGrid>
              {weeklyMeals[day.toLowerCase()]?.map(meal => (
                <MealCard key={meal._id} meal={meal} />
              ))}
            </MealsGrid>
          </DayContainer>
        ))}
      </WeekContainer>
    </PageContainer>
  );
};

export default MealPlan;