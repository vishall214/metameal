import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaUtensils, 
  FaFire, 
  FaDumbbell, 
  FaTint,
  FaRunning,
  FaCalendarDay,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { mealPlansAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MealCard from '../components/mealcard';
import api from '../services/api';
import usePageTitle from '../utils/usePageTitle';

// Main Dashboard Container
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

// Dashboard Content Grid
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// Welcome Header
const WelcomeHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
    
    span {
      color: var(--primary);
    }
  }
  
  p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 1rem;
`;

// Progress Section
const ProgressSection = styled.div`
  background: linear-gradient(135deg, rgba(8, 35, 34, 0.95) 0%, rgba(0, 65, 62, 0.9) 100%);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);
  
  h2 {
    color: var(--text-light);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
  }
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProgressCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 181, 176, 0.15) 0%, rgba(0, 181, 176, 0.08) 100%);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(0, 181, 176, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: var(--glass-backdrop);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 181, 176, 0.2);
    border-color: var(--primary);
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.2) 0%, rgba(0, 181, 176, 0.12) 100%);
  }
  
  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    .metric-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .icon {
        font-size: 1.2rem;
        color: var(--primary);
      }
      
      .label {
        color: var(--text-light);
        font-size: 0.85rem;
        font-weight: 600;
      }
    }
    
    .weekly-indicator {
      font-size: 0.7rem;
      color: var(--text-light);
      background: rgba(0, 181, 176, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: 1px solid rgba(0, 181, 176, 0.3);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .progress-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .values {
      .current-value {
        color: var(--text-light);
        font-size: 1.2rem;
        font-weight: 700;
        line-height: 1;
      }
      
      .target-value {
        color: var(--text-muted);
        font-size: 0.65rem;
        margin-top: 0.2rem;
        font-weight: 500;
      }
    }
    
    .mini-progress {
      width: 40px;
      height: 40px;
      position: relative;
      
      .progress-ring {
        transform: rotate(-90deg);
        
        .ring-bg {
          fill: none;
          stroke: rgba(0, 181, 176, 0.1);
          stroke-width: 3;
        }
        
        .ring-progress {
          fill: none;
          stroke: var(--primary);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dasharray 0.5s ease;
        }
      }
      
      .progress-percentage {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--primary);
      }
    }
  }
  
  .weekly-dots {
    display: flex;
    gap: 0.3rem;
    margin-top: 0.5rem;
    
    .day-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(0, 181, 176, 0.2);
      transition: all 0.3s ease;
      
      &.completed {
        background: var(--primary);
        transform: scale(1.2);
      }
      
      &.today {
        background: var(--primary);
        opacity: 0.7;
        animation: pulse 2s infinite;
      }
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
`;

// Goals Section
const GoalsSection = styled.div`
  background: linear-gradient(135deg, rgba(8, 35, 34, 0.95) 0%, rgba(0, 65, 62, 0.9) 100%);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);
  
  h2 {
    color: var(--text-light);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
  }
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const GoalCard = styled.button`
  background: ${props => props.completed ? 
    'linear-gradient(135deg, rgba(0, 181, 176, 0.4), rgba(0, 181, 176, 0.25))' : 
    'linear-gradient(135deg, rgba(0, 181, 176, 0.2), rgba(0, 181, 176, 0.1))'
  };
  border: ${props => props.completed ? 
    '2px solid var(--primary)' : 
    '1px solid rgba(0, 181, 176, 0.4)'
  };
  border-radius: 20px;
  padding: 1.25rem;
  cursor: ${props => props.completed ? 'not-allowed' : 'pointer'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: ${props => props.completed ? '0.8' : '1'};
  backdrop-filter: var(--glass-backdrop);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.completed ? 
      'linear-gradient(135deg, rgba(0, 181, 176, 0.2), transparent)' : 
      'transparent'
    };
    transition: all 0.3s ease;
  }
  
  &:hover {
    transform: ${props => props.completed ? 'none' : 'translateY(-4px) scale(1.02)'};
    box-shadow: ${props => props.completed ? '0 4px 15px rgba(0, 0, 0, 0.2)' : '0 16px 40px rgba(0, 181, 176, 0.3)'};
    border-color: ${props => props.completed ? 'var(--primary)' : 'var(--primary)'};
    background: ${props => props.completed ? 
      'linear-gradient(135deg, rgba(0, 181, 176, 0.4), rgba(0, 181, 176, 0.25))' : 
      'linear-gradient(135deg, rgba(0, 181, 176, 0.3), rgba(0, 181, 176, 0.2))'
    };
    
    &::before {
      background: ${props => props.completed ? 
        'linear-gradient(135deg, rgba(0, 181, 176, 0.2), transparent)' :
        'linear-gradient(135deg, rgba(0, 181, 176, 0.25), transparent)'
      };
    }
  }
  
  &:active {
    transform: ${props => props.completed ? 'none' : 'translateY(-2px) scale(0.98)'};
  }
  
  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    position: relative;
    z-index: 1;
    
    .goal-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-light);
      font-size: 0.9rem;
      font-weight: 700;
      
      svg {
        font-size: 1.1rem;
        color: var(--primary);
        filter: drop-shadow(0 2px 4px rgba(0, 181, 176, 0.3));
      }
    }
    
    .check-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${props => props.completed ? 
        'linear-gradient(135deg, var(--primary), #00d4aa)' : 
        'transparent'
      };
      border: 2px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
      
      ${props => props.completed && `
        box-shadow: 0 0 15px rgba(0, 181, 176, 0.5);
        animation: pulse 2s infinite;
      `}
      
      svg {
        font-size: 0.8rem;
      }
    }
  }
  
  .goal-progress {
    color: var(--text-muted);
    font-size: 0.75rem;
    position: relative;
    z-index: 1;
    font-weight: 500;
    opacity: 0.8;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .goal-contribution {
    color: var(--text-light);
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 1;
    background: rgba(0, 181, 176, 0.25);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(0, 181, 176, 0.4);
    text-align: center;
    margin-top: 0.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

// Meals Section
const MealsSection = styled.div`
  background: linear-gradient(135deg, rgba(8, 35, 34, 0.95) 0%, rgba(0, 65, 62, 0.9) 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--glass-shadow);
  
  h2 {
    color: var(--text-light);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const MealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const MealTypeSection = styled.div`
  h3 {
    color: var(--text-light);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: capitalize;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
`;

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Set the page title
  usePageTitle('Dashboard');
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({
    calories: { current: 0, target: 2000 },
    protein: { current: 0, target: 120 },
    water: { current: 0, target: 8 },
    exercise: { current: 0, target: 30 }
  });
  
  // Weekly progress tracking - initialized with defaults, updated from API
  const [weeklyProgress, setWeeklyProgress] = useState({
    calories: { current: 0, target: 0, dailyCompletions: [false, false, false, false, false, false, false] },
    protein: { current: 0, target: 0, dailyCompletions: [false, false, false, false, false, false, false] },
    water: { current: 0, target: 0, dailyCompletions: [false, false, false, false, false, false, false] },
    exercise: { current: 0, target: 0, dailyCompletions: [false, false, false, false, false, false, false] }
  });
  
  // Removed duplicate weekly progress fetch. Only loadGoalProgressFromAPI will update weeklyProgress.
  // Track daily completion status for visual dots
  const [dailyCompletionStatus, setDailyCompletionStatus] = useState({
    calories: [false, false, false, false, false, false, false], // Mon-Sun
    protein: [false, false, false, false, false, false, false],
    water: [false, false, false, false, false, false, false],
    exercise: [false, false, false, false, false, false, false]
  });
  
  const [goals, setGoals] = useState([]);

  // Add progress state for goals tracking
  const [progress, setProgress] = useState({
    calories: { daily: 0, todayContribution: 0 },
    protein: { daily: 0, todayContribution: 0 },
    water: { daily: 0, todayContribution: 0 },
    exercise: { daily: 0, todayContribution: 0 }
  });

  // Daily completion tracking with date persistence
  const [dailyCompletions, setDailyCompletions] = useState({});
  const [lastCompletionDate, setLastCompletionDate] = useState(null);

  // API functions for goal progress
const loadGoalProgressFromAPI = async () => {
  try {
    const response = await api.get('/dashboard/goals/progress');
    const { todayGoals, weeklyProgress, todayContributions, userGoals } = response.data;

    console.log('[Dashboard] API Response:', response.data);

    // ✅ Update user profile with smart goals
    setUserProfile(prev => ({
      ...prev,
      dailyCalories: userGoals.dailyCalories,
      dailyProtein: userGoals.dailyProtein,
      dailyWater: userGoals.dailyWater,
      weeklyExercise: userGoals.weeklyExercise,
      dailyExercise: Math.round(userGoals.weeklyExercise / 7)
    }));

    // ✅ Update progress state
    setProgress({
      calories: { 
        daily: todayGoals.calories ? todayContributions.calories : 0,
        todayContribution: Math.round(todayContributions.calories)
      },
      protein: {
        daily: todayGoals.protein ? todayContributions.protein : 0,
        todayContribution: Math.round(todayContributions.protein)
      },
      water: {
        daily: todayGoals.water ? todayContributions.water : 0,
        todayContribution: Math.round(todayContributions.water)
      },
      exercise: {
        daily: todayGoals.exercise ? todayContributions.exercise : 0,
        todayContribution: Math.round(todayContributions.exercise)
      }
    });

    // ✅ Update weekly progress (force re-render)
    setWeeklyProgress({ ...weeklyProgress });

    // ✅ Update dailyCompletionStatus for dot markers
    const dailyStatus = {};
    Object.keys(weeklyProgress).forEach(metric => {
      dailyStatus[metric] = weeklyProgress[metric]?.dailyCompletions || [false, false, false, false, false, false, false];
    });
    setDailyCompletionStatus(dailyStatus);

  } catch (error) {
    console.error('Error loading goal progress:', error);
    toast.error('Failed to load goal progress. Please try again later.');
  }
};


  const completeGoalInAPI = async (goalId) => {
    try {
      const response = await api.post('/dashboard/goals/complete', {
        goalType: goalId
      });
      
      console.log('[Dashboard] Complete goal response:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          todaysContribution: response.data.todaysContribution
        };
      } else if (response.data.alreadyCompleted) {
        return { alreadyCompleted: true, message: response.data.error };
      }
    } catch (error) {
      if (error.response?.data?.alreadyCompleted) {
        return { alreadyCompleted: true, message: error.response.data.error };
      }
      console.error('Error completing goal:', error);
      throw error;
    }
  };

  // Generate goals with current progress and contribution data
