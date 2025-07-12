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
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-light);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  backdrop-filter: var(--glass-backdrop);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  ${props => props.size === 'sm' && css`
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 8px;
  `}
  
  ${props => props.size === 'lg' && css`
    padding: 1rem 1.25rem;
    font-size: 1.125rem;
    border-radius: 16px;
  `}
  
  ${props => props.hasIcon && css`
    padding-left: 2.5rem;
  `}
  
  &::placeholder {
    color: var(--text-muted);
    opacity: 0.8;
    transition: all 0.3s ease;
  }
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${props => props.error ? '#ff6b6b' : 'rgba(0, 181, 176, 0.6)'};
    box-shadow: 0 4px 12px rgba(0, 181, 176, 0.1);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    border-color: ${props => props.error ? '#ff6b6b' : 'var(--primary)'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(255, 107, 107, 0.15)' : 'rgba(0, 181, 176, 0.15)'};
    transform: translateY(-1px);
    
    &::placeholder {
      opacity: 0.6;
      transform: translateX(4px);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
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