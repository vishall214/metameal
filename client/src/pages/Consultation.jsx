import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUserMd, FaDumbbell, FaStar, FaCalendarAlt } from 'react-icons/fa';
import BackButton from '../components/BackButton';

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

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--bg-dark)' : 'var(--text-light)'};
  border: 2px solid ${props => props.active ? 'var(--primary)' : 'var(--primary-light)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.active ? 'var(--primary-light)' : 'rgba(0, 181, 176, 0.1)'};
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.2);
  }
`;

const ProfessionalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const ProfessionalCard = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 181, 176, 0.1);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: var(--primary);
    box-shadow: 0 20px 40px rgba(0, 181, 176, 0.15);
  }
`;

const ProfessionalImage = styled.div`
  height: 200px;
  background: ${props => `url(${props.image}) center/cover`};
`;

const ProfessionalContent = styled.div`
  padding: 1.5rem;
`;

const ProfessionalName = styled.h3`
  color: var(--primary-light);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--primary);
  }
`;

const ProfessionalTitle = styled.p`
  color: var(--text-light);
  opacity: 0.8;
  margin-bottom: 1rem;
`;

const ProfessionalBio = styled.p`
  color: var(--text-light);
  opacity: 0.8;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #f1c40f;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
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
`;

// Sample data
const professionals = {
  doctors: [
    {
      id: 1,
      name: "Dr. Ritwik Thanneeru",
      title: "Clinical Nutrition Specialist",
      image: "/professionals/doctor1.jpg",
      bio: "Expert in clinical nutrition and traditional Indian dietary practices with over 12 years of experience in holistic wellness and metabolic health.",
      rating: 4.9,
      availability: "Mon-Fri, 9AM-5PM",
      email: "dr.ritwik@metameal.com"
    },
    {
      id: 2,
      name: "Dr. Sankeerthana",
      title: "Clinical Dietitian & Nutritionist",
      image: "/professionals/doctor2.jpg",
      bio: "Specialized in Indian dietary patterns, diabetes management, and weight loss with focus on regional food preferences.",
      rating: 4.8,
      availability: "Mon-Sat, 10AM-6PM",
      email: "dr.sankeerthana@metameal.com"
    }
  ],
  trainers: [
    {
      id: 3,
      name: "Arjun Patel",
      title: "Yoga & Fitness Coach",
      image: "/professionals/trainer1.jpg",
      bio: "Certified yoga instructor and fitness coach specializing in traditional Indian exercises and modern fitness techniques.",
      rating: 4.9,
      availability: "Mon-Sun, 6AM-8PM",
      email: "arjun.patel@metameal.com"
    },
    {
      id: 4,
      name: "Priya Sharma",
      title: "Holistic Wellness Coach",
      image: "/professionals/trainer2.jpg",
      bio: "Expert in integrating yoga, pranayama, and traditional wellness principles with modern fitness for complete health transformation.",
      rating: 4.7,
      availability: "Mon-Fri, 7AM-7PM",
      email: "priya.sharma@metameal.com"
    }
  ]
};

export default function Consultation() {
  const [activeTab, setActiveTab] = useState('doctors');

  const handleBookConsultation = (professional) => {
    const subject = `Consultation Request - ${professional.title}`;
    const body = `Dear ${professional.name},

I hope this email finds you well. I am reaching out to schedule a consultation session with you.

I am interested in:
- Personalized nutrition guidance
- Dietary recommendations based on my health goals
- Professional advice on my current eating habits

Please let me know your availability and preferred consultation format (in-person, video call, or phone consultation).

Thank you for your time, and I look forward to hearing from you.

Best regards,
[Your Name]
MetaMeal User`;

    const mailtoLink = `mailto:${professional.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <PageContainer>
      <BackButton to="/home">Back to Dashboard</BackButton>
      <Title>Professional Consultation</Title>

      <Tabs>
        <Tab 
          active={activeTab === 'doctors'} 
          onClick={() => setActiveTab('doctors')}
        >
          <FaUserMd /> Doctors
        </Tab>
        <Tab 
          active={activeTab === 'trainers'} 
          onClick={() => setActiveTab('trainers')}
        >
          <FaDumbbell /> Trainers
        </Tab>
      </Tabs>

      <ProfessionalsGrid>
        {professionals[activeTab].map(professional => (
          <ProfessionalCard key={professional.id}>
            <ProfessionalImage image={professional.image} />
            <ProfessionalContent>
              <ProfessionalName>
                {activeTab === 'doctors' ? <FaUserMd /> : <FaDumbbell />}
                {professional.name}
              </ProfessionalName>
              <ProfessionalTitle>{professional.title}</ProfessionalTitle>
              <ProfessionalBio>{professional.bio}</ProfessionalBio>
              <Rating>
                <FaStar />
                <span>{professional.rating}</span>
              </Rating>
              <ActionButton onClick={() => handleBookConsultation(professional)}>
                <FaCalendarAlt />  Consult              </ActionButton>
            </ProfessionalContent>
          </ProfessionalCard>
        ))}
      </ProfessionalsGrid>
    </PageContainer>
  );
} 