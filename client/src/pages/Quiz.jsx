import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import axios from 'axios';

const QuizContainer = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  background: var(--bg-dark);
  position: relative;
`;

const QuizForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  color: var(--primary);
  margin-bottom: 2rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: var(--text-light);
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  option {
    background: var(--bg-dark);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover {
    background: var(--primary-light);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const BMIResult = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(0, 181, 176, 0.1);
  color: var(--text-light);

  h3 {
    color: var(--primary);
    margin-bottom: 0.5rem;
  }
`;

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    activityLevel: 'sedentary',
    filters: [], // This will match backend Food.filter
    goals: []
    // allergies removed
  });
  const [bmi, setBmi] = useState(null);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Lightly active (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)' },
    { value: 'active', label: 'Very active (hard exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Extra active (very hard exercise & physical job)' }
  ];

  // Only health/dietary filters, no course types
  const filterOptions = [
    'veg', 'non-veg', 'diabetes', 'thyroid', 'high BP'
  ];

  const goalOptions = [
    'Weight Loss', 'Muscle Gain', 'Maintenance',
    'Improved Energy', 'Better Sleep', 'Sports Performance'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const array = formData[name];
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...array, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: array.filter(v => v !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Calculate BMI when height or weight changes
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? parseFloat(value) : parseFloat(formData.height);
      const weight = name === 'weight' ? parseFloat(value) : parseFloat(formData.weight);
      if (height && weight) {
        const heightInMeters = height / 100;
        const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setBmi(bmiValue);
      }
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.age || !formData.height || !formData.weight) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/users/quiz', 
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      toast.success('Quiz completed successfully!');
      navigate('/home');
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuizContainer>
      <BackButton />
      <QuizForm onSubmit={handleSubmit}>
        <Title>Personalization Quiz</Title>
        <FormGroup>
          <Label htmlFor="age">Age</Label>
          <Input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            required
            min="13"
            max="120"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="Enter your height in centimeters"
            required
            min="100"
            max="250"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Enter your weight in kilograms"
            required
            min="30"
            max="300"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
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
          <Label htmlFor="activityLevel">Activity Level</Label>
          <Select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
          >
            {activityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Preferences & Health Filters</Label>
          <CheckboxGroup>
            {filterOptions.map(opt => (
              <CheckboxLabel key={opt}>
                <input
                  type="checkbox"
                  name="filters"
                  value={opt}
                  checked={formData.filters.includes(opt)}
                  onChange={handleChange}
                />
                {opt}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FormGroup>
        <FormGroup>
          <Label>Goals</Label>
          <CheckboxGroup>
            {goalOptions.map(goal => (
              <CheckboxLabel key={goal}>
                <input
                  type="checkbox"
                  name="goals"
                  value={goal}
                  checked={formData.goals.includes(goal)}
                  onChange={handleChange}
                />
                {goal}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FormGroup>
        {bmi && (
          <BMIResult>
            <h3>Your BMI: {bmi}</h3>
            <p>Category: {getBMICategory(bmi)}</p>
          </BMIResult>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Complete Quiz'}
        </Button>
      </QuizForm>
    </QuizContainer>
  );
}