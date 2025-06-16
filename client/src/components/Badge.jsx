import React from 'react';
import styled from 'styled-components';

const BadgeWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  line-height: 1;
  border-radius: ${props => props.theme.radii.full};
  white-space: nowrap;
  transition: all ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing['ease-in-out']};

  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--success);
        `;
      case 'error':
        return `
          background-color: rgba(244, 67, 54, 0.1);
          color: var(--error);
        `;
      case 'warning':
        return `
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning);
        `;
      case 'info':
        return `
          background-color: rgba(33, 150, 243, 0.1);
          color: var(--info);
        `;
      case 'primary':
        return `
          background-color: rgba(0, 181, 176, 0.1);
          color: var(--primary);
        `;
      case 'secondary':
        return `
          background-color: rgba(255, 107, 107, 0.1);
          color: var(--secondary);
        `;
      default:
        return `
          background-color: var(--bg-lighter);
          color: var(--text-light);
        `;
    }
  }}

  ${props => props.size === 'sm' && `
    padding: 0.125rem 0.5rem;
    font-size: ${props.theme.fontSizes.xs};
  `}

  ${props => props.size === 'lg' && `
    padding: 0.375rem 1rem;
    font-size: ${props.theme.fontSizes.md};
  `}

  ${props => props.outlined && `
    background-color: transparent;
    border: 1px solid currentColor;
  `}

  ${props => props.rounded && `
    border-radius: ${props.theme.radii.base};
  `}

  ${props => props.dot && `
    width: 8px;
    height: 8px;
    padding: 0;
    border-radius: 50%;
  `}
`;

const Badge = ({
  variant = 'default',
  size = 'md',
  outlined = false,
  rounded = false,
  dot = false,
  children,
  ...props
}) => {
  return (
    <BadgeWrapper
      variant={variant}
      size={size}
      outlined={outlined}
      rounded={rounded}
      dot={dot}
      {...props}
    >
      {children}
    </BadgeWrapper>
  );
};

export default Badge; 