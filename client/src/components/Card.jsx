import React from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);

  ${props => props.hoverable && `
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: var(--glass-shadow-hover);
      border-color: var(--primary);
      background: linear-gradient(135deg, rgba(10, 41, 40, 0.9) 0%, rgba(0, 77, 74, 0.8) 100%);
    }
  `}

  ${props => props.clickable && `
    cursor: pointer;
  `}
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 181, 176, 0.25);
  background: linear-gradient(135deg, rgba(0, 181, 176, 0.1) 0%, rgba(0, 181, 176, 0.05) 100%);
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
`;

const CardSubtitle = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--text-muted);
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 181, 176, 0.15);
  background: linear-gradient(135deg, transparent 0%, rgba(0, 181, 176, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const CardImage = styled.img`
  width: 100%;
  height: ${props => props.height || '200px'};
  object-fit: cover;
  transition: transform 0.4s ease;
  
  ${CardWrapper}:hover & {
    transform: scale(1.05);
  }
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