import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1;
`;

const Title = styled.h2`
  color: var(--text-light);
  font-size: 2rem;
  margin: 1rem 0 2rem;
`;

const Message = styled.p`
  color: var(--text-light);
  opacity: 0.8;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  max-width: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled(Link)`
  padding: 0.75rem 1.5rem;
  background: ${props => props.secondary ? 'transparent' : 'var(--primary)'};
  color: ${props => props.secondary ? 'var(--text-light)' : 'var(--bg-dark)'};
  border: 1px solid ${props => props.secondary ? 'var(--primary)' : 'none'};
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.secondary ? 'rgba(0, 181, 176, 0.1)' : 'var(--primary-light)'};
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.2);
  }
`;

export default function NotFound() {
  return (
    <PageContainer>
      <ErrorCode>404</ErrorCode>
      <Title>Page Not Found</Title>
      <Message>
        Oops! The page you're looking for seems to has vanished into thin air.
        Don't worry, we'll help you find your way back.
      </Message>
      <ButtonGroup>
        <Button to="/">
          <FaHome /> Back to Home
        </Button>
        <Button secondary to="/meal-plan">
          <FaSearch /> Browse Meal Plans
        </Button>
      </ButtonGroup>
    </PageContainer>
  );
} 