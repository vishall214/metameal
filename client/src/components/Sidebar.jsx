import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUtensils, 
  FaChartBar, 
  FaInfoCircle,
  FaQuestionCircle,
  FaComments,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SidebarContainer = styled.aside`
  width: 250px;
  background: var(--bg-dark);
  border-right: 1px solid var(--border);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const NavContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Logo = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  text-align: center;
`;

const ProfileSection = styled(NavLink)`
  padding: 0.75rem;
  margin: 0 1rem 0.75rem;
  background: rgba(0, 181, 176, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 181, 176, 0.15);
  }
`;

const ProfileAvatar = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-dark);
  font-size: 1rem;
`;

const ProfileName = styled.div`
  color: var(--text-light);
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NavGroup = styled.div`
  margin-bottom: 0.75rem;

  &:not(:first-child) {
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.5rem;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.2s;

  svg {
    font-size: 1.1rem;
    color: var(--primary);
  }

  &:hover {
    background: rgba(0, 181, 176, 0.1);
    color: var(--primary);
  }

  &.active {
    background: var(--primary);
    color: var(--bg-dark);

    svg {
      color: var(--bg-dark);
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.75rem;
  width: 100%;
  text-align: left;

  svg {
    font-size: 1.1rem;
    color: var(--primary);
  }

  &:hover {
    background: rgba(255, 59, 48, 0.1);
    color: var(--error);

    svg {
      color: var(--error);
    }
  }
`;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarContainer>
      <Logo>MetaMeal</Logo>
      
      <NavContent>
        <ProfileSection to="/profile">
          <ProfileAvatar>
            <FaUser />
          </ProfileAvatar>
          <ProfileName>{user?.name || 'User'}</ProfileName>
        </ProfileSection>

        <NavGroup>
          <StyledNavLink to="/home" end>
            <FaHome /> Dashboard
          </StyledNavLink>
          <StyledNavLink to="/meal-plan">
            <FaUtensils /> Meal Plan
          </StyledNavLink>
          <StyledNavLink to="/analytics">
            <FaChartBar /> Analytics
          </StyledNavLink>
        </NavGroup>

        <NavGroup>
          <StyledNavLink to="/nutrition-info">
            <FaInfoCircle /> Nutrition Info
          </StyledNavLink>
          {/* Only show Quiz link if quiz not completed, else show Retake Quiz button */}
          {!user?.quizCompleted ? (
            <StyledNavLink to="/quiz">
              <FaQuestionCircle /> Quiz
            </StyledNavLink>
          ) : (
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1.5rem',
                font: 'inherit',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s',
                marginBottom: '0.2rem',
                fontSize: '1rem',
                borderRadius: '8px',
                outline: 'none',
              }}
              onClick={() => navigate('/quiz')}
            >
              <FaQuestionCircle /> Retake Quiz
            </button>
          )}
          <StyledNavLink to="/consultation">
            <FaComments /> Consultation
          </StyledNavLink>
        </NavGroup>


      </NavContent>

      <LogoutButton onClick={logout}>
        <FaSignOutAlt />
        Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;