import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaChartLine, 
  FaFire, 
  FaUtensils, 
  FaCalendarWeek,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { mealPlansAPI } from '../services/api';

const AnalyticsContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: var(--text-light);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  color: var(--text-light);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
`;

const StatSubtext = styled.div`
  color: var(--text-muted);
  font-size: 0.9rem;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: ${props => 
    props.trend === 'up' ? '#22c55e' : 
    props.trend === 'down' ? '#ef4444' : 
    'var(--text-muted)'};
`;

const WeeklyChart = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h2`
  color: var(--text-light);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const DayColumn = styled.div`
  text-align: center;
`;

const DayLabel = styled.div`
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CalorieBar = styled.div`
  width: 100%;
  height: 100px;
  background: rgba(0, 181, 176, 0.1);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const CalorieFill = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, var(--primary), var(--primary-light));
  border-radius: 6px;
  height: ${props => Math.min(props.percentage, 100)}%;
  transition: height 0.5s ease;
`;

const CalorieValue = styled.div`
  color: var(--text-light);
  font-size: 0.75rem;
  font-weight: 600;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
`;

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalMeals: 0,
    avgCalories: 0,
    avgProtein: 0,
    weeklyProgress: [],
    calorieGoal: 2000
  });
  const [loading, setLoading] = useState(true);

  // Calculate analytics from meal plan data
  const calculateAnalytics = useCallback((mealPlans) => {
    if (!mealPlans || mealPlans.length === 0) {
      setAnalytics({
        totalMeals: 0,
        avgCalories: 0,
        avgProtein: 0,
        weeklyProgress: [],
        calorieGoal: user?.profile?.calorieGoal || 2000
      });
      return;
    }

    const mostRecentPlan = mealPlans[0];
    const meals = mostRecentPlan.meals || [];
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalMeals = meals.length;

    meals.forEach(mealItem => {
      const meal = mealItem.meal;
      if (meal) {
        totalCalories += Number(meal.calories) || 0;
        totalProtein += Number(meal.protein) || 0;
      }
    });

    // Calculate weekly progress
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyProgress = days.map(day => {
      const dayMeals = meals.filter(meal => meal.day === day);
      const dayCalories = dayMeals.reduce((sum, mealItem) => {
        return sum + (Number(mealItem.meal?.calories) || 0);
      }, 0);
      
      return {
        day: day.slice(0, 3),
        calories: dayCalories,
        mealCount: dayMeals.length
      };
    });

    const calorieGoal = user?.profile?.calorieGoal || 2000;

    setAnalytics({
      totalMeals,
      avgCalories: totalMeals > 0 ? Math.round(totalCalories / 7) : 0, // Daily average
      avgProtein: totalMeals > 0 ? Math.round(totalProtein / 7) : 0, // Daily average
      weeklyProgress,
      calorieGoal
    });
  }, [user?.profile?.calorieGoal]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mealPlansAPI.getAll();
      calculateAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate trends (simplified - comparing to goal)
  const getCalorieTrend = () => {
    if (analytics.avgCalories > analytics.calorieGoal * 1.1) return 'up';
    if (analytics.avgCalories < analytics.calorieGoal * 0.9) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp />;
      case 'down': return <FaArrowDown />;
      default: return <FaMinus />;
    }
  };

  if (loading) {
    return (
      <AnalyticsContainer>
        <Title>
          <FaChartLine />
          Analytics
        </Title>
        <LoadingState>Loading your analytics...</LoadingState>
      </AnalyticsContainer>
    );
  }

  const calorieTrend = getCalorieTrend();

  return (
    <AnalyticsContainer>
      <Title>
        <FaChartLine />
        Analytics Dashboard
      </Title>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>
              <FaFire />
              Daily Avg Calories
            </StatTitle>
            <TrendIndicator trend={calorieTrend}>
              {getTrendIcon(calorieTrend)}
            </TrendIndicator>
          </StatHeader>
          <StatValue>{analytics.avgCalories}</StatValue>
          <StatSubtext>Goal: {analytics.calorieGoal} cal/day</StatSubtext>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>
              <FaUtensils />
              Total Meals Planned
            </StatTitle>
          </StatHeader>
          <StatValue>{analytics.totalMeals}</StatValue>
          <StatSubtext>Across all days</StatSubtext>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>
              💪
              Daily Avg Protein
            </StatTitle>
          </StatHeader>
          <StatValue>{analytics.avgProtein}g</StatValue>
          <StatSubtext>Protein intake per day</StatSubtext>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>
              <FaCalendarWeek />
              Weekly Completion
            </StatTitle>
          </StatHeader>
          <StatValue>
            {analytics.weeklyProgress.filter(day => day.mealCount > 0).length}/7
          </StatValue>
          <StatSubtext>Days with meals planned</StatSubtext>
        </StatCard>
      </StatsGrid>

      {/* Weekly Chart */}
      <WeeklyChart>
        <ChartTitle>
          <FaChartLine />
          Weekly Calorie Distribution
        </ChartTitle>
        
        {analytics.weeklyProgress.length > 0 ? (
          <ChartContainer>
            {analytics.weeklyProgress.map((day, index) => (
              <DayColumn key={index}>
                <DayLabel>{day.day}</DayLabel>
                <CalorieBar>
                  <CalorieFill 
                    percentage={(day.calories / analytics.calorieGoal) * 100}
                  />
                </CalorieBar>
                <CalorieValue>{day.calories}</CalorieValue>
              </DayColumn>
            ))}
          </ChartContainer>
        ) : (
          <LoadingState>No meal plan data available</LoadingState>
        )}
      </WeeklyChart>
    </AnalyticsContainer>
  );
};

export default Analytics;
