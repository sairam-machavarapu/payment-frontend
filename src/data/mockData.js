export const CATEGORY_CHART_DATA = [
  { name: 'Food & Dining',      amount: 14800, color: '#EF9F27' },
  { name: 'Shopping',           amount: 8500,  color: '#534AB7' },
  { name: 'Bills & Utilities',  amount: 6200,  color: '#378ADD' },
  { name: 'Travel & Transport', amount: 4800,  color: '#1D9E75' },
  { name: 'Entertainment',      amount: 2750,  color: '#D4537E' },
  { name: 'Healthcare',         amount: 1200,  color: '#E24B4A' },
  { name: 'Others',             amount: 10000, color: '#888780' },
];

export const WEEKLY_DATA = [
  { week: 'Wk 1', amount: 12000 },
  { week: 'Wk 2', amount: 18000 },
  { week: 'Wk 3', amount: 9000  },
  { week: 'Wk 4', amount: 14250 },
];

export const MOCK_TRANSACTIONS = [
  { date: 'Jan 03', description: 'Swiggy Order #45123',       amount: 450,  category: 'Food & Dining',      confidence: 95 },
  { date: 'Jan 04', description: 'Amazon India Purchase',      amount: 2100, category: 'Shopping',           confidence: 88 },
  { date: 'Jan 05', description: 'Metro Card Recharge',        amount: 500,  category: 'Travel & Transport', confidence: 91 },
  { date: 'Jan 06', description: 'BESCOM Electricity Bill',    amount: 1800, category: 'Bills & Utilities',  confidence: 97 },
  { date: 'Jan 07', description: 'Netflix Subscription',       amount: 649,  category: 'Entertainment',      confidence: 99 },
  { date: 'Jan 08', description: 'Apollo Pharmacy',            amount: 320,  category: 'Healthcare',         confidence: 85 },
  { date: 'Jan 09', description: 'Zomato Order #78234',        amount: 380,  category: 'Food & Dining',      confidence: 93 },
  { date: 'Jan 10', description: 'Ola Cab Ride',               amount: 250,  category: 'Travel & Transport', confidence: 90 },
  { date: 'Jan 11', description: 'Myntra Fashion',             amount: 1200, category: 'Shopping',           confidence: 86 },
  { date: 'Jan 12', description: 'Spotify Premium',            amount: 119,  category: 'Entertainment',      confidence: 98 },
  { date: 'Jan 13', description: 'Dominos Pizza',              amount: 620,  category: 'Food & Dining',      confidence: 92 },
  { date: 'Jan 14', description: 'Airtel Broadband Bill',      amount: 999,  category: 'Bills & Utilities',  confidence: 96 },
  { date: 'Jan 15', description: 'BigBasket Groceries',        amount: 880,  category: 'Food & Dining',      confidence: 89 },
  { date: 'Jan 16', description: 'Flipkart Electronics',       amount: 3200, category: 'Shopping',           confidence: 87 },
  { date: 'Jan 17', description: 'Ola Cab Airport Drop',       amount: 420,  category: 'Travel & Transport', confidence: 91 },
  { date: 'Jan 18', description: 'Burger King Outlet',         amount: 340,  category: 'Food & Dining',      confidence: 94 },
  { date: 'Jan 19', description: 'Jio Mobile Recharge',        amount: 599,  category: 'Bills & Utilities',  confidence: 98 },
  { date: 'Jan 20', description: 'BookMyShow Tickets',         amount: 450,  category: 'Entertainment',      confidence: 96 },
  { date: 'Jan 21', description: 'Medplus Pharmacy',           amount: 285,  category: 'Healthcare',         confidence: 82 },
  { date: 'Jan 22', description: 'Nykaa Beauty',               amount: 890,  category: 'Shopping',           confidence: 84 },
];

export const CATEGORY_BADGE_CONFIG = {
  'Food & Dining': {
    bg: '#FAEEDA', text: '#633806', icon: '🍔',
  },
  'Shopping': {
    bg: '#E6F1FB', text: '#0C447C', icon: '🛍️',
  },
  'Travel & Transport': {
    bg: '#E1F5EE', text: '#085041', icon: '✈️',
  },
  'Bills & Utilities': {
    bg: '#EEEDFE', text: '#3C3489', icon: '💡',
  },
  'Entertainment': {
    bg: '#FBEAF0', text: '#72243E', icon: '🎬',
  },
  'Healthcare': {
    bg: '#FCEBEB', text: '#791F1F', icon: '💊',
  },
  'Others': {
    bg: '#F3F4F6', text: '#374151', icon: '📦',
  },
};
