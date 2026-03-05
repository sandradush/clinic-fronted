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
    // Try to include response body in the thrown error for easier debugging
    let bodyText: any = null;
    try {
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        bodyText = await response.json();
      } else {
        bodyText = await response.text();
      }
    } catch (e) {
      bodyText = '<unreadable response body>';
    }

    if (response.status === 403) {
      const msg = typeof bodyText === 'string' ? bodyText : JSON.stringify(bodyText);
      throw new Error(`Waiting for admin approval: ${msg}`);
    }

    const bodyMsg = typeof bodyText === 'string' ? bodyText : JSON.stringify(bodyText);
    throw new Error(`HTTP error! status: ${response.status} - ${bodyMsg}`);
  }

  return response.json();
};

/**
 * Upload a profile image for a user (doctor)
 * @param userId - The user ID
 * @param imageFile - The image file to upload
 * @returns Promise with the response
 */
export const uploadProfileImage = async (userId: number, imageFile: File): Promise<any> => {
  const token = JSON.parse(localStorage.getItem('session') || '{}').token;
  
  const formData = new FormData();
  formData.append('user_id', userId.toString());
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/auth/profile-image`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
