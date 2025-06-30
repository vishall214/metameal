import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';

const NavbarContainer = styled.nav`
  background: var(--bg-dark);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-light);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary);
  }
`;

const AuthButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.primary ? 'var(--primary)' : 'transparent'};
  color: ${props => props.primary ? 'var(--bg-dark)' : 'var(--text-light)'};
  border: 1px solid ${props => props.primary ? 'var(--primary)' : 'var(--border)'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.primary ? 'var(--primary-light)' : 'rgba(0, 181, 176, 0.1)'};
    transform: translateY(-2px);
  }
`;

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">MetaMeal</Logo>
        <NavLinks>
          {user ? (
            <>
              <NavLink to="/meal-plan">Meal Plan</NavLink>
              <NavLink to="/recommendations">Recommendations</NavLink>
              <NavLink to="/quiz">Quiz</NavLink>
              {/* No Logout or Sign Up button for authenticated users */}
            </>
          ) : (
            <>
              <NavLink to="/about">About Us</NavLink>
              <AuthButton onClick={() => navigate('/login')}>
                Sign In
              </AuthButton>
              <AuthButton primary onClick={() => navigate('/register')}>
                <FaUser /> Sign Up
              </AuthButton>
            </>
          )}
        </NavLinks>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;