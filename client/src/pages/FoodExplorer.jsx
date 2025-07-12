import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import { 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaUtensils, 
  FaStar, 
  FaLeaf, 
  FaFire, 
  FaClock, 
  FaHeart, 
  FaEye,
  FaFilter,
  FaTrophy,
  FaBookmark,
  FaShareAlt,
  FaArrowRight,
  FaMagic,
  FaBook
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import usePageTitle from '../utils/usePageTitle';
import { indiaGeoData } from '../data/indiaGeoData';
import '../utils/leafletConfig';

// Modern animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 181, 176, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 181, 176, 0.6); }
`;

// Main container with enhanced styling
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-gradient);
  padding: 1.5rem;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(0, 181, 176, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Enhanced glassmorphic header with animations
const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  
  h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    background: linear-gradient(135deg, var(--primary), #06d6a0, #ffd166);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    
    svg {
      color: var(--primary);
      font-size: 1.5rem;
    }
  }
  
  .subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    max-width: 500px;
    margin: 0 auto 1rem;
    line-height: 1.5;
  }
`;

// Enhanced ExplorerHeader with glassmorphic design
const ExplorerHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  
  p {
    font-size: 1rem;
    color: var(--text-light);
    margin-bottom: 1.5rem;
    line-height: 1.6;
    text-align: center;
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.1);
      }
      
      .icon {
        font-size: 1.2rem;
        color: var(--primary);
        margin-bottom: 0.25rem;
      }
      
      .number {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--primary), #06d6a0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.25rem;
      }
      
      .label {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: center;
        font-weight: 500;
      }
    }
  }
`;

// Enhanced grid layout with responsive design
const ExplorerGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

// Enhanced map section with compact design
const MapSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  
  .map-header {
    margin-bottom: 1rem;
    text-align: center;
    
    h2 {
      font-size: 1.4rem;
      color: var(--text-light);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-weight: 600;
      
      svg {
        color: var(--primary);
        font-size: 1.2rem;
      }
    }
    
    .map-subtitle {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }
  }
  
  .map-container {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      pointer-events: none;
    }
  }
`;

