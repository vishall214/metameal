import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const getButtonStyles = (variant, size) => css`
  /* Base Styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 600;
  text-decoration: none;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  overflow: hidden;
  user-select: none;
  
  /* Size Variants */
  ${size === 'sm' && css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: var(--radius-sm);
  `}
  
  ${size === 'md' && css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `}
  
  ${size === 'lg' && css`
    padding: 1rem 2rem;
    font-size: 1.125rem;
    border-radius: var(--radius-md);
  `}
  
  /* Primary Variant */
  ${variant === 'primary' && css`
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    border: 1px solid rgba(0, 181, 176, 0.4);
    box-shadow: 0 8px 24px rgba(0, 181, 176, 0.25);
    
    &:hover:not(:disabled) {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 16px 40px rgba(0, 181, 176, 0.4);
      border-color: var(--primary);
    }
    
    &:active:not(:disabled) {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 8px 25px rgba(0, 181, 176, 0.3);
    }
  `}
  
  /* Secondary Variant */
  ${variant === 'secondary' && css`
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.2) 0%, rgba(0, 181, 176, 0.1) 100%);
    color: var(--text-light);
    border: 1px solid rgba(0, 181, 176, 0.4);
    backdrop-filter: var(--glass-backdrop);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(0, 181, 176, 0.3) 0%, rgba(0, 181, 176, 0.2) 100%);
      border-color: var(--primary);
      transform: translateY(-3px);
      box-shadow: 0 12px 25px rgba(0, 181, 176, 0.25);
    }
    
    &:active:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 181, 176, 0.2);
    }
  `}
  
  /* Outline Variant */
  ${variant === 'outline' && css`
    background: var(--card-bg);
    color: var(--primary);
    border: 1px solid rgba(0, 181, 176, 0.4);
    backdrop-filter: var(--glass-backdrop);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(0, 181, 176, 0.15) 0%, rgba(0, 181, 176, 0.1) 100%);
      border-color: var(--primary);
      color: var(--primary);
      transform: translateY(-3px);
      box-shadow: 0 12px 25px rgba(0, 181, 176, 0.2);
    }
    
    &:active:not(:disabled) {
      transform: translateY(-1px);
      background: rgba(0, 181, 176, 0.25);
    }
  `}
  
  /* Ghost Variant */
  ${variant === 'ghost' && css`
    background: transparent;
    color: var(--text-secondary);
    border: none;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.1);
    }
  `}
  
  /* Glass Variant */
  ${variant === 'glass' && css`
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.15);
    }
  `}
  
  /* Focus Styles */
  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  /* Disabled Styles */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    filter: none !important;
  }
  
  /* Loading State */
  ${props => props.loading && css`
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      margin: auto;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 1s ease infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
  
  /* Ripple Effect */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active:not(:disabled)::before {
    width: 300px;
    height: 300px;
    animation: ${ripple} 0.6s ease-out;
  }
`;

const StyledButton = styled.button`
  ${props => getButtonStyles(props.variant, props.size)}
`;

const StyledLink = styled(Link)`
  ${props => getButtonStyles(props.variant, props.size)}
`;

const Button = ({ 
  children, 
  to, 
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  ...props 
}) => {
  const content = (
    <>
      {icon && !loading && <span>{icon}</span>}
      {!loading && children}
    </>
  );

  if (to) {
    return (
      <StyledLink 
        to={to} 
        variant={variant} 
        size={size}
        loading={loading}
        {...props}
      >
        {content}
      </StyledLink>
    );
  }

  return (
    <StyledButton 
      variant={variant} 
      size={size}
      loading={loading}
      {...props}
    >
      {content}
    </StyledButton>
  );
};

export default Button; 