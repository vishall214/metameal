import React, { useState, forwardRef } from 'react';
import styled, { css } from 'styled-components';

const InputWrapper = styled.div`
  position: relative;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const StyledInput = styled.input`
  width: 100%;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
  background: ${props => props.variant === 'glass' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${props => props.error ? 'var(--error)' : 'var(--border-light)'};
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  transition: all var(--transition);
  backdrop-filter: ${props => props.variant === 'glass' ? 'blur(20px)' : 'blur(10px)'};
  
  ${props => props.size === 'sm' && css`
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border-radius: var(--radius-sm);
  `}
  
  ${props => props.size === 'lg' && css`
    padding: 1rem 1.25rem;
    font-size: 1.125rem;
    border-radius: var(--radius-md);
  `}
  
  ${props => props.hasIcon && css`
    padding-left: 2.5rem;
  `}
  
  &::placeholder {
    color: var(--text-muted);
    opacity: 1;
    transition: all var(--transition);
  }
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${props => props.error ? 'var(--error)' : 'var(--border-primary)'};
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-color: ${props => props.error ? 'var(--error)' : 'var(--primary)'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 181, 176, 0.1)'};
    
    &::placeholder {
      opacity: 0.7;
      transform: translateX(4px);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.02);
    border-color: var(--border-light);
  }
  
  /* Floating Label Animation */
  ${props => props.hasFloatingLabel && css`
    padding-top: 1.5rem;
    padding-bottom: 0.5rem;
    
    &:focus + label,
    &:not(:placeholder-shown) + label {
      transform: translateY(-0.75rem) scale(0.85);
      color: var(--primary);
    }
  `}
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  transition: all var(--transition);
  z-index: 1;
  pointer-events: none;
  
  ${props => props.inputFocused && css`
    color: var(--primary);
  `}
  
  ${props => props.error && css`
    color: var(--error);
  `}
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 400;
  transition: all var(--transition);
  pointer-events: none;
  background: linear-gradient(to bottom, transparent 0%, transparent 40%, var(--bg-dark) 40%, var(--bg-dark) 60%, transparent 60%);
  padding: 0 0.25rem;
  z-index: 2;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.span`
  display: block;
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
  margin-left: 0.25rem;
  animation: slideIn 0.2s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HelperText = styled.span`
  display: block;
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-left: 0.25rem;
`;

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  variant = 'default',
  size = 'md',
  floatingLabel = false,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState();
  
  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div>
      {!floatingLabel && label && <Label htmlFor={props.id}>{label}</Label>}
      
      <InputWrapper fullWidth={fullWidth} className={className}>
        {icon && (
          <IconWrapper inputFocused={isFocused} error={error}>
            {icon}
          </IconWrapper>
        )}
        
        <StyledInput
          ref={ref}
          variant={variant}
          size={size}
          error={error}
          hasIcon={!!icon}
          hasFloatingLabel={floatingLabel}
          placeholder={floatingLabel ? ' ' : props.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {floatingLabel && label && (
          <FloatingLabel htmlFor={props.id}>
            {label}
          </FloatingLabel>
        )}
      </InputWrapper>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 