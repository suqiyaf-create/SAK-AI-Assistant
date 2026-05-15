import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// For auth tokens if using Express auth, but we'll prefer Firebase.
// However, the weather uses this api.
export default api;
