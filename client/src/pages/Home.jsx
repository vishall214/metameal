import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroSection = styled.section`
  min-height: 95vh;
  display: flex;
  align-items: center;
  background: linear-gradient(rgba(10, 41, 40, 0.9), rgba(10, 41, 40, 0.95)),
              url('/hero-bg.jpg') center/cover;
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.2) 0%, rgba(0, 77, 74, 0.1) 100%);
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const HeroContent = styled.div`
  max-width: 600px;
  
  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    margin-bottom: 1.5rem;
    line-height: 1.2;
    background: linear-gradient(to right, var(--text-light), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    line-height: 1.6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 'var(--primary)' : 'transparent'};
  color: ${props => props.primary ? 'var(--bg-dark)' : 'var(--text-light)'};
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => props.primary ? 'var(--primary)' : 'var(--primary-light)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.2);
    background: ${props => props.primary ? 'var(--primary-light)' : 'rgba(0, 181, 176, 0.1)'};
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background: var(--bg-dark);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
`;

const FeatureCard = styled.div`
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 181, 176, 0.2);
  
  &:hover {
    transform: translateY(-10px);
    background: var(--card-hover);
    border-color: var(--primary);
    box-shadow: 0 20px 40px rgba(0, 181, 176, 0.15);
  }
  
  h3 {
    color: var(--primary-light);
    margin-bottom: 1rem;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    opacity: 0.9;
    line-height: 1.6;
    color: var(--text-light);
  }
`;


const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(to right, var(--primary), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--text-light);
    opacity: 0.8;
    max-width: 600px;
    margin: 0 auto;
  }
`;

export default function Home() {
  const features = [
    {
      title: "AI-Powered Meal Planning",
      description: "Get personalized meal suggestions based on your preferences and nutritional needs."
    },
    {
      title: "Smart Recipe Search",
      description: "Find recipes that match your dietary restrictions and available ingredients."
    },
    {
      title: "Nutrition Tracking",
      description: "Monitor your daily nutrition intake with detailed analytics and insights."
    },
    {
      title: "Dietary Goals",
      description: "Set and track your dietary goals with our intelligent progress monitoring system."
    }
  ];

  return (
    <>
      <HeroSection>
        <Container>
          <HeroContent>
            <h1>Transform Your Nutrition Journey</h1>
            <p>
              MetaMeal uses artificial intelligence to create personalized meal plans
              that perfectly align with your health goals and dietary preferences.
            </p>
            <ButtonGroup>
              <Button to="/register" primary>Get Started</Button>
              <Button to="/about">Learn More</Button>
            </ButtonGroup>
          </HeroContent>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <SectionTitle>
            <h2>Why Choose MetaMeal?</h2>
            <p>
              Experience the future of nutrition planning with our AI-powered platform
            </p>
          </SectionTitle>
          
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </FeaturesSection>
    </>
  );
}