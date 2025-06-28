
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
  margin-left: ${props => props.isPublic ? '0' : '250px'};
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

export default function Layout({ children, isPublic = false }) {
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
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
}
