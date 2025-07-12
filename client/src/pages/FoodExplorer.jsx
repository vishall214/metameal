import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaGlobe, FaMapMarkerAlt, FaUtensils, FaStar, FaLeaf, FaFire, FaClock, FaHeart, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import usePageTitle from '../utils/usePageTitle';
import { indiaGeoData } from '../data/indiaGeoData';
import '../utils/leafletConfig';

// Styled components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-circle" style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%',
                background: 'rgba(148, 163, 184, 0.6)',
                border: '2px solid rgba(100, 116, 139, 0.8)'
              }}></div>
              <span>Coming Soon</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle" style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%',
                background: '#14b8a6',
                border: '2px solid #ffffff'
              }}></div>
              <span>Available Recipes</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle" style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%',
                background: '#00B5B0',
                border: '3px solid #ffffff'
              }}></div>
              <span>Selected State</span>
            </div>
          </div>`;

// Styled Components
const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--text-light);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: var(--primary);
  }
`;

const ExplorerHeader = styled.div`
  background: var(--bg-light);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid var(--border);
  
  p {
    font-size: 1.1rem;
    color: var(--text-light);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .stats {
    display: flex;
    gap: 2rem;
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .number {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--primary);
      }
      
      .label {
        font-size: 0.9rem;
        color: var(--text-muted);
      }
    }
  }
`;

const ExplorerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MapSection = styled.div`
  background: var(--bg-light);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  
  .map-header {
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.5rem;
      color: var(--text-light);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
  
  .map-legend {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .legend-color,
      .legend-circle {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      .legend-circle {
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      span {
        font-size: 0.9rem;
        color: var(--text-muted);
      }
    }
  }
`;

const StateInfoPanel = styled.div`
  background: var(--bg-light);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  height: 100%;
  overflow-y: auto;
  
  .no-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
    
    .icon {
      font-size: 3rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    h3 {
      font-size: 1.5rem;
      color: var(--text-light);
      margin-bottom: 1rem;
    }
    
    p {
      color: var(--text-muted);
      line-height: 1.6;
    }
  }
  
  .state-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
    
    .state-flag {
      font-size: 2rem;
    }
    
    .state-info {
      flex: 1;
      
      h3 {
        font-size: 1.8rem;
        color: var(--text-light);
        margin-bottom: 0.5rem;
      }
      
      .state-stats {
        display: flex;
        gap: 1rem;
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
      }
    }
  }
  
  .state-description {
    color: var(--text-light);
    line-height: 1.6;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  
  .famous-dishes {
    h4 {
      font-size: 1.3rem;
      color: var(--text-light);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
`;

const DishCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--border);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  .dish-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    
    .dish-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-light);
      margin-bottom: 0.25rem;
    }
    
    .dish-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #FFD700;
      font-size: 0.9rem;
    }
    
    .dish-type {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      
      &.vegetarian {
        background: rgba(46, 204, 113, 0.15);
        color: #2ecc71;
      }
      
      &.non-vegetarian {
        background: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
      }
    }
  }
  
  .dish-description {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  
  .dish-stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: var(--text-muted);
      
      .value {
        font-weight: 600;
        color: var(--primary);
      }
    }
  }
  
  .dish-actions {
    display: flex;
    gap: 0.75rem;
    
    .action-btn {
      flex: 1;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
      
      &:hover {
        background: var(--primary-dark);
      }
      
      &.secondary {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        
        &:hover {
          background: var(--bg-dark);
          color: var(--text-light);
        }
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
        name: "Hyderabadi Biryani",
        description: "Aromatic rice dish layered with marinated meat, cooked in dum style with saffron and spices.",
        type: "non-vegetarian",
        rating: 4.9,
        calories: "580",
        cookTime: "120 min",
        difficulty: "Hard"
      },
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
      }
    ]
  },
  telangana: {
    name: "Telangana",
    flag: "🍚",
    description: "Telangana cuisine is characterized by its rustic flavors and extensive use of millets, sorghum, and rice. The cuisine features both vegetarian and non-vegetarian dishes with bold, spicy flavors.",
    dishes: [
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
            <span className="number">84+</span>
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
