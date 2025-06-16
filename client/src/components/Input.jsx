import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: var(--text-light);
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${props => props.theme.fontSizes.md};
  color: var(--text-light);
  background-color: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: ${props => props.theme.radii.base};
  transition: all ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing['ease-in-out']};

  &:hover {
    border-color: var(--primary-light);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0, 181, 176, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--text-muted);
  }

  ${props => props.error && `
    border-color: var(--error);
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
    }
  `}
`;

const ErrorMessage = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: var(--error);
`;

const HelperText = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: var(--text-muted);
`;

const Input = ({
  label,
  error,
  helperText,
  fullWidth = false,
  ...props
}) => {
  return (
    <InputWrapper fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <StyledInput
        error={error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
};

export default Input; 