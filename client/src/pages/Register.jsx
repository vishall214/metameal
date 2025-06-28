import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Input from '../components/Input';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-gradient);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 80% 20%, rgba(0, 181, 176, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%);
    animation: ${fadeIn} 2s ease-out;
  }
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 2;
  animation: ${slideUp} 0.8s ease-out;
`;

const RegisterForm = styled.form`
  background: var(--glass-strong);
  backdrop-filter: blur(30px);
  border-radius: var(--radius-xl);
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: var(--shadow-lg);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 60%;
    height: 4px;
    background: var(--primary-gradient);
    border-radius: 0 0 var(--radius) var(--radius);
    transform: translateX(-50%);
  }
  
  @media (max-width: 480px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
  z-index: 3;
  
  &:hover {
    color: var(--primary);
  }
`;

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
  
  .strength-bar {
    height: 4px;
    background: var(--border-light);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    
    .strength-fill {
      height: 100%;
      transition: all var(--transition);
      border-radius: 2px;
      
      &.weak { background: var(--error); width: 25%; }
      &.fair { background: var(--warning); width: 50%; }
      &.good { background: var(--primary); width: 75%; }
      &.strong { background: var(--success); width: 100%; }
    }
  }
  
  .strength-text {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;

const PasswordRequirements = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  
  .title {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .requirement {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
    
    &.met {
      color: var(--success);
    }
    
    .icon {
      width: 12px;
      height: 12px;
    }
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  
  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.5rem;
    
    &:hover {
      color: var(--primary-light);
      text-decoration: underline;
    }
  }
`;

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name || e.target.id]: e.target.value
    });
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    if (score <= 4) return 'good';
    return 'strong';
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One number', met: /[0-9]/.test(formData.password) },
    { text: 'One special character', met: /[^A-Za-z0-9]/.test(formData.password) }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        username: formData.username,
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password
      });
      
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/login');
      } else {
        toast.error(result.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <BackButton />
      <RegisterCard>
        <RegisterForm onSubmit={handleSubmit}>
          <Header>
            <Title>Create Account</Title>
            <Subtitle>Join thousands improving their nutrition</Subtitle>
          </Header>

          <FormRow>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              icon={<FaUser />}
              variant="glass"
              fullWidth
              required
            />
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              icon={<FaUser />}
              variant="glass"
              fullWidth
              required
            />
          </FormRow>

          <FormGroup>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              icon={<FaEnvelope />}
              variant="glass"
              fullWidth
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              icon={<FaLock />}
              variant="glass"
              fullWidth
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            
            {formData.password && (
              <PasswordStrength>
                <div className="strength-bar">
                  <div className={`strength-fill ${getPasswordStrength(formData.password)}`} />
                </div>
                <div className="strength-text">
                  Password strength: {getPasswordStrength(formData.password)}
                </div>
              </PasswordStrength>
            )}
          </FormGroup>

          <FormGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<FaLock />}
              variant="glass"
              fullWidth
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </FormGroup>

          {formData.password && (
            <PasswordRequirements>
              <div className="title">Password must contain:</div>
              {passwordRequirements.map((req, index) => (
                <div key={index} className={`requirement ${req.met ? 'met' : ''}`}>
                  <FaCheck className="icon" />
                  {req.text}
                </div>
              ))}
            </PasswordRequirements>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            loading={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <LoginPrompt>
            Already have an account?
            <Link to="/login">Sign in</Link>
          </LoginPrompt>
        </RegisterForm>
      </RegisterCard>
    </RegisterContainer>
  );
}