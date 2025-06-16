import React from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  background-color: var(--bg-light);
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.base};
  overflow: hidden;
  transition: transform ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing['ease-in-out']},
              box-shadow ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing['ease-in-out']};

  ${props => props.hoverable && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}

  ${props => props.clickable && `
    cursor: pointer;
  `}
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: var(--text-light);
`;

const CardSubtitle = styled.p`
  margin: 0.5rem 0 0;
  font-size: ${props => props.theme.fontSizes.sm};
  color: var(--text-muted);
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const CardImage = styled.img`
  width: 100%;
  height: ${props => props.height || '200px'};
  object-fit: cover;
`;

const Card = ({
  title,
  subtitle,
  image,
  imageHeight,
  hoverable = false,
  clickable = false,
  footer,
  children,
  ...props
}) => {
  return (
    <CardWrapper
      hoverable={hoverable}
      clickable={clickable}
      {...props}
    >
      {image && (
        <CardImage
          src={image}
          alt={title}
          height={imageHeight}
        />
      )}
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </CardWrapper>
  );
};

export default Card; 