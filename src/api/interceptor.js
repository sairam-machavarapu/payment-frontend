import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://payment-backend-yhud.onrender.com';
axios.defaults.baseURL = API_URL;

/**
 * Dynamically resolves the database name from:
 * 1. URL Query Parameter: `db` or `dbName` (e.g., ?db=tenant_suthra)
 * 2. Session Storage: Keeps the last used database name during the session
 * 3. Fallback: Defaults to 'default'
 */
export const getDbName = () => {
  if (typeof window === 'undefined') return 'evergreen';
  
  const params = new URLSearchParams(window.location.search);
  const db = params.get('db') || params.get('dbName');
  
  if (db) {
    sessionStorage.setItem('current_db_name', db);
    return db;
  }
  
  return sessionStorage.getItem('current_db_name') || 'evergreen';
};

// Global Axios Request Interceptor
axios.interceptors.request.use(
  (config) => {
    const dbName = getDbName();
    let url = config.url || '';
    
    // Normalize URL to remove trailing slash
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    
    // List of base paths to intercept and append the database name
    const pathsToIntercept = [
      '/api/categories',
      '/api/upload',
      '/api/rules',
      '/api/export/excel',
      '/api/export/pdf'
    ];
    
    if (pathsToIntercept.includes(url)) {
      config.url = `${url}/${dbName}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
