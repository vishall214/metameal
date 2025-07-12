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
  FaUser,
  FaLightbulb,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SidebarContainer = styled.aside`
  width: 250px;
  background: linear-gradient(135deg, rgba(8, 35, 34, 0.98) 0%, rgba(0, 65, 62, 0.95) 100%);
  border-right: 1px solid rgba(0, 181, 176, 0.3);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(25px);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
`;

const NavContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 1rem;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const Logo = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-light);
  text-align: center;
  background: linear-gradient(135deg, var(--primary) 0%, #00d4aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ProfileSection = styled(NavLink)`
  padding: 0.75rem;
  margin: 0 1rem 1rem;
  background: linear-gradient(135deg, rgba(0, 181, 176, 0.25), rgba(0, 181, 176, 0.15));
  border-radius: 16px;
  border: 1px solid rgba(0, 181, 176, 0.4);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 181, 176, 0.15);

  &:hover {
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.35), rgba(0, 181, 176, 0.25));
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 181, 176, 0.25);
  }
`;

const ProfileAvatar = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, #00d4aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-dark);
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 181, 176, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const ProfileName = styled.div`
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NavGroup = styled.div`
  margin-bottom: 0.75rem;

  &:not(:first-child) {
    position: relative;
    padding-top: 0.75rem;
    margin-top: 0.75rem;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 1rem;
      right: 1rem;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 181, 176, 0.2) 10%,
        rgba(0, 181, 176, 0.7) 50%,
        rgba(0, 181, 176, 0.2) 90%,
        transparent 100%
      );
      box-shadow: 0 1px 3px rgba(0, 181, 176, 0.3);
    }
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0.1rem 1rem;
  border-radius: 10px;
  position: relative;
  font-weight: 500;
  font-size: 0.9rem;

  svg {
    font-size: 1rem;
    color: var(--primary);
    min-width: 16px;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.18), rgba(0, 181, 176, 0.12));
    color: var(--primary);
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 181, 176, 0.2);
  }

  &.active {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 181, 176, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);

    svg {
      color: white;
    }
  }
`;

const RetakeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  font-size: 0.9rem;
  margin: 0.1rem 1rem;
  border-radius: 10px;
  font-weight: 500;

  svg {
    font-size: 1rem;
    color: var(--primary);
    min-width: 16px;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.18), rgba(0, 181, 176, 0.12));
    color: var(--primary);
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 181, 176, 0.2);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(255, 59, 48, 0.12));
  border: 1px solid rgba(255, 59, 48, 0.4);
  border-radius: 12px;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem;
  width: calc(100% - 2rem);
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: auto;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(255, 59, 48, 0.15);

  svg {
    font-size: 1rem;
    color: #ff6b6b;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.3), rgba(255, 59, 48, 0.2));
    color: #ff6b6b;
    border-color: #ff6b6b;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.3);

    svg {
      color: #ff6b6b;
    }
  }
`;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Common menu items for all users (authenticated or not)
  const commonMenuItems = [
    { to: '/library', icon: <FaUtensils />, label: 'Library' },
    { to: '/food-explorer', icon: <FaMapMarkerAlt />, label: 'Food Explorer' },
    { to: '/about', icon: <FaInfoCircle />, label: 'About' },
  ];

  return (
    <SidebarContainer>
      <Logo>MetaMeal</Logo>
      
      <NavContent>
        {user ? (
          // User is authenticated - show profile and full menu
          <>
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
              <StyledNavLink to="/food-explorer">
                <FaMapMarkerAlt /> Food Explorer
              </StyledNavLink>
              <StyledNavLink to="/library">
                <FaUtensils /> Library
              </StyledNavLink>
              <StyledNavLink to="/recommendations">
                <FaLightbulb /> Workout Recommendations
              </StyledNavLink>
              <StyledNavLink to="/analytics">
                <FaChartBar /> Analytics
              </StyledNavLink>
            </NavGroup>

            <NavGroup>
              <StyledNavLink to="/nutrition-info">
                <FaInfoCircle /> Nutrition Info
              </StyledNavLink>
              {!user?.quizCompleted ? (
                <StyledNavLink to="/quiz">
                  <FaQuestionCircle /> Quiz
                </StyledNavLink>
              ) : (
                <RetakeButton onClick={() => navigate('/quiz')}>
                  <FaQuestionCircle /> Retake Quiz
                </RetakeButton>
              )}
              <StyledNavLink to="/consultation">
                <FaComments /> Consultation
              </StyledNavLink>
            </NavGroup>
          </>
        ) : (
          // User is not authenticated - show limited options and login/register links
          <>
            <ProfileSection to="/login">
              <ProfileAvatar>
                <FaUser />
              </ProfileAvatar>
              <ProfileName>Guest User</ProfileName>
            </ProfileSection>

            <NavGroup>
              <StyledNavLink to="/food-explorer">
                <FaMapMarkerAlt /> Food Explorer
              </StyledNavLink>
              <StyledNavLink to="/library">
                <FaUtensils /> Library
              </StyledNavLink>
              <StyledNavLink to="/about">
                <FaInfoCircle /> About
              </StyledNavLink>
            </NavGroup>

            <NavGroup>
              <StyledNavLink to="/login">
                <FaUser /> Login
              </StyledNavLink>
              <StyledNavLink to="/register">
                <FaUser /> Register
              </StyledNavLink>
            </NavGroup>
          </>
        )}
      </NavContent>

      {user && (
        <LogoutButton onClick={logout}>
          <FaSignOutAlt /> Logout
        </LogoutButton>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;