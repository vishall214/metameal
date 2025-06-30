import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Input from '../components/Input';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

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

const LoginContainer = styled.div`
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
    background: radial-gradient(circle at 20% 80%, rgba(0, 181, 176, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%);
    animation: ${fadeIn} 2s ease-out;
  }
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 2;
  animation: ${slideUp} 0.8s ease-out;
`;

const LoginForm = styled.form`
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

const SignupPrompt = styled.div`
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Welcome back!');
        // Redirect based on quiz completion
        if (result.user && result.user.quizCompleted) {
          navigate('/home', { replace: true });
        } else {
          navigate('/quiz', { replace: true });
        }
      } else {
        toast.error(result.error || 'Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <BackButton />
      <LoginCard>
        <LoginForm onSubmit={handleSubmit}>
          <Header>
            <Title>Welcome Back</Title>
            <Subtitle>Sign in to continue your nutrition journey</Subtitle>
          </Header>

          <FormGroup>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<FaEnvelope />}
              variant="glass"
              fullWidth
              required
              // autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          </FormGroup>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            loading={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <SignupPrompt>
            Don't have an account?
            <Link to="/register">Create account</Link>
          </SignupPrompt>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
}