// Enhanced state info panel with compact design
const StateInfoPanel = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow-y: auto;
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 181, 176, 0.5);
    border-radius: 2px;
    
    &:hover {
      background: rgba(0, 181, 176, 0.8);
    }
  }
  
  .no-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem 1rem;
    
    .icon {
      font-size: 2.5rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    h3 {
      font-size: 1.4rem;
      color: var(--text-light);
      margin-bottom: 0.75rem;
      font-weight: 600;
    }
    
    p {
      color: var(--text-muted);
      line-height: 1.6;
      font-size: 0.95rem;
      max-width: 280px;
    }
  }
  
  .state-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .state-flag {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .state-info {
      flex: 1;
      
      h3 {
        font-size: 1.6rem;
        background: linear-gradient(135deg, var(--text-light), var(--primary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.5rem;
        font-weight: 700;
        line-height: 1.2;
      }
      
      .state-stats {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          
          svg {
            color: var(--primary);
            font-size: 0.8rem;
          }
          
          .value {
            font-weight: 600;
            color: var(--text-light);
          }
        }
      }
    }
  }
  
  .state-description {
    color: var(--text-light);
    line-height: 1.6;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.95rem;
  }
  
  .famous-dishes {
    h4 {
      font-size: 1.3rem;
      color: var(--text-light);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      
      svg {
        color: var(--primary);
        font-size: 1.1rem;
      }
    }
    
    .dishes-grid {
      display: grid;
      gap: 1rem;
    }
    
    .loading-dishes {
      text-align: center;
      padding: 1.5rem;
      color: var(--text-muted);
      
      .loading-icon {
        font-size: 1.5rem;
        color: var(--primary);
        margin-bottom: 0.75rem;
      }
    }
  }
`;

// Enhanced glassmorphic dish card with compact design
const DishCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .dish-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    
    .dish-title {
      flex: 1;
      
      .dish-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-light);
        margin-bottom: 0.25rem;
        line-height: 1.3;
      }
      
      .dish-origin {
        font-size: 0.8rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.25rem;
        
        svg {
          color: var(--primary);
          font-size: 0.7rem;
        }
      }
    }
    
    .dish-badges {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      align-items: flex-end;
    }
    
    .dish-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(255, 215, 0, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 215, 0, 0.3);
      
      .stars {
        color: #FFD700;
        font-size: 0.7rem;
      }
      
      .rating-text {
        font-size: 0.7rem;
        color: var(--text-light);
        font-weight: 600;
      }
    }
    
    .dish-type {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      svg {
        font-size: 0.6rem;
      }
      
      &.vegetarian {
        background: rgba(46, 204, 113, 0.15);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.3);
      }
      
      &.non-vegetarian {
        background: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
      }
    }
  }
  
  .dish-description {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .dish-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      .icon {
        font-size: 0.9rem;
        color: var(--primary);
        margin-bottom: 0.125rem;
      }
      
      .value {
        font-weight: 600;
        color: var(--text-light);
        font-size: 0.85rem;
        margin-bottom: 0.125rem;
      }
      
      .label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-align: center;
      }
    }
  }
  
  .dish-actions {
    display: flex;
    gap: 0.5rem;
    
    .action-btn {
      flex: 1;
      background: linear-gradient(135deg, var(--primary), #06d6a0);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.6rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 181, 176, 0.3);
      
      &:hover {
        background: linear-gradient(135deg, #06d6a0, var(--primary));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 181, 176, 0.4);
      }
      
      &.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-light);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
      
      svg {
        font-size: 0.8rem;
      }
    }
  }
`;

// State data with dish information
const stateData = {
  default: {
    name: "India's Culinary Heritage",
    flag: "🇮🇳",
    description: "India's cuisine is as diverse as its culture. Click on any state to explore its unique culinary heritage, famous dishes, and traditional recipes.",
    dishes: []
  },
  maharashtra: {
    name: "Maharashtra",
    flag: "🧡",
    description: "Maharashtra's cuisine is characterized by slightly spicy food. It includes a range of dishes from mild to very spicy dishes. Wheat, rice, jowar, vegetables, lentils and fruit form staples of the Maharashtrian diet.",
    dishes: [
      {
        name: "Vada Pav",
        description: "Often called the Indian burger, it consists of a spicy potato fritter (vada) placed inside a bread bun (pav) with various chutneys.",
        type: "vegetarian",
        rating: 4.8,
        calories: "320",
        cookTime: "30 min",
        difficulty: "Easy"
      },
      {
        name: "Puran Poli",
        description: "A sweet flatbread stuffed with a mixture of cooked chana dal (split chickpeas), jaggery, and spices like cardamom and nutmeg.",
        type: "vegetarian",
        rating: 4.7,
        calories: "285",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Bombay Duck Fry",
        description: "A popular Maharashtrian delicacy where Bombay Duck fish is marinated with spices and deep fried to perfection.",
        type: "non-vegetarian",
        rating: 4.5,
        calories: "210",
        cookTime: "25 min",
        difficulty: "Easy"
      }
    ]
  },
  punjab: {
    name: "Punjab",
    flag: "💛",
    description: "Punjabi cuisine is known for its rich, buttery flavors. The cuisine is heavily influenced by the agriculture and farming lifestyle prevalent in Punjab. Popular elements include tandoori cooking and dairy products.",
    dishes: [
      {
        name: "Butter Chicken",
        description: "Chicken marinated in yogurt and spices, then cooked in a tomato-based sauce with butter and cream, creating a rich and flavorful curry.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "450",
        cookTime: "50 min",
        difficulty: "Medium"
      },
      {
        name: "Sarson da Saag",
        description: "A popular vegetarian dish made from mustard greens and spices, traditionally served with makki di roti (cornbread).",
        type: "vegetarian",
        rating: 4.7,
        calories: "220",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Amritsari Fish",
        description: "Fish coated in a spiced gram flour batter and deep-fried until crispy. A popular street food in Punjab.",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "280",
        cookTime: "30 min",
        difficulty: "Easy"
      }
    ]
  },
  kerala: {
    name: "Kerala",
    flag: "💚",
    description: "Kerala cuisine offers a multitude of coconut-based dishes and seafood specialties. The abundant use of coconut and spices such as black pepper, cloves, cinnamon, and ginger make Keralan cuisine distinctively aromatic.",
    dishes: [
      {
        name: "Appam with Stew",
        description: "Lacy rice pancakes served with a mildly spiced coconut stew made with vegetables or meat.",
        type: "vegetarian",
        rating: 4.8,
        calories: "310",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Kerala Fish Curry",
        description: "A tangy fish curry cooked with raw mangoes and coconut milk, infused with the flavors of curry leaves and tamarind.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "340",
        cookTime: "40 min",
        difficulty: "Medium"
      },
      {
        name: "Puttu and Kadala Curry",
        description: "Steamed rice cake served with a spicy curry made from black chickpeas, a traditional Kerala breakfast.",
        type: "vegetarian",
        rating: 4.7,
        calories: "290",
        cookTime: "35 min",
        difficulty: "Medium"
      }
    ]
  },
  tamilnadu: {
    name: "Tamil Nadu",
    flag: "💙",
    description: "Tamil cuisine is known for its use of rice, legumes, and lentils, along with distinct differences between the cuisine of different regions. A typical Tamil meal consists of rice, sambar, rasam, poriyal and yogurt.",
    dishes: [
      {
        name: "Dosa",
        description: "A thin, crispy pancake made from fermented rice and black gram batter, typically served with sambar and chutney.",
        type: "vegetarian",
        rating: 4.9,
        calories: "180",
        cookTime: "30 min",
        difficulty: "Medium"
      },
      {
        name: "Chettinad Chicken",
        description: "A fiery chicken curry from the Chettinad region, known for its complex blend of spices and robust flavors.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "420",
        cookTime: "55 min",
        difficulty: "Hard"
      },
      {
        name: "Pongal",
        description: "A comforting rice and dal dish seasoned with cumin, pepper, and curry leaves, often prepared during the Pongal festival.",
        type: "vegetarian",
        rating: 4.6,
        calories: "280",
        cookTime: "40 min",
        difficulty: "Easy"
      }
    ]
  },
  gujarat: {
    name: "Gujarat",
    flag: "🧡",
    description: "Gujarati cuisine is primarily vegetarian and has a slightly sweet taste due to the addition of sugar or jaggery. The typical Gujarati thali consists of rotli, dal or kadhi, rice, and sabzi with accompaniments like pickles and chutneys.",
    dishes: [
      {
        name: "Dhokla",
        description: "A savory steamed cake made from fermented rice and chickpea flour, seasoned with mustard seeds and curry leaves.",
        type: "vegetarian",
        rating: 4.7,
        calories: "150",
        cookTime: "35 min",
        difficulty: "Medium"
      },
      {
        name: "Thepla",
        description: "A flatbread made from fenugreek leaves and whole wheat flour, a perfect travel food that stays fresh for days.",
        type: "vegetarian",
        rating: 4.6,
        calories: "180",
        cookTime: "25 min",
        difficulty: "Easy"
      },
      {
        name: "Undhiyu",
        description: "A mixed vegetable casserole, traditionally cooked in an earthen pot underground, a specialty during winter festivals.",
        type: "vegetarian",
        rating: 4.8,
        calories: "320",
        cookTime: "90 min",
        difficulty: "Hard"
      }
    ]
  },
  rajasthan: {
    name: "Rajasthan",
    flag: "🏜️",
    description: "Rajasthani cuisine is known for its rich, spicy flavors and unique cooking techniques adapted to the desert climate. Dal baati churma, laal maas, and various milk-based sweets are signature dishes.",
    dishes: [
      {
        name: "Dal Baati Churma",
        description: "Traditional combination of spiced lentils (dal), baked wheat balls (baati), and sweet crumbled wheat (churma) with ghee.",
        type: "vegetarian",
        rating: 4.9,
        calories: "450",
        cookTime: "90 min",
        difficulty: "Hard"
      },
      {
        name: "Laal Maas",
        description: "Fiery red mutton curry cooked with red chilies and aromatic spices, a royal Rajasthani delicacy.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "520",
        cookTime: "75 min",
        difficulty: "Hard"
      },
      {
        name: "Pyaaz Kachori",
        description: "Crispy deep-fried pastry stuffed with spiced onion filling, served with tangy tamarind chutney.",
        type: "vegetarian",
        rating: 4.7,
        calories: "280",
        cookTime: "45 min",
        difficulty: "Medium"
      }
    ]
  },
  westbengal: {
    name: "West Bengal",
    flag: "🐟",
    description: "Bengali cuisine is known for its subtle flavors and extensive use of fish and rice. The cuisine features a perfect balance of sweet and savory dishes with an emphasis on fish, vegetables, and sweets.",
    dishes: [
      {
        name: "Machher Jhol",
        description: "Traditional Bengali fish curry cooked with potatoes, tomatoes, and aromatic spices in a light, flavorful gravy.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "320",
        cookTime: "40 min",
        difficulty: "Medium"
      },
      {
        name: "Rasgulla",
        description: "Soft, spongy cottage cheese balls cooked in light sugar syrup, one of Bengal's most famous sweets.",
        type: "vegetarian",
        rating: 4.8,
        calories: "150",
        cookTime: "60 min",
        difficulty: "Hard"
      },
      {
        name: "Shorshe Ilish",
        description: "Hilsa fish cooked in mustard seed paste, a quintessential Bengali delicacy bursting with flavors.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "380",
        cookTime: "35 min",
        difficulty: "Medium"
      }
    ]
  },
  odisha: {
    name: "Odisha",
    flag: "🏛️",
    description: "Odia cuisine is known for its simplicity and the use of minimal spices. Rice is the staple food, and the cuisine features unique dishes like dalma and various sweet preparations.",
    dishes: [
      {
        name: "Dalma",
        description: "Traditional Odia dish made with lentils and vegetables, seasoned with panch phoran (five-spice blend).",
        type: "vegetarian",
        rating: 4.7,
        calories: "240",
        cookTime: "50 min",
        difficulty: "Medium"
      },
      {
        name: "Pakhala Bhata",
        description: "Fermented rice soaked in water, served with various accompaniments, perfect for hot summer days.",
        type: "vegetarian",
        rating: 4.5,
        calories: "180",
        cookTime: "20 min",
        difficulty: "Easy"
      },
      {
        name: "Chenna Poda",
        description: "Baked cottage cheese dessert with caramelized sugar, often called the 'Indian cheesecake'.",
        type: "vegetarian",
        rating: 4.8,
        calories: "320",
        cookTime: "90 min",
        difficulty: "Hard"
      }
    ]
  },
  karnataka: {
    name: "Karnataka",
    flag: "🌶️",
    description: "Karnataka cuisine varies significantly across regions. Known for dishes like bisi bele bath, mysore pak, and dosas. The cuisine features a good balance of vegetarian and non-vegetarian dishes.",
    dishes: [
      {
        name: "Bisi Bele Bath",
        description: "Spicy rice dish cooked with lentils, vegetables, and aromatic spice powder, served hot with ghee.",
        type: "vegetarian",
        rating: 4.8,
        calories: "350",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Mysore Pak",
        description: "Rich, melt-in-mouth sweet made with gram flour, sugar, and generous amounts of ghee.",
        type: "vegetarian",
        rating: 4.9,
        calories: "280",
        cookTime: "45 min",
        difficulty: "Hard"
      },
      {
        name: "Ragi Mudde",
        description: "Nutritious finger millet balls served with sambar or curry, a staple food in rural Karnataka.",
        type: "vegetarian",
        rating: 4.6,
        calories: "200",
        cookTime: "30 min",
        difficulty: "Easy"
      }
    ]
  },
  andhrapradesh: {
    name: "Andhra Pradesh",
    flag: "🌶️",
    description: "Andhra cuisine is famous for its spicy and tangy flavors. Rice is the staple, and the cuisine extensively uses tamarind, red chilies, and various spices to create bold, flavorful dishes.",
    dishes: [
      {
        name: "Gongura Mutton",
        description: "Tangy mutton curry cooked with sorrel leaves (gongura), a signature Andhra delicacy.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "420",
        cookTime: "75 min",
        difficulty: "Medium"
      },
      {
        name: "Pesarattu",
        description: "Protein-rich crepe made from green gram (moong dal), often served with ginger chutney.",
        type: "vegetarian",
        rating: 4.7,
        calories: "220",
        cookTime: "30 min",
        difficulty: "Medium"
      },
      {
        name: "Andhra Fish Curry",
        description: "Spicy and tangy fish curry made with tamarind, red chilies, and coconut, a coastal Andhra specialty.",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "320",
        cookTime: "40 min",
        difficulty: "Medium"
      }
    ]
  },
  telangana: {
    name: "Telangana",
    flag: "🍚",
    description: "Telangana cuisine is characterized by its rustic flavors and extensive use of millets, sorghum, and rice. The cuisine features both vegetarian and non-vegetarian dishes with bold, spicy flavors.",
    dishes: [
      {
        name: "Hyderabadi Biryani",
        description: "Aromatic rice dish layered with marinated meat, cooked in dum style with saffron and spices.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "580",
        cookTime: "120 min",
        difficulty: "Hard"
      },
      {
        name: "Sarva Pindi",
        description: "Savory pancake made with rice flour and spices, often enjoyed as breakfast or snack.",
        type: "vegetarian",
        rating: 4.6,
        calories: "250",
        cookTime: "40 min",
        difficulty: "Medium"
      },
      {
        name: "Jonna Rotte",
        description: "Nutritious flatbread made from sorghum flour, typically served with chutney or curry.",
        type: "vegetarian",
        rating: 4.5,
        calories: "180",
        cookTime: "25 min",
        difficulty: "Easy"
      },
      {
        name: "Telangana Chicken Curry",
        description: "Spicy chicken curry with traditional Telangana spices and curry leaves.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "380",
        cookTime: "50 min",
        difficulty: "Medium"
      }
    ]
  },
  goa: {
    name: "Goa",
    flag: "🌴",
    description: "Goan cuisine is a unique blend of Indian and Portuguese influences. Known for its extensive use of coconut, seafood, and spices like kokum. The cuisine features both vegetarian and seafood delicacies.",
    dishes: [
      {
        name: "Fish Curry Rice",
        description: "Traditional Goan fish curry made with coconut milk, kokum, and spices, served with steamed rice.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "420",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Vindaloo",
        description: "Spicy curry with Portuguese origins, traditionally made with pork, vinegar, and aromatic spices.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "480",
        cookTime: "90 min",
        difficulty: "Hard"
      },
      {
        name: "Bebinca",
        description: "Traditional Goan layered dessert made with coconut milk, eggs, and jaggery.",
        type: "vegetarian",
        rating: 4.7,
        calories: "320",
        cookTime: "120 min",
        difficulty: "Hard"
      }
    ]
  },
  himachalpradesh: {
    name: "Himachal Pradesh",
    flag: "🏔️",
    description: "Himachali cuisine is influenced by the mountainous terrain and climate. The cuisine features hearty, warming dishes with extensive use of dairy products, particularly yogurt and buttermilk.",
    dishes: [
      {
        name: "Dham",
        description: "Traditional festive meal served on special occasions, featuring rice, dal, curries, and sweets.",
        type: "vegetarian",
        rating: 4.8,
        calories: "500",
        cookTime: "180 min",
        difficulty: "Hard"
      },
      {
        name: "Siddu",
        description: "Steamed bread stuffed with poppy seeds or dry fruits, served with ghee and honey.",
        type: "vegetarian",
        rating: 4.7,
        calories: "280",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Chha Gosht",
        description: "Lamb curry cooked in yogurt-based gravy with aromatic spices, a Himachali specialty.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "450",
        cookTime: "90 min",
        difficulty: "Hard"
      }
    ]
  },
  uttarakhand: {
    name: "Uttarakhand",
    flag: "⛰️",
    description: "Uttarakhandi cuisine is simple yet nutritious, adapted to the mountainous lifestyle. The cuisine features extensive use of local grains, lentils, and seasonal vegetables.",
    dishes: [
      {
        name: "Kafuli",
        description: "Nutritious curry made with green leafy vegetables and buttermilk, rich in iron and vitamins.",
        type: "vegetarian",
        rating: 4.6,
        calories: "180",
        cookTime: "40 min",
        difficulty: "Medium"
      },
      {
        name: "Bal Mithai",
        description: "Brown-colored sweet made with roasted khoya and coated with white chocolate balls.",
        type: "vegetarian",
        rating: 4.8,
        calories: "320",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Phaanu",
        description: "Protein-rich curry made with mixed lentils, slow-cooked overnight for enhanced flavors.",
        type: "vegetarian",
        rating: 4.7,
        calories: "250",
        cookTime: "120 min",
        difficulty: "Medium"
      }
    ]
  },
  haryana: {
    name: "Haryana",
    flag: "🌾",
    description: "Haryanvi cuisine is heavily influenced by its agricultural heritage. The cuisine features hearty, filling dishes made with wheat, dairy products, and seasonal vegetables.",
    dishes: [
      {
        name: "Bajra Khichdi",
        description: "Nutritious porridge made with pearl millet and lentils, perfect for winter months.",
        type: "vegetarian",
        rating: 4.6,
        calories: "280",
        cookTime: "45 min",
        difficulty: "Easy"
      },
      {
        name: "Kachri Ki Sabzi",
        description: "Unique curry made with dried wild melons (kachri), a specialty of the region.",
        type: "vegetarian",
        rating: 4.5,
        calories: "200",
        cookTime: "30 min",
        difficulty: "Medium"
      },
      {
        name: "Methi Gajar",
        description: "Stir-fried carrots with fenugreek leaves, a healthy and flavorful winter dish.",
        type: "vegetarian",
        rating: 4.7,
        calories: "150",
        cookTime: "25 min",
        difficulty: "Easy"
      }
    ]
  },
  delhi: {
    name: "Delhi",
    flag: "🏛️",
    description: "Delhi cuisine is a melting pot of various regional Indian cuisines, with strong Mughlai influences. The city is famous for its street food, kebabs, and rich, flavorful dishes.",
    dishes: [
      {
        name: "Butter Chicken",
        description: "Creamy tomato-based chicken curry with butter and cream, invented in Delhi and loved worldwide.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "450",
        cookTime: "50 min",
        difficulty: "Medium"
      },
      {
        name: "Chole Bhature",
        description: "Spicy chickpea curry served with deep-fried bread, a popular North Indian combination.",
        type: "vegetarian",
        rating: 4.8,
        calories: "520",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Paranthas",
        description: "Stuffed flatbreads with various fillings, served with yogurt, pickles, and butter.",
        type: "vegetarian",
        rating: 4.7,
        calories: "350",
        cookTime: "40 min",
        difficulty: "Medium"
      }
    ]
  },
  jharkhand: {
    name: "Jharkhand",
    flag: "🌳",
    description: "Jharkhand cuisine is influenced by tribal culture and features simple, nutritious dishes. The cuisine extensively uses rice, seasonal vegetables, and local herbs.",
    dishes: [
      {
        name: "Litti Chokha",
        description: "Baked wheat balls stuffed with sattu (gram flour), served with spicy mashed vegetables.",
        type: "vegetarian",
        rating: 4.7,
        calories: "380",
        cookTime: "75 min",
        difficulty: "Medium"
      },
      {
        name: "Handia",
        description: "Traditional fermented rice beer, considered auspicious and served during festivals.",
        type: "vegetarian",
        rating: 4.3,
        calories: "120",
        cookTime: "480 min",
        difficulty: "Hard"
      },
      {
        name: "Rugra",
        description: "Curry made with wild mushrooms found in the forests, rich in flavor and nutrients.",
        type: "vegetarian",
        rating: 4.8,
        calories: "180",
        cookTime: "35 min",
        difficulty: "Medium"
      }
    ]
  },
  bihar: {
    name: "Bihar",
    flag: "🌾",
    description: "Bihari cuisine is simple yet flavorful, with rice as the staple food. The cuisine features extensive use of mustard oil, panch phoran, and seasonal vegetables.",
    dishes: [
      {
        name: "Litti Chokha",
        description: "Traditional dish of roasted wheat balls served with mashed spiced vegetables and ghee.",
        type: "vegetarian",
        rating: 4.8,
        calories: "400",
        cookTime: "90 min",
        difficulty: "Medium"
      },
      {
        name: "Sattu Paratha",
        description: "Nutritious flatbread stuffed with roasted gram flour, onions, and spices.",
        type: "vegetarian",
        rating: 4.7,
        calories: "320",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Fish Curry",
        description: "Bengali-influenced fish curry cooked with mustard oil and aromatic spices.",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "280",
        cookTime: "40 min",
        difficulty: "Medium"
      }
    ]
  },
  chhattisgarh: {
    name: "Chhattisgarh",
    flag: "🌾",
    description: "Chhattisgarhi cuisine is influenced by tribal culture and features rice as the staple food. The cuisine is known for its simplicity and use of local ingredients.",
    dishes: [
      {
        name: "Chila",
        description: "Savory pancake made from rice flour batter, often served with chutney.",
        type: "vegetarian",
        rating: 4.5,
        calories: "220",
        cookTime: "30 min",
        difficulty: "Easy"
      },
      {
        name: "Faraa",
        description: "Steamed rice dumplings served with chutney or curry, a traditional breakfast dish.",
        type: "vegetarian",
        rating: 4.6,
        calories: "180",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Aamat",
        description: "Simple curry made with seasonal vegetables and minimal spices.",
        type: "vegetarian",
        rating: 4.4,
        calories: "150",
        cookTime: "35 min",
        difficulty: "Easy"
      }
    ]
  },
  madhyapradesh: {
    name: "Madhya Pradesh",
    flag: "🦚",
    description: "Madhya Pradesh cuisine varies across regions but is generally known for its rich, flavorful dishes. The cuisine features both vegetarian and non-vegetarian preparations with unique local specialties.",
    dishes: [
      {
        name: "Bafla",
        description: "Wheat dumplings boiled and then roasted, served with dal and ghee, similar to Rajasthani baati.",
        type: "vegetarian",
        rating: 4.7,
        calories: "350",
        cookTime: "75 min",
        difficulty: "Medium"
      },
      {
        name: "Poha",
        description: "Flattened rice cooked with onions, mustard seeds, and curry leaves, a popular breakfast dish.",
        type: "vegetarian",
        rating: 4.8,
        calories: "250",
        cookTime: "20 min",
        difficulty: "Easy"
      },
      {
        name: "Seekh Kebab",
        description: "Spiced minced meat grilled on skewers, influenced by Mughlai cuisine.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "380",
        cookTime: "45 min",
        difficulty: "Medium"
      }
    ]
  },
  uttarpradesh: {
    name: "Uttar Pradesh",
    flag: "🕌",
    description: "UP cuisine is heavily influenced by Mughlai cooking and features rich, aromatic dishes. Known for kebabs, biryanis, and sweets, the cuisine varies from Awadhi to Bhojpuri styles.",
    dishes: [
      {
        name: "Lucknowi Biryani",
        description: "Aromatic rice dish cooked in dum style with tender meat and saffron, a royal Awadhi specialty.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "550",
        cookTime: "120 min",
        difficulty: "Hard"
      },
      {
        name: "Tunde Kebab",
        description: "Melt-in-mouth kebabs made with finely minced meat and secret spices from Lucknow.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "320",
        cookTime: "60 min",
        difficulty: "Hard"
      },
      {
        name: "Petha",
        description: "Translucent sweet made from ash gourd, a famous specialty from Agra.",
        type: "vegetarian",
        rating: 4.6,
        calories: "180",
        cookTime: "90 min",
        difficulty: "Medium"
      }
    ]
  },
  assam: {
    name: "Assam",
    flag: "🫖",
    description: "Assamese cuisine is known for its subtle flavors and extensive use of fish, rice, and vegetables. The cuisine features minimal use of spices and emphasizes natural flavors.",
    dishes: [
      {
        name: "Assam Fish Curry",
        description: "Light fish curry cooked with tomatoes and minimal spices, allowing the fish flavor to dominate.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "280",
        cookTime: "35 min",
        difficulty: "Medium"
      },
      {
        name: "Pitha",
        description: "Traditional rice cakes prepared during festivals, available in various sweet and savory varieties.",
        type: "vegetarian",
        rating: 4.7,
        calories: "220",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Khar",
        description: "Traditional alkaline dish made with raw papaya and other vegetables, unique to Assamese cuisine.",
        type: "vegetarian",
        rating: 4.5,
        calories: "150",
        cookTime: "45 min",
        difficulty: "Medium"
      }
    ]
  },
  manipur: {
    name: "Manipur",
    flag: "🌸",
    description: "Manipuri cuisine is characterized by its healthy, less oily preparations. The cuisine extensively uses fish, vegetables, and aromatic herbs, with minimal use of spices.",
    dishes: [
      {
        name: "Eromba",
        description: "Traditional dish made with boiled vegetables, fish, and fermented fish paste (ngari).",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "200",
        cookTime: "40 min",
        difficulty: "Medium"
      },
      {
        name: "Kangshoi",
        description: "Healthy vegetable soup made with seasonal vegetables and herbs.",
        type: "vegetarian",
        rating: 4.5,
        calories: "120",
        cookTime: "30 min",
        difficulty: "Easy"
      },
      {
        name: "Chak-hao Kheer",
        description: "Purple rice pudding made with black glutinous rice, milk, and jaggery.",
        type: "vegetarian",
        rating: 4.8,
        calories: "280",
        cookTime: "60 min",
        difficulty: "Medium"
      }
    ]
  },
  meghalaya: {
    name: "Meghalaya",
    flag: "☁️",
    description: "Meghalayan cuisine is simple and features extensive use of pork, fish, and rice. The cuisine is influenced by tribal culture and emphasizes boiled and steamed preparations.",
    dishes: [
      {
        name: "Jadoh",
        description: "Red rice cooked with pork and aromatic spices, a traditional Khasi dish.",
        type: "non-vegetarian",
        rating: 4.7,
        calories: "420",
        cookTime: "75 min",
        difficulty: "Medium"
      },
      {
        name: "Dohneiiong",
        description: "Pork curry cooked with black sesame seeds, giving it a unique nutty flavor.",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "380",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Pukhlein",
        description: "Traditional sweet bread prepared during festivals, deep-fried and crispy.",
        type: "vegetarian",
        rating: 4.5,
        calories: "250",
        cookTime: "45 min",
        difficulty: "Medium"
      }
    ]
  },
  tripura: {
    name: "Tripura",
    flag: "🏝️",
    description: "Tripuri cuisine is influenced by Bengali and tribal cooking styles. Rice and fish are staples, with extensive use of bamboo shoots and local herbs.",
    dishes: [
      {
        name: "Mui Borok",
        description: "Traditional Tripuri curry made with dried fish and vegetables.",
        type: "non-vegetarian",
        rating: 4.5,
        calories: "250",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Wahan Mosdeng",
        description: "Spicy pork curry with onions and local herbs, a tribal specialty.",
        type: "non-vegetarian",
        rating: 4.7,
        calories: "400",
        cookTime: "70 min",
        difficulty: "Medium"
      },
      {
        name: "Chakhwi",
        description: "Bamboo shoot curry with fish, fermented for unique tangy flavor.",
        type: "non-vegetarian",
        rating: 4.4,
        calories: "180",
        cookTime: "40 min",
        difficulty: "Medium"
      }
    ]
  },
  mizoram: {
    name: "Mizoram",
    flag: "🗻",
    description: "Mizo cuisine is characterized by minimal use of oil and spices. The cuisine features smoked meats, bamboo shoots, and various herbs and vegetables.",
    dishes: [
      {
        name: "Bai",
        description: "Traditional Mizo stew made with pork, bamboo shoots, and local herbs.",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "320",
        cookTime: "90 min",
        difficulty: "Medium"
      },
      {
        name: "Sawhchiar",
        description: "Rice and meat cooked together with ginger and other aromatic ingredients.",
        type: "non-vegetarian",
        rating: 4.5,
        calories: "380",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Zu",
        description: "Traditional rice beer, often served during festivals and special occasions.",
        type: "vegetarian",
        rating: 4.3,
        calories: "150",
        cookTime: "480 min",
        difficulty: "Hard"
      }
    ]
  },
  nagaland: {
    name: "Nagaland",
    flag: "🏔️",
    description: "Naga cuisine is known for its fiery dishes and extensive use of indigenous herbs and vegetables. Smoked meats, fermented foods, and ghost peppers are signature elements.",
    dishes: [
      {
        name: "Smoked Pork with Bamboo Shoot",
        description: "Traditional Naga dish featuring smoked pork cooked with fermented bamboo shoots.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "450",
        cookTime: "120 min",
        difficulty: "Hard"
      },
      {
        name: "Axone with Pork",
        description: "Fermented soybean curry with pork, known for its strong aroma and unique taste.",
        type: "non-vegetarian",
        rating: 4.6,
        calories: "400",
        cookTime: "75 min",
        difficulty: "Medium"
      },
      {
        name: "Galho",
        description: "Comfort food made with rice, vegetables, and meat, similar to a hearty stew.",
        type: "non-vegetarian",
        rating: 4.7,
        calories: "350",
        cookTime: "60 min",
        difficulty: "Medium"
      }
    ]
  },
  arunachalpradesh: {
    name: "Arunachal Pradesh",
    flag: "🌄",
    description: "Arunachali cuisine is influenced by Tibetan and Chinese cooking styles. The cuisine features bamboo shoots, yak meat, and various indigenous vegetables.",
    dishes: [
      {
        name: "Thukpa",
        description: "Hearty noodle soup with vegetables and meat, influenced by Tibetan cuisine.",
        type: "non-vegetarian",
        rating: 4.7,
        calories: "320",
        cookTime: "45 min",
        difficulty: "Medium"
      },
      {
        name: "Momos",
        description: "Steamed dumplings filled with meat or vegetables, served with spicy chutney.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "280",
        cookTime: "60 min",
        difficulty: "Medium"
      },
      {
        name: "Apong",
        description: "Traditional rice beer made from fermented rice, popular among local tribes.",
        type: "vegetarian",
        rating: 4.4,
        calories: "120",
        cookTime: "720 min",
        difficulty: "Hard"
      }
    ]
  },
  sikkim: {
    name: "Sikkim",
    flag: "🏔️",
    description: "Sikkimese cuisine is influenced by Nepalese, Tibetan, and Bengali cooking. The cuisine features fermented foods, dairy products, and minimal use of spices.",
    dishes: [
      {
        name: "Gundruk",
        description: "Fermented leafy green vegetable curry, rich in vitamins and minerals.",
        type: "vegetarian",
        rating: 4.5,
        calories: "120",
        cookTime: "40 min",
        difficulty: "Medium"
      },
      {
        name: "Churpi Soup",
        description: "Soup made with dried yak cheese (churpi), vegetables, and herbs.",
        type: "vegetarian",
        rating: 4.6,
        calories: "180",
        cookTime: "35 min",
        difficulty: "Medium"
      },
      {
        name: "Sel Roti",
        description: "Traditional ring-shaped rice bread, crispy outside and soft inside.",
        type: "vegetarian",
        rating: 4.8,
        calories: "250",
        cookTime: "60 min",
        difficulty: "Hard"
      }
    ]
  },
  jammukashmir: {
    name: "Jammu & Kashmir",
    flag: "🏔️",
    description: "Kashmiri cuisine is known for its rich, aromatic dishes with Persian and Central Asian influences. The cuisine features extensive use of yogurt, saffron, and dried fruits.",
    dishes: [
      {
        name: "Rogan Josh",
        description: "Aromatic lamb curry cooked with yogurt and Kashmiri spices, colored with mawal flowers.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "480",
        cookTime: "90 min",
        difficulty: "Hard"
      },
      {
        name: "Yakhni",
        description: "Delicate yogurt-based mutton curry flavored with fennel and green cardamom.",
        type: "non-vegetarian",
        rating: 4.8,
        calories: "420",
        cookTime: "75 min",
        difficulty: "Hard"
      },
      {
        name: "Kahwa",
        description: "Traditional green tea flavored with cardamom, cinnamon, and saffron.",
        type: "vegetarian",
        rating: 4.7,
        calories: "25",
        cookTime: "15 min",
        difficulty: "Easy"
      }
    ]
  }
};

export default function FoodExplorer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('default');
  const [loading, setLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Set page title
  usePageTitle('Food Explorer');

  // Effect to handle map resize when component mounts
  useEffect(() => {
    if (mapInstance) {
      // Force a resize event after map is visible to ensure proper rendering
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
    }
  }, [mapInstance]);

  const currentStateData = stateData[selectedState] || stateData['default'];

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
  };

  const handleAddToFavourites = (dish) => {
    // Only show toast for successful actions
    // toast.success(`${dish.name} added to your favourites! ❤️`);
    // TODO: Integration with favourites system
    // navigate('/favourites', { state: { selectedDish: dish } });
  };

  const handleViewRecipe = (dish) => {
    // Remove unnecessary toast message for viewing recipe
    // toast.info(`Opening recipe for ${dish.name} 👨‍🍳`);
    // Open recipe modal or navigate to recipe page
  };

  // Calculate center point of a polygon for circular markers
  const getPolygonCenter = (coordinates) => {
    let totalLat = 0;
    let totalLng = 0;
    let totalPoints = 0;
    
    const processCoordinates = (coords) => {
      coords.forEach(ring => {
        if (Array.isArray(ring[0])) {
          // Multi-polygon or nested array
          processCoordinates(ring);
        } else {
          // Simple coordinate pair [lng, lat]
          totalLng += ring[0];
          totalLat += ring[1];
          totalPoints++;
        }
      });
    };
    
    processCoordinates(coordinates);
    
    return [totalLat / totalPoints, totalLng / totalPoints];
  };

  // Style function for state boundaries (subtle background)
  const getFeatureStyle = (feature) => {
    return {
      fillColor: 'rgba(100, 116, 139, 0.1)', // Very subtle fill
      weight: 1,
      opacity: 0.5,
      color: 'rgba(100, 116, 139, 0.3)',
      fillOpacity: 0.1
    };
  };

  // Style function for circular markers
  const getCircleMarkerStyle = (stateId) => {
    const isSelected = selectedState === stateId;
    const hasData = stateData[stateId] && stateData[stateId].dishes.length > 0;
    
    return {
      radius: isSelected ? 12 : hasData ? 8 : 6,
      fillColor: '#3B82F6', // Consistent blue color for all markers
      color: '#ffffff', // White border for all markers
      weight: isSelected ? 3 : 2,
      opacity: 1,
      fillOpacity: isSelected ? 0.9 : 0.7
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
      <Header>
        <h1>
          <FaGlobe /> Discover India's Culinary Heritage
        </h1>
        <p className="subtitle">
          Embark on a culinary journey across 28 Indian states. Discover authentic regional dishes, 
          traditional cooking methods, and the rich cultural heritage that makes each cuisine extraordinary.
        </p>
      </Header>
      
      <ExplorerHeader>
        <p>
          From the spicy curries of Tamil Nadu to the sweet delicacies of Bengal, each region offers 
          a unique palette of flavors shaped by centuries of tradition, local ingredients, and cultural exchange.
        </p>
        <div className="stats">
          <div className="stat">
            <FaMapMarkerAlt className="icon" />
            <span className="number">28</span>
            <span className="label">States & UTs</span>
          </div>
          <div className="stat">
            <FaTrophy className="icon" />
            <span className="number">84+</span>
            <span className="label">Signature Dishes</span>
          </div>
          <div className="stat">
            <FaMagic className="icon" />
            <span className="number">5</span>
            <span className="label">Culinary Regions</span>
          </div>
          <div className="stat">
            <FaHeart className="icon" />
            <span className="number">∞</span>
            <span className="label">Flavors to Explore</span>
          </div>
        </div>
      </ExplorerHeader>

      <ExplorerGrid>
        <MapSection>
          <div className="map-header">
            <h2><FaMapMarkerAlt /> India's Interactive Culinary Map</h2>
            <p className="map-subtitle">Click on any state to explore its unique culinary traditions</p>
          </div>
          
          <MapContainer 
            center={[20.5937, 77.9629]} 
            zoom={5} 
            style={{ height: '500px', width: '100%', borderRadius: '20px' }}
            zoomControl={true}
            scrollWheelZoom={true}
            whenCreated={setMapInstance}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* State boundaries with subtle styling */}
            <GeoJSON
              data={indiaGeoData}
              style={getFeatureStyle}
            />
            
            {/* Circular markers for each state */}
            {indiaGeoData.features.map((feature) => {
              const stateId = feature.properties.id;
              const stateName = feature.properties.name;
              const hasData = stateData[stateId] && stateData[stateId].dishes.length > 0;
              const center = getPolygonCenter(feature.geometry.coordinates);
              
              return (
                <CircleMarker
                  key={stateId}
                  center={center}
                  {...getCircleMarkerStyle(stateId)}
                  eventHandlers={{
                    click: () => {
                      if (hasData) {
                        setSelectedState(stateId);
                        // Remove all toast messages for state selection
                      } else {
                        // Remove toast for states without recipes too
                        // toast.info(`${stateName} recipes coming soon! 🔜`);
                      }
                    },
                    mouseover: (e) => {
                      e.target.setStyle({
                        radius: getCircleMarkerStyle(stateId).radius + 2,
                        weight: 3
                      });
                    },
                    mouseout: (e) => {
                      e.target.setStyle(getCircleMarkerStyle(stateId));
                    }
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', minWidth: '150px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{stateName}</h4>
                      {hasData ? (
                        <div>
                          <p style={{ margin: '4px 0', color: '#64748b' }}>
                            🍽️ {stateData[stateId].dishes.length} dishes available
                          </p>
                          <p style={{ margin: '4px 0', fontSize: '12px', color: '#14b8a6' }}>
                            Click to explore!
                          </p>
                        </div>
                      ) : (
                        <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '12px' }}>
                          Recipes coming soon...
                        </p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </MapSection>

        <StateInfoPanel>
          {selectedState === 'default' ? (
            <div className="no-selection">
              <div className="icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Select a State to Explore</h3>
              <p>
                Click on any state on the interactive map to discover its unique cuisine, traditional dishes, and culinary heritage.
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
                <div className="dishes-grid">
                  {currentStateData.dishes.map((dish, index) => (
                    <DishCard key={index}>
                      <div className="dish-header">
                        <div className="dish-title">
                          <div className="dish-name">{dish.name}</div>
                          <div className="dish-origin">
                            <FaMapMarkerAlt />
                            {currentStateData.name}
                          </div>
                        </div>
                        <div className="dish-badges">
                          <div className="dish-rating">
                            <div className="stars">
                              <FaStar />
                            </div>
                            <span className="rating-text">{dish.rating}</span>
                          </div>
                          <div className={`dish-type ${dish.type}`}>
                            <FaLeaf />
                            {dish.type === 'vegetarian' ? 'VEG' : 'NON-VEG'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="dish-description">
                        {dish.description}
                      </div>
                      
                      <div className="dish-stats">
                        <div className="stat">
                          <FaFire className="icon" />
                          <span className="value">{dish.calories}</span>
                          <span className="label">calories</span>
                        </div>
                        <div className="stat">
                          <FaClock className="icon" />
                          <span className="value">{dish.cookTime}</span>
                          <span className="label">cook time</span>
                        </div>
                        <div className="stat">
                          <FaTrophy className="icon" />
                          <span className="value">{dish.difficulty}</span>
                          <span className="label">level</span>
                        </div>
                      </div>
                      
                      <div className="dish-actions">
                        <button 
                          className="action-btn"
                          onClick={() => handleViewRecipe(dish)}
                        >
                          <FaBook />
                          View Recipe
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleAddToFavourites(dish)}
                        >
                          <FaHeart />
                          Save
                        </button>
                      </div>
                    </DishCard>
                  ))}
                </div>
              </div>
            </>
          )}
        </StateInfoPanel>
      </ExplorerGrid>
    </PageContainer>
  );
}
