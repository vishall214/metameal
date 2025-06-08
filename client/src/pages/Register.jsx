import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import {
  Container,
  FormCard,
  Title,
  Input,
  Button,
  Error,
  LinkText
} from '../styles/FormStyles';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      if (res.token) {
        localStorage.setItem('token', res.token);
        navigate('/quiz'); // Redirect to quiz after registration
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <Container>
      <FormCard onSubmit={handleSubmit}>
        <Title>Create Account</Title>
        {error && <Error>{error}</Error>}
        <Input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
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
        <Button type="submit">Register</Button>
        <LinkText>
          Already have an account? <Link to="/login">Login</Link>
        </LinkText>
      </FormCard>
    </Container>
  );
}