import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaMapMarkerAlt, 
  FaUtensils, 
  FaClock, 
  FaFire,
  FaLeaf,
  FaHeart,
  FaEye,
  FaStar,
  FaGlobe
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Main Container
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
`;

// Title
const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Header Section  
const ExplorerHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0, 181, 176, 0.1), rgba(0, 181, 176, 0.05));
  border-radius: 25px;
  border: 1px solid rgba(0, 181, 176, 0.2);
  
  p {
    font-size: 1.3rem;
    color: var(--text-muted);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  .stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-top: 2rem;
    
    .stat {
      text-align: center;
      
      .number {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary);
        display: block;
      }
      
      .label {
        font-size: 0.9rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
      }
    }
  }
`;

// Main Content Grid
const ExplorerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// Interactive Map Container
const MapSection = styled.div`
  background: var(--card-bg);
  border-radius: 25px;
  padding: 2rem;
  border: 1px solid var(--border);
  position: relative;
  min-height: 700px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  .map-header {
    margin-bottom: 2rem;
    
    h2 {
      color: var(--text-light);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.8rem;
      text-align: center;
      justify-content: center;
    }
  }
  
  .leaflet-container {
    height: 500px;
    width: 100%;
    border-radius: 20px;
    z-index: 1;
  }
  
  .map-legend {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.8);
    padding: 1rem;
    border-radius: 10px;
    font-size: 0.8rem;
    z-index: 1000;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: var(--text-light);
      
      .legend-color {
        width: 15px;
        height: 15px;
        border-radius: 3px;
      }
    }
  }
`;

// State Info Panel
const StateInfoPanel = styled.div`
  background: var(--card-bg);
  border-radius: 25px;
  padding: 2rem;
  border: 1px solid var(--border);
  height: fit-content;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  .state-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(0, 181, 176, 0.2);
    
    .state-flag {
      width: 80px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 5px 15px rgba(0, 181, 176, 0.3);
    }
    
    .state-info {
      flex: 1;
      
      h3 {
        color: var(--text-light);
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }
      
      .state-stats {
        display: flex;
        gap: 1rem;
        
        .stat {
          color: var(--text-muted);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          
          svg {
            color: var(--primary);
          }
        }
      }
    }
  }
  
  .state-description {
    color: var(--text-light);
    line-height: 1.7;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.05), rgba(0, 181, 176, 0.02));
    border-radius: 15px;
    border-left: 4px solid var(--primary);
    font-size: 1.1rem;
  }
  
  .famous-dishes {
    h4 {
      color: var(--text-light);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.4rem;
      font-weight: 700;
    }
  }
  
  .no-selection {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-muted);
    
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: var(--primary);
      opacity: 0.5;
    }
    
    h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--text-light);
    }
    
    p {
      font-size: 1.1rem;
      line-height: 1.6;
    }
  }
`;

// Enhanced Dish Card
const DishCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 181, 176, 0.05), rgba(0, 181, 176, 0.02));
  border-radius: 18px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.1), rgba(0, 181, 176, 0.05));
    border-color: var(--primary);
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 181, 176, 0.2);
  }
  
  .dish-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    
    .dish-name {
      font-weight: 700;
      color: var(--text-light);
      font-size: 1.3rem;
      margin-bottom: 0.25rem;
    }
    
    .dish-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #FFD700;
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .dish-type {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      
      &.veg {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }
      
      &.non-veg {
        background: rgba(255, 87, 34, 0.2);
        color: #FF5722;
        border: 1px solid rgba(255, 87, 34, 0.3);
      }
    }
  }
  
  .dish-description {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  
  .dish-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-muted);
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      
      svg {
        color: var(--primary);
      }
      
      .value {
        font-weight: 600;
        color: var(--text-light);
      }
    }
  }
  
  .dish-actions {
    display: flex;
    gap: 0.75rem;
    
    .action-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      flex: 1;
      justify-content: center;
      
      &:hover {
        background: var(--primary-light);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 181, 176, 0.3);
      }
      
      &.secondary {
        background: rgba(0, 181, 176, 0.1);
        color: var(--primary);
        border: 1px solid rgba(0, 181, 176, 0.3);
        
        &:hover {
          background: rgba(0, 181, 176, 0.2);
          border-color: var(--primary);
        }
      }
    }
  }
