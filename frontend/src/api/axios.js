import axios from 'axios';

// Configure Base URL dynamically
const customApiUrl = localStorage.getItem('omniaudit_backend_url');
const defaultProdUrl = import.meta.env.VITE_API_BASE_URL || customApiUrl || '';

if (defaultProdUrl) {
  axios.defaults.baseURL = defaultProdUrl;
}

// Interceptor to attach Authorization header dynamically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('omniaudit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axios;
