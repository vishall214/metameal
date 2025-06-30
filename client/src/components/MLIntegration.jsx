import React, { useState } from 'react';
import styled from 'styled-components';
import { useMLRecommendations, useNutritionAnalysis } from '../hooks/useML';
import Button from './Button';
import Card from './Card';
import Loading from './Loading';
import { FaRobot, FaThumbsUp, FaThumbsDown, FaBrain, FaCalculator } from 'react-icons/fa';

const MLContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary);
  }
`;

const RecommendationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RecommendationCard = styled(Card)`
  padding: 1.5rem;
  border-left: 4px solid ${props => 
    props.priority === 'high' ? 'var(--success)' :
    props.priority === 'medium' ? 'var(--warning)' : 'var(--info)'
  };
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  margin: 1rem 0;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  width: ${props => props.confidence * 100}%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 0.5s ease;
`;

const FeedbackButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const NutritionItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: var(--glass-light);
  border-radius: var(--radius);
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const AnalysisInput = styled.div`
  background: var(--glass-light);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  
  textarea {
    width: 100%;
    min-height: 120px;
    background: transparent;
    border: 1px solid var(--border-light);
    border-radius: var(--radius);
    padding: 1rem;
    color: var(--text-primary);
    font-family: inherit;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    &::placeholder {
      color: var(--text-muted);
    }
  }
`;

export default function MLIntegration({ userProfile }) {
  const { recommendations, loading: recLoading, provideFeedback } = useMLRecommendations(userProfile);
  const { analysis, loading: analysisLoading, analyzeMeal } = useNutritionAnalysis();
  const [mealInput, setMealInput] = useState('');

  const handleFeedback = async (recommendation, liked) => {
    await provideFeedback(recommendation, { liked });
  };

  const handleAnalyzeMeal = async () => {
    if (!mealInput.trim()) return;

    // Parse simple meal input (in production, use NLP or structured input)
    const ingredients = mealInput.split(',').map(item => item.trim().toLowerCase().replace(/\s+/g, '_'));
    const portions = new Array(ingredients.length).fill(100); // Default 100g portions

    await analyzeMeal({ ingredients, portions });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--success)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--info)';
    }
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <MLContainer>
      <Section>
        <SectionTitle>
          <FaBrain />
          AI Meal Recommendations
        </SectionTitle>
        
        {recLoading ? (
          <Loading message="Analyzing your preferences..." />
        ) : (
          <RecommendationGrid>
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} priority={rec.priority}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaRobot style={{ color: getPriorityColor(rec.priority) }} />
                  {formatCategory(rec.category)}
                </h3>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Confidence: {(rec.confidence * 100).toFixed(1)}%
                </p>
                
                <ConfidenceBar>
                  <ConfidenceFill confidence={rec.confidence} />
                </ConfidenceBar>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  This recommendation is based on your dietary preferences, 
                  health goals, and meal history.
                </p>
                
                <FeedbackButtons>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleFeedback(rec, true)}
                  >
                    <FaThumbsUp /> Like
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleFeedback(rec, false)}
                  >
                    <FaThumbsDown /> Dislike
                  </Button>
                </FeedbackButtons>
              </RecommendationCard>
            ))}
          </RecommendationGrid>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <FaCalculator />
          Nutrition Analysis
        </SectionTitle>
        
        <AnalysisInput>
          <textarea
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            placeholder="Enter your meal ingredients (e.g., chicken breast, rice, broccoli, salmon, quinoa)"
          />
          <Button
            variant="primary"
            onClick={handleAnalyzeMeal}
            loading={analysisLoading}
            style={{ marginTop: '1rem' }}
          >
            Analyze Nutrition
          </Button>
        </AnalysisInput>
        
        {analysis && (
          <Card style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Nutritional Breakdown
            </h3>
            <NutritionGrid>
              <NutritionItem>
                <div className="value">{Math.round(analysis.calories)}</div>
                <div className="label">Calories</div>
              </NutritionItem>
              <NutritionItem>
                <div className="value">{Math.round(analysis.protein)}g</div>
                <div className="label">Protein</div>
              </NutritionItem>
              <NutritionItem>
                <div className="value">{Math.round(analysis.carbs)}g</div>
                <div className="label">Carbs</div>
              </NutritionItem>
              <NutritionItem>
                <div className="value">{Math.round(analysis.fat)}g</div>
                <div className="label">Fat</div>
              </NutritionItem>
              <NutritionItem>
                <div className="value">{Math.round(analysis.fiber)}g</div>
                <div className="label">Fiber</div>
              </NutritionItem>
            </NutritionGrid>
          </Card>
        )}
      </Section>
    </MLContainer>
  );
}