const generateGoals = useCallback(() => {
  if (!userProfile) return [];

  return [
    {
      id: 'calories',
      label: 'Reach Daily Calories',
      title: 'Daily Calories',
      description: 'Meet your calorie target',
      target: userProfile.dailyCalories || 2000,
      current: progress.calories.daily,
      unit: 'kcal',
      icon: FaFire,
      color: 'var(--primary)',
      completed: isGoalCompletedToday('calories'),
      contribution: Math.round(progress.calories.todayContribution || 0)
    },
    {
      id: 'protein',
      label: 'Meet Protein Goal',
      title: 'Daily Protein',
      description: 'Fuel your muscle growth',
      target: userProfile.dailyProtein || 150,
      current: progress.protein.daily,
      unit: 'g',
      icon: FaDumbbell,
      color: '#FF6B6B',
      completed: isGoalCompletedToday('protein'),
      contribution: Math.round(progress.protein.todayContribution || 0)
    },
    {
      id: 'water',
      label: `Drink ${userProfile.dailyWater || 8} Glasses Water`,
      title: 'Daily Water',
      description: 'Stay hydrated',
      target: userProfile.dailyWater || 8,
      current: progress.water.daily,
      unit: 'glasses',
      icon: FaTint,
      color: '#4ECDC4',
      completed: isGoalCompletedToday('water'),
      contribution: Math.round(progress.water.todayContribution || 0)
    },
    {
      id: 'exercise',
      label: `Exercise ${Math.round((userProfile.weeklyExercise || 210) / 7)} Minutes`,
      title: 'Daily Exercise',
      description: 'Active lifestyle',
      target: Math.round((userProfile.weeklyExercise || 210) / 7),
      current: progress.exercise.daily,
      unit: 'min',
      icon: FaRunning,
      color: '#45B7D1',
      completed: isGoalCompletedToday('exercise'),
      contribution: Math.round(progress.exercise.todayContribution || 0)
    }
  ];
}, [userProfile, progress]);


  // Get today's date info
  const getTodayInfo = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const fullDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dateKey = today.toDateString(); // Used for comparison
    return { dayName, fullDate, dateKey };
  };

  // Get today's date key for completion tracking
  const getTodayDateKey = () => {
    return new Date().toDateString();
  };

  // Check if goal is completed today
