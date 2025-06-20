import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import MealCard from '../components/mealcard';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
`;

const DaySection = styled.div`
  margin-bottom: 3rem;
`;

const DayTitle = styled.h2`
  color: var(--primary);
  margin-bottom: 1rem;
`;

const MealsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
`;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Snacks/Dessert', 'Dinner'];

const MealPlan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weeklyPlan, setWeeklyPlan] = useState([]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await api.post('/meal-plans/generate', { planType: 'weekly' });
        if (res.data && res.data.mealPlan && res.data.mealPlan.meals) {
          // Group meals by day
          const grouped = daysOfWeek.map(day => ({
            day,
            meals: mealTypes.map(type =>
              res.data.mealPlan.meals.find(m => m.day === day && (m.mealType.toLowerCase().includes(type.toLowerCase().split('/')[0])))
            ).filter(Boolean)
          }));
          setWeeklyPlan(grouped);
        } else {
          setError('No meal plan generated.');
        }
      } catch (err) {
        setError('Failed to generate meal plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) {
    return <PageContainer><Title>Meal Plan</Title>Loading...</PageContainer>;
  }
  if (error) {
    return <PageContainer><Title>Meal Plan</Title>{error}</PageContainer>;
  }

  return (
    <PageContainer>
      <Title>Weekly Meal Plan</Title>
      {weeklyPlan.map(({ day, meals }) => (
        <DaySection key={day}>
          <DayTitle>{day}</DayTitle>
          <MealsRow>
            {meals.map((item, idx) => (
              <MealCard
                key={item.meal.preview._id}
                image={item.meal.preview.photo}
                title={item.meal.preview.name}
                description={item.meal.details.description}
                prepTime={item.meal.preview.cookingTime}
                servings={item.meal.details.portionSize}
                isFavorite={false}
                onFavoriteClick={() => {}}
              />
            ))}
          </MealsRow>
        </DaySection>
      ))}
    </PageContainer>
  );
};

export default MealPlan;