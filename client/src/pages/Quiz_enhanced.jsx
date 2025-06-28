import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  FaUser, 
  FaRuler, 
  FaWeight, 
  FaVenusMars, 
  FaRunning, 
  FaHeart, 
  FaBullseye,
  FaArrowRight,
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa';
import axios from 'axios';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
`;

const QuizContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: var(--bg-gradient);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 70%, rgba(0, 181, 176, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(255, 107, 107, 0.08) 0%, transparent 50%);
  }
`;

const QuizWrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const ProgressHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 2rem;
  
  .progress-fill {
    height: 100%;
    background: var(--primary-gradient);
    border-radius: 3px;
    transition: width 0.5s ease;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
      animation: shimmer 2s ease-in-out infinite;
    }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-20px); }
    100% { transform: translateX(20px); }
  }
`;

const StepInfo = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StepTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
`;

const QuizCard = styled.div`
  background: var(--glass-strong);
  backdrop-filter: blur(30px);
  border-radius: var(--radius-xl);
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: var(--shadow-lg);
  position: relative;
  animation: ${slideIn} 0.5s ease-out;
  
  &.slide-out {
    animation: ${slideOut} 0.3s ease-out;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 0 1rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 568px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .icon {
    color: var(--primary);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-light);
  border-radius: var(--radius);
  transition: all var(--transition);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--border-primary);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 181, 176, 0.1);
  }
  
  option {
    background: var(--bg-dark);
    color: var(--text-primary);
  }
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 568px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxCard = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid var(--border-light);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--border-primary);
    transform: translateY(-1px);
  }
  
  &.checked {
    background: rgba(0, 181, 176, 0.1);
    border-color: var(--primary);
    
    &::before {
      content: '';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 16px;
      height: 16px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    &::after {
      content: '✓';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 16px;
      height: 16px;
      color: white;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
  }
  
  input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-light);
    border-radius: 4px;
    background: transparent;
    transition: all var(--transition);
    
    &:checked {
      background: var(--primary);
      border-color: var(--primary);
      
      &::after {
        content: '✓';
        display: block;
        color: white;
        font-size: 0.75rem;
        text-align: center;
        line-height: 14px;
        font-weight: bold;
      }
    }
  }
  
  span {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
`;