const isGoalCompletedToday = (goalId) => {
  return progress[goalId]?.daily > 0;
};

  // Load daily completions from localStorage
  const loadDailyCompletions = () => {
    try {
      const saved = localStorage.getItem('metameal_daily_completions');
      const savedDate = localStorage.getItem('metameal_last_completion_date');
      
      if (saved && savedDate) {
        const completions = JSON.parse(saved);
        const lastDate = savedDate;
        const todayKey = getTodayDateKey();
        
        // If it's a new day, reset completions
        if (lastDate !== todayKey) {
          return {};
        }
        
        return completions;
      }
    } catch (error) {
      console.error('Error loading daily completions:', error);
    }
    return {};
  };

  // Save daily completions to localStorage
  const saveDailyCompletions = (completions) => {
    try {
      const todayKey = getTodayDateKey();
      localStorage.setItem('metameal_daily_completions', JSON.stringify(completions));
      localStorage.setItem('metameal_last_completion_date', todayKey);
    } catch (error) {
      console.error('Error saving daily completions:', error);
    }
  };

  // Get current day index (0 = Monday, 6 = Sunday)
  const getCurrentDayIndex = () => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  };

  // Get weekly progress display data
  const getWeeklyProgressData = (metric) => {
    const progressData = weeklyProgress[metric];
    const dailyStatus = dailyCompletionStatus[metric];
    const currentDayIndex = getCurrentDayIndex();
    
    // Add null checking to prevent undefined filter errors
    const safeDaily = dailyStatus || [false, false, false, false, false, false, false];
    const completedDays = safeDaily.filter(day => day).length;
    
    return {
      current: progressData?.current || 0,
      target: progressData?.target || 0,
      weeklyData: safeDaily,
      completedDays,
      currentDayIndex,
      weeklyPercentage: progressData?.target ? Math.round((progressData.current / progressData.target) * 100) : 0
    };
  };

  // Get daily target values
  const getDailyTargets = () => {
    return {
      calories: dailyProgress.calories.target,
      protein: dailyProgress.protein.target,
      water: dailyProgress.water.target,
      exercise: dailyProgress.exercise.target
    };
  };

  // Fetch user profile from database
  const fetchUserProfile = async () => {
    const response = await api.get('/profile');
    const userData = response.data;
    setUserProfile(userData);
  };

  // Fetch today's meals (just for display, doesn't affect progress)
  const fetchTodayMeals = async () => {
    try {
      const response = await mealPlansAPI.getAll();
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const mostRecentPlan = response.data[0];
        const { dayName } = getTodayInfo();
        
        // Filter meals for today
        const todaysMeals = (mostRecentPlan.meals || []).filter(meal => meal.day === dayName);
        setTodayMeals(todaysMeals);
      } else {
        setTodayMeals([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s meals:', error);
      toast.warn('Could not load today\'s meals. Please check your meal plan.');
      setTodayMeals([]);
    }
  };

  const [goalCompletionLoading, setGoalCompletionLoading] = useState(false);

  // Handle goal click with daily completion tracking
const handleGoalClick = async (goalId) => {
  if (goalCompletionLoading) {
    toast.info('Please wait, processing your goal completion...');
    return;
  }

  if (isGoalCompletedToday(goalId)) {
    toast.info(`You've already completed your ${goalId} goal today! Come back tomorrow 🌅`);
    return;
  }

  setGoalCompletionLoading(true);

  try {
    const result = await completeGoalInAPI(goalId);

    if (result.alreadyCompleted) {
      toast.info(result.message);
      return;
    }

    if (result.success) {
      toast.success(result.message);

      // ✅ Fetch updated progress and goal completions
      await loadGoalProgressFromAPI();

      // ✅ Force UI goal list to re-render with new state
      setGoals(generateGoals()); // ← ADD THIS LINE
    }

  } catch (error) {
    console.error('Error completing goal:', error);

    if (error.response?.status === 400) {
      toast.error(error.response.data.error || 'Invalid goal completion request');
    } else if (error.response?.status === 401) {
      toast.error('Please log in again to complete goals');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again in a moment.');
    } else {
      toast.error('Failed to complete goal. Please check your connection and try again.');
    }

  } finally {
    setGoalCompletionLoading(false);
  }
};

  // Initialize data
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      
      try {
        // Load goal progress from API (fallback to localStorage if API fails)
        await loadGoalProgressFromAPI();
        
        // Fetch user data
        await Promise.all([
          fetchUserProfile(),
          fetchTodayMeals()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast.error('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update goals when userProfile or progress changes
  useEffect(() => {
    if (userProfile) {
      const updatedGoals = generateGoals();
      setGoals(updatedGoals);
    }
  }, [userProfile, progress, generateGoals]);

  // Group meals by type
  const groupedMeals = todayMeals.reduce((acc, meal) => {
    const type = meal.mealType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  const { fullDate } = getTodayInfo();
  if (loading) {
    return (
      <DashboardContainer>
        <LoadingState>
          <div>Loading your dashboard...</div>
        </LoadingState>
      </DashboardContainer>
    );
  }
  return (
    <DashboardContainer>
      {/* Welcome Header */}
      <WelcomeHeader>
        <h1>Welcome back, <span>{userProfile?.name || user?.name || 'User'}</span>! 👋</h1>
        <p>Here's your health summary for today</p>
        <DateInfo>
          <FaCalendarDay />
          {fullDate}
        </DateInfo>
      </WelcomeHeader>

      {/* Progress and Goals Grid */}
      <DashboardGrid>
        {/* Daily Progress */}
        <ProgressSection>
          <h2><FaFire /> Weekly Progress</h2>
          <ProgressGrid>
            <ProgressCard>
              <div className="progress-header">
                <div className="metric-info">
                  <div className="icon"><FaFire /></div>
                  <div className="label">Calories</div>
                </div>
                <div className="weekly-indicator">This Week</div>
              </div>
              <div className="progress-content">
                <div className="values">
                  <div className="current-value">
                    {Math.round(getWeeklyProgressData('calories').current).toLocaleString()}
                  </div>
                  <div className="target-value">of {getWeeklyProgressData('calories').target.toLocaleString()} kcal</div>
                </div>
                <div className="mini-progress">
                  <svg className="progress-ring" width="40" height="40">
                    <circle 
                      className="ring-bg" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                    />
                    <circle
                      className="ring-progress"
                      cx="20"
                      cy="20"
                      r="16" 
                      strokeDasharray={`${getWeeklyProgressData('calories').weeklyPercentage * 1.005} 100.5`}
                    />
                  </svg>
                  <div className="progress-percentage">
                    {getWeeklyProgressData('calories').weeklyPercentage}%
                  </div>
                </div>
              </div>
              <div className="weekly-dots">
                {getWeeklyProgressData('calories').weeklyData.map((completed, index) => (
                  <div 
                    key={index} 
                    className={`day-dot ${completed ? 'completed' : ''} ${
                      index === getWeeklyProgressData('calories').currentDayIndex ? 'today' : ''
                    }`}
                  />
                ))}
              </div>
            </ProgressCard>
            <ProgressCard>
              <div className="progress-header">
                <div className="metric-info">
                  <div className="icon"><FaDumbbell /></div>
                  <div className="label">Protein</div>
                </div>
                <div className="weekly-indicator">This Week</div>
              </div>
              <div className="progress-content">
                <div className="values">
                  <div className="current-value">
                    {Math.round(getWeeklyProgressData('protein').current)}g
                  </div>
                  <div className="target-value">of {getWeeklyProgressData('protein').target}g</div>
                </div>
                <div className="mini-progress">
                  <svg className="progress-ring" width="40" height="40">
                    <circle 
                      className="ring-bg" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                    />
                    <circle 
                      className="ring-progress" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                      strokeDasharray={`${getWeeklyProgressData('protein').weeklyPercentage * 1.005} 100.5`}
                    />
                  </svg>
                  <div className="progress-percentage">
                    {getWeeklyProgressData('protein').weeklyPercentage}%
                  </div>
                </div>
              </div>
              <div className="weekly-dots">
                {getWeeklyProgressData('protein').weeklyData.map((completed, index) => (
                  <div 
                    key={index} 
                    className={`day-dot ${completed ? 'completed' : ''} ${
                      index === getWeeklyProgressData('protein').currentDayIndex ? 'today' : ''
                    }`}
                  />
                ))}
              </div>
            </ProgressCard>
            <ProgressCard>
              <div className="progress-header">
                <div className="metric-info">
                  <div className="icon"><FaTint /></div>
                  <div className="label">Water</div>
                </div>
                <div className="weekly-indicator">This Week</div>
              </div>
              <div className="progress-content">
                <div className="values">
                  <div className="current-value">
                    {getWeeklyProgressData('water').current}
                  </div>
                  <div className="target-value">of {getWeeklyProgressData('water').target} glasses</div>
                </div>
                <div className="mini-progress">
                  <svg className="progress-ring" width="40" height="40">
                    <circle 
                      className="ring-bg" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                    />
                    <circle 
                      className="ring-progress" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                      strokeDasharray={`${getWeeklyProgressData('water').weeklyPercentage * 1.005} 100.5`}
                    />
                  </svg>
                  <div className="progress-percentage">
                    {getWeeklyProgressData('water').weeklyPercentage}%
                  </div>
                </div>
              </div>
              <div className="weekly-dots">
                {getWeeklyProgressData('water').weeklyData.map((completed, index) => (
                  <div 
                    key={index} 
                    className={`day-dot ${completed ? 'completed' : ''} ${
                      index === getWeeklyProgressData('water').currentDayIndex ? 'today' : ''
                    }`}
                  />
                ))}
              </div>
            </ProgressCard>
            <ProgressCard>
              <div className="progress-header">
                <div className="metric-info">
                  <div className="icon"><FaRunning /></div>
                  <div className="label">Exercise</div>
                </div>
                <div className="weekly-indicator">This Week</div>
              </div>
              <div className="progress-content">
                <div className="values">
                  <div className="current-value">
                    {getWeeklyProgressData('exercise').current}
                  </div>
                  <div className="target-value">of {getWeeklyProgressData('exercise').target} minutes</div>
                </div>
                <div className="mini-progress">
                  <svg className="progress-ring" width="40" height="40">
                    <circle 
                      className="ring-bg" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                    />
                    <circle 
                      className="ring-progress" 
                      cx="20" 
                      cy="20" 
                      r="16" 
                      strokeDasharray={`${getWeeklyProgressData('exercise').weeklyPercentage * 1.005} 100.5`}
                    />
                  </svg>
                  <div className="progress-percentage">
                    {getWeeklyProgressData('exercise').weeklyPercentage}%
                  </div>
                </div>
              </div>
              <div className="weekly-dots">
                {getWeeklyProgressData('exercise').weeklyData.map((completed, index) => (
                  <div 
                    key={index} 
                    className={`day-dot ${completed ? 'completed' : ''} ${
                      index === getWeeklyProgressData('exercise').currentDayIndex ? 'today' : ''
                    }`}
                  />
                ))}
              </div>
            </ProgressCard>
          </ProgressGrid>
        </ProgressSection>

        {/* Daily Goals */}
        <GoalsSection>
          <h2>🎯 Today's Goals</h2>
          <GoalsGrid>
            {goals.map(goal => {
              const Icon = goal.icon;
              return (
                <GoalCard 
                  key={goal.id} 
                  completed={goal.completed}
                  onClick={() => handleGoalClick(goal.id)}
                >
                  <div className="goal-header">
                    <div className="goal-title">
                      <Icon />
                      {goal.label}
                    </div>
                    <div className="check-icon">
                      {goal.completed && <FaCheck />}
                    </div>
                  </div>
                  <div className="goal-progress">
                    <div>
                      {goal.completed 
                        ? '✅ Completed today! Come back tomorrow' 
                        : 'Click to mark as complete'}
                    </div>
                    <div className="goal-contribution">
                      Today's contribution: {goal.contribution || 0} {goal.unit}
                    </div>
                  </div>
                </GoalCard>
              );
            })}
          </GoalsGrid>
        </GoalsSection>
      </DashboardGrid>

      {/* Today's Meals */}
      <MealsSection>
        <h2><FaUtensils /> Today's Meal Plan</h2>
        {todayMeals.length > 0 ? (
          <MealsGrid>
            {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
              const meals = groupedMeals[mealType] || [];
              const mealIcons = {
                breakfast: '🥞',
                lunch: '🥗',
                dinner: '🍽️',
                snack: '🍎'
              };

              return (
                <MealTypeSection key={mealType}>
                  <h3>
                    <span>{mealIcons[mealType]}</span>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                      ({meals.length} meal{meals.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  {meals.length > 0 ? (
                    meals.map((mealItem, index) => (
                      <MealCard 
                        key={`${mealType}-${index}`}
                        meal={mealItem.meal} 
                      />
                    ))
                  ) : (
                    <EmptyState>
                      <div className="icon">🍽️</div>
                      <div>No {mealType} planned</div>
                    </EmptyState>
                  )}
                </MealTypeSection>
              );
            })}
          </MealsGrid>
        ) : (
          <EmptyState>
            <div className="icon">🍽️</div>
            <h3>No meals planned for today</h3>
            <p>Create a meal plan to track your nutrition goals and see your progress!</p>
            <button 
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
              onClick={() => navigate('/meal-plan')}
            >
              Create Meal Plan
            </button>
          </EmptyState>
        )}
      </MealsSection>
    </DashboardContainer>
  );
}