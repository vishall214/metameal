import React, { useState } from 'react';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaClock, FaInfoCircle, FaFire } from 'react-icons/fa';

const Card = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  height: 420px;
  display: flex;
  flex-direction: column;
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--glass-shadow-hover);
    border-color: var(--primary);
    background: linear-gradient(135deg, rgba(10, 41, 40, 0.9) 0%, rgba(0, 77, 74, 0.8) 100%);
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
`;

const CardImage = styled.img.attrs(props => ({
  src: props.image,
  alt: props.alt || 'Food image',
  onError: props.onError,
  loading: 'lazy'
}))`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  background-color: #f0f0f0;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => (props.isFavorite ? '#ff6b6b' : 'rgba(255, 255, 255, 0.9)')};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: var(--glass-backdrop);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    color: #ff6b6b;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
`;

const QuickStats = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const QuickStat = styled.div`
  background: rgba(0, 181, 176, 0.4);
  color: white;
  padding: 0.4rem 0.7rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid rgba(0, 181, 176, 0.5);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  svg {
    font-size: 0.7rem;
    color: var(--primary-light);
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
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6rem;
`;

const Description = styled.p`
  color: var(--text-muted);
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4rem;
`;

const NutritionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.6rem;
  background: linear-gradient(135deg, rgba(0, 181, 176, 0.1) 0%, rgba(0, 181, 176, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 181, 176, 0.2);
`;

const NutritionItem = styled.div`
  text-align: center;
  flex: 1;
  
  .label {
    font-size: 0.65rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.2rem;
    font-weight: 600;
  }
  
  .value {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--primary);
  }
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const Tag = styled.span`
  background: rgba(0, 181, 176, 0.1);
  color: var(--primary);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  border: 1px solid rgba(0, 181, 176, 0.2);
`;

const ViewDetailsButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 181, 176, 0.3);
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

// Enhanced helper function to process image URLs, especially from Google Drive (matching Library.jsx logic)
const processImageUrl = (url) => {
  if (!url || url === '' || url === null || url === undefined) {
    return fallbackImage;
  }
  
  try {
    const photoUrl = url.trim();
    
    // Handle Google Drive URLs with enhanced parsing (matching Library.jsx)
    if (photoUrl.includes('drive.google.com')) {
      let fileId = null;
      
      // Multiple Google Drive URL format support
      const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,      // /file/d/ID/
        /[?&]id=([a-zA-Z0-9_-]+)/,          // ?id=ID or &id=ID
        /\/d\/([a-zA-Z0-9_-]+)/,            // /d/ID/
        /\/open\?id=([a-zA-Z0-9_-]+)/       // /open?id=ID
      ];
      
      for (const pattern of patterns) {
        const match = photoUrl.match(pattern);
        if (match && match[1]) {
          fileId = match[1];
          break;
        }
      }
      
      // Validate file ID and return optimized view URL
      if (fileId && fileId.length >= 25 && /^[a-zA-Z0-9_-]+$/.test(fileId)) {
        // Try thumbnail API first (often works better for CORS)
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300-c`;
      } else {
        console.warn('Invalid Google Drive file ID extracted:', fileId, 'from URL:', photoUrl);
        return fallbackImage;
      }
    }
    
    // Handle direct image URLs with validation
    if (photoUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) {
      return photoUrl;
    }
    
    // Handle other direct URLs (but warn about potential issues)
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    
    console.warn('Unrecognized image URL format:', photoUrl);
    return fallbackImage;
    
  } catch (error) {
    console.error('Error processing image URL:', error, 'URL:', url);
    return fallbackImage;
  }
};

const MealCard = ({ meal, isFavorite, onFavoriteClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!meal || typeof meal !== 'object') {
    console.warn('Invalid meal object provided to MealCard:', meal);
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

  // Use enhanced image processing (matching Library.jsx logic)
  const imageUrl = imageError ? 
    fallbackImage : 
    processImageUrl(photo);
  
  const handleImageError = (e) => {
    console.error('🖼️ Image failed to load:', {
      src: e.target.src,
      originalPhoto: photo,
      mealName: name
    });
    
    // If this is already the fallback image, don't retry
    if (e.target.src === fallbackImage) {
      setImageError(true);
      return;
    }
    
    // Try alternative Google Drive URL format if the current one failed
    if (photo && photo.includes('drive.google.com') && !imageError) {
      const fileIdMatch = photo.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        
        // If thumbnail API failed, try the uc?export=view format
        if (e.target.src.includes('thumbnail')) {
          const alternativeUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
          console.log('🔄 Trying alternative Google Drive URL:', alternativeUrl);
          e.target.src = alternativeUrl;
          return;
        }
        // If uc?export=view failed, try direct file access
        else if (e.target.src.includes('uc?export=view')) {
          const directUrl = `https://lh3.googleusercontent.com/d/${fileId}=w400-h300-c`;
          console.log('🔄 Trying Google UserContent URL:', directUrl);
          e.target.src = directUrl;
          return;
        }
      }
    }
    
    // Final fallback to the default image
    console.log('🔄 Using fallback image for:', name);
    setImageError(true);
    e.target.src = fallbackImage;
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    setShowDetails(true);
  };

  return (
    <>
      <Card onClick={handleCardClick}>
        <CardImageContainer>
          <CardImage 
            image={imageUrl} 
            alt={name}
            onError={handleImageError}
          />
          
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
