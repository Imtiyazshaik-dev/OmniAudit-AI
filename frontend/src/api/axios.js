import axios from 'axios';

// Function to update Base URL on the fly
export function setBackendUrl(url) {
  let cleanUrl = (url || '').trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  if (cleanUrl) {
    localStorage.setItem('omniaudit_backend_url', cleanUrl);
    axios.defaults.baseURL = cleanUrl;
  } else {
    localStorage.removeItem('omniaudit_backend_url');
    delete axios.defaults.baseURL;
  }
}

// Initial Base URL Configuration
const savedUrl = localStorage.getItem('omniaudit_backend_url');
const defaultUrl = import.meta.env.VITE_API_BASE_URL || savedUrl || '';

if (defaultUrl) {
  setBackendUrl(defaultUrl);
}

// Interceptor to attach Authorization header and detect invalid HTML responses from Vercel static rewrites
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('omniaudit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  // If response is HTML text instead of JSON object (Vercel rewrite fallback), reject with descriptive error
  if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'))) {
    return Promise.reject(new Error("API returned HTML instead of JSON. Backend URL configuration required."));
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default axios;
