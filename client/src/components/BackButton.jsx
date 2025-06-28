import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 181, 176, 0.1);
  color: var(--primary);
  border: 1px solid rgba(0, 181, 176, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 100;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(0, 181, 176, 0.2);
    border-color: var(--primary);
    transform: translateX(-2px);
  }
  
  &:active {
    transform: translateX(0);
  }
  
  @media (max-width: 768px) {
    top: 1rem;
    left: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const BackButton = ({ to, children }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <StyledButton onClick={handleClick}>
      <FaArrowLeft />
      {children || 'Back'}
    </StyledButton>
  );
};

export default BackButton; 