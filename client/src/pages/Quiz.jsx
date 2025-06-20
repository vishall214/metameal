import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const QuizContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(0, 181, 176, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: var(--primary-light);
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-light);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 181, 176, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 181, 176, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  cursor: pointer;

  input {
    width: auto;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: var(--primary);
  color: var(--bg-dark);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    activityLevel: '',
    healthConditions: {
      diabetes: false,
      highBloodPressure: false,
      thyroid: false,
      other: []
    },
    fitnessGoals: [],
    dietaryPreferences: []
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const userData = response.data;
        
        if (userData.profile) {
          setFormData({
            age: userData.profile.age || '',
            height: userData.profile.height || '',
            weight: userData.profile.weight || '',
            gender: userData.profile.gender || '',
            activityLevel: userData.profile.activityLevel || '',
            healthConditions: userData.profile.healthConditions || {
              diabetes: false,
              highBloodPressure: false,
              thyroid: false,
              other: []
            },
            fitnessGoals: userData.profile.fitnessGoals || [],
            dietaryPreferences: userData.profile.dietaryPreferences || []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name.startsWith('healthConditions.')) {
        const condition = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          healthConditions: {
            ...prev.healthConditions,
            [condition]: checked
          }
        }));
      } else if (name === 'fitnessGoals' || name === 'dietaryPreferences') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.age || !formData.height || !formData.weight || !formData.gender || !formData.activityLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate numeric fields
    if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      toast.error('Please enter a valid age between 1 and 120');
      return;
    }

    if (isNaN(formData.height) || formData.height < 1) {
      toast.error('Please enter a valid height');
      return;
    }

    if (isNaN(formData.weight) || formData.weight < 1) {
      toast.error('Please enter a valid weight');
      return;
    }

    // Validate at least one fitness goal is selected
    if (!formData.fitnessGoals.length) {
      toast.error('Please select at least one fitness goal');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post('/api/profile/update', {
        profile: {
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          healthConditions: formData.healthConditions,
          fitnessGoals: formData.fitnessGoals,
          dietaryPreferences: formData.dietaryPreferences
        },
        quizCompleted: true,
        lastQuizDate: new Date()
      });

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        navigate('/meal-plan');
      } else {
        toast.error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QuizContainer>
      <Title>{user?.quizCompleted ? 'Retake Quiz' : 'Profile Quiz'}</Title>
      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionTitle>Basic Information</SectionTitle>
          <FormGroup>
            <Label>Age</Label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
            />
          </FormGroup>

          <FormGroup>
            <Label>Height (cm)</Label>
            <Input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              min="1"
              max="300"
            />
          </FormGroup>

          <FormGroup>
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="1"
              max="500"
            />
          </FormGroup>

          <FormGroup>
            <Label>Gender</Label>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Activity Level</Label>
            <Select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly_active">Lightly active (light exercise 1-3 days/week)</option>
              <option value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</option>
              <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
              <option value="extra_active">Extra active (very hard exercise & physical job)</option>
            </Select>
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Health Conditions</SectionTitle>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="healthConditions.diabetes"
                checked={formData.healthConditions.diabetes}
                onChange={handleChange}
              />
              Diabetes
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="healthConditions.highBloodPressure"
                checked={formData.healthConditions.highBloodPressure}
                onChange={handleChange}
              />
              High Blood Pressure
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="healthConditions.thyroid"
                checked={formData.healthConditions.thyroid}
                onChange={handleChange}
              />
              Thyroid
            </CheckboxLabel>
          </CheckboxGroup>
        </Section>

        <Section>
          <SectionTitle>Fitness Goals</SectionTitle>
          <CheckboxGroup>
            {[
              'weight_loss',
              'muscle_gain',
              'maintenance',
              'improved_energy',
              'better_sleep',
              'sports_performance'
            ].map(goal => (
              <CheckboxLabel key={goal}>
                <input
                  type="checkbox"
                  name="fitnessGoals"
                  value={goal}
                  checked={formData.fitnessGoals.includes(goal)}
                  onChange={handleChange}
                />
                {goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </Section>

        <Section>
          <SectionTitle>Dietary Preferences</SectionTitle>
          <CheckboxGroup>
            {[
              'vegetarian',
              'vegan',
              'pescatarian',
              'gluten_free',
              'dairy_free'
            ].map(pref => (
              <CheckboxLabel key={pref}>
                <input
                  type="checkbox"
                  name="dietaryPreferences"
                  value={pref}
                  checked={formData.dietaryPreferences.includes(pref)}
                  onChange={handleChange}
                />
                {pref.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </Section>

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (user?.quizCompleted ? 'Update Profile' : 'Complete Quiz')}
        </Button>
      </Form>
    </QuizContainer>
  );
} 