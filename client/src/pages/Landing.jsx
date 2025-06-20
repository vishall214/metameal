import React from 'react';
import styled, { keyframes } from 'styled-components';
import Button from '../components/Button';
import { FaUtensils, FaBrain, FaChartLine} from 'react-icons/fa';
import Navbar from '../components/navbar';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px);}
  to { opacity: 1; transform: translateY(0);}
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px);}
  to { opacity: 1; transform: translateX(0);}
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(rgba(10, 41, 40, 0.85), rgba(10, 41, 40, 0.95)),
    url('/hero-food.jpg') center/cover no-repeat;
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const HeroContent = styled.div`
  max-width: 650px;
  animation: ${fadeIn} 1s ease-out;

  h1 {
    font-size: clamp(3rem, 6vw, 4.5rem);
    font-weight: 800;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, var(--primary-light), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    color: var(--text-light);
    opacity: 0.9;
    line-height: 1.6;
    animation: ${slideIn} 1s ease-out 0.3s both;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  animation: ${fadeIn} 1s ease-out 0.6s both;
`;

const FeaturesSection = styled.section`
  padding: 8rem 2rem;
  background: var(--bg-dark);
  position: relative;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;

  h2 {
    font-size: 2.5rem;
    background: linear-gradient(to right, var(--primary-light), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  p {
    color: var(--text-light);
    opacity: 0.8;
    font-size: 1.1rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
`;

const FeatureCard = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.1);
  }

  h3 {
    color: var(--primary-light);
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: var(--primary);
    }
  }

  p {
    color: var(--text-light);
    opacity: 0.8;
    line-height: 1.6;
  }
`;

const features = [
  {
    icon: <FaUtensils />,
    title: "Smart Meal Planning",
    description: "Get personalized meal plans based on your preferences, dietary restrictions, and health goals."
  },
  {
    icon: <FaBrain />,
    title: "AI-Powered Recommendations",
    description: "Our AI analyzes your habits and preferences to suggest meals you'll love."
  },
  {
    icon: <FaChartLine />,
    title: "Progress Tracking",
    description: "Monitor your nutrition goals and track your progress with detailed analytics."
  }
];

const Landing = () => {
  return (
    <>
      <Navbar />
      <HeroSection>
        <Container>
          <HeroContent>
            <h1>Transform Your Nutrition Journey</h1>
            <p>
              Experience the power of AI-driven meal planning that adapts to your lifestyle.
              Get personalized recommendations, track your progress, and achieve your health goals.
            </p>
            <ButtonGroup>
              <Button to="/register" variant="primary">Get Started</Button>
              <Button to="/login" variant="secondary">Login</Button>
              <Button to="/about" variant="outline">Learn More</Button>
            </ButtonGroup>
          </HeroContent>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <SectionTitle>
            <h2>Why Choose MetaMeal?</h2>
            <p>Discover how our intelligent system can transform your nutrition journey</p>
          </SectionTitle>
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <h3>{feature.icon} {feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </FeaturesSection>
    </>
  );
};

export default Landing;