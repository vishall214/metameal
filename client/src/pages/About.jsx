import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaLeaf, FaBrain, FaChartLine, FaUsers } from 'react-icons/fa';
import BackButton from '../components/BackButton';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: var(--text-light);
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
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

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--primary);
  color: var(--bg-dark);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.2);
  }
`;

const features = [
  {
    icon: <FaLeaf />,
    title: "Swasth Bharat Living",
    description: "Our platform helps you make informed decisions about your nutrition using traditional Indian knowledge combined with modern science."
  },
  {
    icon: <FaBrain />,
    title: "AI-Powered Desi Nutrition",
    description: "Advanced algorithms analyze your preferences, regional tastes, and health goals to create personalized Indian meal plans."
  },
  {
    icon: <FaChartLine />,
    title: "Track Your Wellness Journey",
    description: "Monitor your nutrition progress with detailed analytics focused on Indian dietary patterns and seasonal eating habits."
  },
  {
    icon: <FaUsers />,
    title: "Indian Health Community",
    description: "Connect with others following traditional Indian nutrition practices and share recipes, tips, and experiences."
  }
];

export default function About() {
  return (
    <PageContainer>
      <BackButton />
      <HeroSection>
        <Title>About MetaMeal</Title>
        <Subtitle>
          MetaMeal is your personal nutrition companion rooted in Indian culinary wisdom, powered by artificial intelligence 
          to help you achieve your swasthya (health) and wellness goals through personalized desi meal planning 
          and expert guidance from Indian nutrition specialists.
        </Subtitle>
        <CTAButton to="/register">Get Started</CTAButton>
      </HeroSection>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <h3>
              {feature.icon}
              {feature.title}
            </h3>
            <p>{feature.description}</p>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </PageContainer>
  );
} 