const BMIResult = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  background: rgba(0, 181, 176, 0.1);
  border: 1px solid rgba(0, 181, 176, 0.2);
  text-align: center;

  .bmi-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }
  
  .bmi-category {
    font-size: 1.125rem;
    color: var(--text-secondary);
    font-weight: 600;
  }
  
  .bmi-description {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  
  .nav-button {
    flex: 1;
    max-width: 150px;
  }
  
  .next-button {
    margin-left: auto;
  }
`;

const steps = [
  {
    title: 'Personal Information',
    description: 'Tell us a bit about yourself',
    icon: <FaUser />
  },
  {
    title: 'Physical Details',
    description: 'Your height and weight information',
    icon: <FaRuler />
  },
  {
    title: 'Activity Level',
    description: 'How active are you?',
    icon: <FaRunning />
  },
  {
    title: 'Preferences',
    description: 'Your dietary preferences and restrictions',
    icon: <FaHeart />
  },
  {
    title: 'Goals',
    description: 'What do you want to achieve?',
    icon: <FaBullseye />
  }
];

export default function Quiz() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    activityLevel: 'sedentary',
    filters: [],
    goals: []
  });
  const [bmi, setBmi] = useState(null);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Extra Active', desc: 'Very hard exercise & physical job' }
  ];

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
    if (bmi < 18.5) return { category: 'Underweight', desc: 'You may need to gain some weight' };
    if (bmi < 25) return { category: 'Normal weight', desc: 'You have a healthy weight' };
    if (bmi < 30) return { category: 'Overweight', desc: 'You may benefit from losing some weight' };
    return { category: 'Obese', desc: 'Consider consulting a healthcare provider' };
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.age && formData.gender;
      case 1:
        return formData.height && formData.weight;
      case 2:
        return formData.activityLevel;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.age || !formData.height || !formData.weight) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/quiz/complete',
        {
          profile: {
            age: formData.age,
            height: formData.height,
            weight: formData.weight,
            gender: formData.gender,
            activityLevel: formData.activityLevel,
            filters: formData.filters,
            goals: formData.goals
          },
          preferences: {}
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      updateProfile && updateProfile({ ...user, quizCompleted: true });
      toast.success('Profile setup completed!');
      navigate('/home');
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="age">
                  <FaUser className="icon" />
                  Age
                </Label>
                <Input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  variant="glass"
                  fullWidth
                  min="13"
                  max="120"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="gender">
                  <FaVenusMars className="icon" />
                  Gender
                </Label>
                <Select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>
            </FormGrid>
          </>
        );

      case 1:
        return (
          <>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="height">
                  <FaRuler className="icon" />
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Enter height in cm"
                  variant="glass"
                  fullWidth
                  min="100"
                  max="250"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="weight">
                  <FaWeight className="icon" />
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter weight in kg"
                  variant="glass"
                  fullWidth
                  min="30"
                  max="300"
                />
              </FormGroup>
            </FormGrid>
            {bmi && (
              <BMIResult>
                <div className="bmi-value">{bmi}</div>
                <div className="bmi-category">{getBMICategory(bmi).category}</div>
                <div className="bmi-description">{getBMICategory(bmi).desc}</div>
              </BMIResult>
            )}
          </>
        );

      case 2:
        return (
          <FormGroup>
            <Label>
              <FaRunning className="icon" />
              Activity Level
            </Label>
            <CheckboxGrid>
              {activityLevels.map(level => (
                <CheckboxCard 
                  key={level.value}
                  className={formData.activityLevel === level.value ? 'checked' : ''}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={formData.activityLevel === level.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {level.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {level.desc}
                    </div>
                  </div>
                </CheckboxCard>
              ))}
            </CheckboxGrid>
          </FormGroup>
        );

      case 3:
        return (
          <FormGroup>
            <Label>
              <FaHeart className="icon" />
              Dietary Preferences & Health Conditions
            </Label>
            <CheckboxGrid>
              {filterOptions.map(filter => (
                <CheckboxCard 
                  key={filter}
                  className={formData.filters.includes(filter) ? 'checked' : ''}
                >
                  <input
                    type="checkbox"
                    name="filters"
                    value={filter}
                    checked={formData.filters.includes(filter)}
                    onChange={handleChange}
                  />
                  <span>{filter}</span>
                </CheckboxCard>
              ))}
            </CheckboxGrid>
          </FormGroup>
        );

      case 4:
        return (
          <FormGroup>
            <Label>
              <FaBullseye className="icon" />
              Health Goals
            </Label>
            <CheckboxGrid>
              {goalOptions.map(goal => (
                <CheckboxCard 
                  key={goal}
                  className={formData.goals.includes(goal) ? 'checked' : ''}
                >
                  <input
                    type="checkbox"
                    name="goals"
                    value={goal}
                    checked={formData.goals.includes(goal)}
                    onChange={handleChange}
                  />
                  <span>{goal}</span>
                </CheckboxCard>
              ))}
            </CheckboxGrid>
          </FormGroup>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <QuizContainer>
      <BackButton />
      <QuizWrapper>
        <ProgressHeader>
          <ProgressBar>
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </ProgressBar>
          <StepInfo>
            Step {currentStep + 1} of {steps.length}
          </StepInfo>
          <StepTitle>{steps[currentStep].title}</StepTitle>
          <StepDescription>{steps[currentStep].description}</StepDescription>
        </ProgressHeader>

        <QuizCard>
          {renderStepContent()}

          <NavigationButtons>
            {currentStep > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={prevStep}
                icon={<FaArrowLeft />}
                className="nav-button"
              >
                Back
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={nextStep}
                className="nav-button next-button"
                disabled={!validateStep(currentStep)}
              >
                Next
                <FaArrowRight />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                className="nav-button next-button"
                icon={<FaCheck />}
              >
                {loading ? 'Completing...' : 'Complete Setup'}
              </Button>
            )}
          </NavigationButtons>
        </QuizCard>
      </QuizWrapper>
    </QuizContainer>
  );
}
