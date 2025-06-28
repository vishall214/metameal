import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaWeight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
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
  const { updateProfile } = useAuth();
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
      goals: [],
      healthConditions: [],
      avatar: ''
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
        const response = await api.get('/profile');
        const userData = response.data.profile ? { ...response.data, ...response.data.profile } : response.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          profile: {
            height: userData.height || userData.profile?.height || '',
            weight: userData.weight || userData.profile?.weight || '',
            age: userData.age || userData.profile?.age || '',
            gender: userData.gender || userData.profile?.gender || '',
            activityLevel: userData.activityLevel || userData.profile?.activityLevel || '',
            dietaryRestrictions: userData.dietaryRestrictions || userData.profile?.dietaryRestrictions || [],
            allergies: userData.allergies || userData.profile?.allergies || [],
            goals: userData.goals || userData.profile?.goals || [],
            healthConditions: userData.healthConditions || userData.profile?.healthConditions || [],
            avatar: userData.avatar || userData.profile?.avatar || ''
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
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'select-multiple' ? Array.from(e.target.selectedOptions, option => option.value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value.split(',').map(v => v.trim()).filter(Boolean)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/profile', {
        name: formData.name,
        ...formData.profile
      });
      if (response.data.profile) {
        toast.success('Profile updated successfully');
        updateProfile(response.data.profile);
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
      <BackButton to="/home">Back to Dashboard</BackButton>
      <Title>Profile Settings</Title>
      <ProfileGrid>
        <ProfileSidebar>
          <ProfileImage image={formData.profile.avatar || "/default-avatar.jpg"} />
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
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Avatar URL</Label>
                <Input
                  type="text"
                  name="profile.avatar"
                  value={formData.profile.avatar}
                  onChange={handleChange}
                  placeholder="Paste image URL or leave blank for default"
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
              <FormGroup>
                <Label>Gender</Label>
                <select name="profile.gender" value={formData.profile.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormGroup>
              <FormGroup>
                <Label>Activity Level</Label>
                <select name="profile.activityLevel" value={formData.profile.activityLevel} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </FormGroup>
            </Section>
            <Section>
              <h3>Preferences & Health</h3>
              <FormGroup>
                <Label>Dietary Restrictions (comma separated)</Label>
                <Input
                  type="text"
                  name="profile.dietaryRestrictions"
                  value={formData.profile.dietaryRestrictions.join(', ')}
                  onChange={handleArrayChange}
                  placeholder="e.g. veg, diabetes"
                />
              </FormGroup>
              <FormGroup>
                <Label>Allergies (comma separated)</Label>
                <Input
                  type="text"
                  name="profile.allergies"
                  value={formData.profile.allergies.join(', ')}
                  onChange={handleArrayChange}
                  placeholder="e.g. peanuts, gluten"
                />
              </FormGroup>
              <FormGroup>
                <Label>Goals (comma separated)</Label>
                <Input
                  type="text"
                  name="profile.goals"
                  value={formData.profile.goals.join(', ')}
                  onChange={handleArrayChange}
                  placeholder="e.g. Weight Loss, Muscle Gain"
                />
              </FormGroup>
              <FormGroup>
                <Label>Health Conditions (comma separated)</Label>
                <Input
                  type="text"
                  name="profile.healthConditions"
                  value={formData.profile.healthConditions.join(', ')}
                  onChange={handleArrayChange}
                  placeholder="e.g. diabetes, thyroid"
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