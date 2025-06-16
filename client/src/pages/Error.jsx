import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 2rem;
`;

const Button = styled(Link)`
  background: var(--primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const Error = () => {
  return (
    <Container>
      <Title>404</Title>
      <Message>Oops! The page you're looking for doesn't exist.</Message>
      <Button to="/">Go Back Home</Button>
    </Container>
  );
};

export default Error; 