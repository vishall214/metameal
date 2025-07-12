import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Button from '../components/Button';
import { FaUtensils, FaBrain, FaChartLine, FaShieldAlt, FaClock, FaHeart, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/navbar';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Enhanced animations
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(60px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

const fadeInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-60px);
  }
  to { 
    opacity: 1; 
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(60px);
  }
  to { 
    opacity: 1; 
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const ParallaxBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-gradient);
  overflow: hidden;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 181, 176, 0.1) 0%, transparent 70%);
    animation: ${float} 6s ease-in-out infinite;
  }
  
  &::before {
    top: -250px;
    right: -250px;
    animation-delay: -2s;
  }
  
  &::after {
    bottom: -250px;
    left: -250px;
    animation-delay: -4s;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--primary);
    border-radius: 50%;
    opacity: 0.6;
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 6rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  h1 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100px;
      height: 4px;
      background: var(--primary-gradient);
      border-radius: 2px;
      
      @media (max-width: 968px) {
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    color: var(--text-secondary);
    line-height: 1.7;
    max-width: 500px;
    
    @media (max-width: 968px) {
      margin: 0 auto 2.5rem;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const HeroVisual = styled.div`
  position: relative;
  
  @media (max-width: 968px) {
    order: -1;
  }
`;

const FloatingCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  position: absolute;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  
  &:nth-child(2) {
    top: 15%;
    right: 0%;
    transform: rotate(-1deg);
  }
  
  &:nth-child(3) {
    bottom: 40%;
    left: -5%;
    transform: rotate(1deg);
  }
  
  &:nth-child(4) {
    top: 60%;
    right: 25%;
    transform: rotate(-0.5deg);
  }

  &:hover {
    transform: scale(1.02) rotate(0deg) !important;
    border-color: rgba(0, 181, 176, 0.5);
    box-shadow: 0 12px 40px rgba(0, 181, 176, 0.15);
    background: linear-gradient(135deg, rgba(0, 181, 176, 0.1) 0%, rgba(255, 255, 255, 0.08) 100%);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    
    .emoji {
      font-size: 1.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    
    .title {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
  }

  .card-content {
    .value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-light);
      margin-bottom: 0.25rem;
    }
    
    .description {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-top: 0.5rem;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 2px;
      transition: width 1s ease-out;
    }
  }
`;

const MainVisual = styled.div`
  width: 400px;
  height: 400px;
  margin: 0 auto;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, var(--primary), var(--accent), var(--primary));
    animation: spin 20s linear infinite;
    z-index: -1;
    opacity: 0.3;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -40px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 181, 176, 0.1) 0%, transparent 70%);
    animation: pulseGlow 4s ease-in-out infinite;
    z-index: -2;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulseGlow {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.3;
    }
    50% { 
      transform: scale(1.1);
      opacity: 0.6;
    }
  }
  
  .icon {
    font-size: 8rem;
    color: white;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  }
  
  @media (max-width: 768px) {
    width: 300px;
    height: 300px;
    
    .icon {
      font-size: 6rem;
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 8rem 0;
  background: var(--bg-dark);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 5rem;

  .badge {
    display: inline-block;
    background: rgba(0, 181, 176, 0.1);
    color: var(--primary);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-xl);
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    border: 1px solid rgba(0, 181, 176, 0.2);
  }

  h2 {
    font-size: clamp(2rem, 5vw, 3rem);
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }

  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.7;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled.div`
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-gradient);
    transform: scaleX(0);
    transition: transform var(--transition);
  }

  &:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-lg), var(--shadow-glow);
    
    &::before {
      transform: scaleX(1);
    }
    
    .icon {
      transform: scale(1.1);
      color: var(--primary-light);
    }
  }

  .icon {
    font-size: 3rem;
    color: var(--primary);
    margin-bottom: 1.5rem;
    transition: all var(--transition);
  }

  h3 {
    color: var(--text-primary);
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }
  
  .learn-more {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary);
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all var(--transition);
    
    &:hover {
      gap: 1rem;
      color: var(--primary-light);
    }
  }
`;

const features = [
  {
    icon: <FaUtensils />,
    title: "Indian Meal Planning",
    description: "Create weekly meal plans with authentic Indian recipes based on your regional preferences, dietary traditions, and nutritional goals. From North Indian thalis to South Indian filter coffee.",
    delay: "0.1s"
  },
  {
    icon: <FaBrain />,
    title: "Intelligent Food Recommendations",
    description: "Get meal suggestions rooted in Indian culinary wisdom that match your taste preferences, dietary restrictions, and seasonal ingredients using intelligent algorithms.",
    delay: "0.2s"
  },
  {
    icon: <FaChartLine />,
    title: "Nutrition Tracking",
    description: "Monitor your daily nutrient intake with detailed information about Indian foods - from dals and sabzis to rotis and rice. Track your progress toward balanced Indian nutrition.",
    delay: "0.3s"
  },
  {
    icon: <FaShieldAlt />,
    title: "Dietary Management",
    description: "Manage food allergies, intolerances, and dietary restrictions while staying true to Indian cooking traditions. Get alternatives for ghee, paneer, wheat, and other common ingredients.",
    delay: "0.4s"
  },
  {
    icon: <FaClock />,
    title: "Ghar Ka Khana Made Easy",
    description: "Streamline Indian meal preparation with organized grocery lists for local bazaars, prep schedules for Indian cooking, and time-saving tips for tadkas and masalas.",
    delay: "0.5s"
  },
  {
    icon: <FaHeart />,
    title: "Swasth Bharat Focused",
    description: "Build sustainable eating habits with balanced Indian nutrition plans designed to support your long-term wellness goals while celebrating our food heritage.",
    delay: "0.6s"
  }
];

const CTASection = styled.section`
  padding: 8rem 0;
  background: var(--bg-dark);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1000px;
    height: 1000px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 181, 176, 0.05) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin: 0 auto;
  
  h2 {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    line-height: 1.7;
  }
`;

const Landing = () => {
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroVisualRef = useRef(null);
  const featuresRef = useRef(null);
  const featureCardsRef = useRef([]);
  const floatingCardsRef = useRef([]);
  const backgroundRef = useRef(null);
  const mainVisualRef = useRef(null);
  const ctaRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create subtle floating particles
      const createParticles = () => {
        if (backgroundRef.current) {
          for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            backgroundRef.current.appendChild(particle);
            particlesRef.current.push(particle);

            // Subtle particle animations
            gsap.to(particle, {
              y: "random(-30, 30)",
              x: "random(-20, 20)",
              duration: "random(12, 20)",
              repeat: -1,
              yoyo: true,
              ease: "power1.inOut",
              delay: Math.random() * 8
            });

            gsap.to(particle, {
              opacity: "random(0.1, 0.4)",
              scale: "random(0.8, 1.2)",
              duration: "random(6, 10)",
              repeat: -1,
              yoyo: true,
              ease: "power2.inOut",
              delay: Math.random() * 5
            });
          }
        }
      };

      createParticles();
      // Initial setup - hide elements
      gsap.set([heroContentRef.current, heroVisualRef.current], { opacity: 0, y: 50 });
      gsap.set(floatingCardsRef.current, { opacity: 0, scale: 0.8 });

      // Hero entrance animation timeline
      const heroTl = gsap.timeline({ delay: 0.5 });
      
      heroTl
        .to(heroContentRef.current, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        })
        .to(heroVisualRef.current, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        }, "-=0.5")
        .to(floatingCardsRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)"
        }, "-=0.3");

      // Continuous floating animation for cards with subtle movement
      floatingCardsRef.current.forEach((card, index) => {
        if (card) {
          // Initial entrance animation
          gsap.fromTo(card, {
            opacity: 0,
            scale: 0.9,
            rotation: index % 2 === 0 ? -3 : 3,
            y: 30
          }, {
            opacity: 1,
            scale: 1,
            rotation: index === 0 ? -2 : index === 1 ? 1 : -1,
            y: 0,
            duration: 1,
            delay: 0.8 + (index * 0.15),
            ease: "power2.out"
          });

          // Subtle floating movement
          gsap.to(card, {
            y: "random(-8, -15)",
            x: "random(-3, 3)",
            duration: "random(6, 9)",
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 1
          });

          // Gentle breathing effect
          gsap.to(card, {
            scale: "random(0.98, 1.01)",
            duration: "random(4, 7)",
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
            delay: index * 0.8
          });

          // Subtle rotation
          gsap.to(card, {
            rotation: `random(${index === 0 ? -3 : index === 1 ? -1 : -2}, ${index === 0 ? -1 : index === 1 ? 2 : 1})`,
            duration: "random(8, 12)",
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 1.2
          });

          // Enhanced hover interactions
          const handleMouseEnter = () => {
            gsap.to(card, {
              scale: 1.03,
              rotation: 0,
              y: -5,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          const handleMouseLeave = () => {
            gsap.to(card, {
              scale: 1,
              rotation: index === 0 ? -2 : index === 1 ? 1 : -1,
              y: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          card.addEventListener('mouseenter', handleMouseEnter);
          card.addEventListener('mouseleave', handleMouseLeave);
        }
      });

      // Enhanced main visual animation - more subtle
      if (mainVisualRef.current) {
        // Entrance animation
        gsap.fromTo(mainVisualRef.current, {
          scale: 0.95,
          opacity: 0
        }, {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          delay: 0.5,
          ease: "power2.out"
        });

        // Subtle breathing effect
        gsap.to(mainVisualRef.current, {
          scale: 1.01,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });

        // Very subtle icon animation
        const icon = mainVisualRef.current.querySelector('.icon');
        if (icon) {
          gsap.to(icon, {
            rotation: 2,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
          });
        }
      }

      // Background parallax effect
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          backgroundPosition: "50% 100px",
          ease: "none",
          scrollTrigger: {
            trigger: backgroundRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Features section scroll animations
      if (featureCardsRef.current.length > 0) {
        featureCardsRef.current.forEach((card, index) => {
          if (card) {
            gsap.fromTo(card, 
              {
                opacity: 0,
                y: 100,
                scale: 0.9
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  end: "bottom 15%",
                  toggleActions: "play none none reverse"
                }
              }
            );

            // Hover animation
            const handleMouseEnter = () => {
              gsap.to(card, {
                y: -10,
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out"
              });
            };

            const handleMouseLeave = () => {
              gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
              });
            };

            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);

            // Cleanup listeners
            return () => {
              card.removeEventListener('mouseenter', handleMouseEnter);
              card.removeEventListener('mouseleave', handleMouseLeave);
            };
          }
        });
      }

      // CTA section animation
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          {
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

    }, heroRef);

    return () => {
      ctx.revert();
      // Clean up particles
      particlesRef.current.forEach(particle => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particlesRef.current = [];
    };
  }, []);

  return (
    <div ref={heroRef}>
      <Navbar />
      <HeroSection>
        <ParallaxBackground ref={backgroundRef} />
        <Container>
          <HeroGrid>
            <HeroContent ref={heroContentRef}>
              <h1>Smart Indian Nutrition</h1>
              <p>
                Plan your meals rooted in Indian culinary wisdom. Track your nutrition goals and build healthy eating habits 
                with personalized desi meal recommendations tailored to your taste, and dietary traditions - from Punjabi tadka, Telangana pachadlu to Tamilnadu rasam.
              </p>
              <ButtonGroup>
                <Button to="/register" variant="primary" size="lg">
                  Get Started
                </Button>
                <Button to="/login" variant="glass" size="lg">
                  Sign In
                </Button>
              </ButtonGroup>
            </HeroContent>
            
            <HeroVisual ref={heroVisualRef}>
              <MainVisual ref={mainVisualRef}>
                <FaUtensils className="icon" />
              </MainVisual>
              
              <FloatingCard ref={el => floatingCardsRef.current[0] = el}>
                <div className="card-header">
                  <span className="emoji">🥗</span>
                  <span className="title">Today's Meal</span>
                </div>
                <div className="card-content">
                  <div className="value">Dal Tadka Thali</div>
                  <div className="description">High protein, balanced nutrition</div>
                </div>
              </FloatingCard>

              <FloatingCard ref={el => floatingCardsRef.current[1] = el}>
                <div className="card-header">
                  <span className="emoji">📊</span>
                  <span className="title">Weekly Progress</span>
                </div>
                <div className="card-content">
                  <div className="value">85%</div>
                  <div className="description">Nutrition goals achieved</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '85%'}}></div>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard ref={el => floatingCardsRef.current[2] = el}>
                <div className="card-header">
                  <span className="emoji">⚡</span>
                  <span className="title">Daily Calories</span>
                </div>
                <div className="card-content">
                  <div className="value">1,847 / 2,100</div>
                  <div className="description">253 calories remaining</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '88%'}}></div>
                  </div>
                </div>
              </FloatingCard>
            </HeroVisual>
          </HeroGrid>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <SectionHeader>
            <div className="badge">Features</div>
            <h2>Tools for healthy eating</h2>
            <p>
              Discover the features that help you plan meals, track nutrition, and build sustainable eating habits.
            </p>
          </SectionHeader>
          
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                delay={feature.delay}
                ref={el => featureCardsRef.current[index] = el}
              >
                <div className="icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="learn-more">
                  Learn More <FaArrowRight />
                </div>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </FeaturesSection>
      
      <FeaturesSection style={{ background: 'rgba(0, 181, 176, 0.03)' }}>
        <Container>
          <SectionHeader>
            <div className="badge">Indian Foods Database</div>
            <h2>Comprehensive Cuisine Database</h2>
            <p>
              With our collection of over 350 authentic Indian recipes and dishes with detailed nutritional information.
            </p>
          </SectionHeader>
          
          <FeatureGrid>
            <FeatureCard delay="0.1s">
              <div className="icon">🍛</div>
              <h3>Regional Specialties</h3>
              <p>From kashmiri mirchi to karnataka sambar, discover authentic recipes from all Indian states with traditional cooking methods and nutritional profiles.</p>
              <div className="learn-more">
                Explore Recipes <FaArrowRight />
              </div>
            </FeatureCard>
            
            <FeatureCard delay="0.2s">
              <div className="icon">🥘</div>
              <h3>Street Food & Snacks</h3>
              <p>Get nutritional information for your favorite chaat, vada pav, dosa, and other Indian street foods with healthy preparation alternatives.</p>
              <div className="learn-more">
                View Snacks <FaArrowRight />
              </div>
            </FeatureCard>
            
            <FeatureCard delay="0.3s">
              <div className="icon">🌾</div>
              <h3>Traditional Ingredients</h3>
              <p>Learn about the nutritional benefits of traditional Indian ingredients like turmeric, cumin, fenugreek, and seasonal vegetables.</p>
              <div className="learn-more">
                Discover More <FaArrowRight />
              </div>
            </FeatureCard>
          </FeatureGrid>
        </Container>
      </FeaturesSection>
    </div>
  );
};

export default Landing;