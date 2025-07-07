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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  text-align: center;
  
  .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-light);
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .description {
    color: var(--text-light);
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const GoalCard = styled.div`
  background: rgba(0, 181, 176, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(0, 181, 176, 0.2);
  
  .goal-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-light);
    margin-bottom: 0.5rem;
  }
  
  .goal-label {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .goal-preview {
    color: var(--text-light);
    font-size: 0.8rem;
    opacity: 0.7;
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

  option {
    background: var(--bg-dark);
    color: var(--text-light);
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: var(--text-light);
  border: 1px solid var(--border);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-light);
  }
`;

const EditButton = styled(Button)`
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);

  &:hover {
    background: var(--primary);
    color: var(--bg-dark);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: var(--text-light);
`;

const DisplayValue = styled.div`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: var(--text-light);
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 181, 176, 0.1);
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
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [previewGoals, setPreviewGoals] = useState(null);

  // Helper function to calculate BMI
  const calculateBMI = (height, weight) => {
    if (!height || !weight) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };

  // Helper function to calculate BMR
  const calculateBMR = (profile) => {
    if (!profile.height || !profile.weight || !profile.age || !profile.gender) return 'N/A';
    
    let bmr;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
    
    return Math.round(bmr);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        const userData = response.data;
        
        // Structure the data properly
        const profileData = {
          name: userData.name || userData.profile?.name || '',
          email: userData.email || userData.profile?.email || '',
          profile: {
            height: userData.profile?.height || '',
            weight: userData.profile?.weight || '',
            age: userData.profile?.age || '',
            gender: userData.profile?.gender || '',
            activityLevel: userData.profile?.activityLevel || '',
            dietaryRestrictions: userData.profile?.dietaryRestrictions || [],
            allergies: userData.profile?.allergies || [],
            goals: userData.profile?.goals || [],
            healthConditions: userData.profile?.healthConditions || [],
            avatar: userData.profile?.avatar || ''
          },
          preferences: {
            mealTypes: userData.preferences?.mealTypes || [],
            cuisineTypes: userData.preferences?.cuisineTypes || [],
            calorieGoal: userData.preferences?.calorieGoal || '',
            proteinGoal: userData.preferences?.proteinGoal || '',
            carbGoal: userData.preferences?.carbGoal || '',
            fatGoal: userData.preferences?.fatGoal || ''
          }
        };
        
        setFormData(profileData);
        setOriginalData(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => {
        const newData = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: type === 'select-multiple' ? Array.from(e.target.selectedOptions, option => option.value) : value
          }
        };
        
        // Update preview goals when profile data changes
        if (section === 'profile' && ['height', 'weight', 'age', 'gender', 'activityLevel', 'goals'].includes(field)) {
          setPreviewGoals(calculateNutritionGoals(newData.profile));
        }
        
        return newData;
      });
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
    setFormData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value.split(',').map(v => v.trim()).filter(Boolean)
        }
      };
      
      // Update preview goals when goals change
      if (field === 'goals') {
        setPreviewGoals(calculateNutritionGoals(newData.profile));
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Calculate nutrition goals based on profile data
      const calculatedGoals = calculateNutritionGoals(formData.profile);
      
      const response = await api.put('/profile', {
        name: formData.name,
        ...formData.profile
      });
      
      if (response.data) {
        toast.success('Profile updated successfully! Nutrition goals recalculated.');
        
        // Update the form data with calculated goals
        const updatedData = {
          ...formData,
          preferences: {
            ...formData.preferences,
            ...calculatedGoals
          }
        };
        
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditing(false);
        
        // Update the auth context with new user data
        updateProfile(response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Calculate nutrition goals based on profile
  const calculateNutritionGoals = (profile) => {
    if (!profile.age || !profile.weight || !profile.height || !profile.gender || !profile.activityLevel) {
      return {
        calorieGoal: 2000,
        proteinGoal: 150,
        carbGoal: 200,
        fatGoal: 67
      };
    }

    // Harris-Benedict equation for BMR
    let bmr;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    // Activity level multipliers
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };

    const dailyCalories = Math.round(bmr * activityMultipliers[profile.activityLevel]);

    // Adjust based on goals
    const goalAdjustments = {
      'Weight Loss': -300,
      'weight loss': -300,
      'Muscle Gain': 300,
      'muscle gain': 300,
      'Maintenance': 0,
      'maintenance': 0
    };

    let adjustment = 0;
    if (profile.goals && profile.goals.length > 0) {
      profile.goals.forEach(goal => {
        if (goalAdjustments[goal]) {
          adjustment = goalAdjustments[goal];
        }
      });
    }

    const targetCalories = dailyCalories + adjustment;

    return {
      calorieGoal: targetCalories,
      proteinGoal: Math.round((targetCalories * 0.3) / 4), // 30% of calories from protein
      carbGoal: Math.round((targetCalories * 0.4) / 4),    // 40% of calories from carbs
      fatGoal: Math.round((targetCalories * 0.3) / 9)      // 30% of calories from fat
    };
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize preview goals with current data
    setPreviewGoals(calculateNutritionGoals(formData.profile));
  };

  const generateMealPlan = async () => {
    try {
      const response = await api.post('/meal-plans/generate', {
        profile: formData.profile,
        preferences: formData.preferences
      });
      
      if (response.data) {
        toast.success('New meal plan generated based on your profile!');
        // Could navigate to meal plan page
        // navigate('/meal-plan');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading profile...</div>
        </LoadingContainer>
      </PageContainer>
    );
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
          
          {/* Health Metrics */}
          {formData.profile.height && formData.profile.weight && formData.profile.age && (
            <>
              <ProfileStats>
                <Stat>
                  <h4>BMI</h4>
                  <p>{calculateBMI(formData.profile.height, formData.profile.weight)}</p>
                </Stat>
                <Stat>
                  <h4>BMR</h4>
                  <p>{calculateBMR(formData.profile)} cal/day</p>
                </Stat>
              </ProfileStats>
              <ProfileStats>
                <Stat>
                  <h4>Height</h4>
                  <p>{formData.profile.height} cm</p>
                </Stat>
                <Stat>
                  <h4>Weight</h4>
                  <p>{formData.profile.weight} kg</p>
                </Stat>
                <Stat>
                  <h4>Age</h4>
                  <p>{formData.profile.age} years</p>
                </Stat>
                <Stat>
                  <h4>Gender</h4>
                  <p>{formData.profile.gender ? formData.profile.gender.charAt(0).toUpperCase() + formData.profile.gender.slice(1) : 'Not set'}</p>
                </Stat>
              </ProfileStats>
            </>
          )}
          
          {/* Current Nutrition Goals */}
          {formData.preferences?.calorieGoal && (
            <ProfileStats>
              <Stat>
                <h4>Daily Calories</h4>
                <p>{formData.preferences.calorieGoal}</p>
              </Stat>
              <Stat>
                <h4>Protein Goal</h4>
                <p>{formData.preferences.proteinGoal}g</p>
              </Stat>
              <Stat>
                <h4>Carbs Goal</h4>
                <p>{formData.preferences.carbGoal}g</p>
              </Stat>
              <Stat>
                <h4>Fat Goal</h4>
                <p>{formData.preferences.fatGoal}g</p>
              </Stat>
            </ProfileStats>
          )}
          
          {/* Action Buttons */}
          <div style={{ marginTop: '1.5rem' }}>
            <Button onClick={generateMealPlan} style={{ width: '100%', marginBottom: '1rem' }}>
              Generate New Meal Plan
            </Button>
            {!isEditing && (
              <EditButton type="button" onClick={handleEdit} style={{ width: '100%' }}>
                Edit Profile
              </EditButton>
            )}
          </div>
        </ProfileSidebar>
        
        <ProfileContent>
          <Form onSubmit={handleSubmit}>
            <Section>
              <h3><FaUser /> Personal Information</h3>
              <FormGroup>
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <DisplayValue>{formData.name || 'Not set'}</DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <DisplayValue>{formData.email || 'Not set'}</DisplayValue>
              </FormGroup>
              <FormGroup>
                <Label>Avatar URL</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="profile.avatar"
                    value={formData.profile.avatar}
                    onChange={handleChange}
                    placeholder="Paste image URL or leave blank for default"
                  />
                ) : (
                  <DisplayValue>{formData.profile.avatar || 'Using default avatar'}</DisplayValue>
                )}
              </FormGroup>
            </Section>
            
            <Section>
              <h3><FaWeight /> Physical Information</h3>
              <FormGroup>
                <Label>Height (cm)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="profile.height"
                    value={formData.profile.height}
                    onChange={handleChange}
                    placeholder="Enter height in cm"
                  />
                ) : (
                  <DisplayValue>{formData.profile.height ? `${formData.profile.height} cm` : 'Not set'}</DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Weight (kg)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="profile.weight"
                    value={formData.profile.weight}
                    onChange={handleChange}
                    placeholder="Enter weight in kg"
                  />
                ) : (
                  <DisplayValue>{formData.profile.weight ? `${formData.profile.weight} kg` : 'Not set'}</DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Age</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="profile.age"
                    value={formData.profile.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                  />
                ) : (
                  <DisplayValue>{formData.profile.age ? `${formData.profile.age} years` : 'Not set'}</DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Gender</Label>
                {isEditing ? (
                  <Select name="profile.gender" value={formData.profile.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                ) : (
                  <DisplayValue>
                    {formData.profile.gender ? 
                      formData.profile.gender.charAt(0).toUpperCase() + formData.profile.gender.slice(1) : 
                      'Not set'
                    }
                  </DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Activity Level</Label>
                {isEditing ? (
                  <Select name="profile.activityLevel" value={formData.profile.activityLevel} onChange={handleChange}>
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="light">Light (light exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                    <option value="active">Active (hard exercise 6-7 days/week)</option>
                    <option value="very_active">Very Active (physical job + exercise)</option>
                  </Select>
                ) : (
                  <DisplayValue>
                    {formData.profile.activityLevel ? 
                      formData.profile.activityLevel.charAt(0).toUpperCase() + formData.profile.activityLevel.slice(1).replace('_', ' ') : 
                      'Not set'
                    }
                  </DisplayValue>
                )}
              </FormGroup>
            </Section>
            
            <Section>
              <h3>🏥 Health & Preferences</h3>
              <FormGroup>
                <Label>Health Goals</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="profile.goals"
                    value={formData.profile.goals.join(', ')}
                    onChange={handleArrayChange}
                    placeholder="e.g. Weight Loss, Muscle Gain, Diabetes Control"
                  />
                ) : (
                  <DisplayValue>
                    {formData.profile.goals.length > 0 ? 
                      formData.profile.goals.join(', ') : 
                      'None specified'
                    }
                  </DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Dietary Restrictions</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="profile.dietaryRestrictions"
                    value={formData.profile.dietaryRestrictions.join(', ')}
                    onChange={handleArrayChange}
                    placeholder="e.g. vegetarian, jain, no onion-garlic"
                  />
                ) : (
                  <DisplayValue>
                    {formData.profile.dietaryRestrictions.length > 0 ? 
                      formData.profile.dietaryRestrictions.join(', ') : 
                      'None specified'
                    }
                  </DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Food Allergies</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="profile.allergies"
                    value={formData.profile.allergies.join(', ')}
                    onChange={handleArrayChange}
                    placeholder="e.g. groundnuts, wheat, milk"
                  />
                ) : (
                  <DisplayValue>
                    {formData.profile.allergies.length > 0 ? 
                      formData.profile.allergies.join(', ') : 
                      'None specified'
                    }
                  </DisplayValue>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Health Conditions</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="profile.healthConditions"
                    value={formData.profile.healthConditions.join(', ')}
                    onChange={handleArrayChange}
                    placeholder="e.g. diabetes, thyroid, hypertension"
                  />
                ) : (
                  <DisplayValue>
                    {formData.profile.healthConditions.length > 0 ? 
                      formData.profile.healthConditions.join(', ') : 
                      'None specified'
                    }
                  </DisplayValue>
                )}
              </FormGroup>
            </Section>
            
            {/* Calculated Nutrition Goals Preview */}
            {isEditing && previewGoals && (
              <Section>
                <h3>📊 Calculated Nutrition Goals Preview</h3>
                <GoalsGrid>
                  <GoalCard>
                    <div className="goal-value">{previewGoals.calorieGoal}</div>
                    <div className="goal-label">Daily Calories</div>
                    <div className="goal-preview">Based on your BMR and activity level</div>
                  </GoalCard>
                  <GoalCard>
                    <div className="goal-value">{previewGoals.proteinGoal}g</div>
                    <div className="goal-label">Protein Target</div>
                    <div className="goal-preview">30% of total calories</div>
                  </GoalCard>
                  <GoalCard>
                    <div className="goal-value">{previewGoals.carbGoal}g</div>
                    <div className="goal-label">Carbs Target</div>
                    <div className="goal-preview">40% of total calories</div>
                  </GoalCard>
                  <GoalCard>
                    <div className="goal-value">{previewGoals.fatGoal}g</div>
                    <div className="goal-label">Fat Target</div>
                    <div className="goal-preview">30% of total calories</div>
                  </GoalCard>
                </GoalsGrid>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  These goals will be automatically calculated and used in your dashboard when you save.
                </p>
              </Section>
            )}
            
            {/* Current Nutrition Goals Display */}
            {!isEditing && formData.preferences?.calorieGoal && (
              <Section>
                <h3>📊 Current Nutrition Goals</h3>
                <GoalsGrid>
                  <GoalCard>
                    <div className="goal-value">{formData.preferences.calorieGoal}</div>
                    <div className="goal-label">Daily Calories</div>
                    <div className="goal-preview">Your current target</div>
                  </GoalCard>
                  <GoalCard>
                    <div className="goal-value">{formData.preferences.proteinGoal}g</div>
                    <div className="goal-label">Protein Target</div>
                    <div className="goal-preview">Daily protein goal</div>
                  </GoalCard>
                  <GoalCard>
                    <div className="goal-value">{formData.preferences.carbGoal}g</div>
                    <div className="goal-label">Carbs Target</div>
                    <div className="goal-preview">Daily carbs goal</div>
                  </GoalCard>
                  <GoalCard>
                    <div className="goal-value">{formData.preferences.fatGoal}g</div>
                    <div className="goal-label">Fat Target</div>
                    <div className="goal-preview">Daily fat goal</div>
                  </GoalCard>
                </GoalsGrid>
              </Section>
            )}
            
            {isEditing && (
              <ButtonGroup>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <CancelButton type="button" onClick={handleCancel}>
                  Cancel
                </CancelButton>
              </ButtonGroup>
            )}
          </Form>
        </ProfileContent>
      </ProfileGrid>
    </PageContainer>
  );
}