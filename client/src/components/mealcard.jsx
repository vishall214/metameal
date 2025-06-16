import React from 'react';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaClock, FaUtensils } from 'react-icons/fa';

const Card = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 20px 40px rgba(0, 181, 176, 0.15);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  color: var(--text-light);
  margin: 0;
  font-size: 1.25rem;
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.isFavorite ? 'var(--primary)' : 'var(--text-light)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;

  &:hover {
    transform: scale(1.1);
  }
`;

const Description = styled.p`
  color: var(--text-light);
  opacity: 0.8;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  opacity: 0.8;
  font-size: 0.9rem;

  svg {
    color: var(--primary);
  }
`;

const MealCard = ({
  image,
  title,
  description,
  prepTime,
  servings,
  isFavorite,
  onFavoriteClick
}) => {
  return (
    <Card>
      <CardImage src={image} alt={title} />
      <CardContent>
        <CardHeader>
          <Title>{title}</Title>
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={onFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </FavoriteButton>
        </CardHeader>
        <Description>{description}</Description>
        <Stats>
          <Stat>
            <FaClock />
            <span>{prepTime} mins</span>
          </Stat>
          <Stat>
            <FaUtensils />
            <span>{servings}</span>
          </Stat>
        </Stats>
      </CardContent>
    </Card>
  );
};

export default MealCard;
