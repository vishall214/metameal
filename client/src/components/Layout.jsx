
import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bg-dark);
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props =>
    props.isPublic || props.noMargin
      ? '0'
      : props.customMargin || '250px'};
  min-height: 100vh;
  background: var(--bg-dark);
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const PublicContent = styled.main`
  width: 100%;
  min-height: 100vh;
  background: var(--bg-dark);
`;

export default function Layout({ children, isPublic = false, noMargin = false, customMargin }) {
  if (isPublic) {
    return (
      <PublicContent>
        {children}
      </PublicContent>
    );
  }

  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent noMargin={noMargin} customMargin={customMargin}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
}
