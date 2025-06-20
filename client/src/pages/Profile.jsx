import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaWeight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api, { profileAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

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

const Select = styled.select`
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

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const RequiredField = styled.span`
  color: #ff6b6b;
  margin-left: 4px;
`;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        const userData = response.data;
        
        if (!userData) {
          toast.error('No profile data found');
          return;
        }

        setFormData({
          name: user?.name || '',
          email: user?.email || '',
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

        // Check if essential profile fields are filled
        const hasRequiredFields = 
          userData.profile?.height &&
          userData.profile?.weight &&
          userData.profile?.age &&
          userData.profile?.gender &&
          userData.profile?.activityLevel;

        setIsProfileComplete(hasRequiredFields);

      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.profile.height) newErrors.height = 'Height is required';
    if (!formData.profile.weight) newErrors.weight = 'Weight is required';
    if (!formData.profile.age) newErrors.age = 'Age is required';
    if (!formData.profile.gender) newErrors.gender = 'Gender is required';
    if (!formData.profile.activityLevel) newErrors.activityLevel = 'Activity level is required';

    // Numeric validation
    if (formData.profile.height && (isNaN(formData.profile.height) || formData.profile.height <= 0)) {
      newErrors.height = 'Please enter a valid height';
    }
    if (formData.profile.weight && (isNaN(formData.profile.weight) || formData.profile.weight <= 0)) {
      newErrors.weight = 'Please enter a valid weight';
    }
    if (formData.profile.age && (isNaN(formData.profile.age) || formData.profile.age <= 0)) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      setLoading(true);
      const response = await profileAPI.updateProfile({
        ...formData.profile
      });

      if (response.data) {
        toast.success('Profile updated successfully');
        setIsProfileComplete(true);

        // If this was initial profile setup, redirect to meal plan generation
        if (!isProfileComplete) {
          navigate('/meal-plan');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Title>
        {isProfileComplete ? 'Update Your Profile' : 'Complete Your Profile'}
      </Title>
      <ProfileGrid>
        <ProfileContent>
          <Form onSubmit={handleSubmit}>
            <Section>
              <h3><FaUser /> Basic Information</h3>
              <FormGroup>
                <Label>Height (cm)<RequiredField>*</RequiredField></Label>
                <Input
                  type="number"
                  name="profile.height"
                  value={formData.profile.height}
                  onChange={handleChange}
                  placeholder="Enter your height in centimeters"
                />
                {errors.height && <ErrorMessage>{errors.height}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Weight (kg)<RequiredField>*</RequiredField></Label>
                <Input
                  type="number"
                  name="profile.weight"
                  value={formData.profile.weight}
                  onChange={handleChange}
                  placeholder="Enter your weight in kilograms"
                />
                {errors.weight && <ErrorMessage>{errors.weight}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Age<RequiredField>*</RequiredField></Label>
                <Input
                  type="number"
                  name="profile.age"
                  value={formData.profile.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                />
                {errors.age && <ErrorMessage>{errors.age}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Gender<RequiredField>*</RequiredField></Label>
                <Select
                  name="profile.gender"
                  value={formData.profile.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                {errors.gender && <ErrorMessage>{errors.gender}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Activity Level<RequiredField>*</RequiredField></Label>
                <Select
                  name="profile.activityLevel"
                  value={formData.profile.activityLevel}
                  onChange={handleChange}
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 times/week)</option>
                  <option value="moderate">Moderate (exercise 4-5 times/week)</option>
                  <option value="active">Active (daily exercise)</option>
                  <option value="very_active">Very Active (intense exercise 6-7 times/week)</option>
                </Select>
                {errors.activityLevel && <ErrorMessage>{errors.activityLevel}</ErrorMessage>}
              </FormGroup>
            </Section>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isProfileComplete ? 'Update Profile' : 'Complete Profile')}
            </Button>
          </Form>
        </ProfileContent>
      </ProfileGrid>
    </PageContainer>
  );
} 