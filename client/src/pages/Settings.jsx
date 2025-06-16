import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBell, FaLock, FaPalette, FaShieldAlt } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const SettingsCard = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 20px 40px rgba(0, 181, 176, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  h3 {
    color: var(--primary-light);
    margin: 0;
  }

  svg {
    color: var(--primary);
    font-size: 1.5rem;
  }
`;

const SettingItem = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  span {
    color: var(--text-light);
    font-weight: 500;
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 181, 176, 0.2);
    transition: .4s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: var(--primary);
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 181, 176, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0, 181, 176, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: var(--bg-dark);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.2);
  }
`;

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    language: 'en',
    twoFactorAuth: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleLanguageChange = (e) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };

  return (
    <PageContainer>
      <Title>Settings</Title>

      <SettingsGrid>
        <SettingsCard>
          <CardHeader>
            <FaBell />
            <h3>Notifications</h3>
          </CardHeader>

          <SettingItem>
            <SettingLabel>
              <span>Email Notifications</span>
              <Toggle>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span></span>
              </Toggle>
            </SettingLabel>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <span>Push Notifications</span>
              <Toggle>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span></span>
              </Toggle>
            </SettingLabel>
          </SettingItem>
        </SettingsCard>

        <SettingsCard>
          <CardHeader>
            <FaPalette />
            <h3>Appearance</h3>
          </CardHeader>

          <SettingItem>
            <SettingLabel>
              <span>Dark Mode</span>
              <Toggle>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <span></span>
              </Toggle>
            </SettingLabel>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <span>Language</span>
            </SettingLabel>
            <Select value={settings.language} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </Select>
          </SettingItem>
        </SettingsCard>

        <SettingsCard>
          <CardHeader>
            <FaShieldAlt />
            <h3>Security</h3>
          </CardHeader>

          <SettingItem>
            <SettingLabel>
              <span>Two-Factor Authentication</span>
              <Toggle>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span></span>
              </Toggle>
            </SettingLabel>
          </SettingItem>

          <Button>
            <FaLock /> Change Password
          </Button>
        </SettingsCard>
      </SettingsGrid>
    </PageContainer>
  );
} 