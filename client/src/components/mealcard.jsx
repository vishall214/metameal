import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: rgba(0, 120, 108, 0.1);
  border-radius: 16px;
  overflow: hidden;
  width: 300px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Title = styled.h3`
  color: var(--primary);
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--text-light);
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
`;

const Stat = styled.div`
  text-align: center;
  
  b {
    color: var(--primary);
    display: block;
  }
  
  span {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

export default function MealCard({ meal }) {
  return (
    <Card>
      <Image src={meal.photo} alt={meal.name} />
      <Content>
        <Title>{meal.name}</Title>
        <Description>{meal.description}</Description>
        <Stats>
          <Stat>
            <b>{meal.calories}</b>
            <span>calories</span>
          </Stat>
          <Stat>
            <b>{meal.protein}g</b>
            <span>protein</span>
          </Stat>
          <Stat>
            <b>{meal.cookingTime}m</b>
            <span>time</span>
          </Stat>
        </Stats>
      </Content>
    </Card>
  );
}