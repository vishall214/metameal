import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bg-dark);
  flex-direction: ${props => props.isPublic ? 'column' : 'row'};
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.isPublic ? '0' : '250px'}; // Width of sidebar
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-dark);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Layout = ({ children, isPublic }) => {
  const { user } = useAuth();

  return (
    <LayoutContainer isPublic={isPublic}>
      {isPublic ? <Navbar /> : <Sidebar />}
      <MainContent isPublic={isPublic}>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 