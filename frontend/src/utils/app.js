// src/utils/api.js
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Generic function to fetch data from the API
 */
export const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

/**
 * Generic function to post data to the API
 */
export const postData = async (endpoint, data, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

/**
 * Get the full URL for an image or file path
 */
export const getFullResourceUrl = (path) => {
  if (!path) return null;
  return `${API_BASE_URL}/${path}`;
};
