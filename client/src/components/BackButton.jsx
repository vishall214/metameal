import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 1rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;

  &:hover {
    color: var(--primary);
    transform: translateX(-3px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <StyledButton onClick={() => navigate(-1)}>
      <FaArrowLeft />
      Back
    </StyledButton>
  );
};

export default BackButton; 