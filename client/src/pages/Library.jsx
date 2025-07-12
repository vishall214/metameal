import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import MealCard from '../components/mealcard';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import usePageTitle from '../utils/usePageTitle';

const gridStyles = `
  * {
    box-sizing: border-box;
  }
  
  .library-main {
    width: 100%;
    min-height: 100vh;
    background: var(--bg-dark);
    padding: 2rem;
    margin: 0;
    overflow-x: hidden;
  }
  
  .library-content {
    width: 100%;
    max-width: 1400px;
    padding: 0;
    margin: 0 auto;
    overflow-x: hidden;
  }
  
  .library-header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    width: 100%;
    padding: 0;
  }
  
  .library-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-light);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .library-count {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    background: rgba(0, 181, 176, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .search-container {
    width: 100%;
    background: var(--card-bg);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border);
    box-sizing: border-box;
  }
  
  .search-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    align-items: center;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(0, 181, 176, 0.2);
    border-radius: 12px;
    background: var(--input-bg);
    color: var(--text-light);
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 181, 176, 0.1);
    background: rgba(255, 255, 255, 0.1);
  }
  
  .search-input::placeholder {
    color: var(--text-muted);
    font-weight: 400;
  }
  
  .category-dropdown {
    padding: 0.75rem 1rem;
    border: 1px solid rgba(0, 181, 176, 0.2);
    border-radius: 12px;
    background: var(--input-bg);
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
    font-size: 1rem;
    font-weight: 500;
  }
  
  .category-dropdown:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 181, 176, 0.1);
  }
  
  .search-btn {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  
  .search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 181, 176, 0.3);
  }
  
  .search-btn:active {
    transform: translateY(0);
  }
  
  .meals-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .error-message {
    background: var(--card-bg);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: 20px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .error-message p {
    color: #ff6b6b;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }
  
  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba(0, 181, 176, 0.2);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .no-results {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
  }
  
  .no-results h3 {
    color: var(--text-light);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .no-results p {
    font-size: 1rem;
    opacity: 0.8;
  }
  
  .load-more-container {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
    padding: 2rem 0;
  }
  
  .load-more-btn {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 1rem 2rem;
    color: var(--text-light);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 200px;
    justify-content: center;
  }
  
  .load-more-btn:hover:not(:disabled) {
    background: var(--card-hover);
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  /* Responsive Design */
  @media (max-width: 1600px) {
    .meals-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
  }
  
  @media (max-width: 1200px) {
    .meals-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }
  
  @media (max-width: 1024px) {
    .meals-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .library-main {
      padding: 1.5rem;
    }
    
    .library-title {
      font-size: 2rem;
    }
    
    .search-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
  
  @media (max-width: 768px) {
    .meals-grid {
      grid-template-columns: 1fr;
    }
    
    .library-main {
      padding: 1rem;
    }
    
    .library-title {
      font-size: 1.8rem;
    }
    
    .library-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .search-container {
      padding: 1rem;
    }
  }
  
  @media (max-width: 600px) {
    .library-title {
      font-size: 1.5rem;
    }
    
    .search-btn {
      width: 100%;
    }
    
    .library-main {
      padding: 0.5rem;
    }
  }
`;

