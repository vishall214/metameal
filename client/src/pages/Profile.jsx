import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaWeight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

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

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  height: fit-content;
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  background: ${props => `url(${props.image}) center/cover`};
  border: 3px solid var(--primary);
`;

const ProfileName = styled.h2`
  color: var(--primary-light);
  text-align: center;
  margin-bottom: 0.5rem;
`;

const ProfileEmail = styled.p`
  color: var(--text-light);
  opacity: 0.8;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Stat = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(0, 181, 176, 0.1);
  border-radius: 8px;

  h4 {
    color: var(--primary-light);
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--text-light);
    font-size: 1.25rem;
    font-weight: bold;
  }
`;

const ProfileContent = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;

  h3 {
    color: var(--primary-light);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: var(--primary);
    }
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: var(--text-light);
  font-weight: 500;
`;

const Input = styled.input`
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
  padding: 0.75rem 1.5rem;
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

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile: {
      height: '',
      weight: '',
      age: '',
      gender: '',
      activityLevel: '',
      dietaryRestrictions: [],
      allergies: [],
      goals: []
    },
    preferences: {
      mealTypes: [],
      cuisineTypes: [],
      calorieGoal: '',
      proteinGoal: '',
      carbGoal: '',
      fatGoal: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const userData = response.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          profile: {
            height: userData.profile?.height || '',
            weight: userData.profile?.weight || '',
            age: userData.profile?.age || '',
            gender: userData.profile?.gender || '',
            activityLevel: userData.profile?.activityLevel || '',
            dietaryRestrictions: userData.profile?.dietaryRestrictions || [],
            allergies: userData.profile?.allergies || [],
            goals: userData.profile?.goals || []
          },
          preferences: {
            mealTypes: userData.preferences?.mealTypes || [],
            cuisineTypes: userData.preferences?.cuisineTypes || [],
            calorieGoal: userData.preferences?.calorieGoal || '',
            proteinGoal: userData.preferences?.proteinGoal || '',
            carbGoal: userData.preferences?.carbGoal || '',
            fatGoal: userData.preferences?.fatGoal || ''
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        // Update auth context with new user data
        updateProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <PageContainer>
      <Title>Profile Settings</Title>

      <ProfileGrid>
        <ProfileSidebar>
          <ProfileImage image={user?.profile?.avatar || "/default-avatar.jpg"} />
          <ProfileName>{formData.name}</ProfileName>
          <ProfileEmail>{formData.email}</ProfileEmail>

          <ProfileStats>
            <Stat>
              <h4>Height</h4>
              <p>{formData.profile.height} cm</p>
            </Stat>
            <Stat>
              <h4>Weight</h4>
              <p>{formData.profile.weight} kg</p>
            </Stat>
          </ProfileStats>
        </ProfileSidebar>

        <ProfileContent>
          <Form onSubmit={handleSubmit}>
            <Section>
              <h3><FaUser /> Personal Information</h3>
              <FormGroup>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Section>

            <Section>
              <h3><FaWeight /> Physical Information</h3>
              <FormGroup>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  name="profile.height"
                  value={formData.profile.height}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  name="profile.weight"
                  value={formData.profile.weight}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Age</Label>
                <Input
                  type="number"
                  name="profile.age"
                  value={formData.profile.age}
                  onChange={handleChange}
                />
              </FormGroup>
            </Section>

            <Button type="submit">Save Changes</Button>
          </Form>
        </ProfileContent>
      </ProfileGrid>
    </PageContainer>
  );
} 