import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const StyledButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => {
    if (props.variant === 'primary') return 'var(--primary)';
    if (props.variant === 'secondary') return 'var(--secondary)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'secondary') return 'var(--bg-dark)';
    return 'var(--text-light)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'primary') return 'var(--primary)';
    if (props.variant === 'secondary') return 'var(--secondary)';
    return 'var(--primary)';
  }};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.1);
    background: ${props => {
      if (props.variant === 'primary') return 'var(--primary-light)';
      if (props.variant === 'secondary') return 'var(--secondary-light)';
      return 'rgba(0, 181, 176, 0.1)';
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Button = ({ children, to, variant = 'primary', ...props }) => {
  if (to) {
    return (
      <StyledButton as={Link} to={to} variant={variant} {...props}>
        {children}
      </StyledButton>
    );
  }

  return (
    <StyledButton variant={variant} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button; 