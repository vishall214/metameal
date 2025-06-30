import { useState, useEffect } from 'react';
import mlService from '../services/mlService';

export const useMLRecommendations = (userProfile) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendations = async (profile = userProfile) => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    try {
      const recs = await mlService.getMealRecommendations(profile);
      setRecommendations(recs);
    } catch (err) {
      setError(err.message);
      console.error('Failed to get recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const provideFeedback = async (recommendation, feedback) => {
    try {
      await mlService.updateModelWithFeedback(userProfile, recommendation, feedback);
      // Refresh recommendations after feedback
      await getRecommendations();
    } catch (err) {
      console.error('Failed to provide feedback:', err);
    }
  };

  useEffect(() => {
    if (userProfile) {
      getRecommendations();
    }
  }, [userProfile]);

  return {
    recommendations,
    loading,
    error,
    getRecommendations,
    provideFeedback
  };
};

export const useNutritionAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeMeal = async (mealData) => {
    setLoading(true);
    try {
      const result = await mlService.analyzeNutrition(mealData);
      setAnalysis(result);
      return result;
    } catch (error) {
      console.error('Nutrition analysis failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    analyzeMeal
  };
};
