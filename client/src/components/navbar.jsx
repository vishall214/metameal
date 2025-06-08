import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background: rgba(0, 41, 40, 0.95);
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 181, 176, 0.1);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: var(--primary);
  font-size: 1.8rem;
  font-weight: bold;
  text-decoration: none;
  
  &:hover {
    color: var(--primary-light);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--primary-light);
    background: rgba(0, 181, 176, 0.1);
  }
`;

const ActionButton = styled(Link)`
  color: ${props => props.primary ? 'var(--bg-dark)' : 'var(--text-light)'};
  background: ${props => props.primary ? 'var(--primary)' : 'transparent'};
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  border: 2px solid ${props => props.primary ? 'var(--primary)' : 'var(--primary-light)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary ? 'var(--primary-light)' : 'rgba(0, 181, 176, 0.1)'};
    border-color: var(--primary-light);
  }
`;

export default function Navbar() {
  return (
    <Nav>
      <NavContainer>
        <Logo to="/">MetaMeal</Logo>
        <NavLinks>
          <NavLink to="/contact">Contact Us</NavLink>
          <ActionButton to="/login">Sign In</ActionButton>
          <ActionButton to="/register" primary>Sign Up</ActionButton>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}