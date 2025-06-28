import React, { useState } from 'react';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaClock, FaInfoCircle, FaFire } from 'react-icons/fa';

const Card = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  height: 400px; /* Fixed height for consistency */
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 181, 176, 0.2);
    border-color: var(--primary);
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  height: 160px;
  overflow: hidden;
`;

const CardImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.image ? `url(${props.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.1) 0%,
    rgba(0,0,0,0.2) 50%,
    rgba(0,0,0,0.7) 100%
  );
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => (props.isFavorite ? '#ff6b6b' : '#666')};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #ff6b6b;
    transform: scale(1.1);
  }
`;

const QuickStats = styled.div`
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
`;

const QuickStat = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    font-size: 0.7rem;
  }
`;

const CardContent = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled.h3`
  color: var(--text-light);
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6rem; /* Fixed height for 2 lines */
`;

const Description = styled.p`
  color: var(--text-muted);
  margin: 0 0 1rem 0;
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4rem; /* Fixed height for 2 lines */
`;

const NutritionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-light);
  border-radius: 10px;
  border: 1px solid var(--border);
`;

const NutritionItem = styled.div`
  text-align: center;
  flex: 1;
  
  .label {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary);
  }
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid rgba(var(--primary-rgb), 0.2);
`;

const ViewDetailsButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 181, 176, 0.4);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid var(--border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  position: relative;
  height: 200px;
  background: ${props => props.image ? `url(${props.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(transparent, var(--card-bg));
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: #333;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
  margin-top: -40px;
  position: relative;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  color: var(--text-light);
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
`;

const ModalSubtitle = styled.p`
  color: var(--text-muted);
  margin: 0 0 2rem 0;
  font-size: 1rem;
`;

const SectionTitle = styled.h3`
  color: var(--primary);
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: var(--primary);
    border-radius: 2px;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const NutritionCard = styled.div`
  background: var(--bg-light);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border);
  
  .label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
  }
`;

const RecipeContainer = styled.div`
  background: var(--bg-light);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--primary);
  margin-bottom: 2rem;
`;

const RecipeText = styled.div`
  line-height: 1.7;
  white-space: pre-line;
  color: var(--text-light);
  font-size: 0.95rem;
`;

const fallbackImage = 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=200&fit=crop&crop=center';

const MealCard = ({ meal, isFavorite, onFavoriteClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!meal || typeof meal !== 'object') {
    return null;
  }
  
  const {
    name = 'Unknown Meal',
    photo = fallbackImage,
    description = 'No description available',
    recipe = 'Recipe not available',
    cookingTime = 0,
    course = 'main',
    calories = 0,
    protein = 0,
    fats = 0,
    carbs = 0,
    fibre = 0,
    // sugar = 0,
    // addedSugar = 0,
    sodium = 0,
    portionSize = 100,
    filter = []
  } = meal;

  const imageUrl = (photo && photo.trim() && !photo.includes('example.com')) 
    ? photo 
    : fallbackImage;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    setShowDetails(true);
  };

  return (
    <>
      <Card onClick={handleCardClick}>
        <CardImageContainer>
          <CardImage image={imageUrl} />
          <ImageOverlay />
          
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteClick();
            }}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </FavoriteButton>
          
          <QuickStats>
            <QuickStat>
              <FaFire /> {calories}
            </QuickStat>
            <QuickStat>
              <FaClock /> {cookingTime}m
            </QuickStat>
          </QuickStats>
        </CardImageContainer>

        <CardContent>
          <div>
            <Title>{name}</Title>
            <Description>{description}</Description>
            
            <NutritionRow>
              <NutritionItem>
                <div className="label">Protein</div>
                <div className="value">{protein}g</div>
              </NutritionItem>
              <NutritionItem>
                <div className="label">Carbs</div>
                <div className="value">{carbs}g</div>
              </NutritionItem>
              <NutritionItem>
                <div className="label">Fats</div>
                <div className="value">{fats}g</div>
              </NutritionItem>
            </NutritionRow>

            {filter && filter.length > 0 && (
              <TagsRow>
                {filter.slice(0, 3).map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
                {filter.length > 3 && <Tag>+{filter.length - 3}</Tag>}
              </TagsRow>
            )}
          </div>

          <ViewDetailsButton onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
          }}>
            <FaInfoCircle /> View Recipe
          </ViewDetailsButton>
        </CardContent>
      </Card>

      {showDetails && (
        <Modal onClick={() => setShowDetails(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader image={imageUrl}>
              <CloseButton onClick={() => setShowDetails(false)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              <ModalTitle>{name}</ModalTitle>
              <ModalSubtitle>
                {course} • {cookingTime} minutes • {calories} calories
              </ModalSubtitle>

              <SectionTitle>Nutrition Facts</SectionTitle>
              <NutritionGrid>
                <NutritionCard>
                  <div className="label">Calories</div>
                  <div className="value">{calories}</div>
                </NutritionCard>
                <NutritionCard>
                  <div className="label">Protein</div>
                  <div className="value">{protein}g</div>
                </NutritionCard>
                <NutritionCard>
                  <div className="label">Carbs</div>
                  <div className="value">{carbs}g</div>
                </NutritionCard>
                <NutritionCard>
                  <div className="label">Fats</div>
                  <div className="value">{fats}g</div>
                </NutritionCard>
                <NutritionCard>
                  <div className="label">Fiber</div>
                  <div className="value">{fibre}g</div>
                </NutritionCard>
                <NutritionCard>
                  <div className="label">Sodium</div>
                  <div className="value">{sodium}mg</div>
                </NutritionCard>
              </NutritionGrid>

              {description && description !== 'No description available' && (
                <>
                  <SectionTitle>About This Dish</SectionTitle>
                  <p style={{ marginBottom: '2rem', lineHeight: 1.6, color: 'var(--text-light)' }}>
                    {description}
                  </p>
                </>
              )}

              <SectionTitle>Recipe Instructions</SectionTitle>
              <RecipeContainer>
                <RecipeText>{recipe}</RecipeText>
              </RecipeContainer>

              {filter && filter.length > 0 && (
                <>
                  <SectionTitle>Dietary Information</SectionTitle>
                  <TagsRow style={{ marginBottom: '1rem' }}>
                    {filter.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </TagsRow>
                </>
              )}

              <div style={{ 
                padding: '1rem',
                background: 'var(--bg-light)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)'
              }}>
                <strong style={{ color: 'var(--text-light)' }}>Portion Size:</strong> {portionSize}g
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default MealCard;
