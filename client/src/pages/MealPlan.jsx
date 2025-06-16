import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaFilter, FaHeart } from 'react-icons/fa';
import { mealsAPI } from '../services/api';
import MealCard from '../components/MealCard';
import Button from '../components/Button';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 181, 176, 0.2);
  border-radius: 8px;
  background: rgba(0, 181, 176, 0.05);
  color: var(--text-light);
  width: 300px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0, 181, 176, 0.1);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const MealGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  opacity: 0.8;
`;

const MealPlan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meals, setMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mealsAPI.getAll();
      setMeals(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFavorite = (mealId) => {
    setFavorites(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  const toggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (showFavoritesOnly) {
      return matchesSearch && favorites[meal._id];
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <PageContainer>
        <Title>Meal Plan</Title>
        <EmptyState>Loading meals...</EmptyState>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Title>Meal Plan</Title>
        <EmptyState style={{ color: 'var(--error)' }}>{error}</EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Meal Plan</Title>
        <ActionButtons>
          <SearchInput
            type="text"
            placeholder="Search meals..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button variant="outline">
            <FaFilter /> Filter
          </Button>
          <Button 
            variant={showFavoritesOnly ? "primary" : "outline"}
            onClick={toggleFavoritesFilter}
          >
            <FaHeart /> Favorites
          </Button>
        </ActionButtons>
      </Header>

      {filteredMeals.length === 0 ? (
        <EmptyState>
          {searchTerm || showFavoritesOnly ? 
            "No meals found matching your criteria" : 
            "No meals available. Try adding some meals to your plan!"
          }
        </EmptyState>
      ) : (
        <MealGrid>
          {filteredMeals.map(meal => (
            <MealCard
              key={meal._id}
              image={meal.photo}
              title={meal.name}
              description={meal.description}
              prepTime={meal.cookingTime}
              servings={`${meal.portionSize}g`}
              isFavorite={favorites[meal._id]}
              onFavoriteClick={() => toggleFavorite(meal._id)}
            />
          ))}
        </MealGrid>
      )}
    </PageContainer>
  );
};

export default MealPlan;