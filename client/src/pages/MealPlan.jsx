import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUtensils, FaSpinner } from 'react-icons/fa';
import { mealPlansAPI } from '../services/api';
import MealCard from '../components/MealCard';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 'var(--primary)' : 'transparent'};
  color: ${props => props.primary ? 'var(--bg-dark)' : 'var(--text-light)'};
  border: 1px solid var(--primary);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.primary ? 'var(--primary-light)' : 'rgba(0, 181, 176, 0.1)'};
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
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
  text-transform: capitalize;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--error);
  background: rgba(244, 67, 54, 0.1);
  border-radius: 16px;
  margin: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  opacity: 0.8;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(0, 181, 176, 0.1);
`;

const MealPlan = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const { user } = useAuth();

  const fetchWeeklyMeals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await mealPlansAPI.getWeekly();
      
      if (response.data) {
        setWeeklyMeals(response.data);
      } else {
        throw new Error('No meal plan data received');
      }
    } catch (err) {
      console.error('Error fetching weekly meals:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };

  const generateNewMealPlan = async () => {
    try {
      setGenerating(true);
      setError('');
      
      const response = await mealPlansAPI.generate({ planType: 'weekly' });
      
      if (response.data) {
        toast.success('New meal plan generated successfully!');
        await fetchWeeklyMeals(); // Refresh the meal plan
      } else {
        throw new Error('Failed to generate meal plan');
      }
    } catch (err) {
      console.error('Error generating meal plan:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate meal plan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchWeeklyMeals();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <Title>Weekly Meal Plan</Title>
        <LoadingState>
          <FaSpinner className="fa-spin" size={24} />
          <p>Loading your meal plan...</p>
        </LoadingState>
      </PageContainer>
    );
  }

  if (error && Object.keys(weeklyMeals).length === 0) {
    return (
      <PageContainer>
        <Title>Weekly Meal Plan</Title>
        <ErrorState>
          <h3>⚠️ Unable to load meal plan</h3>
          <p>{error}</p>
          <Button primary onClick={fetchWeeklyMeals} style={{ marginTop: '1rem' }}>
            Try Again
          </Button>
        </ErrorState>
      </PageContainer>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hasAnyMeals = Object.values(weeklyMeals).some(dayMeals => dayMeals && dayMeals.length > 0);

  return (
    <PageContainer>
      <Title>Weekly Meal Plan</Title>
      
      <ActionBar>
        <Button primary onClick={generateNewMealPlan} disabled={generating}>
          {generating ? (
            <>
              <FaSpinner className="fa-spin" />
              Generating...
            </>
          ) : (
            <>
              <FaUtensils />
              Generate New Plan
            </>
          )}
        </Button>
        <Button onClick={fetchWeeklyMeals} disabled={loading}>
          Refresh
        </Button>
      </ActionBar>

      {error && (
        <ErrorState>
          <p>⚠️ {error}</p>
        </ErrorState>
      )}

      {!hasAnyMeals ? (
        <EmptyState>
          <FaUtensils size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No meal plan available</h3>
          <p>Generate your first personalized meal plan to get started!</p>
          <Button primary onClick={generateNewMealPlan} style={{ marginTop: '1rem' }}>
            <FaUtensils />
            Generate Meal Plan
          </Button>
        </EmptyState>
      ) : (
        <WeekContainer>
          {days.map(day => {
            const dayKey = day.toLowerCase();
            const dayMeals = weeklyMeals[dayKey] || [];
            
            return (
              <DayContainer key={day}>
                <DayHeader>
                  <DayTitle>{day}</DayTitle>
                  <p style={{ color: 'var(--text-light)', opacity: 0.7, margin: 0 }}>
                    {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''} planned
                  </p>
                </DayHeader>
                {dayMeals.length > 0 ? (
                  <MealsGrid>
                    {dayMeals.map((meal, index) => (
                      <MealCard key={meal._id || `${day}-${index}`} meal={meal} />
                    ))}
                  </MealsGrid>
                ) : (
                  <EmptyState style={{ margin: 0, padding: '2rem' }}>
                    <p>No meals planned for {day}</p>
                  </EmptyState>
                )}
              </DayContainer>
            );
          })}
        </WeekContainer>
      )}
    </PageContainer>
  );
};

export default MealPlan;