import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBook, FaChartBar, FaCalculator, FaQuestionCircle } from 'react-icons/fa';
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

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'var(--primary)' : 'rgba(0, 181, 176, 0.1)'};
  color: ${props => props.active ? 'var(--bg-dark)' : 'var(--text-light)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(0, 181, 176, 0.2)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? 'var(--primary-light)' : 'rgba(0, 181, 176, 0.2)'};
    transform: translateY(-2px);
  }
`;

const ContentSection = styled.div`
  background: rgba(0, 181, 176, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 181, 176, 0.1);
`;

const SectionTitle = styled.h2`
  color: var(--text-light);
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--primary);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 181, 176, 0.1);
  }
`;

const CardTitle = styled.h3`
  color: var(--text-light);
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const CardContent = styled.p`
  color: var(--text-light);
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const CalculatorForm = styled.form`
  display: grid;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
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

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0, 181, 176, 0.2);
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
`;

const ResultCard = styled.div`
  background: rgba(0, 181, 176, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  text-align: center;
`;

const ResultValue = styled.div`
  font-size: 2rem;
  color: var(--primary);
  font-weight: bold;
  margin: 1rem 0;
`;

const ResultLabel = styled.div`
  color: var(--text-light);
  opacity: 0.8;
`;

export default function NutritionInfo() {
  const [activeTab, setActiveTab] = useState('basics');
  const [bmi, setBmi] = useState(null);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate'
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height) / 100; // convert cm to m
    const bmiValue = weight / (height * height);
    setBmi(bmiValue.toFixed(1));
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <PageContainer>
      <BackButton to="/home">Back to Dashboard</BackButton>
      <Title>Nutrition Information</Title>

      <TabContainer>
        <TabList>
          <Tab
            active={activeTab === 'basics'}
            onClick={() => setActiveTab('basics')}
          >
            <FaBook /> Basics
          </Tab>
          <Tab
            active={activeTab === 'calculator'}
            onClick={() => setActiveTab('calculator')}
          >
            <FaCalculator /> Calculator
          </Tab>
          <Tab
            active={activeTab === 'guidelines'}
            onClick={() => setActiveTab('guidelines')}
          >
            <FaChartBar /> Guidelines
          </Tab>
          <Tab
            active={activeTab === 'faq'}
            onClick={() => setActiveTab('faq')}
          >
            <FaQuestionCircle /> FAQ
          </Tab>
        </TabList>

        {activeTab === 'basics' && (
          <ContentSection>
            <SectionTitle>
              <FaBook /> Nutrition Basics
            </SectionTitle>
            <InfoGrid>
              <InfoCard>
                <CardTitle>Macronutrients</CardTitle>
                <CardContent>
                  The major nutrients that we NEED everyday are called Macronutrients. Dal provides protein, rice/roti gives carbohydrates, and ghee supplies healthy fats.
                  Each plays a vital role in maintaining health and providing sustained energy.
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardTitle>Micronutrients</CardTitle>
                <CardContent>
                  The minor nutrients that we need in our meals. Indian spices like turmeric, cumin, coriander are rich in vitamins and minerals.
                  These micronutrients support immunity and overall health naturally.
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardTitle>Hydration</CardTitle>
                <CardContent>
                  Staying hydrated is very important, Include water-rich foods like watermelon, cucumber, coconut water, and buttermilk.
                  Aim for 8-10 glasses daily, especially during hot Indian summers.
                </CardContent>
              </InfoCard>
            </InfoGrid>
          </ContentSection>
        )}

        {activeTab === 'calculator' && (
          <ContentSection>
            <SectionTitle>
              <FaCalculator /> BMI Calculator
            </SectionTitle>
            <CalculatorForm onSubmit={calculateBMI}>
              <FormGroup>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <Button type="submit">Calculate BMI</Button>
            </CalculatorForm>

            {bmi && (
              <ResultCard>
                <ResultValue>{bmi}</ResultValue>
                <ResultLabel>{getBMICategory(bmi)}</ResultLabel>
              </ResultCard>
            )}
          </ContentSection>
        )}

        {activeTab === 'guidelines' && (
          <ContentSection>
            <SectionTitle>
              <FaChartBar /> Dietary Guidelines
            </SectionTitle>
            <InfoGrid>
              <InfoCard>
                <CardTitle>Daily Recommendations</CardTitle>
                <CardContent>
                  • 2-3 servings of dal/legumes for protein
                  • 4-5 servings of vegetables (sabzi) and fruits
                  • 6-8 servings of grains (roti, rice, millet)
                  • 2-3 servings of dairy (dahi, milk, paneer)
                  • Limited jaggery and ghee consumption
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardTitle>Portion Control</CardTitle>
                <CardContent>
                  Use traditional measures: 1 katori dal, 2 rotis, 1 bowl rice, 1 small bowl sabzi. 
                  Follow the thali concept for balanced nutrition in every meal.
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardTitle>Meal Timing</CardTitle>
                <CardContent>
                  Follow traditional meal patterns: Light breakfast with upma/poha or tifins, 
                  substantial lunch with dal-rice-sabzi, and light dinner before sunset when possible.
                </CardContent>
              </InfoCard>
            </InfoGrid>
          </ContentSection>
        )}

        {activeTab === 'faq' && (
          <ContentSection>
            <SectionTitle>
              <FaQuestionCircle /> Frequently Asked Questions
            </SectionTitle>
            <InfoGrid>
              <InfoCard>
                <CardTitle>What is a balanced Indian diet?</CardTitle>
                <CardContent>
                  A balanced Indian diet includes a variety of foods from all food groups: dal (proteins), 
                  sabzi (vegetables), roti/rice (grains), and dahi (dairy) in appropriate proportions for optimal health.
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardTitle>How much water should I drink?</CardTitle>
                <CardContent>
                  The general recommendation is 8-10 glasses (2-2.5 liters) per day, 
                  but this can vary based on activity level, climate, and spice consumption in Indian food.
                </CardContent>
              </InfoCard>
              <InfoCard>
                <CardTitle>What are good sources of protein?</CardTitle>
                <CardContent>
                  Dal (lentils), rajma, chana, paneer, dahi, eggs, fish, chicken, and nuts 
                  are all excellent sources of protein commonly found in Indian cuisine.
                </CardContent>
              </InfoCard>
            </InfoGrid>
          </ContentSection>
        )}
      </TabContainer>
    </PageContainer>
  );
} 