`;

// Comprehensive state data with authentic Indian cuisine for all 28 states
const stateData = {
  'andhrapradesh': {
    name: 'Andhra Pradesh',
    flag: '🌶️',
    description: 'Known for its fiery and spicy cuisine, Andhra Pradesh offers bold flavors with generous use of red chilies, tamarind, and curry leaves.',
    dishes: [
      {
        name: 'Hyderabadi Biryani',
        type: 'non-veg',
        description: 'Aromatic basmati rice layered with marinated mutton and cooked in dum style',
        calories: 650,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.9,
        region: 'Hyderabad'
      },
      {
        name: 'Gongura Mutton',
        type: 'non-veg',
        description: 'Tangy mutton curry made with sorrel leaves, a signature Andhra dish',
        calories: 420,
        cookTime: '90 min',
        difficulty: 'Medium',
        rating: 4.7,
        region: 'Andhra Pradesh'
      }
    ]
  },
  'arunachalpradesh': {
    name: 'Arunachal Pradesh',
    flag: '🏔️',
    description: 'The land of dawn-lit mountains offers simple, wholesome cuisine with bamboo shoots, fermented foods, and minimal spices.',
    dishes: [
      {
        name: 'Thukpa',
        type: 'non-veg',
        description: 'Hearty noodle soup with vegetables and meat, perfect for cold weather',
        calories: 350,
        cookTime: '45 min',
        difficulty: 'Easy',
        rating: 4.5,
        region: 'Tawang'
      },
      {
        name: 'Bamboo Shoot Curry',
        type: 'veg',
        description: 'Traditional curry made with fresh bamboo shoots and local herbs',
        calories: 180,
        cookTime: '30 min',
        difficulty: 'Medium',
        rating: 4.3,
        region: 'Itanagar'
      }
    ]
  },
  'assam': {
    name: 'Assam',
    flag: '🌿',
    description: 'Home to world-famous tea and unique cuisine featuring bamboo shoots, fish, and minimal oil with maximum flavor.',
    dishes: [
      {
        name: 'Assam Fish Curry',
        type: 'non-veg',
        description: 'Light and tangy fish curry cooked with tomatoes and lemon',
        calories: 280,
        cookTime: '25 min',
        difficulty: 'Easy',
        rating: 4.6,
        region: 'Guwahati'
      },
      {
        name: 'Masor Tenga',
        type: 'non-veg',
        description: 'Sour fish curry with elephant apple and tomatoes',
        calories: 250,
        cookTime: '30 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Assam'
      }
    ]
  },
  'bihar': {
    name: 'Bihar',
    flag: '🌾',
    description: 'Simple, rustic cuisine featuring lentils, vegetables, and sattu (roasted gram flour) with traditional cooking methods.',
    dishes: [
      {
        name: 'Litti Chokha',
        type: 'veg',
        description: 'Roasted wheat balls stuffed with sattu served with mashed vegetables',
        calories: 400,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.8,
        region: 'Patna'
      },
      {
        name: 'Sattu Drink',
        type: 'veg',
        description: 'Refreshing drink made from roasted gram flour with spices',
        calories: 150,
        cookTime: '5 min',
        difficulty: 'Easy',
        rating: 4.4,
        region: 'Bihar'
      }
    ]
  },
  'chhattisgarh': {
    name: 'Chhattisgarh',
    flag: '🌾',
    description: 'Tribal-influenced cuisine with unique preparations of rice, lentils, and local vegetables with minimal spices.',
    dishes: [
      {
        name: 'Chila',
        type: 'veg',
        description: 'Rice flour pancakes served with chutneys and curry',
        calories: 220,
        cookTime: '20 min',
        difficulty: 'Easy',
        rating: 4.3,
        region: 'Raipur'
      },
      {
        name: 'Bore Basi',
        type: 'veg',
        description: 'Fermented rice dish served with salt, onions, and green chilies',
        calories: 180,
        cookTime: '480 min',
        difficulty: 'Easy',
        rating: 4.2,
        region: 'Chhattisgarh'
      }
    ]
  },
  'goa': {
    name: 'Goa',
    flag: '🏖️',
    description: 'Portuguese-influenced coastal cuisine with abundant seafood, coconut, and unique spice blends.',
    dishes: [
      {
        name: 'Fish Curry Rice',
        type: 'non-veg',
        description: 'Goan fish curry with coconut milk served with steamed rice',
        calories: 380,
        cookTime: '35 min',
        difficulty: 'Medium',
        rating: 4.8,
        region: 'Panaji'
      },
      {
        name: 'Bebinca',
        type: 'veg',
        description: 'Traditional layered dessert made with coconut milk and jaggery',
        calories: 320,
        cookTime: '90 min',
        difficulty: 'Hard',
        rating: 4.6,
        region: 'Goa'
      }
    ]
  },
  'gujarat': {
    name: 'Gujarat',
    flag: '🥛',
    description: 'Predominantly vegetarian cuisine known for its sweet and savory combinations, dhoklas, and thalis.',
    dishes: [
      {
        name: 'Dhokla',
        type: 'veg',
        description: 'Steamed fermented rice and chickpea flour cake, light and fluffy',
        calories: 200,
        cookTime: '30 min',
        difficulty: 'Medium',
        rating: 4.7,
        region: 'Ahmedabad'
      },
      {
        name: 'Gujarati Thali',
        type: 'veg',
        description: 'Complete meal with variety of curries, breads, rice, and sweets',
        calories: 800,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.9,
        region: 'Gujarat'
      }
    ]
  },
  'haryana': {
    name: 'Haryana',
    flag: '🌾',
    description: 'Simple, hearty cuisine with emphasis on dairy products, wheat, and seasonal vegetables.',
    dishes: [
      {
        name: 'Bajra Khichdi',
        type: 'veg',
        description: 'Pearl millet cooked with lentils and vegetables',
        calories: 300,
        cookTime: '45 min',
        difficulty: 'Easy',
        rating: 4.4,
        region: 'Gurugram'
      },
      {
        name: 'Kadhi Pakora',
        type: 'veg',
        description: 'Yogurt-based curry with gram flour fritters',
        calories: 350,
        cookTime: '40 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Haryana'
      }
    ]
  },
  'himachalpradesh': {
    name: 'Himachal Pradesh',
    flag: '🏔️',
    description: 'Mountain cuisine featuring hearty meals with local grains, dairy, and preserved foods suitable for cold climate.',
    dishes: [
      {
        name: 'Dham',
        type: 'veg',
        description: 'Traditional festive meal served on leaf plates with rice, dal, and vegetables',
        calories: 600,
        cookTime: '180 min',
        difficulty: 'Hard',
        rating: 4.8,
        region: 'Shimla'
      },
      {
        name: 'Siddu',
        type: 'veg',
        description: 'Steamed bread stuffed with poppy seeds or walnuts',
        calories: 280,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Himachal Pradesh'
      }
    ]
  },
  'jharkhand': {
    name: 'Jharkhand',
    flag: '🌿',
    description: 'Tribal cuisine with unique preparations of rice, seasonal vegetables, and minimal use of oil and spices.',
    dishes: [
      {
        name: 'Handia',
        type: 'veg',
        description: 'Traditional fermented rice drink with medicinal herbs',
        calories: 120,
        cookTime: '720 min',
        difficulty: 'Medium',
        rating: 4.2,
        region: 'Ranchi'
      },
      {
        name: 'Rugra',
        type: 'veg',
        description: 'Curry made from mushrooms found in the forests',
        calories: 150,
        cookTime: '25 min',
        difficulty: 'Easy',
        rating: 4.3,
        region: 'Jharkhand'
      }
    ]
  },
  'karnataka': {
    name: 'Karnataka',
    flag: '☕',
    description: 'Diverse cuisine varying from coastal Mangalorean to North Karnataka specialties, famous for filter coffee and dosas.',
    dishes: [
      {
        name: 'Mysore Pak',
        type: 'veg',
        description: 'Rich sweet made with ghee, sugar, and gram flour',
        calories: 400,
        cookTime: '30 min',
        difficulty: 'Hard',
        rating: 4.8,
        region: 'Mysore'
      },
      {
        name: 'Bisi Bele Bath',
        type: 'veg',
        description: 'Spicy rice dish cooked with lentils and vegetables',
        calories: 350,
        cookTime: '45 min',
        difficulty: 'Medium',
        rating: 4.6,
        region: 'Bangalore'
      }
    ]
  },
  'kerala': {
    name: 'Kerala',
    flag: '🥥',
    description: 'God\'s own country with coconut-rich cuisine, abundant seafood, and aromatic spices from the Western Ghats.',
    dishes: [
      {
        name: 'Fish Curry',
        type: 'non-veg',
        description: 'Traditional coconut-based fish curry with curry leaves and spices',
        calories: 320,
        cookTime: '30 min',
        difficulty: 'Medium',
        rating: 4.7,
        region: 'Coastal Kerala'
      },
      {
        name: 'Appam with Stew',
        type: 'veg',
        description: 'Fermented rice pancakes served with coconut milk-based vegetable stew',
        calories: 250,
        cookTime: '480 min',
        difficulty: 'Hard',
        rating: 4.5,
        region: 'Central Kerala'
      }
    ]
  },
  'madhyapradesh': {
    name: 'Madhya Pradesh',
    flag: '🦁',
    description: 'Heart of India with diverse cuisine featuring wheat-based dishes, sweets, and regional specialties from different regions.',
    dishes: [
      {
        name: 'Poha',
        type: 'veg',
        description: 'Flattened rice dish cooked with onions, curry leaves, and peanuts',
        calories: 250,
        cookTime: '15 min',
        difficulty: 'Easy',
        rating: 4.6,
        region: 'Indore'
      },
      {
        name: 'Dal Bafla',
        type: 'veg',
        description: 'Steamed and baked wheat dumplings served with dal and ghee',
        calories: 380,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Madhya Pradesh'
      }
    ]
  },
  'maharashtra': {
    name: 'Maharashtra',
    flag: '🏛️',
    description: 'The land of warriors and rich culinary traditions. Maharashtra\'s cuisine varies from the coastal Konkan region to the spicy Vidarbha region, offering a diverse palette of flavors.',
    dishes: [
      {
        name: 'Vada Pav',
        type: 'veg',
        description: 'Mumbai\'s beloved street food - deep-fried potato dumpling served in a bun with chutneys',
        calories: 300,
        cookTime: '30 min',
        difficulty: 'Easy',
        rating: 4.8,
        region: 'Mumbai'
      },
      {
        name: 'Misal Pav',
        type: 'veg',
        description: 'Spicy curry made of sprouted moth beans topped with farsan, onions, and served with bread',
        calories: 400,
        cookTime: '45 min',
        difficulty: 'Medium',
        rating: 4.6,
        region: 'Pune'
      },
      {
        name: 'Puran Poli',
        type: 'veg',
        description: 'Traditional sweet flatbread stuffed with jaggery and chana dal filling',
        calories: 350,
        cookTime: '60 min',
        difficulty: 'Hard',
        rating: 4.7,
        region: 'Rural Maharashtra'
      },
      {
        name: 'Koliwada Prawns',
        type: 'non-veg',
        description: 'Crispy fried prawns with a spicy batter, originated from the Koli community',
        calories: 280,
        cookTime: '25 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Coastal Maharashtra'
      }
    ]
  },
  'manipur': {
    name: 'Manipur',
    flag: '🌸',
    description: 'Northeastern cuisine with unique fermented ingredients, bamboo shoots, and emphasis on boiled and steamed foods.',
    dishes: [
      {
        name: 'Eromba',
        type: 'veg',
        description: 'Mashed vegetable curry with fermented fish and chilies',
        calories: 200,
        cookTime: '25 min',
        difficulty: 'Medium',
        rating: 4.4,
        region: 'Imphal'
      },
      {
        name: 'Singju',
        type: 'veg',
        description: 'Fresh salad made with seasonal vegetables and herbs',
        calories: 120,
        cookTime: '10 min',
        difficulty: 'Easy',
        rating: 4.3,
        region: 'Manipur'
      }
    ]
  },
  'meghalaya': {
    name: 'Meghalaya',
    flag: '☔',
    description: 'Land of clouds with Khasi, Jaintia, and Garo cuisines featuring pork, rice, and unique fermented foods.',
    dishes: [
      {
        name: 'Jadoh',
        type: 'non-veg',
        description: 'Red rice cooked with pork and black sesame',
        calories: 450,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Shillong'
      },
      {
        name: 'Tungrymbai',
        type: 'veg',
        description: 'Fermented soybean curry with pork or vegetables',
        calories: 280,
        cookTime: '40 min',
        difficulty: 'Medium',
        rating: 4.2,
        region: 'Meghalaya'
      }
    ]
  },
  'mizoram': {
    name: 'Mizoram',
    flag: '🦅',
    description: 'Simple cuisine with minimal spices, featuring bamboo shoots, fish, and meat preparations with unique cooking methods.',
    dishes: [
      {
        name: 'Bai',
        type: 'veg',
        description: 'Traditional stew made with vegetables and herbs',
        calories: 180,
        cookTime: '30 min',
        difficulty: 'Easy',
        rating: 4.3,
        region: 'Aizawl'
      },
      {
        name: 'Sawhchiar',
        type: 'veg',
        description: 'Rice dish flavored with ginger and served with vegetables',
        calories: 220,
        cookTime: '25 min',
        difficulty: 'Easy',
        rating: 4.1,
        region: 'Mizoram'
      }
    ]
  },
  'nagaland': {
    name: 'Nagaland',
    flag: '🌶️',
    description: 'Tribal cuisine known for its fiery dishes, smoked meats, and use of bhut jolokia (ghost pepper).',
    dishes: [
      {
        name: 'Smoked Pork Curry',
        type: 'non-veg',
        description: 'Traditional pork curry with bamboo shoots and ghost peppers',
        calories: 400,
        cookTime: '90 min',
        difficulty: 'Medium',
        rating: 4.6,
        region: 'Kohima'
      },
      {
        name: 'Axone',
        type: 'veg',
        description: 'Fermented soybean curry with vegetables and spices',
        calories: 250,
        cookTime: '35 min',
        difficulty: 'Medium',
        rating: 4.3,
        region: 'Nagaland'
      }
    ]
  },
  'odisha': {
    name: 'Odisha',
    flag: '🏛️',
    description: 'Ancient culinary traditions with temple foods, sweets, and unique preparations of rice and lentils.',
    dishes: [
      {
        name: 'Pakhala Bhata',
        type: 'veg',
        description: 'Fermented rice served with yogurt, vegetables, and fried fish',
        calories: 300,
        cookTime: '480 min',
        difficulty: 'Easy',
        rating: 4.5,
        region: 'Bhubaneswar'
      },
      {
        name: 'Rasgulla',
        type: 'veg',
        description: 'Spongy cottage cheese balls in sugar syrup (originated in Odisha)',
        calories: 180,
        cookTime: '45 min',
        difficulty: 'Hard',
        rating: 4.8,
        region: 'Cuttack'
      }
    ]
  },
  'punjab': {
    name: 'Punjab',
    flag: '🌾',
    description: 'The land of five rivers, known for its robust and hearty cuisine with rich gravies and fresh dairy products.',
    dishes: [
      {
        name: 'Butter Chicken',
        type: 'non-veg',
        description: 'Creamy tomato-based curry with tender chicken pieces, a global favorite',
        calories: 520,
        cookTime: '45 min',
        difficulty: 'Medium',
        rating: 4.8,
        region: 'Delhi/Punjab'
      },
      {
        name: 'Sarson Ka Saag',
        type: 'veg',
        description: 'Traditional mustard greens curry served with makki ki roti',
        calories: 280,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.6,
        region: 'Rural Punjab'
      }
    ]
  },
  'rajasthan': {
    name: 'Rajasthan',
    flag: '🏰',
    description: 'The royal state known for its majestic palaces and rich, hearty cuisine that reflects the desert landscape and royal heritage.',
    dishes: [
      {
        name: 'Dal Baati Churma',
        type: 'veg',
        description: 'Traditional Rajasthani dish with hard wheat rolls served with dal and sweet churma',
        calories: 450,
        cookTime: '90 min',
        difficulty: 'Hard',
        rating: 4.9,
        region: 'Rural Rajasthan'
      },
      {
        name: 'Laal Maas',
        type: 'non-veg',
        description: 'Fiery red mutton curry cooked with red chillies and traditional spices',
        calories: 380,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.7,
        region: 'Jodhpur'
      }
    ]
  },
  'sikkim': {
    name: 'Sikkim',
    flag: '🏔️',
    description: 'Himalayan cuisine influenced by Nepali, Tibetan, and Bengali foods with momos, noodles, and fermented foods.',
    dishes: [
      {
        name: 'Momos',
        type: 'non-veg',
        description: 'Steamed dumplings filled with meat or vegetables',
        calories: 280,
        cookTime: '45 min',
        difficulty: 'Medium',
        rating: 4.7,
        region: 'Gangtok'
      },
      {
        name: 'Gundruk',
        type: 'veg',
        description: 'Fermented leafy green vegetable curry',
        calories: 120,
        cookTime: '20 min',
        difficulty: 'Easy',
        rating: 4.2,
        region: 'Sikkim'
      }
    ]
  },
  'tamilnadu': {
    name: 'Tamil Nadu',
    flag: '🌴',
    description: 'Ancient Tamil culture reflects in its diverse cuisine, from Chettinad spices to South Indian comfort foods.',
    dishes: [
      {
        name: 'Chettinad Chicken',
        type: 'non-veg',
        description: 'Spicy chicken curry with roasted spices from the Chettinad region',
        calories: 400,
        cookTime: '60 min',
        difficulty: 'Hard',
        rating: 4.8,
        region: 'Chettinad'
      },
      {
        name: 'Idli Sambar',
        type: 'veg',
        description: 'Steamed rice cakes served with lentil-based vegetable curry',
        calories: 200,
        cookTime: '480 min',
        difficulty: 'Medium',
        rating: 4.6,
        region: 'Throughout Tamil Nadu'
      }
    ]
  },
  'telangana': {
    name: 'Telangana',
    flag: '💎',
    description: 'Rich culinary heritage with royal Nizami influence, known for biryanis, kebabs, and traditional sweets.',
    dishes: [
      {
        name: 'Hyderabadi Haleem',
        type: 'non-veg',
        description: 'Slow-cooked stew of meat, lentils, and wheat',
        calories: 450,
        cookTime: '180 min',
        difficulty: 'Hard',
        rating: 4.8,
        region: 'Hyderabad'
      },
      {
        name: 'Qubani Ka Meetha',
        type: 'veg',
        description: 'Sweet dessert made from dried apricots',
        calories: 280,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Hyderabad'
      }
    ]
  },
  'tripura': {
    name: 'Tripura',
    flag: '🐟',
    description: 'Bengali-influenced cuisine with tribal elements, featuring fish, rice, and indigenous vegetables.',
    dishes: [
      {
        name: 'Mui Borok',
        type: 'veg',
        description: 'Traditional Tripuri curry made with dried fish and vegetables',
        calories: 220,
        cookTime: '30 min',
        difficulty: 'Medium',
        rating: 4.3,
        region: 'Agartala'
      },
      {
        name: 'Chakhwi',
        type: 'veg',
        description: 'Bamboo shoot curry with dried fish',
        calories: 180,
        cookTime: '25 min',
        difficulty: 'Easy',
        rating: 4.1,
        region: 'Tripura'
      }
    ]
  },
  'uttarakhand': {
    name: 'Uttarakhand',
    flag: '⛰️',
    description: 'Mountain cuisine from the land of gods, featuring simple, nutritious foods suitable for high altitude living.',
    dishes: [
      {
        name: 'Kafuli',
        type: 'veg',
        description: 'Green leafy vegetable curry with iron-rich spinach',
        calories: 150,
        cookTime: '25 min',
        difficulty: 'Easy',
        rating: 4.4,
        region: 'Garhwal'
      },
      {
        name: 'Bhang Ki Chutney',
        type: 'veg',
        description: 'Traditional chutney made from hemp seeds',
        calories: 80,
        cookTime: '10 min',
        difficulty: 'Easy',
        rating: 4.2,
        region: 'Kumaon'
      }
    ]
  },
  'uttarpradesh': {
    name: 'Uttar Pradesh',
    flag: '🕌',
    description: 'Diverse cuisine from Awadhi to Mughlai, featuring kebabs, biryanis, and sweets from various cultural influences.',
    dishes: [
      {
        name: 'Lucknowi Biryani',
        type: 'non-veg',
        description: 'Aromatic rice dish with tender meat cooked in Awadhi style',
        calories: 580,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.9,
        region: 'Lucknow'
      },
      {
        name: 'Petha',
        type: 'veg',
        description: 'Traditional sweet made from ash gourd',
        calories: 200,
        cookTime: '90 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Agra'
      }
    ]
  },
  'westbengal': {
    name: 'West Bengal',
    flag: '🐟',
    description: 'The cultural capital of India, known for its love of fish, rice, and sweets. Bengali cuisine is a perfect blend of subtle and fiery flavors.',
    dishes: [
      {
        name: 'Machher Jhol',
        type: 'non-veg',
        description: 'Traditional Bengali fish curry cooked with potatoes and spices',
        calories: 280,
        cookTime: '30 min',
        difficulty: 'Medium',
        rating: 4.8,
        region: 'Kolkata'
      },
      {
        name: 'Rasgulla',
        type: 'veg',
        description: 'Soft, spongy cottage cheese balls soaked in sugar syrup',
        calories: 180,
        cookTime: '45 min',
        difficulty: 'Hard',
        rating: 4.9,
        region: 'Kolkata'
      }
    ]
  },
  'haryana': {
    name: 'Haryana',
    flag: '🥛',
    description: 'Rich dairy-based cuisine with hearty meals suited for agricultural lifestyle.',
    dishes: [
      {
        name: 'Bajre ki Roti',
        type: 'veg',
        description: 'Pearl millet flatbread served with jaggery and butter',
        calories: 250,
        cookTime: '30 min',
        difficulty: 'Easy',
        rating: 4.3,
        region: 'Gurugram'
      }
    ]
  },
  'himachalpradesh': {
    name: 'Himachal Pradesh',
    flag: '🏔️',
    description: 'Mountain cuisine with hearty dishes to combat cold weather, featuring meat, dairy, and preserved foods.',
    dishes: [
      {
        name: 'Dham',
        type: 'veg',
        description: 'Traditional feast with rice, dal, rajma, and sweet rice',
        calories: 600,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.7,
        region: 'Kangra'
      }
    ]
  },
  'uttarakhand': {
    name: 'Uttarakhand',
    flag: '⛰️',
    description: 'Pahadi cuisine with nutritious mountain foods, including unique grains and seasonal vegetables.',
    dishes: [
      {
        name: 'Aloo ke Gutke',
        type: 'veg',
        description: 'Spiced baby potatoes cooked with local herbs',
        calories: 200,
        cookTime: '35 min',
        difficulty: 'Easy',
        rating: 4.4,
        region: 'Dehradun'
      }
    ]
  },
  'jammuandkashmir': {
    name: 'Jammu and Kashmir',
    flag: '🍖',
    description: 'Rich Kashmiri cuisine with Persian influences, known for wazwan and extensive use of spices.',
    dishes: [
      {
        name: 'Rogan Josh',
        type: 'non-veg',
        description: 'Aromatic lamb curry with Kashmiri spices',
        calories: 400,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.9,
        region: 'Srinagar'
      }
    ]
  },
  'assam': {
    name: 'Assam',
    flag: '🐟',
    description: 'Northeastern cuisine with emphasis on rice, fish, and indigenous herbs and vegetables.',
    dishes: [
      {
        name: 'Assam Fish Curry',
        type: 'non-veg',
        description: 'Tangy fish curry with tomatoes and local herbs',
        calories: 280,
        cookTime: '40 min',
        difficulty: 'Medium',
        rating: 4.6,
        region: 'Guwahati'
      }
    ]
  },
  'arunachalpradesh': {
    name: 'Arunachal Pradesh',
    flag: '🦌',
    description: 'Tribal cuisine with bamboo shoot preparations, fermented foods, and game meat.',
    dishes: [
      {
        name: 'Thukpa',
        type: 'non-veg',
        description: 'Hearty noodle soup with vegetables and meat',
        calories: 350,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Itanagar'
      }
    ]
  },
  'nagaland': {
    name: 'Nagaland',
    flag: '🌶️',
    description: 'Naga cuisine known for extremely spicy food, fermented ingredients, and unique cooking methods.',
    dishes: [
      {
        name: 'Naga Pork Curry',
        type: 'non-veg',
        description: 'Spicy pork curry with bhut jolokia and local herbs',
        calories: 450,
        cookTime: '90 min',
        difficulty: 'Hard',
        rating: 4.7,
        region: 'Kohima'
      }
    ]
  },
  'manipur': {
    name: 'Manipur',
    flag: '🐟',
    description: 'Cuisine centered around rice and fish, with minimal use of oil and emphasis on boiled foods.',
    dishes: [
      {
        name: 'Eromba',
        type: 'non-veg',
        description: 'Mashed vegetable and fish curry with fermented fish',
        calories: 220,
        cookTime: '45 min',
        difficulty: 'Medium',
        rating: 4.4,
        region: 'Imphal'
      }
    ]
  },
  'mizoram': {
    name: 'Mizoram',
    flag: '🌿',
    description: 'Simple cuisine with boiled vegetables, meat, and rice as staples, minimal use of spices.',
    dishes: [
      {
        name: 'Bai',
        type: 'non-veg',
        description: 'Traditional stew with pork, vegetables, and local herbs',
        calories: 300,
        cookTime: '75 min',
        difficulty: 'Medium',
        rating: 4.3,
        region: 'Aizawl'
      }
    ]
  },
  'tripura': {
    name: 'Tripura',
    flag: '🦐',
    description: 'Bengali-influenced cuisine with rice, fish, and seasonal vegetables as primary ingredients.',
    dishes: [
      {
        name: 'Mui Borok',
        type: 'non-veg',
        description: 'Traditional dried fish preparation with bamboo shoots',
        calories: 250,
        cookTime: '50 min',
        difficulty: 'Medium',
        rating: 4.2,
        region: 'Agartala'
      }
    ]
  },
  'meghalaya': {
    name: 'Meghalaya',
    flag: '🐷',
    description: 'Khasi and Garo tribal cuisine with pork, rice, and local herbs, often cooked in bamboo.',
    dishes: [
      {
        name: 'Jadoh',
        type: 'non-veg',
        description: 'Red rice cooked with pork and local spices',
        calories: 380,
        cookTime: '60 min',
        difficulty: 'Medium',
        rating: 4.5,
        region: 'Shillong'
      }
    ]
  },
  'sikkim': {
    name: 'Sikkim',
    flag: '🥟',
    description: 'Himalayan cuisine with Tibetan and Nepali influences, featuring momos, noodles, and fermented foods.',
    dishes: [
      {
        name: 'Momo',
        type: 'non-veg',
        description: 'Steamed dumplings filled with meat or vegetables',
        calories: 200,
        cookTime: '45 min',
        difficulty: 'Medium',
        rating: 4.8,
        region: 'Gangtok'
      }
    ]
  },
  'goa': {
    name: 'Goa',
    flag: '🥥',
    description: 'Portuguese-influenced coastal cuisine with abundant seafood, coconut, and spices.',
    dishes: [
      {
        name: 'Fish Curry Rice',
        type: 'non-veg',
        description: 'Coconut-based fish curry served with steamed rice',
        calories: 380,
        cookTime: '40 min',
        difficulty: 'Medium',
        rating: 4.7,
        region: 'Panaji'
      },
      {
        name: 'Bebinca',
        type: 'veg',
        description: 'Traditional layered dessert made with coconut milk and eggs',
        calories: 320,
        cookTime: '120 min',
        difficulty: 'Hard',
        rating: 4.6,
        region: 'Throughout Goa'
      }
    ]
  },
  'default': {
    name: 'Explore India\'s Cuisine',
    flag: '🇮🇳',
    description: 'India\'s culinary landscape is as diverse as its culture. Each state offers unique flavors, cooking techniques, and traditional dishes passed down through generations.',
    dishes: []
  }
};

// Comprehensive India GeoJSON data for all 28 states
const indiaGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Maharashtra", "id": "maharashtra" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [72.6, 15.6], [74.2, 15.8], [76.8, 16.5], [79.5, 17.2], [80.0, 19.0], [79.2, 20.8], [77.5, 21.5], [75.0, 21.2], [73.2, 20.0], [72.6, 18.0], [72.6, 15.6]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Rajasthan", "id": "rajasthan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [69.5, 23.0], [72.5, 23.8], [75.2, 25.2], [77.0, 27.0], [76.8, 29.5], [75.0, 30.2], [72.2, 29.0], [70.0, 26.5], [69.5, 24.0], [69.5, 23.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Punjab", "id": "punjab" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [74.0, 29.5], [75.5, 30.0], [76.5, 31.2], [76.8, 32.2], [75.5, 32.5], [74.2, 31.8], [74.0, 30.2], [74.0, 29.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Kerala", "id": "kerala" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [74.8, 8.2], [75.8, 8.8], [76.8, 10.2], [77.4, 11.8], [76.8, 12.8], [75.5, 12.2], [75.0, 10.8], [74.8, 9.0], [74.8, 8.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Tamil Nadu", "id": "tamilnadu" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.2, 8.0], [78.5, 8.5], [80.3, 9.5], [79.8, 11.5], [78.8, 13.2], [77.5, 13.5], [76.8, 12.0], [76.5, 10.0], [76.2, 8.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "West Bengal", "id": "westbengal" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [85.8, 21.5], [87.5, 22.2], [89.8, 24.0], [89.2, 26.5], [87.8, 27.2], [86.5, 26.0], [85.8, 24.0], [85.8, 21.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Gujarat", "id": "gujarat" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [68.2, 20.1], [74.5, 20.1], [74.5, 24.7], [68.2, 24.7], [68.2, 20.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Karnataka", "id": "karnataka" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [74.0, 11.5], [78.6, 11.5], [78.6, 18.5], [74.0, 18.5], [74.0, 11.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Andhra Pradesh", "id": "andhrapradesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.8, 12.6], [84.8, 12.6], [84.8, 19.9], [76.8, 19.9], [76.8, 12.6]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Telangana", "id": "telangana" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [77.2, 15.8], [81.3, 15.8], [81.3, 19.9], [77.2, 19.9], [77.2, 15.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Odisha", "id": "odisha" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [81.3, 17.8], [87.5, 17.8], [87.5, 22.6], [81.3, 22.6], [81.3, 17.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Jharkhand", "id": "jharkhand" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [83.3, 21.9], [88.2, 21.9], [88.2, 25.3], [83.3, 25.3], [83.3, 21.9]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Bihar", "id": "bihar" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [83.3, 24.3], [88.2, 24.3], [88.2, 27.5], [83.3, 27.5], [83.3, 24.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Uttar Pradesh", "id": "uttarpradesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [77.1, 23.9], [84.6, 23.9], [84.6, 30.4], [77.1, 30.4], [77.1, 23.9]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Madhya Pradesh", "id": "madhyapradesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [74.0, 21.1], [82.8, 21.1], [82.8, 26.9], [74.0, 26.9], [74.0, 21.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Chhattisgarh", "id": "chhattisgarh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [80.2, 17.8], [84.4, 17.8], [84.4, 24.1], [80.2, 24.1], [80.2, 17.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Haryana", "id": "haryana" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [74.5, 27.4], [77.6, 27.4], [77.6, 30.9], [74.5, 30.9], [74.5, 27.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Himachal Pradesh", "id": "himachalpradesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [75.5, 30.4], [79.0, 30.4], [79.0, 33.2], [75.5, 33.2], [75.5, 30.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Uttarakhand", "id": "uttarakhand" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [77.6, 28.4], [81.0, 28.4], [81.0, 31.5], [77.6, 31.5], [77.6, 28.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Assam", "id": "assam" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [89.7, 24.1], [96.0, 24.1], [96.0, 28.2], [89.7, 28.2], [89.7, 24.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Arunachal Pradesh", "id": "arunachalpradesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [91.2, 26.6], [97.4, 26.6], [97.4, 29.5], [91.2, 29.5], [91.2, 26.6]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Nagaland", "id": "nagaland" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [93.3, 25.2], [95.8, 25.2], [95.8, 27.0], [93.3, 27.0], [93.3, 25.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Manipur", "id": "manipur" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [93.0, 23.8], [94.8, 23.8], [94.8, 25.7], [93.0, 25.7], [93.0, 23.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Mizoram", "id": "mizoram" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [92.2, 21.9], [93.7, 21.9], [93.7, 24.5], [92.2, 24.5], [92.2, 21.9]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Tripura", "id": "tripura" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [91.0, 22.9], [92.7, 22.9], [92.7, 24.5], [91.0, 24.5], [91.0, 22.9]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Meghalaya", "id": "meghalaya" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [89.7, 25.0], [92.8, 25.0], [92.8, 26.1], [89.7, 26.1], [89.7, 25.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sikkim", "id": "sikkim" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [88.0, 27.0], [88.9, 27.0], [88.9, 28.1], [88.0, 28.1], [88.0, 27.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Goa", "id": "goa" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [73.7, 14.9], [74.7, 14.9], [74.7, 15.8], [73.7, 15.8], [73.7, 14.9]
        ]]
      }
    }
  ]
};

export default function FoodExplorer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('default');
  const [loading, setLoading] = useState(false);

  const currentStateData = stateData[selectedState] || stateData['default'];

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
  };

  const handleAddToFavourites = (dish) => {
    toast.success(`${dish.name} added to your favourites! ❤️`);
    // TODO: Integration with favourites system
    // navigate('/favourites', { state: { selectedDish: dish } });
  };

  const handleViewRecipe = (dish) => {
    toast.info(`Opening recipe for ${dish.name} 👨‍🍳`);
    // Open recipe modal or navigate to recipe page
  };

  // Style function for GeoJSON features
  const getFeatureStyle = (feature) => {
    const stateId = feature.properties.id;
    const isSelected = selectedState === stateId;
    const hasData = stateData[stateId] && stateData[stateId].dishes.length > 0;
    
    return {
      fillColor: isSelected 
        ? '#00B5B0' 
        : hasData 
          ? 'rgba(0, 181, 176, 0.3)' 
          : 'rgba(128, 128, 128, 0.2)',
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? '#00B5B0' : '#666',
      fillOpacity: isSelected ? 0.8 : hasData ? 0.5 : 0.3
    };
  };

  // Handle feature events
  const onEachFeature = (feature, layer) => {
    const stateId = feature.properties.id;
    const stateName = feature.properties.name;
    const hasData = stateData[stateId] && stateData[stateId].dishes.length > 0;
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#00B5B0',
          fillOpacity: 0.7
        });
      },
      mouseout: (e) => {
        e.target.setStyle(getFeatureStyle(feature));
      },
      click: (e) => {
        if (hasData) {
          handleStateClick(stateId);
        }
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <PageContainer>
      <Title>
        <FaGlobe /> Discover India's Culinary Heritage
      </Title>
      
      <ExplorerHeader>
        <p>
          Embark on a culinary journey across all 28 Indian states. Discover authentic regional dishes, traditional cooking methods, and the rich cultural heritage that makes each state's cuisine unique and extraordinary.
        </p>
        <div className="stats">
          <div className="stat">
            <span className="number">28</span>
            <span className="label">States Available</span>
          </div>
          <div className="stat">
            <span className="number">56+</span>
            <span className="label">Authentic Dishes</span>
          </div>
          <div className="stat">
            <span className="number">28</span>
            <span className="label">Regional Cuisines</span>
          </div>
        </div>
      </ExplorerHeader>

      <ExplorerGrid>
        <MapSection>
          <div className="map-header">
            <h2><FaGlobe /> India's Culinary Map</h2>
          </div>
          
          <MapContainer 
            center={[20.5937, 77.9629]} 
            zoom={5} 
            style={{ height: '500px', width: '100%', borderRadius: '20px' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON
              data={indiaGeoJSON}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
          
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'rgba(128, 128, 128, 0.3)' }}></div>
              <span>Coming Soon</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'rgba(0, 181, 176, 0.5)' }}></div>
              <span>Available States</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#00B5B0' }}></div>
              <span>Selected State</span>
            </div>
          </div>
        </MapSection>

        <StateInfoPanel>
          {selectedState === 'default' ? (
            <div className="no-selection">
              <div className="icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Select a State to Explore</h3>
              <p>
                Click on any state on the interactive map to discover its unique cuisine, traditional dishes, and culinary heritage. Each state offers a different taste of India's rich food culture.
              </p>
            </div>
          ) : (
            <>
              <div className="state-header">
                <div className="state-flag">{currentStateData.flag}</div>
                <div className="state-info">
                  <h3>{currentStateData.name}</h3>
                  <div className="state-stats">
                    <div className="stat">
                      <FaUtensils />
                      {currentStateData.dishes.length} Featured Dishes
                    </div>
                    <div className="stat">
                      <FaUtensils />
                      Traditional Recipes
                    </div>
                  </div>
                </div>
              </div>

              <div className="state-description">
                {currentStateData.description}
              </div>

              <div className="famous-dishes">
                <h4><FaUtensils /> Signature Dishes</h4>
                {currentStateData.dishes.map((dish, index) => (
                  <DishCard key={index}>
                    <div className="dish-header">
                      <div>
                        <div className="dish-name">{dish.name}</div>
                        <div className="dish-rating">
                          <FaStar />
                          {dish.rating}/5
                        </div>
                      </div>
                      <div className={`dish-type ${dish.type}`}>
                        <FaLeaf />
                        {dish.type}
                      </div>
                    </div>
                    
                    <div className="dish-description">
                      {dish.description}
                    </div>
                    
                    <div className="dish-stats">
                      <div className="stat">
                        <FaFire />
                        <span className="value">{dish.calories}</span> cal
                      </div>
                      <div className="stat">
                        <FaClock />
                        <span className="value">{dish.cookTime}</span>
                      </div>
                      <div className="stat">
                        <FaUtensils />
                        <span className="value">{dish.difficulty}</span>
                      </div>
                    </div>
                    
                    <div className="dish-actions">
                      <button 
                        className="action-btn"
                        onClick={() => handleAddToFavourites(dish)}
                      >
                        <FaHeart /> Add to Favourites
                      </button>
                      <button 
                        className="action-btn secondary"
                        onClick={() => handleViewRecipe(dish)}
                      >
                        <FaEye /> Recipe
                      </button>
                    </div>
                  </DishCard>
                ))}
              </div>
            </>
          )}
        </StateInfoPanel>
      </ExplorerGrid>
    </PageContainer>
  );
}
