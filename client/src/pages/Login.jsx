import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import {
  Container,
  FormCard,
  Title,
  Input,
  Button,
  Error,
  LinkText
} from '../styles/FormStyles';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      if (res.token) {
        localStorage.setItem('token', res.token);
        navigate('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <Container>
      <FormCard onSubmit={handleSubmit}>
        <Title>Welcome Back</Title>
        {error && <Error>{error}</Error>}
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Button type="submit">Login</Button>
        <LinkText>
          Don't have an account? <Link to="/register">Register</Link>
        </LinkText>
      </FormCard>
    </Container>
  );
}