import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';
import { FaWeight, FaHeartbeat, FaChartLine, FaAppleAlt, FaClock, FaUser } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const RecommendationsContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-gradient);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-muted);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const UserProfileCard = styled(Card)`
  animation: ${slideIn} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  h3 {
    color: var(--text-primary);
    margin: 0;
    font-size: 1.3rem;
  }
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  background: var(--glass-light);
  padding: 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  
  .label {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .value {
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const RecommendationsCard = styled(Card)`
  animation: ${slideIn} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const PlanHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h3 {
    color: var(--text-primary);
    margin: 0;
    font-size: 1.3rem;
  }
`;

const CategoryBadge = styled.span`
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const MacrosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MacroCard = styled.div`
  background: var(--glass-light);
  padding: 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  text-align: center;
  
  .icon {
    font-size: 1.5rem;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .value {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const WorkoutsList = styled.div`
  margin-bottom: 2rem;
  
  h4 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const WorkoutItem = styled.div`
  background: var(--glass-light);
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  transition: all var(--transition);
  
  &:hover {
    background: var(--glass);
    border-color: var(--primary-light);
    transform: translateX(5px);
  }
`;

const TipsList = styled.div`
  h4 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TipItem = styled.div`
  background: var(--success-light);
  color: var(--success-dark);
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--success);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  background: var(--error-light);
  border: 1px solid var(--error);
  border-radius: var(--radius);
  color: var(--error-dark);
  margin: 2rem auto;
  max-width: 500px;
`;

export default function Recommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in and has an ID
      if (!user || !user.id) {
        throw new Error('Please log in to get personalized recommendations');
      }

      // Send user ID to get recommendations based on MongoDB profile
      const requestData = {
        user_id: user.id
      };

      const response = await fetch('http://localhost:5002/api/ml/predict-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get workout recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
      toast.success('Workout recommendations generated successfully!');

    } catch (err) {
      console.error('Error generating workout recommendations:', err);
      setError(err.message);
      toast.error('Failed to generate workout recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate recommendations if user is logged in
    if (user && user.id) {
      generateRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <RecommendationsContainer>
        <BackButton />
        <LoadingContainer>
          <Loading size="lg" />
          <h3>Generating your personalized workout recommendations...</h3>
          <p>This may take a few moments</p>
        </LoadingContainer>
      </RecommendationsContainer>
    );
  }

  if (error) {
    return (
      <RecommendationsContainer>
        <BackButton />
        <ErrorContainer>
          <h3>⚠️ Unable to Generate Recommendations</h3>
          <p>{error}</p>
          <Button 
            onClick={generateRecommendations}
            variant="primary"
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </Button>
        </ErrorContainer>
      </RecommendationsContainer>
    );
  }

  return (
    <RecommendationsContainer>
      <BackButton />
      
      <Header>
        <Title>AI Workout Recommendations</Title>
        <Subtitle>
          Personalized workout plans and fitness guidance powered by machine learning
        </Subtitle>
      </Header>

      {!recommendations ? (
        <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <Card>
            <h3>Get Your Personalized Workout Recommendations</h3>
            <p>Our AI will analyze your profile and generate customized workout recommendations.</p>
            <Button 
              onClick={generateRecommendations}
              variant="primary"
              size="lg"
              style={{ marginTop: '1rem' }}
            >
              Generate Recommendations
            </Button>
          </Card>
        </div>
      ) : (
        <ContentGrid>
          <UserProfileCard>
            <ProfileHeader>
              <FaUser style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
              <h3>Your Profile</h3>
            </ProfileHeader>
            
            <ProfileStats>
              <StatItem>
                <div className="label">Weight</div>
                <div className="value">{recommendations.user_data.weight} kg</div>
              </StatItem>
              <StatItem>
                <div className="label">Height</div>
                <div className="value">{recommendations.user_data.height} m</div>
              </StatItem>
              <StatItem>
                <div className="label">BMI</div>
                <div className="value">{recommendations.user_data.bmi}</div>
              </StatItem>
              <StatItem>
                <div className="label">Category</div>
                <div className="value">{recommendations.user_data.bmi_category}</div>
              </StatItem>
            </ProfileStats>

            <div style={{ background: 'var(--glass-light)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <div className="label" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Daily Calorie Target
              </div>
              <div className="value" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700' }}>
                {recommendations.user_data.daily_calories} kcal
              </div>
            </div>
          </UserProfileCard>

          <RecommendationsCard>
            <PlanHeader>
              <h3>Workout Plan</h3>
              <CategoryBadge>{recommendations.workout_plan.category}</CategoryBadge>
            </PlanHeader>

            <MacrosGrid>
              <MacroCard>
                <div className="icon"><FaHeartbeat /></div>
                <div className="label">Intensity</div>
                <div className="value">{recommendations.workout_plan.intensity}</div>
              </MacroCard>
              <MacroCard>
                <div className="icon"><FaClock /></div>
                <div className="label">Frequency</div>
                <div className="value">{recommendations.workout_plan.frequency}</div>
              </MacroCard>
              <MacroCard>
                <div className="icon"><FaChartLine /></div>
                <div className="label">Focus</div>
                <div className="value">{recommendations.workout_plan.focus}</div>
              </MacroCard>
              <MacroCard>
                <div className="icon"><FaWeight /></div>
                <div className="label">Plan ID</div>
                <div className="value">#{recommendations.exercise_plan_id}</div>
              </MacroCard>
            </MacrosGrid>

            <WorkoutsList>
              <h4><FaHeartbeat /> Recommended Workouts</h4>
              {recommendations.workout_plan.workouts.map((workout, index) => (
                <WorkoutItem key={index}>{workout}</WorkoutItem>
              ))}
            </WorkoutsList>

            <TipsList>
              <h4><FaAppleAlt /> Workout Tips</h4>
              {recommendations.workout_plan.tips.map((tip, index) => (
                <TipItem key={index}>{tip}</TipItem>
              ))}
            </TipsList>

            <ActionButtons>
              <Button 
                onClick={generateRecommendations}
                variant="outline"
              >
                Refresh Recommendations
              </Button>
              <Button 
                onClick={() => toast.info('Workout tracking feature coming soon!')}
                variant="primary"
              >
                Start Workout Plan
              </Button>
            </ActionButtons>
          </RecommendationsCard>
        </ContentGrid>
      )}
    </RecommendationsContainer>
  );
}
