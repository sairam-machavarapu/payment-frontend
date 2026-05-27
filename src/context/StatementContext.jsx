import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { seedCategoryColors } from '../data/categoryColors';

const StatementContext = createContext(null);

const INITIAL_STATE = {
  transactions: [],
  summary: {},
  filename: '',
  filtered: [],
  activeCategory: 'All',
  activePage: 1,
  amountFilter: 'All',
  categories: [],
};

const loadFromSession = () => {
  try {
    const raw = sessionStorage.getItem('statementData');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATE, ...parsed, categories: [] }; // always re-fetch categories fresh
  } catch {
    return null;
  }
};

const saveToSession = (data) => {
  try {
    sessionStorage.setItem('statementData', JSON.stringify(data));
  } catch { /* quota exceeded or private mode */ }
};

export const StatementProvider = ({ children }) => {
  const [statementData, setStatementDataRaw] = useState(
    () => loadFromSession() ?? INITIAL_STATE,
  );

  const setStatementData = useCallback((updater) => {
    setStatementDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToSession(next);
      return next;
    });
  }, []);

  // Fetch all categories from DB and update context + session
  const refreshCategories = useCallback(() => {
    return axios.get('/api/categories')
      .then(({ data }) => {
        const names = data.categories ?? [];
        seedCategoryColors(names);
        setStatementData((prev) => ({ ...prev, categories: names }));
        return names;
      })
      .catch(() => []);
  }, [setStatementData]);

  // Always load fresh from DB on mount
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const updateFilters = useCallback((category, amountRange) => {
    setStatementData((prev) => {
      const filtered = prev.transactions.filter((t) => {
        const catMatch = category === 'All' || t.category === category;
        let amtMatch = true;
        if (amountRange === 'Under ₹500')       amtMatch = t.amount < 500;
        else if (amountRange === '₹500–₹2000')  amtMatch = t.amount >= 500 && t.amount <= 2000;
        else if (amountRange === 'Above ₹2000')  amtMatch = t.amount > 2000;
        return catMatch && amtMatch;
      });
      return { ...prev, activeCategory: category, amountFilter: amountRange, filtered, activePage: 1 };
    });
  }, [setStatementData]);

  return (
    <StatementContext.Provider value={{ statementData, setStatementData, updateFilters, refreshCategories }}>
      {children}
    </StatementContext.Provider>
  );
};

export const useStatement = () => {
  const ctx = useContext(StatementContext);
  if (!ctx) throw new Error('useStatement must be used within StatementProvider');
  return ctx;
};
