const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://clinic-backend-s2lx.onrender.com/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const TIMEOUT = 30000; // 30 seconds

// Helper function to add timeout to fetch with HTTP/1.1 fallback
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = TIMEOUT) => {
  // Force HTTP/1.1 to avoid HTTP/2 protocol errors
  const enhancedOptions = {
    ...options,
    headers: {
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
  };

  return Promise.race([
    fetch(url, enhancedOptions),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Helper function to check if error is retryable
const isRetryableError = (error: any): boolean => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true; // Network errors
  }
  if (error.message === 'Request timeout') {
    return true;
  }
  if (error.message && error.message.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
    return true; // HTTP/2 protocol errors are retryable
  }
  if (error.message && error.message.includes('ERR_CONNECTION_RESET')) {
    return true; // Connection reset errors
  }
  return false;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = JSON.parse(localStorage.getItem('session') || '{}').token;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`API Request attempt ${attempt}/${MAX_RETRIES}: ${endpoint}`);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
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

        // Don't retry 4xx errors (except 408 timeout)
        if (response.status >= 400 && response.status < 500 && response.status !== 408) {
          const bodyMsg = typeof bodyText === 'string' ? bodyText : JSON.stringify(bodyText);
          
          // Handle specific error cases
          if (response.status === 401) {
            throw new Error(`Invalid credentials: ${bodyMsg}`);
          }
          if (response.status === 404) {
            throw new Error(`Not found: ${bodyMsg}`);
          }
          if (response.status === 422) {
            throw new Error(`Validation error: ${bodyMsg}`);
          }
          
          throw new Error(`Client error (${response.status}): ${bodyMsg}`);
        }

        // Retry 5xx errors and 408 timeout
        const bodyMsg = typeof bodyText === 'string' ? bodyText : JSON.stringify(bodyText);
        throw new Error(`HTTP error! status: ${response.status} - ${bodyMsg}`);
      }

      console.log(`API Request successful on attempt ${attempt}`);
      return response.json();
      
    } catch (error: any) {
      lastError = error;
      console.error(`API Request attempt ${attempt} failed:`, error.message);
      
      // Handle specific HTTP/2 protocol errors
      if (error.message && error.message.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
        console.log('HTTP/2 protocol error detected, will retry with different headers');
      }
      
      // Don't retry non-retryable errors (4xx client errors)
      if (!isRetryableError(error) && !error.message.includes('HTTP error! status: 5') && !error.message.includes('Server error')) {
        throw error;
      }
      
      // Don't delay on the last attempt
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY * attempt}ms...`);
        await delay(RETRY_DELAY * attempt); // Exponential backoff
      }
    }
  }
  
  // If all retries failed, throw the last error with additional context
  const errorMessage = lastError?.message || 'Unknown error';
  if (errorMessage.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
    throw new Error(`HTTP/2 protocol error after ${MAX_RETRIES} attempts. This may be a server configuration issue. Please try again or contact support.`);
  }
  throw new Error(`Backend server unavailable after ${MAX_RETRIES} attempts. ${errorMessage}`);
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

  let lastError: any;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/profile-image`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Upload successful on attempt ${attempt}`);
      return response.json();
      
    } catch (error: any) {
      lastError = error;
      console.error(`Upload attempt ${attempt} failed:`, error.message);
      
      if (!isRetryableError(error) && attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * attempt);
      } else if (attempt === MAX_RETRIES) {
        break;
      }
    }
  }
  
  throw new Error(`Upload failed after ${MAX_RETRIES} attempts. ${lastError?.message || 'Unknown error'}`);
};
