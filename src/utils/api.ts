const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://clinic-backend-s2lx.onrender.com/api';

export const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = JSON.parse(localStorage.getItem('session') || '{}').token;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Waiting for admin approval');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};