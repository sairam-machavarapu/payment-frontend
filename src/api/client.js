import axios from 'axios';
import { getDbName } from './interceptor';

const API_URL = import.meta.env.VITE_API_URL || 'https://payment-backend-yhud.onrender.com';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

const getDb = (dbName) => dbName || getDbName();

export const uploadFile = async (file, dbName) => {
  const activeDb = getDb(dbName);
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post(`/upload/${activeDb}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCategories = (dbName) =>
  client.get(`/categories/${getDb(dbName)}`).then((r) => r.data);

export const createCategory = (dbName, payload) =>
  client.post(`/categories/${getDb(dbName)}`, payload).then((r) => r.data);

export const saveRule = (dbName, description, category) =>
  client.post(`/rules/${getDb(dbName)}`, { description, category }).then((r) => r.data);

export const exportExcel = (dbName) => {
  window.open(`${API_URL}/api/export/excel/${getDb(dbName)}`, '_blank');
};

export const exportPdf = (dbName) => {
  window.open(`${API_URL}/api/export/pdf/${getDb(dbName)}`, '_blank');
};

export default client;
