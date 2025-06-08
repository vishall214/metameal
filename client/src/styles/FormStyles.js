import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--dark) 0%, var(--bg-dark) 100%);
`;

export const FormCard = styled.form`
  background: rgba(10, 41, 40, 0.8);
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  border: 1px solid rgba(0, 181, 176, 0.2);
`;

export const Title = styled.h2`
  color: var(--primary-light);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(0, 181, 176, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-light);
  font-size: 1rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: var(--primary);
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 2px rgba(0, 181, 176, 0.2);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary);
    outline: none;
  }

  option {
    background: var(--bg-dark);
    color: var(--text-light);
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: var(--bg-dark);
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

export const Error = styled.div`
  color: #ff6b6b;
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.1);
`;

export const LinkText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: var(--text-light);

  a {
    color: var(--primary);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;