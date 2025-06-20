import React, { useState } from 'react';
import styled from 'styled-components';
import { FaClock, FaUtensils } from 'react-icons/fa';

const Card = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.1);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, var(--primary-light), var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
`;

const Content = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`;

const CourseTag = styled.span`
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  color: var(--text-light);
  opacity: 0.8;
  font-size: 0.875rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: var(--bg-dark);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const NutritionItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 8px;

  h4 {
    color: var(--primary);
    margin: 0;
    font-size: 1.25rem;
  }

  p {
    color: var(--text-light);
    opacity: 0.8;
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
  }
`;

const Recipe = styled.div`
  margin-top: 1.5rem;
  color: var(--text-light);
  
  h3 {
    color: var(--primary);
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.6;
    opacity: 0.9;
  }
`;

const ErrorMessage = styled.div`
  color: var(--text-light);
  opacity: 0.6;
  text-align: center;
  padding: 1rem;
`;

const MealCard = ({ meal }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Handle missing or invalid meal data
  if (!meal) {
    return (
      <Card>
        <ErrorMessage>
          <FaUtensils />
          <p>Meal data not available</p>
        </ErrorMessage>
      </Card>
    );
  }

  // Extract meal data with fallbacks
  const {
    name = 'Unknown Meal',
    photo,
    course = 'meal',
    calories = 0,
    cookingTime = 0,
    description = 'No description available',
    recipe = 'Recipe not available',
    protein = 0,
    carbs = 0,
    fats = 0,
    fibre = 0
  } = meal;

  // Handle different possible data structures
  const mealData = meal.preview || meal.details || meal;
  const nutritionData = meal.details?.nutritionalInfo || meal;

  return (
    <>
      <Card onClick={() => setShowDetails(true)}>
        <ImageContainer>
          {photo ? (
            <Image 
              src={photo} 
              alt={name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <PlaceholderImage style={{ display: photo ? 'none' : 'flex' }}>
            <FaUtensils />
          </PlaceholderImage>
        </ImageContainer>
        <Content>
          <CourseTag>
            <FaUtensils /> {course}
          </CourseTag>
          <Title>{name}</Title>
          <Stats>
            <span><FaClock /> {cookingTime} mins</span>
            <span>{calories} kcal</span>
          </Stats>
        </Content>
      </Card>

      {showDetails && (
        <Modal onClick={() => setShowDetails(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setShowDetails(false)}>×</CloseButton>
            <ImageContainer style={{ borderRadius: '8px', marginBottom: '1rem' }}>
              {photo ? (
                <Image 
                  src={photo} 
                  alt={name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <PlaceholderImage style={{ display: photo ? 'none' : 'flex' }}>
                <FaUtensils />
              </PlaceholderImage>
            </ImageContainer>
            <Title style={{ fontSize: '1.75rem' }}>{name}</Title>
            <CourseTag>
              <FaUtensils /> {course}
            </CourseTag>
            <p style={{ color: 'var(--text-light)', opacity: 0.9, marginTop: '1rem' }}>
              {description}
            </p>
            
            <NutritionGrid>
              <NutritionItem>
                <h4>{calories}</h4>
                <p>Calories</p>
              </NutritionItem>
              <NutritionItem>
                <h4>{nutritionData.protein || protein}g</h4>
                <p>Protein</p>
              </NutritionItem>
              <NutritionItem>
                <h4>{nutritionData.carbs || carbs}g</h4>
                <p>Carbs</p>
              </NutritionItem>
              <NutritionItem>
                <h4>{nutritionData.fats || fats}g</h4>
                <p>Fats</p>
              </NutritionItem>
              <NutritionItem>
                <h4>{nutritionData.fibre || fibre}g</h4>
                <p>Fibre</p>
              </NutritionItem>
            </NutritionGrid>

            <Recipe>
              <h3>How to Prepare</h3>
              <p>{recipe}</p>
            </Recipe>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default MealCard;