const Library = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  usePageTitle('Food Library');
  
  const itemsPerPage = 24;
  
  // Enhanced Google Drive image URL processor for MongoDB Food collection
  const processGoogleDriveImageUrl = (photoUrl) => {
    // Default fallback image
    const fallbackImage = 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=500&h=400&fit=crop&crop=center&auto=format&q=80';
    
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim() === '') {
      return fallbackImage;
    }
    
    try {
      const url = photoUrl.trim();
      
      // Handle Google Drive URLs with enhanced parsing
      if (url.includes('drive.google.com')) {
        let fileId = null;
        
        // Multiple Google Drive URL format support
        const patterns = [
          /\/file\/d\/([a-zA-Z0-9_-]+)/,      // /file/d/ID/
          /[?&]id=([a-zA-Z0-9_-]+)/,          // ?id=ID or &id=ID
          /\/d\/([a-zA-Z0-9_-]+)/,            // /d/ID/
          /\/open\?id=([a-zA-Z0-9_-]+)/       // /open?id=ID
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            fileId = match[1];
            break;
          }
        }
        
        // Validate file ID and return optimized view URL
        if (fileId && fileId.length >= 25 && /^[a-zA-Z0-9_-]+$/.test(fileId)) {
          // Use thumbnail API for better CORS compatibility and performance
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300-c`;
        } else {
          console.warn('Invalid Google Drive file ID extracted:', fileId, 'from URL:', url);
        }
      }
      
      // Handle direct image URLs with validation
      if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) {
        return url;
      }
      
      // Handle other direct URLs (but warn about potential issues)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        console.warn('Non-image URL detected, using as-is:', url);
        return url;
      }
      
      console.warn('Unrecognized image URL format:', url);
      return fallbackImage;
      
    } catch (error) {
      console.error('Error processing image URL:', error, 'URL:', photoUrl);
      return fallbackImage;
    }
  };

  // Server connection check for Food collection
  const checkServerConnection = async () => {
    try {
      const response = await axios.get('/api/meals', { 
        timeout: 5000,
        params: { limit: 1, page: 1 }
      });
      return response.status === 200;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message === 'Network Error') {
        setError('❌ Backend server is not running. Please start the server on port 5002.');
        setLoading(false);
        return false;
      }
      // For other errors, still allow the main fetch to handle them
      console.warn('Server check failed but continuing:', err.message);
      return true; 
    }
  };

  // Enhanced meal fetching optimized for MongoDB Food collection
  useEffect(() => {
    const fetchFoodsFromCollection = async () => {
      try {
        setError(null);
        
        // Build optimized query parameters for Food collection
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });
        
        // Add search parameters if provided
        if (searchQuery && searchQuery.trim()) {
          queryParams.append('search', searchQuery.trim());
        }
        
        // Add category filter if selected
        if (filterCategory && filterCategory.trim()) {
          queryParams.append('course', filterCategory.trim());
        }
        
        // Always use the main endpoint since it supports both search and course filtering
        const endpoint = '/api/meals';
        const apiUrl = `${endpoint}?${queryParams.toString()}`;
        
        console.log('🔍 Search parameters:', {
          searchQuery: searchQuery?.trim(),
          filterCategory: filterCategory?.trim(),
          page,
          itemsPerPage,
          endpoint,
          fullUrl: apiUrl
        });
        
        // Make API request with proper timeout
        const response = await axios.get(apiUrl, { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        // Parse response data with better error handling
        let fetchedMeals = [];
        let total = 0;
        let hasMoreFromAPI = false;
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            // Old format - direct array
            fetchedMeals = response.data;
            total = response.data.length;
            hasMoreFromAPI = response.data.length >= itemsPerPage;
          } else if (response.data.meals && Array.isArray(response.data.meals)) {
            // New format with pagination info
            fetchedMeals = response.data.meals;
            total = response.data.total || response.data.meals.length;
            hasMoreFromAPI = response.data.hasMore || false;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Alternative format
            fetchedMeals = response.data.data;
            total = response.data.total || response.data.data.length;
            hasMoreFromAPI = response.data.hasMore || false;
          } else {
            console.warn('Unexpected API response format:', response.data);
            fetchedMeals = [];
          }
        }
        
        console.log('📊 API Response:', {
          fetchedCount: fetchedMeals.length,
          total,
          hasMoreFromAPI,
          page,
          searchQuery,
          filterCategory
        });
        //comment
        // Process meals with enhanced data validation and fallbacks
        const processedMeals = fetchedMeals.map((meal, index) => ({
          // MongoDB ObjectId with fallback
          _id: meal._id || meal.id || `meal-${Date.now()}-${index}`,
          
          // Basic info with validation
          name: (meal.name && meal.name.trim()) || 'Unknown Dish',
          description: (meal.description && meal.description.trim()) || 
                      (meal.ingredients && Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : '') || 
                      'No description available',
          
          // Process image URL with better error handling
          photo: processGoogleDriveImageUrl(meal.photo || meal.image || meal.photoUrl),
          originalPhotoUrl: meal.photo || meal.image || meal.photoUrl,
          
          // Category and cuisine with validation
          course: (meal.course && meal.course.toLowerCase()) || 
                 (meal.category && meal.category.toLowerCase()) || 
                 'main',
          cuisine: (meal.cuisine && meal.cuisine.trim()) || 'International',
          
          // Nutrition data with proper validation and fallbacks
          calories: Math.max(0, parseInt(meal.calories) || 0),
          protein: Math.max(0, parseFloat(meal.protein) || 0),
          carbs: Math.max(0, parseFloat(meal.carbs) || parseFloat(meal.carbohydrates) || 0),
          fat: Math.max(0, parseFloat(meal.fat) || parseFloat(meal.fats) || 0),
          
          // Additional fields with validation
          cookTime: (meal.cookTime && meal.cookTime.trim()) || 
                   (meal.prep_time && meal.prep_time.trim()) || 
                   (meal.prepTime && meal.prepTime.trim()) || 
                   '30 mins',
          ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : 
                      (meal.ingredients && typeof meal.ingredients === 'string' ? 
                       meal.ingredients.split(',').map(i => i.trim()) : []),
          
          // Keep all other fields from MongoDB
          ...meal
        }));
        
        console.log(`✅ Processed ${processedMeals.length} meals from Food collection (Page ${page})`);
        
        // Update state with improved pagination logic
        if (page === 1) {
          setFoods(processedMeals);
        } else {
          setFoods(prevMeals => {
            const existingIds = new Set(prevMeals.map(meal => meal._id));
            const newMeals = processedMeals.filter(meal => !existingIds.has(meal._id));
            return [...prevMeals, ...newMeals];
          });
        }
        
        // Update pagination state with better logic
        setTotalCount(total);
        // Use API's hasMore if available, otherwise calculate based on items received
        const calculatedHasMore = hasMoreFromAPI !== undefined ? hasMoreFromAPI : 
          (fetchedMeals.length >= itemsPerPage && fetchedMeals.length > 0);
        setHasMore(calculatedHasMore);
        
        console.log('📈 Pagination updated:', {
          totalCount: total,
          hasMore: calculatedHasMore,
          itemsReceived: fetchedMeals.length,
          currentPage: page
        });
        
      } catch (err) {
        console.error('❌ Error fetching from Food collection:', err);
        
        // Enhanced error handling with specific error types
        let errorMessage = 'Failed to load meals from database.';
        
        if (err.code === 'ECONNREFUSED') {
          errorMessage = '🔴 Cannot connect to server. Please ensure the backend is running on port 5002.';
        } else if (err.response?.status === 404) {
          errorMessage = '🔍 Food collection endpoint not found. Please check API configuration.';
        } else if (err.response?.status === 401) {
          errorMessage = '🔐 Authentication required. Please log in again.';
        } else if (err.response?.status === 403) {
          errorMessage = '🚫 Access denied. Please check your permissions.';
        } else if (err.response?.status === 500) {
          errorMessage = '💥 Database error. Please try again later.';
        } else if (err.message === 'Network Error') {
          errorMessage = '🌐 Network connection failed. Check your internet connection.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.code === 'ENOTFOUND') {
          errorMessage = '🌐 Cannot reach server. Please check your connection.';
        } else if (err.code === 'ETIMEDOUT') {
          errorMessage = '⏱️ Request timeout. Please try again.';
        }
        
        setError(errorMessage);
        
        // Only clear foods if it's the first page
        if (page === 1) {
          setFoods([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    };

    // Execute the fetch with loading state management
    const initializePage = async () => {
      // Only show loading for first page or when starting new search
      if (page === 1) {
        setLoading(true);
      }
      
      const isServerConnected = await checkServerConnection();
      if (isServerConnected) {
        await fetchFoodsFromCollection();
      }
    };

    initializePage();
  }, [page, searchQuery, filterCategory, itemsPerPage]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Clear any pending timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Reset pagination and trigger immediate search
    setPage(1);
    setHasMore(true);
    setFoods([]);
  };

  // Handle search input changes with improved debouncing
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      // Reset pagination and trigger new search
      setPage(1);
      setHasMore(true);
      setFoods([]); // Clear current results to show loading
    }, 300); // Reduced debounce time for better responsiveness
    
    setSearchTimeout(newTimeout);
  };

  // Handle category filter changes
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFilterCategory(value);
    
    // Clear any pending search timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Reset to page 1 and clear results when changing category
    setPage(1);
    setHasMore(true);
    setFoods([]);
  };

  const handleToggleFavorite = async (mealId) => {
    if (!user) {
      if (window.confirm('You need to be logged in to save favorites. Would you like to log in now?')) {
        window.location.href = '/login';
      }
      return;
    }
    
    try {
      const newFavorites = new Set(favorites);
      const isCurrentlyFavorite = newFavorites.has(mealId);
      
      if (isCurrentlyFavorite) {
        newFavorites.delete(mealId);
      } else {
        newFavorites.add(mealId);
      }
      
      setFavorites(newFavorites);
      
      // Save to localStorage as backup
      localStorage.setItem('favoritesMeals', JSON.stringify([...newFavorites]));
      
      // TODO: Also save to database via API
      // await api.post('/api/user/favorites', { mealId, action: isCurrentlyFavorite ? 'remove' : 'add' });
      
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert the change if API call fails
      setFavorites(favorites);
    }
  };

  // Load favorites from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem('favoritesMeals');
      if (savedFavorites) {
        try {
          const favoritesArray = JSON.parse(savedFavorites);
          if (Array.isArray(favoritesArray)) {
            setFavorites(new Set(favoritesArray));
          }
        } catch (e) {
          console.error('Error parsing favorites from localStorage:', e);
          // Clear corrupted data
          localStorage.removeItem('favoritesMeals');
        }
      }
    }
  }, [user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);
  return (
    <Layout>
      <style>{gridStyles}</style>
      <div className="library-main">
        <div className="library-content">
          {/* Header Section */}
          <div className="library-header">
            <h1 className="library-title">Food Library</h1>
            {totalCount > 0 && (
              <span className="library-count">
                {searchQuery || filterCategory ? 
                  `${totalCount} recipes found` : 
                  `${totalCount} recipes available`
                }
              </span>
            )}
          </div>
          
          {/* Search and Filter Section */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-grid">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or cuisine..."
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
                {searchTimeout && (
                  <div style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.8rem',
                    color: 'var(--primary)'
                  }}>
                    🔍
                  </div>
                )}
              </div>
              
              <select
                value={filterCategory}
                onChange={handleCategoryChange}
                className="category-dropdown"
              >
                <option value="">All Categories</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </select>
              
              <button type="submit" className="search-btn">
                Search
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && page === 1 && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading recipes from database...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && foods.length === 0 && !error && (
            <div className="no-results">
              <h3>No recipes found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {/* Foods Grid */}
          {!loading && foods.length > 0 && (
            <motion.div 
              className="meals-grid"
              initial="hidden"
              animate="visible"
            >
              {foods.map((meal, index) => {
                const mealId = meal._id || `meal-${index}`;
                
                return (
                  <motion.div
                    key={mealId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: (index % itemsPerPage) * 0.02,
                      ease: "easeOut"
                    }}
                  >
                    <MealCard 
                      meal={meal} 
                      isFavorite={favorites.has(mealId)} 
                      onFavoriteClick={() => handleToggleFavorite(mealId)} 
                    />
                  </motion.div>
                );
              })}
              
              {/* Loading placeholders for pagination */}
              {loading && page > 1 && Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={`loading-${index}`}
                  className="meal-card-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                />
              ))}
            </motion.div>
          )}

          {/* Load More Button */}
          {hasMore && foods.length > 0 && (
            <div className="load-more-container">
              <button
                onClick={handleLoadMore}
                className="load-more-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '1rem', height: '1rem', margin: 0 }}></div>
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Recipes
                    {totalCount > foods.length && (
                      <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>
                        ({foods.length} of {totalCount})
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Library;
