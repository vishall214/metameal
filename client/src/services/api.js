const API_BASE = 'http://localhost:5000/api';

export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchMeals = async (token) => {
  const res = await fetch(`${API_BASE}/meals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};